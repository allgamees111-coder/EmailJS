// ✅ Replace your sendEmail function with this:
async function sendEmail(data) {
  try {
    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "Game Server <onboarding@resend.dev>",
        to: ["alliedcgaming@gmail.com"],
        subject: "Player Data JSON (from Render Server)",
        html: `<pre>${JSON.stringify(data, null, 2)}</pre>`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ [EMAIL SENT]", response.status, response.statusText);
  } catch (error) {
    console.error("❌ [EMAIL ERROR]", error.response?.data || error.message);
  }
}
