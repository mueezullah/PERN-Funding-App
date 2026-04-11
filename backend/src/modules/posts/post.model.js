const pool = require("../../config/db");

const initTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      media_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
  `;
  try {
    await pool.query(query);
    console.log("Posts table is ready");
  } catch (error) {
    console.error("Error initializing posts table:", error);
    throw error;
  }
};

const Post = {
  init: initTable,

  create: async (userId, content, mediaUrl) => {
    const query = `
      INSERT INTO posts (user_id, content, media_url)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const values = [userId, content, mediaUrl];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  findAll: async (limit = 10, offset = 0) => {
    const query = `
      SELECT p.*, u.name as author_name, u.email as author_email, u.role as author_role
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await pool.query(query, [limit, offset]);
    
    const countQuery = `SELECT COUNT(*) FROM posts`;
    const countResult = await pool.query(countQuery);
    
    return {
      posts: result.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  },

  findByUserId: async (userId, limit = 10, offset = 0) => {
    const query = `
      SELECT p.*, u.name as author_name, u.email as author_email
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC
      LIMIT $2 OFFSET $3;
    `;
    const result = await pool.query(query, [userId, limit, offset]);

    const countQuery = `SELECT COUNT(*) FROM posts WHERE user_id = $1`;
    const countResult = await pool.query(countQuery, [userId]);

    return {
      posts: result.rows,
      total: parseInt(countResult.rows[0].count, 10)
    };
  },

  delete: async (id, userId) => {
    // Delete post ONLY if it belongs to the user requesting deletion
    const query = `
      DELETE FROM posts 
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const result = await pool.query(query, [id, userId]);
    return result.rows[0] || null;
  }
};

module.exports = Post;
