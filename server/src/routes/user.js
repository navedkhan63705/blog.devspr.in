const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  changePassword,
} = require("../controllers/userController");

const { protect } = require("../middlewares/requireAuth");

// All routes are protected
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/change-password", protect, changePassword);

module.exports = router;
