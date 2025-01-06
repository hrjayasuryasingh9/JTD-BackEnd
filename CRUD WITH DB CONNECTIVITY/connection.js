const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "practice",
  password: "2119",
  port: 5433,
});

pool.connect((err) => {
  if (err) {
    console.error("Error connecting to db:", err.message);
  } else {
    console.log("Connected to PostgreSQL database");
  }
});

app.post("/employee/add", async (req, res) => {
  const { id, name, age, department } = req.body;
  console.log("Request body received:", req.body);

  if (!name || !age || !department) {
    return res
      .status(400)
      .send("Missing required fields: name, age, or department");
  }

  try {
    const query = id
      ? "INSERT INTO employees (id, name, age, department) VALUES ($1, $2, $3, $4)"
      : "INSERT INTO employees (name, age, department) VALUES ($1, $2, $3)";

    const params = id ? [id, name, age, department] : [name, age, department];

    const result = await pool.query(query, params);

    res
      .status(201)
      .json({ message: "Employee added successfully", result: result.rows });
  } catch (error) {
    console.error("Error executing query:", error.message);
    res.status(500).send("Error querying database");
  }
});

app.delete("/employee/delete/:name", async (req, res) => {
  const name = req.params.name;

  console.log("Name parameter received for deletion:", name);

  if (!name) {
    return res.status(400).send("Name parameter is required");
  }

  try {
    const result = await pool.query(
      "DELETE FROM employees WHERE name ILIKE $1 returning *",
      [name]
    );

    if (result.rows.length == 0) {
      return res.status(390).send("No employee found with the name");
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(300).send("WRONG REQUESST OR QUERY ");
  }
});

app.patch("/employee/update/:name", async (req, res) => {
  const cname = req.params.name;
  const { id, name, age, department } = req.body;
  console.log("Name parameter received:", cname);
  if (!id && !name && !age && !department) {
    return res.status(400).send("IF nothing is there why should you use me? ");
  }
  try {
    let query = "UPDATE employees SET ";
    let params = [];
    let count = 1;
    if (id) {
      query += `id=$${count++},`;
      params.push(id);
    }
    if (name) {
      query += `name=$${count++},`;
      params.push(name);
    }
    if (age) {
      query += `age=$${count++},`;
      params.push(age);
    }
    if (department) {
      query += `department=$${count++},`;
      params.push(department);
    }
    query = query.slice(0, -1);

    query += ` WHERE name ILIKE $${count++} RETURNING *`;
    params.push(cname);
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).send("Error querying database");
  }
});

app.get("/employee/:name", async (req, res) => {
  const name = req.params.name;
  console.log("Name parameter received:", name);
  try {
    let query;
    let params;
    if (name.toLowerCase() === "all") {
      query = "SELECT * FROM employees";
      params = [];
    } else {
      query = "SELECT * FROM employees WHERE name ILIKE $1";
      params = [name];
    }
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).send("Error querying database");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
