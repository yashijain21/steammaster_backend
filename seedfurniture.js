const mongoose = require('mongoose');
const Service = require('./models/Service');
const Category = require('./models/Category');

// Replace with your MongoDB URI
const MONGO_URI = 'mongodb+srv://yashi:12345@cluster0.wux9ud9.mongodb.net/Steammaster?retryWrites=true&w=majority';

const services = [
  {
    name: "Spjälsäng",
    description: "Ångrengöring av madrass för babysäng.",
    price: 300,
    durationMinutes: 20,
    categoryName: "Sängar och madrasser",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "Enkel säng",
    description: "Ångrengöring för enkelsängsmadrass.",
    price: 600,
    durationMinutes: 25,
    categoryName: "Sängar och madrasser",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "Dubbelsäng (120, 140, 160, 180 cm)",
    description: "Djuprengöring för dubbelsäng.",
    price: 900,
    durationMinutes: 35,
    categoryName: "Sängar och madrasser",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "King size-säng",
    description: "Ångrengöring för kingsize-säng.",
    price: 1100,
    durationMinutes: 40,
    categoryName: "Sängar och madrasser",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "2-sits soffa",
    description: "Ångrengöring av 2-sits soffa.",
    price: 600,
    durationMinutes: 30,
    categoryName: "Soffor och fåtöljer",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "3-sits soffa",
    description: "Ångrengöring av 3-sits soffa.",
    price: 700,
    durationMinutes: 35,
    categoryName: "Soffor och fåtöljer",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "Fåtölj",
    description: "Ångrengöring av fåtölj.",
    price: 400,
    durationMinutes: 15,
    categoryName: "Soffor och fåtöljer",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "Stol",
    description: "Ångrengöring av stol.",
    price: 300,
    durationMinutes: 10,
    categoryName: "Soffor och fåtöljer",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  },
  {
    name: "Pall",
    description: "Ångrengöring av fotpall eller sittpall.",
    price: 250,
    durationMinutes: 8,
    categoryName: "Soffor och fåtöljer",
    image: "https://hips.hearstapps.com/hmg-prod/images/gettyimages-1276643694.jpg"
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Ansluten till MongoDB");

    for (const svc of services) {
      const category = await Category.findOne({ name: svc.categoryName });

      if (!category) {
        console.warn(`⚠️ Kategori hittades inte: ${svc.categoryName}`);
        continue;
      }

      const exists = await Service.findOne({ name: svc.name });
      if (exists) {
        console.log(`🔁 Hoppar över (finns redan): ${svc.name}`);
        continue;
      }

      const newService = new Service({
        name: svc.name,
        description: svc.description,
        price: svc.price,
        durationMinutes: svc.durationMinutes,
        category: category._id,
        image: svc.image,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newService.save();
      console.log(`✅ Infogad: ${svc.name}`);
    }

    await mongoose.disconnect();
    console.log("🚪 Frånkopplad från databasen");
  } catch (err) {
    console.error("❌ Fel:", err.message);
  }
}

seed();
