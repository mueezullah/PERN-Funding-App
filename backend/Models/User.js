const pool = require("./db"); // Import your PostgreSQL connection

// Define the User schema structure (for documentation/validation)
const UserSchema = {
  id: "SERIAL PRIMARY KEY",
  name: "VARCHAR(255) NOT NULL",
  email: "VARCHAR(255) UNIQUE NOT NULL",
  password: "VARCHAR(255) NOT NULL",
  role: "VARCHAR(20) NOT NULL DEFAULT 'user'",
  created_at: "TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
};

// Initialize/Create table if it doesn't exist
const initializeTable = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log("Users table is ready");
  } catch (error) {
    console.error("Error initializing users table:", error);
    throw error;
  }
};

// User Model with all operations
const User = {
  // Initialize table
  init: initializeTable,

  // CREATE - Sign up new user
  create: async (name, email, password) => {
    const query = `
      INSERT INTO users (name, email, password) 
      VALUES ($1, $2, $3)
      RETURNING id, name, email, created_at;
    `;
    const values = [name, email, password];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // READ - Find user by email (for sign-in)
  findByEmail: async (email) => {
    const query = "SELECT * FROM users WHERE email = $1";

    try {
      const result = await pool.query(query, [email]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // READ - Find user by ID
  findById: async (id) => {
    const query =
      "SELECT id, name, email, created_at FROM users WHERE id = $1";

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // READ - Get all users
  findAll: async () => {
    const query =
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC";

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE - Update user details
  update: async (id, name, email) => {
    const query = `
      UPDATE users 
      SET name = $1, email = $2 
      WHERE id = $3 
      RETURNING id, name, email, created_at;
    `;

    try {
      const result = await pool.query(query, [name, email, id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  // UPDATE - Update password
  updatePassword: async (id, newPassword) => {
    const query = "UPDATE users SET password = $1 WHERE id = $2";

    try {
      await pool.query(query, [newPassword, id]);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // DELETE - Delete user
  delete: async (id) => {
    const query = "DELETE FROM users WHERE id = $1 RETURNING id";

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  },
};

module.exports = User;
