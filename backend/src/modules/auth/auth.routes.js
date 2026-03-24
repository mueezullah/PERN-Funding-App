const { signup, login, getAllUsers } = require("./auth.controller");
const { signupValidation, loginValidation } = require("./auth.validation");
const { ensureAuthenticated, ensureAdmin } = require("./auth.middleware");

const router = require("express").Router();

router.post("/signup", signupValidation, signup);
router.post("/login", loginValidation, login);
router.get("/users", ensureAuthenticated, ensureAdmin, getAllUsers);

module.exports = router;
