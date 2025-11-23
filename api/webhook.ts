export const config = {
  api: {
    bodyParser: true,
  },
};

export default function handler(req: any, res: any) {
  const VERIFY_TOKEN = "my_verify_token";

  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return res.status(200).send(challenge);
    } else {
      return res.status(403).json({ error: "Verification failed" });
    }
  }

  if (req.method === "POST") {
    console.log("📩 Incoming WhatsApp Message:");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).json({ error: "Method not allowed" });
}
