// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");
const fs = require("fs");
const cors = require("cors");

const url = require("url");
const { waitForDebugger } = require("inspector");
const { title } = require("process");

const config = {
  user: "avnadmin",
  password: "AVNS_da0-TlwbiZCc7KDfBpB",
  host: "pg-10045fdf-hrjayasuryasingh-40eb.l.aivencloud.com",
  port: 27090,
  database: "defaultdb",
  ssl: {
    rejectUnauthorized: true,
    ca: `-----BEGIN CERTIFICATE-----
MIIEQTCCAqmgAwIBAgIUcAIZD6ofTePubz6b0+UpUXgzOu4wDQYJKoZIhvcNAQEM
BQAwOjE4MDYGA1UEAwwvZTM3YmE3Y2YtZmE1ZS00NWUzLWIwYmItZWZlNTk2MDhk
N2I1IFByb2plY3QgQ0EwHhcNMjUwMTIwMTAxNjQ4WhcNMzUwMTE4MTAxNjQ4WjA6
MTgwNgYDVQQDDC9lMzdiYTdjZi1mYTVlLTQ1ZTMtYjBiYi1lZmU1OTYwOGQ3YjUg
UHJvamVjdCBDQTCCAaIwDQYJKoZIhvcNAQEBBQADggGPADCCAYoCggGBAKMn5Twn
g+4kzOSM5MaBf8/1f+YOs861uXKswJjIfrzVnquI9oW87nsxtSWC7hhYjYX80Fbw
qNixj91DPfJ0I/80yDlVRk31P6JlNq7he2YJSTI3jeKg32e4ViTTbWApUmfGm2JB
zQlxvnT0Y62Or/pfjkz12+feS6xtCSHj3YYjCADk/T+go24n6vp9CSZiEjzzrwb/
iEd5/4ic+WSVaZd6zxIlM1Xm6QHsF+3zCcR9IhIBHvhQTMcV0lqcsHXpC766HY/j
rrij1g36UE54Xn34pjRjY/fZA2Ql302B45GlP/7GPM4pTGBe59S7+WMPufvWUXku
uLo04ns+mA+MJpuBOVwNBSOCSaD+O6lYjPuI/7ef6FWZQ6jZzCOxoylIa+sNppe1
0CZ+UOxke8eaikNEJxFB/0l/DD3IVKQ523wYhm+2b4GfGX7sodaeWZ9yKgqHgmEc
WIJ25kABmu+Vu9i8T643CAeQb9fbFegxFQUxgOpkBGNQK4BQWcZhFQiEEQIDAQAB
oz8wPTAdBgNVHQ4EFgQU+nwZP828LpBNZityU5456BTA3GcwDwYDVR0TBAgwBgEB
/wIBADALBgNVHQ8EBAMCAQYwDQYJKoZIhvcNAQEMBQADggGBABxBrnvJU3T1H2Ho
DubRQEoiNwPmTqKphMfV2ZmWz3pxlK8UgFh7ofu+uPPps53fXr7UixjrIJXZCeZM
xg+40TuXcI0ZJyGZZ6Z0Fex/lnolaWf7AiD5g7FrK2I+ClHad5Qq8u6Dbc0lGGzW
4g7p7PKGzOUgQ9336FWbqtR40dxbgTB0SOaNI9IJ351QHpZzxNAU8U5MbpUNdHJm
PO18J/KpNK2TZo3ZWVy3/MEYJeByG+OWk8Aw1IIrcNWyfo2qSrt6qyyevMKYFeAk
85BtTpJJ60e3/vLvZOuNNo0Gz02si11HAKr5KApLCHflaZO8lvSUCrgFni/CunS/
R1KNCASU4Lp0nm/vA2T/Cvi7qk/XGFP6UrDgDR54BHa3KuWHhDV1a+O1bdjnG6JQ
nu+2HiedxlX+e8qrhBUklto/HksfR9vdSa15JNkzvIR1SWVet/OuDzjk4fkxBHDD
JmTO3E9wFCYthJsCGpKrnv6q7uCgd5Opcs43cznK3KbCai1vJQ==
-----END CERTIFICATE-----`,
  },
};

const pool = new Pool(config);

pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to database.");
  client.query("SELECT VERSION()", [], (err, result) => {
    release();
    if (err) {
      console.error("Query error:", err);
      return;
    }
    console.log("PostgreSQL version:", result.rows[0].version);
  });
});

const app = express();
const PORT = 3005;
const JWT_SECRET = "iamsuryasinghamernstackdevelopersince2023andilovetodocode";
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
    res.json({ role: role });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
// admin crud start
app.get("/rentals", async (req, res) => {
  try {
    const result = await pool.query(
      ` SELECT ROW_NUMBER() OVER () AS row_number, users.id, users.username, books.title, books.id AS book_id, rentals.rented_on, rentals.due_date, rentals.quantity_rented, books.price as price_per_book, books.quantity_available FROM users INNER JOIN rentals ON users.id = rentals.user_id INNER JOIN books ON rentals.book_id = books.id WHERE users.role = 'customers';`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});
app.post("/rentals/add", async (req, res) => {
  const { user_id, book_id, quantity_rented, due_date } = req.body;

  try {
    await pool.query(
      `INSERT INTO rentals (user_id, book_id, quantity_rented, due_date) VALUES ($1, $2, $3, $4)`,
      [user_id, book_id, quantity_rented, due_date]
    );

    await pool.query(
      `UPDATE books SET quantity_available = quantity_available - $1 WHERE id = $2`,
      [quantity_rented, book_id]
    );

    res.json({ message: "Rental added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/rentals/delete", async (req, res) => {
  const { userid, bookid } = req.body;
  try {
    pool.query(
      ` delete from rentals where user_id=${userid} and book_id=${bookid};`
    );
    res.json({ message: "the rental is deleted " });
  } catch (error) {
    res.status(200).json({ messge: "error has occured" });
  }
});
app.get("/books", async (req, res) => {
  try {
    const results = await pool.query(
      `SELECT books.id AS book_id, books.title, books.author, books.price as price_per_book, books.quantity_available FROM books LEFT JOIN rentals ON books.id = rentals.book_id ORDER BY book_id;`
    );
    res.json(results.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error occurred on the server" });
  }
});

app.post("/books/add", async (req, res) => {
  const { name, author, price, available_quantity } = req.body;
  try {
    await pool.query(
      "INSERT INTO books (title, author,quantity_available,price) VALUES ($1, $2, $3, $4)",
      [name, author, available_quantity, price]
    );
    res.json({ message: "Added a book successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error has occurred on the server side" });
  }
});

app.delete("/books/delete", async (req, res) => {
  const { name } = req.body;
  try {
    pool.query("delete from books where title= $1", [name]);
    res.json({ messgae: "deleted a book successfully" });
  } catch (error) {
    res
      .status(200)
      .json({ message: "the error has occured at the server side" });
  }
});

// end of admins crud

// customer crud starts here

app.get("/mybooks/:name", async (req, res) => {
  const name = req.params.name;
  try {
    const result = await pool.query(
      `SELECT ROW_NUMBER() OVER () AS book_number,books.title as book_name,books.id as book_id,rentals.rented_on,rentals.due_date,rentals.quantity_rented,books.price as price_per_book FROM users INNER JOIN rentals ON users.id = rentals.user_id INNER JOIN books ON rentals.book_id = books.id WHERE users.username=$1;`,
      [name]
    );
    res.status(202).json(result.rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error has occurred on the server side" });
  }
});

// customer crud ends here

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
