import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let latestData = {};
let lastUpdated = Date.now();

app.post("/upload", async (req, res) => {
  latestData = req.body;
  lastUpdated = Date.now();
  console.log("✅ [UPLOAD] JSON received from Unity:", latestData);

  res.status(200).send("JSON received");

  // Wait 10 minutes before sending (optional)
  setTimeout(async () => {
    try {
      const response = await axios.post("https://api.emailjs.com/api/v1.0/email/send", {
        service_id: service_6eeozkq,
        template_id: template_wb3ibzr,
        user_id: XiFPOwXsGBlSl8B7Q,
        accessToken: process.env.EMAILJS_PRIVATE_KEY, // optional
        template_params: {
          to_email: "alliedcgaming@gmail.com",
          subject: "Unity Player Data",
          player_json: JSON.stringify(latestData, null, 2)
        }
      });

      console.log("✅ [EMAILJS SENT] Response:", response.data);
    } catch (error) {
      console.error("❌ [EMAILJS ERROR]:", error.response?.data || error.message);
    }
  }, 10 * 60 * 1000); // 10 minutes delay
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

