import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Resend } from "resend";

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors({ origin: "*", methods: ["GET", "POST"], allowedHeaders: ["Content-Type"] }));
app.use(bodyParser.json());

// 🧠 Store data per player
let playerDataMap = {}; 
// Example: { "202510231216563779": { data: {...}, lastUpdated: 123456789 } }

// 📥 Receive player data from Unity
app.post("/upload", (req, res) => {
  const player = req.body;
  const playerID = player.PlayerID || `player_${Date.now()}`;

  playerDataMap[playerID] = {
    data: player,
    lastUpdated: Date.now(),
  };

  console.log(`✅ [UPLOAD] Data received from Player ${playerID}`);
  res.status(200).send("Data received");
});

// 🕒 Check all players every 1 minute
setInterval(async () => {
  const now = Date.now();

  for (const [playerID, entry] of Object.entries(playerDataMap)) {
    const diff = (now - entry.lastUpdated) / 1000 / 60; // in minutes

    if (diff >= 5) {
      console.log(`📬 [SEND] Sending email for Player ${playerID} after ${diff.toFixed(2)} mins of inactivity`);
      await sendEmail(entry.data, playerID);

      delete playerDataMap[playerID]; // clear after sending
    } else {
      console.log(`⏳ [WAIT] Player ${playerID}: ${diff.toFixed(2)} mins since last update`);
    }
  }

  if (Object.keys(playerDataMap).length === 0) {
    console.log("💤 [CHECK] No active players currently...");
  }
}, 60000);

// 📧 Send email via Resend
async function sendEmail(data, playerID) {
  try {
    const emailResponse = await resend.emails.send({
      from: "Game Server <allgamees111@gmail.com>", // ✅ must be verified domain or same as account
      to: "allgamees111@gmail.com",
      subject: `Player ${playerID} Data JSON`,
      text: JSON.stringify(data, null, 2),
    });

    console.log(`✅ [EMAIL SENT] Player ${playerID} —`, emailResponse.id);
  } catch (error) {
    console.error(`❌ [EMAIL ERROR] Player ${playerID}:`, error.message);
  }
}

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 [SERVER] Running on port ${PORT}`));


