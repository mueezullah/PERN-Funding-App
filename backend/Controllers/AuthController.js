const { sign } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../Models/User");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findByEmail(email);
    if (user) {
      return res
        .status(409)
        .json({ message: "User already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.create(name, email, hashedPassword);
    res
      .status(201)
      .json({ message: "User registered successfully", success: true });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findByEmail(email);
    const errorMessage =
      "Authentication failed, Email or password is incorrect";
    if (!user) {
      return res.status(401).json({
        message: errorMessage,
        success: false,
      });
    }
    const isPassEqual = await bcrypt.compare(password, user.password);
    if (!isPassEqual) {
      return res.status(401).json({
        message: errorMessage,
        success: false,
      });
    }
    const jwtToken = jwt.sign(
      { email: user.email, id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );
    // Determine redirection path based on role
    const redirectTo = user.role === "admin" ? "/adminDashboard" : "/home";

    res.status(200).json({
      message: "Login success",
      success: true,
      jwtToken,
      email,
      name: user.name,
      role: user.role,
      redirectTo, // Frontend can use this to redirect immediately
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", success: false });
  }
};

module.exports = { signup, login };
