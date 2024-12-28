const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
app.use(express.json());
const jwt = require('jsonwebtoken');

const mongoUrl = "mongodb+srv://kuroshiasuka:admin@communi-backend.wwbaf.mongodb.net/?retryWrites=true&w=majority&appName=communi-backend";


const JWT_SECRET = "ksfdgjshdkjvbhdsjkhjkhkjh54jhj$#%^gsdfjkgdsjkghdjfkhiiiuiure&&^%"
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

// app.post("/login-user", async (req, res) => {
//   const { email, password } = req.body;

//   // Validate email and password
//   if (!email || !password) {
//     return res.status(400).send({ status: "error", data: "Email and password are required!" });
//   }

//   try {
//     const oldUser = await User.findOne({ email: email });

//     if (!oldUser) {
//       return res.status(404).send({ status: "error", data: "User doesn't exist!" });
//     }

//     const isPasswordValid = await bcrypt.compare(password, oldUser.password);

//     if (!isPasswordValid) {
//       return res.status(401).send({ status: "error", data: "Invalid password!" });
//     }

//     const token = jwt.sign({ email: oldUser.email }, JWT_SECRET, { expiresIn: "1h" });

//     return res.status(200).send({ status: "ok", data: token });
//   } catch (error) {
//     console.error("Error during login:", error);
//     return res.status(500).send({ status: "error", data: "Internal server error" });
//   }


// });

// Add the new route to save MBTI result

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

    // Retrieve user data including selected interests
    const userData = {
      firstName: oldUser.firstName,
      lastName: oldUser.lastName,
      email: oldUser.email,
      birthday: oldUser.birthday,
      program: oldUser.program,
    };

    // Fetch selected interests from the database
    const selectedInterests = oldUser.interests || []; // Fallback to an empty array if no interests are set

    // Return the user data along with the selected interests
    return res.status(200).send({
      status: "ok",
      userData: userData,
      selectedInterests: selectedInterests, // Include selected interests here
    });

  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).send({ status: "error", data: "Internal server error" });
  }
});


app.post("/save-mbti", async (req, res) => {
  const { email, mbtiResult } = req.body;

  if (!email || !mbtiResult) {
    return res.status(400).send({ status: "error", data: "Email and MBTI result are required" });
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      { mbtiType: mbtiResult },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ status: "error", data: "User not found" });
    }

    res.status(200).send({ status: "ok", data: "MBTI result saved successfully", user: updatedUser });
  } catch (error) {
    console.error("Error saving MBTI result:", error);
    res.status(500).send({ status: "error", data: "Internal server error" });
  }
});


app.post("/save-interests", async (req, res) => {
  const { email, selectedInterests } = req.body;

  // Ensure email and selectedInterests are provided
  if (!email || !selectedInterests || selectedInterests.length === 0) {
    return res.status(400).send({ status: 'error', data: 'Email and interests are required' });
  }

  try {
    // Find the user by email and update the interests field
    const updatedUser = await User.findOneAndUpdate(
      { email: email },  // Match the user by email
      { $set: { interests: selectedInterests } },  // Update interests using $set
      { new: true }  // Ensure the updated document is returned
    );

    // If no user is found
    if (!updatedUser) {
      return res.status(404).send({ status: 'error', data: 'User not found' });
    }

    res.status(200).send({ status: 'ok', data: 'Interests saved successfully', user: updatedUser });
  } catch (error) {
    console.error('Error saving interests:', error);
    res.status(500).send({ status: 'error', data: 'Internal server error' });
  }
});


app.listen(5003, () => {
  console.log("Node js server started.. we're killing this");
});
