import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let latestData = {};
let lastUpdated = Date.now();

app.post("/upload", (req, res) => {
  latestData = req.body;
  lastUpdated = Date.now();
  console.log("✅ [UPLOAD] JSON received from Unity:");
  console.log(JSON.stringify(latestData, null, 2));
  res.status(200).send("Received JSON");
});

// check every minute
setInterval(async () => {
  if (Object.keys(latestData).length > 0) {
    const diff = (Date.now() - lastUpdated) / 1000 / 60;
    console.log(`⏳ [CHECK] ${diff.toFixed(2)} minutes since last update`);
    if (diff >= 5) {
      console.log("📬 [ACTION] Sending email via EmailJS...");
      await sendEmail(latestData);
      latestData = {};
    }
  } else {
    console.log("💤 [CHECK] No data to send yet...");
  }
}, 60000);

// ✅ EmailJS API call instead of SMTP
async function sendEmail(data) {
  try {
    const payload = {
      service_id: "service_6eeozkq",
      template_id: "template_wb3ibzr",
      user_id: "XiFPOwXsGBlSl8B7Q",
      template_params: {
        player_json: JSON.stringify(data, null, 2),
        to_email: "alliedcgaming@gmail.com"
      },
    };

    const res = await axios.post("https://api.emailjs.com/api/v1.0/email/send", payload);
    console.log("✅ [EMAILJS SENT]", res.status, res.statusText);
  } catch (err) {
    console.error("❌ [EMAILJS ERROR]", err.response?.data || err.message);
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 [SERVER] Running on port ${PORT}`));
