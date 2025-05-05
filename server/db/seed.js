const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function seed() {
  console.log("Seeding the database...");
  try {
    // Clear the database
    await prisma.student.deleteMany();
    await prisma.instructor.deleteMany();

    // Create instructors
    const instructors = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        prisma.instructor.create({
          data: {
            username: faker.internet.userName(),
            password: faker.internet.password(),
          },
        })
      )
    );

    // Create students and associate them with instructors
    for (const instructor of instructors) {
      await Promise.all(
        Array.from({ length: 4 }).map(() =>
          prisma.student.create({
            data: {
              name: faker.name.fullName(),
              cohort: faker.number.int({ min: 2000, max: 3000 }).toString(),
              instructorId: instructor.id, // Link student to instructor
            },
          })
        )
      );
    }

    console.log("Seeding complete.");
  } catch (err) {
    console.error("Error seeding:", err);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
