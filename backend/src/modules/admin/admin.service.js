import prisma from "../../config/prisma.js";

export const getPlatformAnalytics = async () => {
  const now = new Date();

  // 1. Financial Aggregations
  const [completedDonationsAgg, refundedDonationsAgg, pendingCount] = await Promise.all([
    prisma.donation.aggregate({
      where: { status: "completed" },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    }),
    prisma.donation.aggregate({
      where: { status: "refunded" },
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.donation.count({
      where: { status: "pending" },
    }),
  ]);

  const totalRaised = completedDonationsAgg._sum.amount
    ? parseFloat(completedDonationsAgg._sum.amount.toString())
    : 0;
  const totalDonationsCount = completedDonationsAgg._count.id || 0;
  const averageDonation = completedDonationsAgg._avg.amount
    ? parseFloat(completedDonationsAgg._avg.amount.toString())
    : 0;
  const totalRefunded = refundedDonationsAgg._sum.amount
    ? parseFloat(refundedDonationsAgg._sum.amount.toString())
    : 0;
  const refundedCount = refundedDonationsAgg._count.id || 0;

  // 2. Campaigns Statistics
  const [allCampaigns, totalCampaignsCount] = await Promise.all([
    prisma.campaign.findMany({
      where: { status: { not: "deleted" } },
      include: {
        user: { select: { name: true, username: true } },
        _count: { select: { donations: true } },
      },
      orderBy: { current_amount: "desc" },
    }),
    prisma.campaign.count({ where: { status: { not: "deleted" } } }),
  ]);

  let activeCampaigns = 0;
  let endedCampaigns = 0;
  let fullyFundedCampaigns = 0;
  let totalGoal = 0;

  const formattedCampaigns = allCampaigns.map((c) => {
    const goal = parseFloat(c.goal_amount.toString());
    const current = parseFloat((c.current_amount || 0).toString());
    const isDeadlinePassed = new Date(c.deadline) < now;
    const isEnded = c.status === "ended" || isDeadlinePassed;
    const isActive = c.status === "active" && !isDeadlinePassed;
    const isFunded = current >= goal && goal > 0;

    if (isActive) activeCampaigns++;
    if (isEnded) endedCampaigns++;
    if (isFunded) fullyFundedCampaigns++;
    totalGoal += goal;

    return {
      id: c.id,
      title: c.title,
      goal_amount: goal,
      current_amount: current,
      deadline: c.deadline,
      status: isEnded && c.status === "active" ? "ended" : c.status,
      created_at: c.created_at,
      owner_name: c.user?.name || "Unknown",
      owner_username: c.user?.username || "",
      donations_count: c._count?.donations || 0,
      progress_percent: goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0,
    };
  });

  const overallSuccessRate =
    totalCampaignsCount > 0
      ? Math.round((fullyFundedCampaigns / totalCampaignsCount) * 100)
      : 0;
  const topCampaigns = formattedCampaigns.slice(0, 5);

  // 3. User Statistics & KYC
  const [allUsers, totalUsersCount] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        role: true,
        kyc_verified: true,
        created_at: true,
      },
    }),
    prisma.user.count(),
  ]);

  let kycVerified = 0;
  let kycUnverified = 0;
  const roleCounts = {
    user: 0,
    fundraiser: 0,
    admin: 0,
    moderator: 0,
  };

  allUsers.forEach((u) => {
    if (u.kyc_verified) kycVerified++;
    else kycUnverified++;
    if (roleCounts[u.role] !== undefined) {
      roleCounts[u.role]++;
    } else {
      roleCounts[u.role] = 1;
    }
  });

  // 4. Community Engagement
  const [totalPosts, totalComments, totalLikes] = await Promise.all([
    prisma.post.count({ where: { status: { not: "deleted" } } }),
    prisma.comment.count(),
    prisma.like.count(),
  ]);

  // 5. Recent Completed Donations
  const recentDonations = await prisma.donation.findMany({
    where: { status: "completed" },
    include: {
      donor: {
        select: { id: true, name: true, username: true, email: true },
      },
      campaign: { select: { id: true, title: true } },
    },
    orderBy: { created_at: "desc" },
    take: 8,
  });

  const formattedRecentDonations = recentDonations.map((d) => ({
    id: d.id,
    amount: parseFloat(d.amount.toString()),
    created_at: d.created_at,
    donor_name: d.donor?.name || "Anonymous",
    donor_username: d.donor?.username || "",
    donor_email: d.donor?.email || "",
    donor_avatar: d.donor?.avatar_url || "",
    campaign_id: d.campaign?.id,
    campaign_title: d.campaign?.title || "Direct Contribution",
  }));

  // 6. Monthly Trends (Past 6 Months)
  const monthlyTrends = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthName = startOfMonth.toLocaleString("default", { month: "short" });

    monthlyTrends.push({
      month: monthName,
      year: startOfMonth.getFullYear(),
      start: startOfMonth,
      end: endOfMonth,
      revenue: 0,
      donationsCount: 0,
      newCampaigns: 0,
      newUsers: 0,
    });
  }

  const sixMonthsAgo = monthlyTrends[0].start;
  const recentRangeDonations = await prisma.donation.findMany({
    where: {
      status: "completed",
      created_at: { gte: sixMonthsAgo },
    },
    select: { amount: true, created_at: true },
  });

  recentRangeDonations.forEach((item) => {
    const itemDate = new Date(item.created_at);
    const bucket = monthlyTrends.find((b) => itemDate >= b.start && itemDate <= b.end);
    if (bucket) {
      bucket.revenue += parseFloat(item.amount.toString());
      bucket.donationsCount += 1;
    }
  });

  allCampaigns.forEach((c) => {
    const cDate = new Date(c.created_at);
    if (cDate >= sixMonthsAgo) {
      const bucket = monthlyTrends.find((b) => cDate >= b.start && cDate <= b.end);
      if (bucket) bucket.newCampaigns += 1;
    }
  });

  allUsers.forEach((u) => {
    const uDate = new Date(u.created_at);
    if (uDate >= sixMonthsAgo) {
      const bucket = monthlyTrends.find((b) => uDate >= b.start && uDate <= b.end);
      if (bucket) bucket.newUsers += 1;
    }
  });

  const sanitizedTrends = monthlyTrends.map(
    ({ month, year, revenue, donationsCount, newCampaigns, newUsers }) => ({
      name: `${month} ${year.toString().slice(2)}`,
      month,
      revenue: Math.round(revenue * 100) / 100,
      donations: donationsCount,
      campaigns: newCampaigns,
      users: newUsers,
    })
  );

  return {
    financials: {
      totalRaised,
      totalDonationsCount,
      averageDonation: Math.round(averageDonation * 100) / 100,
      totalRefunded,
      refundedCount,
      pendingCount,
      totalGoal,
    },
    campaigns: {
      total: totalCampaignsCount,
      active: activeCampaigns,
      ended: endedCampaigns,
      funded: fullyFundedCampaigns,
      successRate: overallSuccessRate,
      topCampaigns,
    },
    users: {
      total: totalUsersCount,
      kycVerified,
      kycUnverified,
      roles: roleCounts,
    },
    engagement: {
      posts: totalPosts,
      comments: totalComments,
      likes: totalLikes,
    },
    trends: sanitizedTrends,
    recentDonations: formattedRecentDonations,
  };
};
