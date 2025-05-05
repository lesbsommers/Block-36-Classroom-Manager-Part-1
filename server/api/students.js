// An instructor can only access their own students' data.
const router = require("express").Router();
const prisma = require("../db");

// Deny access if user is not logged in
router.use((req, res, next) => {
  if (!req.user) {
    return res.status(401).send("You must be logged in to do that.");
  }
  next();
});

// Get all students for logged-in instructor
router.get("/", async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: {
        instructorId: req.user.id,
      },
    });
    res.send(students);
  } catch (error) {
    next(error);
  }
});

// Get a specific student by ID, scoped to instructor
router.get("/:id", async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id: Number(req.params.id),
        instructorId: req.user.id,
      },
    });

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    res.send(student);
  } catch (error) {
    next(error);
  }
});

// Create a new student (owned by logged-in instructor)
router.post("/", async (req, res, next) => {
  try {
    const student = await prisma.student.create({
      data: {
        name: req.body.name,
        cohort: req.body.cohort,
        instructorId: req.user.id,
      },
    });
    res.status(201).send(student);
  } catch (error) {
    next(error);
  }
});

// Update a student (only if belongs to instructor)
router.put("/:id", async (req, res, next) => {
  try {
    const student = await prisma.student.updateMany({
      where: {
        id: Number(req.params.id),
        instructorId: req.user.id,
      },
      data: {
        name: req.body.name,
        cohort: req.body.cohort,
      },
    });

    if (student.count === 0) {
      return res.status(404).send("Student not found.");
    }

    // Return updated student
    const updated = await prisma.student.findUnique({
      where: { id: Number(req.params.id) },
    });

    res.send(updated);
  } catch (error) {
    next(error);
  }
});

// Delete a student by ID (owned by instructor)
router.delete("/:id", async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: {
        id: Number(req.params.id),
        instructorId: req.user.id,
      },
    });

    if (!student) {
      return res.status(404).send("Student not found.");
    }

    await prisma.student.delete({
      where: { id: student.id },
    });

    res.send(student);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
