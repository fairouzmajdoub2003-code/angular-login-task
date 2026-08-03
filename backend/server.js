const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:4200", "http://localhost:4201"],
  })
);

app.use(express.json());

let pool;

/**
 * Creates the database and users table if they do not already exist.
 * It also creates one test user for the internship login.
 */
async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``
  );

  await connection.end();

  pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT NOT NULL AUTO_INCREMENT,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    )
  `);

  const username = "admin123";
  const password = "123456";

  const [existingUsers] = await pool.execute(
    "SELECT id FROM users WHERE username = ?",
    [username]
  );

  if (existingUsers.length === 0) {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, passwordHash]
    );

    console.log("Test user created: admin123");
  }
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Color Game backend is running",
  });
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      username.trim() === "" ||
      password === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const [users] = await pool.execute(
      `
        SELECT id, username, password_hash
        FROM users
        WHERE username = ?
        LIMIT 1
      `,
      [username.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = users[0];

    const passwordIsCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordIsCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      username: user.username,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const PORT = Number(process.env.PORT || 3000);

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
      console.log("Database connected successfully");
    });
  })
  .catch((error) => {
    console.error("Backend could not start:");
    console.error(error.message);
    process.exit(1);
  });