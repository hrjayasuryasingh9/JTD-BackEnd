const http = require("http");
const PORT = 3001;
const fs = require("fs");
const path = require("path");
console.log(__dirname);
const filePath = path.join(__dirname, "data.json");

function readData() {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;
  if (method === "GET" && url === "/hello") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World..");
  } else if (method === "POST" && url === "/items") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const newItem = JSON.parse(body);
      const items = readData();

      newItem.id = items.length ? items[items.length - 1].id + 1 : 1;
      items.push(newItem);
      writeData(items);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(newItem));
    });
  } else if (method === "GET" && url === "/items") {
    const items = readData();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(items));
  } else if (method === "GET" && url.startsWith("/items/")) {
    const id = parseInt(url.split("/")[2]);

    const items = readData();
    const item = items.find((i) => i.id === id);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(item));
  } else if (method === "DELETE" && url.startsWith("/items/")) {
    const id = parseInt(url.split("/")[2]);

    const items = readData();
    const index = items.findIndex((i) => i.id === id);
    const deletedItem = items.splice(index, 1);
    writeData(items);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(deletedItem));
  } else if (method === "PUT" && url.startsWith("/items/")) {
    const id = parseInt(url.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const updatedItem = JSON.parse(body);
      const items = readData();
      const index = items.findIndex((i) => i.id === id);
      items[index] = { ...items[index], ...updatedItem, id };
      writeData(items);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(items[index]));
    });
  } else if (method === "PATCH" && url.startsWith("/items/")) {
    const id = parseInt(url.split("/")[2]);
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const updatedItem = JSON.parse(body);
      const items = readData();
      const index = items.findIndex((i) => i.id === id);
      items[index] = { ...items[index], ...updatedItem };
      writeData(items);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(items[index]));
    });
  }
});

server.listen(3001, () => {
  console.log("property of JTD BACKEND");
});
