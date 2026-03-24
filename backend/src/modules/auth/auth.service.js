const UserModel = require("../users/user.model");
const { hashPassword, comparePassword } = require("../../utils/hash");
const { generateToken } = require("../../utils/jwt");

const signupUser = async (name, email, password) => {
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    return { success: false, status: 409, message: "User already exists" };
  }

  const hashedPassword = await hashPassword(password);
  const newUser = await UserModel.create(name, email, hashedPassword);

  // Default to 'user' role if undefined for some reason
  const role = newUser.role || "user";

  const jwtToken = generateToken({
    email: newUser.email,
    id: newUser.id,
    role,
  });

  // Determine redirection path based on role
  const redirectTo = role === "admin" ? "/admin/dashboard" : "/feed";

  return {
    success: true,
    status: 201,
    data: {
      message: "User registered successfully",
      success: true,
      jwtToken,
      email: newUser.email,
      name: newUser.name,
      role,
      redirectTo,
    },
  };
};

const loginUser = async (email, password) => {
  const user = await UserModel.findByEmail(email);
  const errorMessage =
    "Authentication failed, Email or password is incorrect";

  if (!user) {
    return { success: false, status: 401, message: errorMessage };
  }

  const isPassEqual = await comparePassword(password, user.password);
  if (!isPassEqual) {
    return { success: false, status: 401, message: errorMessage };
  }

  const jwtToken = generateToken({
    email: user.email,
    id: user.id,
    role: user.role,
  });

  // Determine redirection path based on role
  const redirectTo =
    user.role === "admin"
      ? "/admin/dashboard"
      : user.role === "user"
        ? "/feed"
        : "/";

  return {
    success: true,
    status: 200,
    data: {
      message: "Login success",
      success: true,
      jwtToken,
      email,
      name: user.name,
      role: user.role,
      redirectTo,
    },
  };
};

const fetchAllUsers = async () => {
  const users = await UserModel.findAll();
  return {
    success: true,
    users,
    totalUsers: users.length,
  };
};

module.exports = { signupUser, loginUser, fetchAllUsers };
