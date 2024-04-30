const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const port = process.env.PORT || 5000;
const knowledgeBase = require("./knowledgeBase");
app.use(express.json());
app.use(cors());

// database

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

// chatbot
app.get("/chatbot", async (req, res) => {
  const question = req.query.question;

  const formattedQuestion = question.toLowerCase().trim();

  const formattedQuestionWithQuestionMark = formattedQuestion.endsWith("?")
    ? formattedQuestion
    : formattedQuestion + "?";

  const normalizedKnowledgeBase = {};
  for (const key in knowledgeBase) {
    const normalizeKey = key.trim().toLowerCase();
    const normalizeValue = knowledgeBase[key].trim();
    normalizedKnowledgeBase[normalizeKey] = normalizeValue;
  }
  if (
    normalizedKnowledgeBase.hasOwnProperty(formattedQuestionWithQuestionMark)
  ) {
    res.json(normalizedKnowledgeBase[formattedQuestionWithQuestionMark]);
  } else {
    res.status(404).json("Sorry, I don't have an answer to that question.");
  }
});
// getting chatbot question
app.get("/chatbot/question", async (req, res) => {
  const question = Object.keys(knowledgeBase);
  res.send(question);
});
app.get("/", (req, res) => {
  res.send("running");
});
// foods
// insert foods
app.post("/foods", (req, res) => {
  const {
    email,
    user_name,
    user_photo,
    status,
    additional_notes,
    expire_date,
    location,
    quantity,
    food_name,
    food_photo,
    category,
    category_image,
  } = req.body;
  const query =
    "INSERT INTO foods (email, user_name, user_photo, status, additional_notes, expire_date, location, quantity, food_name, food_photo, category, category_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      email,
      user_name,
      user_photo,
      status,
      additional_notes,
      expire_date,
      location,
      quantity,
      food_name,
      food_photo,
      category,
      category_image,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results);
    }
  );
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
// getting food name

app.get("/foods/food-name/:category", async (req, res) => {
  const category = req.params.category;
  const query = "SELECT food_name FROM foods WHERE category=?";
  db.query(query, [category], (err, results) => {
    if (err) {
      console.log(err);
    }
    let foodName = [];
    if (results) {
      results.forEach((food) => foodName.push(food?.food_name));
    }
    res.send(foodName);
  });
});
// unique category
app.get("/unique-categories", (req, res) => {
  const query = "SELECT DISTINCT category, category_image FROM foods ";

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
    }

    res.send(results);
  });
});
// foods category
app.get("/foods/:category", async (req, res) => {
  const category = req.params.category;
  const orderBy = req.query.sort;
  const search = req.query.name;
  console.log(search);

  let food = `SELECT * FROM foods WHERE category=?`;
  if (search) {
    food += ` AND food_name=?`;
  }
  if (orderBy) {
    food += ` ORDER BY ${orderBy}`;
  }

  db.query(food, [category, search], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// foods for donor
app.get("/foods/donor/:email", async (req, res) => {
  const email = req.params.email;

  const query = "SELECT * FROM foods WHERE   email=?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// delete food
app.delete("/foods/:id", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM foods WHERE id=?";
  db.query(query, [id], async (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// getting single food
app.get("/foods/single-foods/:id", async (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM foods WHERE id=?";
  db.query(query, [id], async (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results[0]);
  });
});

// update food
app.put("/foods/:id", async (req, res) => {
  const id = req.params.id;
  const {
    category,
    additional_notes,
    expire_date,
    location,
    quantity,
    food_name,
    food_photo,
    category_image,
  } = req.body;
  const query =
    "UPDATE foods SET category = ?, additional_notes = ?, expire_date = ?, location = ?, quantity = ?, food_name = ?, food_photo = ?, category_image = ? WHERE id = ?";
  db.query(
    query,
    [
      category,
      additional_notes,
      expire_date,
      location,
      quantity,
      food_name,
      food_photo,
      category_image,
      id,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results);
    }
  );
});
// foods  update status
app.put("/foods/update/:id", async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;
  console.log(id, status, "update food");
  const query = "UPDATE foods SET status =? WHERE id =?";

  db.query(query, [status, id], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});

// manage foods
app.post("/manage-food", async (req, res) => {
  const {
    food_id,
    status,
    deliveryStatus,
    recipientEmail,
    recipientName,
    recipientImage,
    donorName,
    donorEmail,
    donorImage,
    additional_notes,
    expire_date,
    location,
    quantity,
    food_name,
    food_photo,
    category,
    category_image,
  } = req.body;
  const manageQuery = `INSERT INTO manage_food (
      food_id,
      status,
      deliveryStatus,
      recipientEmail,
      recipientName,
      recipientImage,
      donorName,
      donorEmail,
      donorImage,
      additional_notes,
      expire_date,
      location,
      quantity,
      food_name,
      food_photo,
      category,
      category_image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    manageQuery,
    [
      food_id,
      status,
      deliveryStatus,
      recipientEmail,
      recipientName,
      recipientImage,
      donorName,
      donorEmail,
      donorImage,
      additional_notes,
      expire_date,
      location,
      quantity,
      food_name,
      food_photo,
      category,
      category_image,
    ],
    (err, results) => {
      if (err) {
        console.log(err);
      }

      res.send(results);
    }
  );
});
// getting manage-food for user
app.get("/manage-food/:email", async (req, res) => {
  const email = req.params.email;

  const query = "SELECT * FROM manage_food WHERE recipientEmail=?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// manage-food for donor

app.get("/manage-food/donor/:email", async (req, res) => {
  const email = req.params.email;

  const query = "SELECT * FROM manage_food WHERE donorEmail=?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// delete manage foods

app.delete("/manage-food/:id", async (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM manage_food WHERE food_id=?";
  db.query(query, [id], async (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});

// update manage food
app.put("/manage-food/:id", async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;
  console.log(status, "manage food");

  const query = "UPDATE manage_food SET status =? WHERE id =?";

  db.query(query, [status, id], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// update deliveryStatus
app.put("/manage-food/delivery/:id", async (req, res) => {
  const id = req.params.id;
  const deliveryStatus = req.body.status;
  const query = "UPDATE manage_food SET deliveryStatus=? WHERE id=?";
  db.query(query, [deliveryStatus, id], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// register
app.post("/register", async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const userImage = req.body.userImage;
  const role = req.body.role;
  const hashedPassword = await bcrypt.hash(password, 10);

  const query =
    "INSERT INTO users (username,email,password,role,userImage) VALUES (?,?,?,?,?)";
  db.query(
    query,
    [username, email, hashedPassword, role, userImage],
    (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).send({ message: "Email already exists" });
        } else {
          console.log(err);
          return res.status(500).send({ message: "Failed to register user" });
        }
      } else {
        const user = { email, username, role, userImage };
        return res
          .status(201)
          .send({ message: "User registered successfully", user });
      }
    }
  );
});
// login
app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const username = req.body.username;
  const userImage = req.body.userImage;
  const role = req.body.role;
  console.log(typeof password);
  const query = "SELECT * FROM users WHERE email=?";
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.log(err);
    }
    if (results.length === 0) {
      return res.status(401).send({ message: "Invalid Email" });
    }
    const userData = results[0];

    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid Password" });
    }
    const user = { email, userImage, username, role };
    return res.status(200).send({ message: "Login Successful", user });
    // return res.status(200).send({ message: "Login successful", user });
  });
});
// logout
app.post("/logout", (req, res) => {
  res.status(200).send({ message: "Logout successful" });
});

// stats

// user-stats
app.get("/user-stats/:email", async (req, res) => {
  const email = req.params.email;
  const query =
    "SELECT status,COUNT(*) as count FROM manage_food WHERE recipientEmail=? GROUP BY status ";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.log(err);
    }
    let resultObj = {};
    results.forEach((result) => {
      resultObj[result.status] = result.count;
    });
    res.send(resultObj);
  });
});
// get user

// donor stats
app.get("/donor-stats/:email", async (req, res) => {
  const email = req.params.email;
  const categoryQuery = `SELECT category, COUNT(*) as count FROM manage_food WHERE donorEmail=? GROUP BY category`;
  const recipientCount =
    "SELECT COUNT(DISTINCT recipientEmail) as totalRecipient FROM manage_food WHERE donorEmail=? ";
  const statusQuery =
    "SELECT status,COUNT(*) as count FROM foods WHERE email=? GROUP BY status ";
  const totalAddedFoodQuery =
    "SELECT COUNT(*) as totalFoodCount FROM foods WHERE email=?";
  const deliveredQuery = `SELECT count(*) as count FROM manage_food WHERE deliveryStatus="delivered" AND donorEmail=?`;
  //  total recipient query
  db.query(recipientCount, [email], (err, totalRecipient) => {
    if (err) {
      console.log(err);
      return;
    }
    // categoryQuery
    db.query(categoryQuery, [email], (err, categoryData) => {
      if (err) {
        console.log(err);
        return;
      }
      // statusQuery
      db.query(statusQuery, [email], (err, statusData) => {
        if (err) {
          console.log(err);
        }
        db.query(totalAddedFoodQuery, [email], (err, totalFood) => {
          if (err) {
            console.log(err);
          }
          db.query(deliveredQuery, [email], (err, delivered) => {
            if (err) {
              console.log(err);
            }
            const responseData = {
              categoryData,
              totalRecipient: totalRecipient[0].totalRecipient,
              statusData,
              totalFood: totalFood[0].totalFoodCount,
              delivered: delivered[0].count,
            };
            res.send(responseData);
          });
        });
      });
    });
  });
});
app.get("/admin-stats", async (req, res) => {
  const userQuery = `SELECT (SELECT COUNT(DISTINCT recipientEmail) FROM manage_food)as uniqueRecipients,(SELECT COUNT(DISTINCT email) FROM foods) as uniqueDonor ,(SELECT SUM(quantity)  FROM foods) AS totalQuantity,(SELECT COUNT(*) FROM foods ) AS totalFood,(SELECT  COUNT(*) FROM foods WHERE status="delivered") AS totalDelivered`;
  // join query of avg expire date and  total quantity by donorEmail
  const query = `SELECT t1.email,t1.totalQuantity,t2.avg_expire_date FROM(SELECT email,SUM(quantity) AS totalQuantity FROM foods GROUP BY email) AS t1 JOIN (SELECT email,ROUND(AVG(expire_date),2) AS avg_expire_date FROM foods GROUP BY email) AS t2 ON t1.email=t2.email`;

  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
    }
    db.query(userQuery, (err, userResults) => {
      if (err) {
        console.log(err);
      }
      res.send({ results, userResults: userResults[0] });
    });
  });
});
// getting user
app.get("/users", async (req, res) => {
  const query = "SELECT * FROM users";
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
app.get("/users/:email", async (req, res) => {
  const email = req.params.email;
  const query = "SELECT * FROM users WHERE email=?";
  db.query(query, [email], async (err, results) => {
    const user = results[0];
    if (err) {
      console.log(err);
    }
    res.send(user);
  });
});
// delete user
app.delete("/users/:email", async (req, res) => {
  const email = req.params.email;
  console.log(email);
  const query = "DELETE FROM users WHERE email=?";
  db.query(query, [email], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// update user role
app.put("/users/:email", async (req, res) => {
  const email = req.params.email;
  const role = req.body.role;
  console.log(email, role);
  const query = "UPDATE users SET role=? WHERE email=?";

  db.query(query, [role, email], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});

// rating
app.post("/rating", async (req, res) => {
  const { suggestion, feedback, name, email, userImage, ratingValue, date } =
    req.body;

  const query =
    "INSERT INTO rating (suggestion,feedback,name,email,userImage,ratingValue,date) VALUES(?,?,?,?,?,?,?)";
  db.query(
    query,
    [suggestion, feedback, name, email, userImage, ratingValue, date],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results);
    }
  );
});
// get rating
app.get("/rating", async (req, res) => {
  const query = "SELECT * FROM rating ORDER BY date DESC";
  db.query(query, (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
// delete rating
app.delete("/rating/:id", async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM rating WHERE id=?";
  db.query(query, [id], (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results);
  });
});
app.listen(port, () => {
  console.log("listening");
});
