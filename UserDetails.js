const mongoose = require("mongoose");

const UserDetailSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  birthday: String,
  idNumber: String,
  program: String,
  mbtiType: String, // Add mbtiType here
  interests: [String],  // Add this line to store the interests as an array of strings

}, {
  collection: "UserInfo"
});
mongoose.model("UserInfo", UserDetailSchema);