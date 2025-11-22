// رمز التحقق - يجب أن يكون نفس الرمز الذي ستضعه في Facebook Developer
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'your_verify_token_here';

export default async function handler(req: any, res: any) {
  // معالجة GET request للتحقق من Webhook (Verification)
  if (req.method === 'GET') {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Verification request received:', {
      mode,
      hasToken: !!token,
      hasChallenge: !!challenge,
      tokenMatch: token === VERIFY_TOKEN,
    });

    // التحقق من mode و token
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully');
      // إرجاع challenge للتحقق الناجح - يجب أن يكون string
      const challengeString = String(challenge || '');
      res.status(200).send(challengeString);
      return;
    } else {
      // رفض الطلب إذا كان token غير صحيح
      console.error('❌ Webhook verification failed', {
        mode,
        receivedToken: token,
        expectedToken: VERIFY_TOKEN,
        tokenMatch: token === VERIFY_TOKEN,
      });
      res.status(403).send('Forbidden');
      return;
    }
  }
  // معالجة POST request لاستقبال الأحداث من Facebook
  else if (req.method === 'POST') {
    try {
      const body = req.body;

      console.log('POST request received:', {
        object: body?.object,
        hasEntry: !!body?.entry,
      });

      // التحقق من أن الطلب من Facebook
      if (body.object === 'page' || body.object === 'instagram' || body.object === 'whatsapp_business_account') {
        // معالجة الأحداث
        if (body.entry && Array.isArray(body.entry)) {
          body.entry.forEach((entry: any) => {
            // معالجة webhook events هنا
            console.log('📨 Received webhook event:', JSON.stringify(entry, null, 2));
            
            // يمكنك إضافة منطق معالجة الأحداث هنا
            // مثلاً: حفظ في قاعدة البيانات، إرسال إشعارات، إلخ
          });
        }

        // إرجاع 200 OK لإعلام Facebook أننا استلمنا الحدث
        res.status(200).send('EVENT_RECEIVED');
        return;
      } else {
        // إذا لم يكن الطلب من نوع معروف
        console.warn('Unknown object type:', body.object);
        res.status(404).send('Not Found');
        return;
      }
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      res.status(500).send('Internal Server Error');
      return;
    }
  }
  // رفض أي methods أخرى
  else {
    console.warn('Method not allowed:', req.method);
    res.status(405).send('Method Not Allowed');
    return;
  }
}
