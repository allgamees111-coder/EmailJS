import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const app = express();

// ✅ CORS FIX — must come before all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  
  // ✅ Important: respond immediately to preflight OPTIONS
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors());
app.use(bodyParser.json());

// Store latest data from Unity
let latestData = {};
let lastUpdated = Date.now();

// ✅ Receive data from Unity WebGL
app.post("/upload", (req, res) => {
  latestData = req.body;
  lastUpdated = Date.now();
  console.log("✅ [UPLOAD] JSON received from Unity:");
  console.log(JSON.stringify(latestData, null, 2));
  res.status(200).send("Received JSON from Unity");
});

// ✅ Every minute check if 5 minutes passed since last upload
setInterval(async () => {
  if (Object.keys(latestData).length > 0) {
    const diff = (Date.now() - lastUpdated) / 1000 / 60;
    console.log(`⏳ [CHECK] ${diff.toFixed(2)} minutes since last update`);

    if (diff >= 5) {
      console.log("📬 [ACTION] 5 minutes passed — sending email...");
      await sendEmail(latestData);
      latestData = {}; // Reset after sending
    }
  } else {
    console.log("💤 [CHECK] No data to send yet...");
  }
}, 60000);

// ✅ EmailJS REST API sender
async function sendEmail(data) {
  try {
    const emailPayload = {
      service_id: "service_6eeozkq",
      template_id: "template_wb3ibzr",
      user_id: "XiFPOwXsGBlSl8B7Q",
      template_params: {
        to_email: "alliedcgaming@gmail.com",
        subject: "Player Data JSON (from Render Server)",
        message: JSON.stringify(data, null, 2)
      }
    };

    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      emailPayload,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ [EMAIL SENT]", response.status, response.statusText);
  } catch (error) {
    console.error("❌ [EMAIL ERROR]", error.response?.data || error.message);
  }
}

// ✅ Use Render’s dynamic port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 [SERVER] Running on port ${PORT}`));
