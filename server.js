// ✅ server.js — Secure version (Resend + 5-minute delayed email)

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const app = express();

// ✅ Allow Unity WebGL and local testing
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

let latestData = {};
let lastUpdated = Date.now();

// 📨 POST endpoint for Unity WebGL
app.post("/upload", (req, res) => {
  latestData = req.body;
  lastUpdated = Date.now();
  console.log("✅ [UPLOAD] JSON received from Unity:");
  console.log(JSON.stringify(latestData, null, 2));
  res.status(200).send("✅ JSON received from Unity");
});

// ⏳ Check every minute if 5 minutes have passed since last update
setInterval(async () => {
  if (Object.keys(latestData).length > 0) {
    const diff = (Date.now() - lastUpdated) / 1000 / 60;
    console.log(`⏳ [CHECK] ${diff.toFixed(2)} minutes since last update`);

    if (diff >= 5) {
      console.log("📬 [ACTION] 5 minutes passed — sending email...");
      await sendEmail(latestData);
      latestData = {}; // reset after sending
    }
  } else {
    console.log("💤 [CHECK] No data to send yet...");
  }
}, 60000);

// 🧠 Resend email function
async function sendEmail(data) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY; // ✅ secure key from Render environment

  if (!RESEND_API_KEY) {
    console.error("❌ [ERROR] RESEND_API_KEY not set in environment variables!");
    return;
  }

  const payload = {
    from: "Game Server <onboarding@resend.dev>",
    to: ["alliedcgaming@gmail.com"], // ✅ your recipient
    subject: "Player Data (5-minute summary)",
    text: JSON.stringify(data, null, 2)
  };

  try {
    const response = await axios.post("https://api.resend.com/emails", payload, {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    console.log("✅ [EMAIL SENT]", response.data);
  } catch (error) {
    console.error("❌ [EMAIL ERROR]", error.response?.data || error.message);
  }
}

// ✅ Render dynamic port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 [SERVER] Running on port ${PORT}`));
