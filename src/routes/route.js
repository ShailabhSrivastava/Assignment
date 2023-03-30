const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authentication, isUserAuthorised } = require("../middleware/auth");

router.post("/users", userController.createUser);
router.post("/login", userController.userLogin);
router.get("/users", authentication, userController.getAllUser);
router.get("/users/:id", authentication, userController.getProfile);
router.put("/users/:id",authentication,isUserAuthorised,userController.updateUser);
router.delete("/users/:id",authentication,isUserAuthorised,userController.deleteUserById);

module.exports = router;
