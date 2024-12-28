const { prototype } = require("events");
const express = require("express");
const PORT = 3001;
const fs = require("fs");
const path = require("path");
const { json } = require("stream/consumers");
console.log(__dirname);
const filePath = path.join(__dirname, "data.json");

const app = express();
app.use(express.json());
function readData() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
}

app.get("/hello", (req, res) => {
  res.status(200).json({ message: "hello world" });
});
app.post("/item", (req, res) => {
  const newitem = req.body;
  const items = readData();
  newitem.id = items.length ? items[items.length - 1].id + 1 : 1;
  items.push(newitem);
  writeData(items);
  res.status(201).json(newitem);
});
app.get("/item", (req, res) => {
  const data = readData();
  res.status(200).json(data);
});
app.get("/item/:id", (req, res) => {
  const items = readData();
  const idu = parseInt(req.params.id);
  const item = items.find((element) => element.id === idu);
  res.status(201).json(item);
});

app.put("/item/:id", (req, res) => {
  const updated = req.body;
  const items = readData();
  const idu = parseInt(req.params.id);
  const index = items.findIndex((element) => element.id === idu);
  items[index] = { ...items[index], ...updated, id: idu };
  writeData(items);
  res.status(200).json(items[index]);
});

app.patch("/item/:id", (req, res) => {
  const updated = req.body;
  const items = readData();
  const idu = parseInt(req.params.id);
  const index = items.findIndex((element) => element.id === idu);
  items[index] = { ...items[index], ...updated};
  writeData(items);
  res.status(200).json(items[index]);
});


app.delete("/item/:id", (req, res) => {
  const items = readData();
  const idu = parseInt(req.params.id);
  const index = items.findIndex((element) => element.id === idu);
  items.splice(index, 1);
  writeData(items);
  res
    .status(200)
    .json([{ message: "the id numbered person is deleted" }, items]);
});
app.listen(PORT, () => {
  console.log("property of JTD BACKEND");
});
