import * as adminService from "./admin.service.js";

export const getAdminAnalytics = async (req, res) => {
  try {
    const analytics = await adminService.getPlatformAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch platform analytics",
      error: error.message,
    });
  }
};
