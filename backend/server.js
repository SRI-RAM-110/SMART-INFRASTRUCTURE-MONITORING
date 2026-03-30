const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

// ===================== DB =====================
const connectDB = require("./config/db");
connectDB();

// ===================== ROUTES =====================
app.use("/api/auth", require("./routes/auth"));

// ===================== SENSOR STORAGE =====================
let sensorData = [];

// 🔥 Track state
let lastRisk = "LOW";
let lastAlertTime = 0;

// ===================== SENSOR API (NO AUTH) =====================
// 🚨 IMPORTANT: No verifyToken here → simulator must work
app.post("/api/sensor", (req, res) => {
  console.log("API HIT:", new Date().toISOString());

  const data = req.body;
  console.log("Received:", data);

  // 🎯 Risk logic
  let risk = "LOW";
  if (data.vibration > 3) risk = "MEDIUM";
  if (data.vibration > 4) risk = "HIGH";

  data.risk = risk;

  let alert = null;
  const now = Date.now();

  // 🚨 Alert only on state change + cooldown
  if (
    risk === "HIGH" &&
    lastRisk !== "HIGH" &&
    now - lastAlertTime > 2000
  ) {
    alert = {
      type: "CRITICAL",
      message: "High vibration detected",
      time: new Date().toLocaleTimeString(),
      sensor: "Vibration",
      value: data.vibration,
    };

    lastAlertTime = now;
  }

  lastRisk = risk;

  sensorData.push(data);

  // 📡 Emit live data
  io.emit("newData", data);

  // 🚨 Emit alert
  if (alert) {
    console.log("ALERT SENT:", alert);
    io.emit("alert", alert);
  }

  res.send("Data stored");
});

// ===================== GET SENSOR DATA =====================
app.get("/api/sensor", (req, res) => {
  res.json(sensorData);
});

// ===================== START =====================
server.listen(5000, () => {
  console.log("Server running on port 5000");
});