const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(express.json());
app.use(cors());
// database
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "food_donation",
  password: "likhon@011212066",
});
try {
  db.query("SHOW TABLES", (err, result) => {
    if (err) throw err;
    console.log(result);
  });
} catch (err) {
  console.log(err);
}
app.get("/", (req, res) => {
  res.send("running");
});

app.get("/foods", (req, res) => {
  const food = "SELECT * FROM  foods";
  db.query(food, (err, data) => {
    if (err) {
      console.log(err);
    }
    res.send(data);
  });
});

app.listen(port, () => {
  console.log("listening");
});
