import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let latestData = {};
let lastUpdated = Date.now();
let emailTimer = null; // to reset timer if new data arrives

app.post("/upload", async (req, res) => {
latestData = req.body;
lastUpdated = Date.now();

console.log("✅ [UPLOAD] JSON received from Unity:");
console.log(JSON.stringify(latestData, null, 2));

res.status(200).send("Received JSON");

// 🕓 Clear any previous timer (avoid duplicate sends)
if (emailTimer) {
clearTimeout(emailTimer);
console.log("🔁 [TIMER RESET] New upload received before 5 minutes, resetting timer...");
}

// Schedule email send after 5 minutes (300,000 ms)
emailTimer = setTimeout(() => {
sendEmail(latestData);
}, 300000);
});

async function sendEmail(data) {
console.log("⏰ [SCHEDULED] 5 minutes passed — sending email...");

try {
const response = await axios.post(
"https://api.emailjs.com/api/v1.0/email/send
",
{
service_id: "service_6eeozkq", // 🔧 your EmailJS service ID
template_id: "template_wb3ibzr", // 🔧 your EmailJS template ID
user_id: "XiFPOwXsGBlSl8B7Q", // 🔧 your EmailJS public key
template_params: {
player_name: data.Name,
player_id: data.PlayerID,
player_json: JSON.stringify(data, null, 2),
},
},
{
headers: { "Content-Type": "application/json" },
}
);

console.log("✅ [EMAIL SENT SUCCESSFULLY]", response.data);


} catch (err) {
console.error("❌ [EMAIL ERROR]", err.response?.data || err.message);
}
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(🚀 Server running on port ${PORT}));
