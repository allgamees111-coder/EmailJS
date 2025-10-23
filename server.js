import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const app = express();

// ✅ Allow all origins (fix CORS for Unity WebGL + Render)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(bodyParser.json());

let latestData = {};
let lastUpdated = Date.now();

// ✅ POST endpoint for Unity WebGL
app.post("/upload", (req, res) => {
  latestData = req.body;
  lastUpdated = Date.now();
  console.log("✅ [UPLOAD] JSON received from Unity:");
  console.log(JSON.stringify(latestData, null, 2));
  res.status(200).send("Received JSON from Unity");
});

// ✅ Check every minute if 5 minutes have passed since last upload
setInterval(async () => {
  if (Object.keys(latestData).length > 0) {
    const diff = (Date.now() - lastUpdated) / 1000 / 60;
    console.log(`⏳ [CHECK] ${diff.toFixed(2)} minutes since last update`);

    if (diff >= 5) {
      console.log("📬 [ACTION] 5 minutes passed — sending email via Resend...");
      await sendEmail(latestData);
      latestData = {}; // Reset after sending
    }
  } else {
    console.log("💤 [CHECK] No data to send yet...");
  }
}, 60000);

// ✅ Resend Email sender
async function sendEmail(data) {
  try {
    const RESEND_API_KEY = "re_XBHdVnaF_LC7ELRP4zHWg9u2UgJT3Jr3J"; // Replace with your real Resend API key

    const emailPayload = {
      from: "Game Server <onboarding@resend.dev>", // works without setup
      to: ["alliedcgaming@gmail.com"], // recipient(s)
      subject: "🎮 Player Data JSON (from Render Server)",
      html: `<pre>${JSON.stringify(data, null, 2)}</pre>`,
    };

    const response = await axios.post("https://api.resend.com/emails", emailPayload, {
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ [EMAIL SENT]", response.status, response.statusText);
  } catch (error) {
    console.error("❌ [EMAIL ERROR]", error.response?.data || error.message);
  }
}

// ✅ Use Render’s dynamic port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 [SERVER] Running on port ${PORT}`));
