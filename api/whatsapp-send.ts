// API endpoint لإرسال رسائل WhatsApp عبر Green API (لتجنب مشاكل CORS)

export default async function handler(req: any, res: any) {
  // السماح فقط بـ POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // الحصول على متغيرات Green API من environment variables
  const GREEN_API_URL = process.env.VITE_GREEN_API_URL || process.env.GREEN_API_URL;
  const GREEN_ID_INSTANCE = process.env.VITE_GREEN_ID_INSTANCE || process.env.GREEN_ID_INSTANCE;
  const GREEN_API_TOKEN = process.env.VITE_GREEN_API_TOKEN || process.env.GREEN_API_TOKEN;

  // التحقق من وجود المتغيرات المطلوبة
  if (!GREEN_API_URL) {
    res.status(500).json({ error: 'GREEN_API_URL غير محدد في environment variables' });
    return;
  }

  if (!GREEN_ID_INSTANCE) {
    res.status(500).json({ error: 'GREEN_ID_INSTANCE غير محدد في environment variables' });
    return;
  }

  if (!GREEN_API_TOKEN) {
    res.status(500).json({ error: 'GREEN_API_TOKEN غير محدد في environment variables' });
    return;
  }

  try {
    const { to, message, type, templateName } = req.body;

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

    // Green API يتطلب تنسيق الرقم بالصيغة الدولية (بدون +)
    const formattedPhone = cleanPhoneNumber.startsWith('00') 
      ? cleanPhoneNumber.substring(2) 
      : cleanPhoneNumber;

    // بناء البيانات حسب نوع الرسالة
    let requestData: any;
    let apiEndpoint: string;
    
    if (type === 'template') {
      // Green API لا يدعم templates بنفس طريقة Facebook API
      // سنستخدم رسالة نصية عادية بدلاً منها
      if (!message && !templateName) {
        res.status(400).json({ error: 'الرسالة أو اسم القالب مطلوب' });
        return;
      }
      
      // استخدام الرسالة إذا كانت موجودة، وإلا استخدام اسم القالب كنص
      const messageText = message || `Template: ${templateName}`;
      requestData = {
        chatId: `${formattedPhone}@c.us`, // Green API format: {phone}@c.us
        message: messageText,
      };
      apiEndpoint = 'sendMessage';
    } else {
      if (!message) {
        res.status(400).json({ error: 'الرسالة مطلوبة' });
        return;
      }
      
      requestData = {
        chatId: `${formattedPhone}@c.us`, // Green API format: {phone}@c.us
        message: message,
      };
      apiEndpoint = 'sendMessage';
    }

    // إرسال الطلب إلى Green API
    const url = `${GREEN_API_URL}/waInstance${GREEN_ID_INSTANCE}/${apiEndpoint}/${GREEN_API_TOKEN}`;
    
    console.log('Green API Request:', {
      url: url.replace(GREEN_API_TOKEN, '***'),
      method: 'POST',
      data: requestData,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
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
      const errorMessage = responseData.error || 
                          responseData.errorMessage ||
                          JSON.stringify(responseData);
      res.status(response.status).json({ 
        error: `Green API Error: ${errorMessage}`,
        details: responseData,
      });
      return;
    }

    // Green API قد يعيد success: false حتى مع status 200
    if (responseData.success === false) {
      const errorMessage = responseData.error || 
                          responseData.errorMessage ||
                          'Unknown error';
      res.status(400).json({ 
        error: `Green API Error: ${errorMessage}`,
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

