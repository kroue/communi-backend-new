const mongoose=require("mongoose");

const UserDetailSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true },
    password: String,
    birthday: String,
    idNumber: String,
    program: String,
    mbtiType: String, // Add mbtiType here
  }, {
    collection: "UserInfo"
  });
mongoose.model("UserInfo",UserDetailSchema);