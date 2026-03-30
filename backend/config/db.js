const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb://sriram:sriram@ac-6mjfmjg-shard-00-00.kxrrbkr.mongodb.net:27017,ac-6mjfmjg-shard-00-01.kxrrbkr.mongodb.net:27017,ac-6mjfmjg-shard-00-02.kxrrbkr.mongodb.net:27017/?ssl=true&replicaSet=atlas-pnxn7z-shard-0&authSource=admin&appName=smartinfra"
    );

    console.log("MongoDB Atlas Connected 🚀");
  } catch (err) {
    console.error("DB ERROR:", err.message);
  }
};

module.exports = connectDB;