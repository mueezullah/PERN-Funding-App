const app = require("./app");
const { PORT } = require("./config/env");
const UserModel = require("./modules/users/user.model");
const CampaignModel = require("./modules/campaigns/campaign.model");

// Initialize the tables
UserModel.init()
  .then(() => CampaignModel.init())
  .then(() => {
    console.log("Database schema initialized");
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
