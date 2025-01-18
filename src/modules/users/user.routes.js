// userRoutes.js
const express = require("express");
const userControllers = require("./users.controller");
const router = express.Router();

router.get("/user-stats/:email", userControllers.getUserStats);
router.get("/donor-stats/:email", userControllers.getDonorStats);
router.get("/users", userControllers.getAllUsers);
router.get("/users/:email", userControllers.getUserByEmail);
router.delete("/users/:email", userControllers.deleteUserByEmail);
router.put("/users/:email", userControllers.updateUserRole);

const userRoutes = router;
module.exports = userRoutes;
