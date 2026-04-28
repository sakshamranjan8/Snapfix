require('dotenv').config();

console.log("MY URI IS:", process.env.MONGO_URI);

const mongoose = require('mongoose');
const Authority = require('./models/Authority');

const seedData = [
  {
    city: "Jalandhar",
    name: "Municipal Corporation Jalandhar",
    email: "commissioner.mcj@punjab.gov.in"
  },
  {
    city: "Patna",
    name: "Patna Municipal Corporation",
    email: "pmc@bihar.gov.in"
  },
  {
    city: "New Delhi",
    name: "Municipal Corporation of Delhi",
    email: "contact@mcd.nic.in"
  }
];

const seedDB = async () => {
  try {
    // 1. Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for seeding...");

    // 2. Clear existing authorities (to avoid duplicates)
    await Authority.deleteMany({});
    console.log("🗑️  Cleared old authority data");

    // 3. Insert new data
    await Authority.insertMany(seedData);
    console.log("🚀 Success: Added 3 cities to the database!");

    // 4. Close connection
    mongoose.connection.close();
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedDB();