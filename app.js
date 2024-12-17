const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
app.use(express.json());
const jwt=require('jsonwebtoken');

const mongoUrl = "mongodb+srv://kuroshiasuka:admin@communi-backend.wwbaf.mongodb.net/?retryWrites=true&w=majority&appName=communi-backend";


const JWT_SECRET="ksfdgjshdkjvbhdsjkhjkhkjh54jhj$#%^gsdfjkgdsjkghdjfkhiiiuiure&&^%"
mongoose.connect(mongoUrl)
  .then(() => {
    console.log("Database Connected");
  })
  .catch((e) => {
    console.log(e);
  });

require('./UserDetails');
const User = mongoose.model("UserInfo");

app.get("/", (req, res) => {
  res.send({ status: "Started" });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, birthday, idNumber, program } = req.body;

  if (!firstName || !lastName || !email || !password || !birthday || !idNumber || !program) {
    return res.status(400).send({ status: "error", data: "All fields are required" });
  }

  const oldUser = await User.findOne({ email: email });
  if (oldUser) {
    return res.send({ data: "User already exists!" });
  }

  try {
    const encryptPassword = await bcrypt.hash(password, 10);
    // Create the user without the mbtiType
    await User.create({
      firstName,
      lastName,
      email,
      password: encryptPassword,
      birthday,
      idNumber,
      program,
    });
    res.send({ status: "ok", data: "User Created" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ status: "error", data: "An error occurred during user creation" });
  }
});


// Update user MBTI type endpoint
app.post('/updateUserData', async (req, res) => {
  const { email, mbtiType } = req.body;

  console.log('Request received for updateUserData:', req.body); // Debugging log

  if (!email || !mbtiType) {
    console.error('Invalid request: Missing email or mbtiType');
    return res.status(400).send({ status: 'error', data: 'Email and MBTI type are required' });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email }, 
      { mbtiType: mbtiType }, 
      { new: true }
    );

    if (!updatedUser) {
      console.error('User not found for email:', email);
      return res.status(404).send({ status: 'error', data: 'User not found' });
    }

    console.log('User updated successfully:', updatedUser);
    res.send({ status: 'ok', data: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error during user update:', error);
    res.status(500).send({ status: 'error', data: 'An error occurred while updating the user' });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return res.status(400).send({ status: "error", data: "Email and password are required!" });
  }

  try {
    const oldUser = await User.findOne({ email: email });

    if (!oldUser) {
      return res.status(404).send({ status: "error", data: "User doesn't exist!" });
    }

    const isPasswordValid = await bcrypt.compare(password, oldUser.password);

    if (!isPasswordValid) {
      return res.status(401).send({ status: "error", data: "Invalid password!" });
    }

    const token = jwt.sign({ email: oldUser.email }, JWT_SECRET, { expiresIn: "1h" });

    return res.status(200).send({ status: "ok", data: token });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send({ status: "error", data: "Internal server error" });
  }
});


app.listen(5003, () => {
  console.log("Node js server started");
});
