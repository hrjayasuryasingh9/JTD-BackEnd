// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

const app = express();
const PORT = 3005;
const JWT_SECRET = "iamsuryasinghamernstackdevelopersince2023andilovetodocode";
const pool = new Pool({
  user: "avnadmin",
  host: "pg-10045fdf-hrjayasuryasingh-40eb.l.aivencloud.com",
  database: "defaultdb",
  password: "AVNS_vV-Zf1C3zUr0yxgAQDx",
  port: 27090,
});

app.use(express.json());

app.post("/registration", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please enter the details for all the fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id",
      [username, hashedPassword, role]
    );
    res.status(201).json({
      message: "Registration successful please proceed with login",
      userId: result.rows[0].id,
    });
  } catch (error) {
    if (error.code === "23505") {
      res.status(400).json({ message: "Username already exists" });
    } else {
      console.log(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
});

app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 AND role = $2",
      [username, role]
    );
    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ message: "User not found or role mismatch" });
    }

    const user = result.rows[0];
    const ispasswordcorrect = await bcrypt.compare(password, user.password);
    console.log(password);
    console.log(user.password);
    if (!ispasswordcorrect) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "24h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: "Access forbidden: Insufficient permissions" });
    }
    next();
  };
};

app.get("/admin", authenticateToken, authorizeRole("admin"), (req, res) => {
  res.json({ message: "Welcome to the admin panel!" });
});

app.get("/user", authenticateToken, (req, res) => {
  res.json({ message: `Welcome, user with ID: ${req.user.userId}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
