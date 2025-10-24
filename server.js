import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Resend } from "resend";

const app = express();

// ✅ Allow Unity WebGL / local builds
app.use(cors({
  origin: "*",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.options("*", cors()); // handle preflight
app.use(bodyParser.json());


// ✅ Initialize Resend (Option 1: use environment variable)
const resend = new Resend(process.env.RESEND_API_KEY);

// Store player data and timers
let players = {}; // { playerName: { data, lastUpdated } }

// ✅ Endpoint to receive data from Unity
app.post("/upload", (req, res) => {
  const data = req.body;
  const playerName = data?.player_name || `Player_${Date.now()}`;

  players[playerName] = { data, lastUpdated: Date.now() };

  console.log(`✅ [UPLOAD] Data received from ${playerName}`);
  console.log(JSON.stringify(data, null, 2));
  res.status(200).send(`Received JSON for ${playerName}`);
});

// ✅ Check every minute for each player
setInterval(async () => {
  const now = Date.now();
  for (const [playerName, info] of Object.entries(players)) {
    const diffMinutes = (now - info.lastUpdated) / 1000 / 60;

    if (diffMinutes >= 5) {
      console.log(`📬 [SEND] 5 minutes passed for ${playerName} — sending email...`);
      await sendEmail(playerName, info.data);
      delete players[playerName]; // reset player after sending
    } else {
      console.log(`⏳ [WAIT] ${playerName}: ${diffMinutes.toFixed(2)} min elapsed`);
    }
  }

  if (Object.keys(players).length === 0)
    console.log("💤 [CHECK] No active players right now...");
}, 60000);

// ✅ Send email via Resend
async function sendEmail(playerName, data) {
  try {
    const response = await resend.emails.send({
      from: "Game Server <onboarding@resend.dev>",
      to: "alliedcgaming@gmail.com", // ✅ your destination email
      subject: `${playerName} - Player Data JSON`,
      text: JSON.stringify(data, null, 2),
    });

    console.log(`✅ [EMAIL SENT] ${playerName} — ${response.id}`);
  } catch (error) {
    console.error("❌ [EMAIL ERROR]", error.message || error);
  }
}

// ✅ Port for Render or local use
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 [SERVER] Running on port ${PORT}`));

