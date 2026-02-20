const { signup, login, getAllUsers } = require("../Controllers/AuthController");
const {
  signupValidation,
  loginValidation,
} = require("../Middlewares/AuthValidation");
const { ensureAuthenticated, ensureAdmin } = require("../Middlewares/Auth");

const router = require("express").Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
// router.post("/refeshtoken", loginValidation, login);
router.get("/users", ensureAuthenticated, ensureAdmin, getAllUsers);

module.exports = router;
