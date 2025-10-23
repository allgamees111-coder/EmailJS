import express from "express";
import bodyParser from "body-parser";
import nodemailer from "nodemailer";
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

// every 1 minute check if 5 minutes have passed
setInterval(async () => {
  if (Object.keys(latestData).length > 0) {
    const diff = (Date.now() - lastUpdated) / 1000 / 60;
    console.log(`⏳ [CHECK] ${diff.toFixed(2)} minutes since last update`);
    if (diff >= 5) {
      console.log("📬 [ACTION] 5 minutes passed — sending email...");
      await sendEmail(latestData);
      latestData = {};
    }
  } else {
    console.log("💤 [CHECK] No data to send yet...");
  }
}, 60000);

async function sendEmail(data) {
  console.log("📧 [EMAIL] Preparing to send email...");
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "allgamees111@gmail.com",
      pass: "sjmf oozo jzez piyb", // your app password
    },
  });

  const mailOptions = {
    from: "allgamees111@gmail.com",
    to: "alliedcgaming@gmail.com",
    cc: "alliedcgaming@gmail.com",
    subject: "Player Data JSON",
    text: JSON.stringify(data, null, 2),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [EMAIL SENT] Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ [EMAIL ERROR]", error);
  }
}

app.listen(3000, () => console.log("🚀 [SERVER] Running on port 3000"));
