const axios = require("axios");

// 🔐 paste your token here
const TOKEN = "YOUR_TOKEN_HERE";

setInterval(async () => {
  const data = {
    temperature: (20 + Math.random() * 10).toFixed(2),
    vibration: (Math.random() * 5).toFixed(2),
    humidity: (40 + Math.random() * 30).toFixed(2),
    pressure: (900 + Math.random() * 100).toFixed(2),
    timestamp: new Date()
  };

  console.log("Sending:", data);

  try {
    await axios.post(
      "http://localhost:5000/api/sensor",
      data,
      {
        headers: {
          Authorization: TOKEN,
        },
      }
    );
  } catch (err) {
    console.log("Error:", "backend not connected? ");
  }

}, 5000);