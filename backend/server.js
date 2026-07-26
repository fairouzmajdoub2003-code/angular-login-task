const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Temporary user stored in the backend.
// Later, we will move this user to MySQL.
const user = {
  id: 1,
  username: "admin123",
  passwordHash: bcrypt.hashSync("123456", 10)
};

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  if (username !== user.username) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const passwordIsCorrect = bcrypt.compareSync(
    password,
    user.passwordHash
  );

  if (!passwordIsCorrect) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    {
      userId: user.id,
      username: user.username
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return res.json({
    success: true,
    message: "Login successful",
    token: token,
    username: user.username
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});