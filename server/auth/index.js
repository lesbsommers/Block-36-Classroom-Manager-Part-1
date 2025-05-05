const router = require("express").Router();
const prisma = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10; // Number of rounds for bcrypt hashing

// Register a new instructor account
router.post("/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingInstructor = await prisma.instructor.findUnique({
      where: { username },
    });
    if (existingInstructor) {
      return res.status(400).send("Instructor with that username already exists.");
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the instructor record
    const instructor = await prisma.instructor.create({
      data: { username, password: hashedPassword },
    });

    // Create a JWT token
    const token = jwt.sign({ id: instructor.id }, process.env.JWT);

    res.status(201).send({ token });
  } catch (error) {
    next(error);
  }
});

// Login to an existing instructor account
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find the instructor by username
    const instructor = await prisma.instructor.findUnique({
      where: { username },
    });

    if (!instructor) {
      return res.status(401).send("Invalid login credentials.");
    }

    // Compare the password with the hashed password stored in the database
    const match = await bcrypt.compare(password, instructor.password);
    if (!match) {
      return res.status(401).send("Invalid login credentials.");
    }

    // Create a JWT token
    const token = jwt.sign({ id: instructor.id }, process.env.JWT);

    res.send({ token });
  } catch (error) {
    next(error);
  }
});

// Get the currently logged-in instructor
router.get("/me", async (req, res, next) => {
  try {
    const instructor = await prisma.instructor.findUnique({
      where: { id: req.user?.id },
    });

    if (!instructor) {
      return res.status(404).send("Instructor not found.");
    }

    res.send(instructor);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
