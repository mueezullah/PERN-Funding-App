import prisma from "../../config/prisma.js";
import { getPresignedGetUrl } from "../../utils/s3.service.js";

/**
 * Aggregates all analytics, financial metrics, campaign progress,
 * and backer insights specifically for a verified creator / fundraiser.
 */
export const getCreatorAnalytics = async (userId) => {
  const numericUserId = parseInt(userId, 10);
  const now = new Date();

  // 1. Fetch all non-deleted campaigns owned by this creator
  const campaigns = await prisma.campaign.findMany({
    where: {
      user_id: numericUserId,
      status: { not: "deleted" },
    },
    include: {
      _count: {
        select: { donations: true, bookmarks: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const campaignIds = campaigns.map((c) => c.id);

  // 2. Fetch all completed donations on this creator's campaigns
  const [completedDonationsAgg, refundedDonationsAgg, pendingDonationsCount] =
    campaignIds.length > 0
      ? await Promise.all([
          prisma.donation.aggregate({
            where: {
              campaign_id: { in: campaignIds },
              status: "completed",
            },
            _sum: { amount: true },
            _count: { id: true },
            _avg: { amount: true },
          }),
          prisma.donation.aggregate({
            where: {
              campaign_id: { in: campaignIds },
              status: "refunded",
            },
            _sum: { amount: true },
            _count: { id: true },
          }),
          prisma.donation.count({
            where: {
              campaign_id: { in: campaignIds },
              status: "pending",
            },
          }),
        ])
      : [
          { _sum: { amount: 0 }, _count: { id: 0 }, _avg: { amount: 0 } },
          { _sum: { amount: 0 }, _count: { id: 0 } },
          0,
        ];

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

  // 3. Campaign Performance Calculations
  let activeCampaigns = 0;
  let endedCampaigns = 0;
  let fullyFundedCampaigns = 0;
  let totalGoal = 0;

  const formattedCampaigns = await Promise.all(
    campaigns.map(async (c) => {
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

      const presignedMediaUrl = await getPresignedGetUrl(c.media_url);

      const daysLeft = Math.max(
        0,
        Math.ceil((new Date(c.deadline).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      );

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        goal_amount: goal,
        current_amount: current,
        deadline: c.deadline,
        days_left: daysLeft,
        status: isEnded && c.status === "active" ? "ended" : c.status,
        pinned_at: c.pinned_at,
        created_at: c.created_at,
        media_url: presignedMediaUrl || c.media_url,
        donations_count: c._count?.donations || 0,
        bookmarks_count: c._count?.bookmarks || 0,
        progress_percent:
          goal > 0 ? Math.min(Math.round((current / goal) * 100), 1000) : 0,
        is_funded: isFunded,
      };
    })
  );

  const successRate =
    campaigns.length > 0
      ? Math.round((fullyFundedCampaigns / campaigns.length) * 100)
      : 0;

  // 4. Community & Follower Stats
  const [followersCount, followingCount, creatorPosts, likesCount, commentsCount] =
    await Promise.all([
      prisma.follow.count({ where: { following_id: numericUserId } }),
      prisma.follow.count({ where: { follower_id: numericUserId } }),
      prisma.post.findMany({
        where: { user_id: numericUserId, status: { not: "deleted" } },
        select: { id: true, created_at: true },
      }),
      campaignIds.length > 0
        ? prisma.like.count({
            where: {
              target_type: "campaign",
              target_id: { in: campaignIds },
            },
          })
        : 0,
      campaignIds.length > 0
        ? prisma.comment.count({
            where: {
              target_type: "campaign",
              target_id: { in: campaignIds },
            },
          })
        : 0,
    ]);

  const postIds = creatorPosts.map((p) => p.id);
  const [postLikes, postComments] = postIds.length > 0
    ? await Promise.all([
        prisma.like.count({
          where: { target_type: "post", target_id: { in: postIds } },
        }),
        prisma.comment.count({
          where: { target_type: "post", target_id: { in: postIds } },
        }),
      ])
    : [0, 0];

  const totalLikesReceived = likesCount + postLikes;
  const totalCommentsReceived = commentsCount + postComments;

  // 5. Recent Completed Donations on Creator's Campaigns
  const recentDonations =
    campaignIds.length > 0
      ? await prisma.donation.findMany({
          where: {
            campaign_id: { in: campaignIds },
            status: "completed",
          },
          include: {
            donor: {
              select: { id: true, name: true, username: true, email: true, avatar_url: true },
            },
            campaign: { select: { id: true, title: true } },
          },
          orderBy: { created_at: "desc" },
          take: 10,
        })
      : [];

  const formattedRecentDonations = await Promise.all(
    recentDonations.map(async (d) => ({
      id: d.id,
      amount: parseFloat(d.amount.toString()),
      created_at: d.created_at,
      donor_name: d.donor?.name || "Anonymous Backer",
      donor_username: d.donor?.username || "",
      donor_email: d.donor?.email || "",
      donor_avatar: (await getPresignedGetUrl(d.donor?.avatar_url)) || "",
      campaign_id: d.campaign?.id,
      campaign_title: d.campaign?.title || "Direct Contribution",
    }))
  );

  // 6. Monthly Trends (Past 6 Months) for Creator's Funding & Activity
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
      donations: 0,
      campaigns: 0,
      followers: 0,
      posts: 0,
    });
  }

  const sixMonthsAgo = monthlyTrends[0].start;

  if (campaignIds.length > 0) {
    const allRangeDonations = await prisma.donation.findMany({
      where: {
        campaign_id: { in: campaignIds },
        status: "completed",
        created_at: { gte: sixMonthsAgo },
      },
      select: { amount: true, created_at: true },
    });

    allRangeDonations.forEach((item) => {
      const itemDate = new Date(item.created_at);
      const bucket = monthlyTrends.find((b) => itemDate >= b.start && itemDate <= b.end);
      if (bucket) {
        bucket.revenue += parseFloat(item.amount.toString());
        bucket.donations += 1;
      }
    });
  }

  campaigns.forEach((c) => {
    const cDate = new Date(c.created_at);
    if (cDate >= sixMonthsAgo) {
      const bucket = monthlyTrends.find((b) => cDate >= b.start && cDate <= b.end);
      if (bucket) bucket.campaigns += 1;
    }
  });

  creatorPosts.forEach((p) => {
    const pDate = new Date(p.created_at);
    if (pDate >= sixMonthsAgo) {
      const bucket = monthlyTrends.find((b) => pDate >= b.start && pDate <= b.end);
      if (bucket) bucket.posts += 1;
    }
  });

  // Fetch recent followers over 6 months
  const recentFollowers = await prisma.follow.findMany({
    where: {
      following_id: numericUserId,
      created_at: { gte: sixMonthsAgo },
    },
    select: { created_at: true },
  });

  recentFollowers.forEach((f) => {
    const fDate = new Date(f.created_at);
    const bucket = monthlyTrends.find((b) => fDate >= b.start && fDate <= b.end);
    if (bucket) bucket.followers += 1;
  });

  const sanitizedTrends = monthlyTrends.map(
    ({ month, year, revenue, donations, campaigns, followers, posts }) => ({
      name: `${month} '${year.toString().slice(2)}`,
      month,
      revenue: Math.round(revenue * 100) / 100,
      donations,
      campaigns,
      followers,
      posts,
    })
  );

  // 7. Backer Donation Tier Breakdown
  const donationTiers = [
    { label: "Micro ($1 - $25)", range: "1-25", count: 0, totalAmount: 0, color: "#38bdf8" },
    { label: "Standard ($25 - $100)", range: "25-100", count: 0, totalAmount: 0, color: "#00aff0" },
    { label: "Enthusiast ($100 - $500)", range: "100-500", count: 0, totalAmount: 0, color: "#018cf1" },
    { label: "VIP ($500+)", range: "500+", count: 0, totalAmount: 0, color: "#0271c2" },
  ];

  if (campaignIds.length > 0) {
    const allCompletedDonations = await prisma.donation.findMany({
      where: {
        campaign_id: { in: campaignIds },
        status: "completed",
      },
      select: { amount: true },
    });

    allCompletedDonations.forEach((d) => {
      const amt = parseFloat(d.amount.toString());
      if (amt <= 25) {
        donationTiers[0].count += 1;
        donationTiers[0].totalAmount += amt;
      } else if (amt <= 100) {
        donationTiers[1].count += 1;
        donationTiers[1].totalAmount += amt;
      } else if (amt <= 500) {
        donationTiers[2].count += 1;
        donationTiers[2].totalAmount += amt;
      } else {
        donationTiers[3].count += 1;
        donationTiers[3].totalAmount += amt;
      }
    });
  }

  const tiersWithPercentages = donationTiers.map((tier) => ({
    ...tier,
    totalAmount: Math.round(tier.totalAmount * 100) / 100,
    percentageOfDonations:
      totalDonationsCount > 0
        ? Math.round((tier.count / totalDonationsCount) * 100)
        : 0,
    percentageOfRevenue:
      totalRaised > 0
        ? Math.round((tier.totalAmount / totalRaised) * 100)
        : 0,
  }));

  return {
    financials: {
      totalRaised,
      totalGoal,
      totalDonationsCount,
      averageDonation: Math.round(averageDonation * 100) / 100,
      totalRefunded,
      refundedCount,
      pendingCount: pendingDonationsCount,
      overallGoalReachedPercent:
        totalGoal > 0 ? Math.min(Math.round((totalRaised / totalGoal) * 100), 1000) : 0,
    },
    campaigns: {
      total: campaigns.length,
      active: activeCampaigns,
      ended: endedCampaigns,
      funded: fullyFundedCampaigns,
      successRate,
      list: formattedCampaigns,
    },
    community: {
      followersCount,
      followingCount,
      postsCount: creatorPosts.length,
      likesReceived: totalLikesReceived,
      commentsReceived: totalCommentsReceived,
    },
    trends: sanitizedTrends,
    donationTiers: tiersWithPercentages,
    recentDonations: formattedRecentDonations,
  };
};
