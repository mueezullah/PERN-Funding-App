const router = require("express").Router();
const ensureAuthenticated = require("../Middlewares/Auth.js");

router.get("/prods", ensureAuthenticated, (req, res) => {
  console.log("---Logged In User Detail---", req.user);

  res.status(200).json([
    {
      name: "mobile",
      price: 20000,
    },
    {
      name: "laptop",
      price: 50000,
    },
    {
      name: "tv",
      price: 30000,
    },
  ]);
});

module.exports = router;
