// API endpoint لإرسال رسائل WhatsApp (لتجنب مشاكل CORS)

export default async function handler(req: any, res: any) {
  // السماح فقط بـ POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // الحصول على المتغيرات من environment variables
  const WHATSAPP_ACCESS_TOKEN = process.env.VITE_WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.VITE_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const WHATSAPP_GRAPH_API_BASE = 'https://graph.facebook.com/v22.0';

  // التحقق من وجود المتغيرات المطلوبة
  if (!WHATSAPP_ACCESS_TOKEN) {
    res.status(500).json({ error: 'WHATSAPP_ACCESS_TOKEN غير محدد في environment variables' });
    return;
  }

  if (!WHATSAPP_PHONE_NUMBER_ID) {
    res.status(500).json({ error: 'WHATSAPP_PHONE_NUMBER_ID غير محدد في environment variables' });
    return;
  }

  try {
    const { to, message, type, templateName, templateLanguage } = req.body;

    // التحقق من البيانات المطلوبة
    if (!to) {
      res.status(400).json({ error: 'رقم الهاتف مطلوب' });
      return;
    }

    // تنظيف رقم الهاتف
    const cleanPhoneNumber = to.replace(/\s+/g, '').replace(/[+\-()]/g, '');

    // التحقق من تنسيق رقم الهاتف
    if (!/^\d{10,15}$/.test(cleanPhoneNumber)) {
      res.status(400).json({ error: `تنسيق رقم الهاتف غير صحيح: ${cleanPhoneNumber}` });
      return;
    }

    // بناء البيانات حسب نوع الرسالة
    let requestData: any;
    
    if (type === 'template') {
      if (!templateName) {
        res.status(400).json({ error: 'اسم القالب مطلوب' });
        return;
      }
      
      requestData = {
        messaging_product: 'whatsapp',
        to: cleanPhoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateLanguage || 'en_US',
          },
        },
      };
    } else {
      if (!message) {
        res.status(400).json({ error: 'الرسالة مطلوبة' });
        return;
      }
      
      requestData = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhoneNumber,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      };
    }

    // إرسال الطلب إلى Facebook Graph API
    const url = `${WHATSAPP_GRAPH_API_BASE}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
    
    console.log('WhatsApp API Request:', {
      url: url,
      method: 'POST',
      data: requestData,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      res.status(500).json({ 
        error: 'Failed to parse response',
        responseText: responseText.substring(0, 200),
      });
      return;
    }

    console.log('WhatsApp API Response:', {
      status: response.status,
      data: responseData,
    });

    if (!response.ok) {
      const errorMessage = responseData.error?.message || 
                          responseData.error?.error_user_msg || 
                          JSON.stringify(responseData);
      res.status(response.status).json({ 
        error: `WhatsApp API Error: ${errorMessage}`,
        details: responseData,
      });
      return;
    }

    // التحقق من وجود أخطاء في الاستجابة
    if (responseData.error) {
      const errorMessage = responseData.error.message || 
                          responseData.error.error_user_msg || 
                          JSON.stringify(responseData.error);
      res.status(400).json({ 
        error: `WhatsApp API Error: ${errorMessage}`,
        details: responseData,
      });
      return;
    }

    // إرجاع النتيجة الناجحة
    res.status(200).json(responseData);
  } catch (error: any) {
    console.error('Error in WhatsApp API:', error);
    res.status(500).json({ 
      error: error.message || 'حدث خطأ أثناء إرسال الرسالة',
      details: error.stack,
    });
  }
}

