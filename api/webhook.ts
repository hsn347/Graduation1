import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: true,
  },
};

// تهيئة Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("⚠️ Supabase credentials not found. Messages will not be saved to database.");
}

export default async function handler(req: any, res: any) {
  const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || "my_verify_token";

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

    try {
      // تحديد نوع Webhook: Green API أو Facebook API
      const isGreenApi = req.body.type || req.body.typeWebhook || req.body.messageData;
      
      if (isGreenApi) {
        // معالجة webhook من Green API
        await handleGreenApiWebhook(req.body);
      } else if (req.body.entry && Array.isArray(req.body.entry)) {
        // معالجة webhook من Facebook API
        await handleFacebookApiWebhook(req.body);
      } else {
        console.warn("⚠️ Unknown webhook format:", req.body);
      }
    } catch (error: any) {
      console.error("❌ Error processing webhook:", error);
      // نستمر في إرجاع 200 حتى لو فشل الحفظ لتجنب إعادة المحاولة
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).json({ error: "Method not allowed" });
}

// معالجة webhook من Green API
async function handleGreenApiWebhook(body: any) {
  // Green API يرسل الرسائل بتنسيق مختلف
  // التنسيق: { typeWebhook: 'incomingMessageReceived', messageData: {...} }
  
  if (body.typeWebhook === 'incomingMessageReceived' && body.messageData) {
    const message = body.messageData;
    
    // استخراج رقم المرسل من chatId (التنسيق: {phone}@c.us)
    let fromNumber = message.chatId || message.senderData?.chatId || '';
    if (fromNumber.includes('@')) {
      fromNumber = fromNumber.split('@')[0];
    }
    
    // استخراج النص من الرسالة
    let messageText = null;
    let messageType = message.type || 'text';
    
    if (message.textData) {
      messageText = message.textData.textMessage || message.textData;
    } else if (message.extendedTextData) {
      messageText = message.extendedTextData.text || message.extendedTextData;
    } else if (message.quotedMessage) {
      messageText = `[Quoted] ${message.quotedMessage.text || ''}`;
    }
    
    const messageData = {
      message_id: message.idMessage || message.id || `${Date.now()}_${fromNumber}`,
      from_number: fromNumber,
      timestamp: message.timestamp ? new Date(message.timestamp * 1000).toISOString() : new Date().toISOString(),
      type: messageType,
      text: messageText,
      image: message.imageMessage ? JSON.stringify(message.imageMessage) : null,
      video: message.videoMessage ? JSON.stringify(message.videoMessage) : null,
      audio: message.audioMessage ? JSON.stringify(message.audioMessage) : null,
      document: message.documentMessage ? JSON.stringify(message.documentMessage) : null,
      location: message.locationMessage ? JSON.stringify(message.locationMessage) : null,
      contacts: message.contactMessage ? JSON.stringify(message.contactMessage) : null,
      raw_data: JSON.stringify(message),
      created_at: new Date().toISOString(),
    };

    // حفظ الرسالة في Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("whatsapp_messages")
          .insert([messageData])
          .select();

        if (error) {
          console.error("❌ Error saving message to Supabase:", error);
          if (error.code === "42P01") {
            console.warn("⚠️ Table 'whatsapp_messages' does not exist. Please create it in Supabase.");
          }
        } else {
          console.log("✅ Message saved to Supabase:", data);
        }
      } catch (dbError: any) {
        console.error("❌ Database error:", dbError);
      }
    } else {
      console.warn("⚠️ Supabase not configured. Message not saved.");
    }
  } else if (body.typeWebhook === 'outgoingMessageStatus' && body.statusData) {
    // تحديث حالة الرسالة المرسلة
    const status = body.statusData;
    console.log("📊 Message Status Update:", status);
    
    if (supabase && status.idMessage) {
      try {
        const { error } = await supabase
          .from("whatsapp_messages")
          .update({
            status: status.status || status.statusMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("message_id", status.idMessage);

        if (error) {
          console.error("❌ Error updating message status:", error);
        } else {
          console.log("✅ Message status updated");
        }
      } catch (dbError: any) {
        console.error("❌ Database error updating status:", dbError);
      }
    }
  }
}

// معالجة webhook من Facebook API
async function handleFacebookApiWebhook(body: any) {
  // معالجة الرسائل الواردة من Facebook API
  if (body.entry && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      if (entry.changes && Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages && Array.isArray(change.value.messages)) {
            for (const message of change.value.messages) {
              // استخراج معلومات الرسالة
              const messageData = {
                message_id: message.id,
                from_number: message.from,
                timestamp: message.timestamp || new Date().toISOString(),
                type: message.type,
                text: message.text?.body || null,
                image: message.image ? JSON.stringify(message.image) : null,
                video: message.video ? JSON.stringify(message.video) : null,
                audio: message.audio ? JSON.stringify(message.audio) : null,
                document: message.document ? JSON.stringify(message.document) : null,
                location: message.location ? JSON.stringify(message.location) : null,
                contacts: message.contacts ? JSON.stringify(message.contacts) : null,
                raw_data: JSON.stringify(message),
                created_at: new Date().toISOString(),
              };

              // حفظ الرسالة في Supabase
              if (supabase) {
                try {
                  const { data, error } = await supabase
                    .from("whatsapp_messages")
                    .insert([messageData])
                    .select();

                  if (error) {
                    console.error("❌ Error saving message to Supabase:", error);
                    if (error.code === "42P01") {
                      console.warn("⚠️ Table 'whatsapp_messages' does not exist. Please create it in Supabase.");
                    }
                  } else {
                    console.log("✅ Message saved to Supabase:", data);
                  }
                } catch (dbError: any) {
                  console.error("❌ Database error:", dbError);
                }
              } else {
                console.warn("⚠️ Supabase not configured. Message not saved.");
              }
            }
          }

          // معالجة حالة الرسائل (message_status)
          if (change.value.statuses && Array.isArray(change.value.statuses)) {
            for (const status of change.value.statuses) {
              console.log("📊 Message Status Update:", status);
              
              if (supabase && status.id) {
                try {
                  const { error } = await supabase
                    .from("whatsapp_messages")
                    .update({
                      status: status.status,
                      timestamp: status.timestamp || new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    })
                    .eq("message_id", status.id);

                  if (error) {
                    console.error("❌ Error updating message status:", error);
                  } else {
                    console.log("✅ Message status updated");
                  }
                } catch (dbError: any) {
                  console.error("❌ Database error updating status:", dbError);
                }
              }
            }
          }
        }
      }
    }
  }
}
