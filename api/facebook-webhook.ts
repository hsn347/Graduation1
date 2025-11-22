// رمز التحقق - يجب أن يكون نفس الرمز الذي ستضعه في Facebook Developer
const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'your_verify_token_here';

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const method = request.method;

  // معالجة GET request للتحقق من Webhook (Verification)
  if (method === 'GET') {
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // التحقق من mode و token
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook verified successfully');
      // إرجاع challenge للتحقق الناجح
      return new Response(challenge, { status: 200 });
    } else {
      // رفض الطلب إذا كان token غير صحيح
      console.error('Webhook verification failed');
      return new Response('Forbidden', { status: 403 });
    }
  }
  // معالجة POST request لاستقبال الأحداث من Facebook
  else if (method === 'POST') {
    try {
      const body = await request.json();

      // التحقق من أن الطلب من Facebook
      if (body.object === 'page' || body.object === 'instagram' || body.object === 'whatsapp_business_account') {
        // معالجة الأحداث
        if (body.entry) {
          body.entry.forEach((entry: any) => {
            // معالجة webhook events هنا
            console.log('Received webhook event:', JSON.stringify(entry, null, 2));
            
            // يمكنك إضافة منطق معالجة الأحداث هنا
            // مثلاً: حفظ في قاعدة البيانات، إرسال إشعارات، إلخ
          });
        }

        // إرجاع 200 OK لإعلام Facebook أننا استلمنا الحدث
        return new Response('EVENT_RECEIVED', { status: 200 });
      } else {
        // إذا لم يكن الطلب من نوع معروف
        return new Response('Not Found', { status: 404 });
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
  // رفض أي methods أخرى
  else {
    return new Response('Method Not Allowed', { status: 405 });
  }
}

