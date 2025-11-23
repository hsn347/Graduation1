// إعداد واجهة Green API لـ WhatsApp

// الحصول على بيانات Green API من متغيرات البيئة
const GREEN_API_URL = import.meta.env.VITE_GREEN_API_URL as string;
const GREEN_ID_INSTANCE = import.meta.env.VITE_GREEN_ID_INSTANCE as string;
const GREEN_API_TOKEN = import.meta.env.VITE_GREEN_API_TOKEN as string;

// التحقق من وجود المتغيرات المطلوبة
if (!GREEN_API_URL) {
  console.warn('⚠️ VITE_GREEN_API_URL غير موجود في متغيرات البيئة');
}

if (!GREEN_ID_INSTANCE) {
  console.warn('⚠️ VITE_GREEN_ID_INSTANCE غير موجود في متغيرات البيئة');
}

if (!GREEN_API_TOKEN) {
  console.warn('⚠️ VITE_GREEN_API_TOKEN غير موجود في متغيرات البيئة');
}

/**
 * إعدادات Green API
 */
export const greenApiConfig = {
  apiUrl: GREEN_API_URL,
  idInstance: GREEN_ID_INSTANCE,
  apiToken: GREEN_API_TOKEN,
};

/**
 * إنشاء URL لـ Green API
 */
export function createGreenApiUrl(endpoint: string): string {
  if (!GREEN_API_URL || !GREEN_ID_INSTANCE || !GREEN_API_TOKEN) {
    throw new Error('Green API credentials غير مكتملة. يرجى إضافة VITE_GREEN_API_URL, VITE_GREEN_ID_INSTANCE, و VITE_GREEN_API_TOKEN في ملف .env.local');
  }
  
  // Green API format: https://{apiUrl}/waInstance{idInstance}/{endpoint}/{apiToken}
  return `${GREEN_API_URL}/waInstance${GREEN_ID_INSTANCE}/${endpoint}/${GREEN_API_TOKEN}`;
}

/**
 * إرسال طلب POST إلى Green API
 */
export async function greenApiPost<T = any>(
  endpoint: string,
  data?: Record<string, any>
): Promise<T> {
  const url = createGreenApiUrl(endpoint);
  
  console.log('Green API Request:', {
    url: url.replace(GREEN_API_TOKEN, '***'),
    method: 'POST',
    data: data,
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const responseText = await response.text();
    console.log('Green API Response Status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });
    console.log('Green API Response Text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`Failed to parse response: ${responseText.substring(0, 200)}`);
    }
    
    console.log('Green API Response Data:', responseData);
    
    if (!response.ok) {
      const errorMessage = responseData.error || 
                          responseData.errorMessage ||
                          JSON.stringify(responseData);
      throw new Error(`Green API Error (${response.status}): ${errorMessage}`);
    }
    
    // Green API قد يعيد success: false حتى مع status 200
    if (responseData.success === false) {
      const errorMessage = responseData.error || 
                          responseData.errorMessage ||
                          'Unknown error';
      throw new Error(`Green API Error: ${errorMessage}`);
    }
    
    return responseData;
  } catch (fetchError: any) {
    console.error('❌ Fetch Error:', fetchError);
    
    if (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch')) {
      throw new Error('خطأ في الاتصال بالشبكة (CORS). قد تحتاج إلى استخدام Proxy أو إرسال الطلب من الخادم بدلاً من المتصفح.');
    }
    
    throw fetchError;
  }
}

/**
 * إرسال طلب GET إلى Green API
 */
export async function greenApiGet<T = any>(
  endpoint: string
): Promise<T> {
  const url = createGreenApiUrl(endpoint);
  
  console.log('Green API Request:', {
    url: url.replace(GREEN_API_TOKEN, '***'),
    method: 'GET',
  });
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`Failed to parse response: ${responseText.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      const errorMessage = responseData.error || 
                          responseData.errorMessage ||
                          JSON.stringify(responseData);
      throw new Error(`Green API Error (${response.status}): ${errorMessage}`);
    }
    
    return responseData;
  } catch (fetchError: any) {
    console.error('❌ Fetch Error:', fetchError);
    throw fetchError;
  }
}

/**
 * إرسال رسالة نصية عبر Green API
 * تنسيق الرقم: يجب أن يكون بالصيغة الدولية (مثال: 967778076543)
 */
export async function sendGreenApiTextMessage(
  to: string,
  message: string
) {
  if (!GREEN_API_URL || !GREEN_ID_INSTANCE || !GREEN_API_TOKEN) {
    throw new Error('Green API credentials غير مكتملة. يرجى إضافة VITE_GREEN_API_URL, VITE_GREEN_ID_INSTANCE, و VITE_GREEN_API_TOKEN في ملف .env.local');
  }

  console.log('📤 إرسال رسالة نصية عبر Green API:', { to, messageLength: message.length });

  // تنظيف رقم الهاتف
  const cleanPhoneNumber = to.replace(/\s+/g, '').replace(/[+\-()]/g, '');
  
  // Green API يتطلب تنسيق الرقم بالصيغة الدولية (بدون +)
  // مثال: 967778076543
  const formattedPhone = cleanPhoneNumber.startsWith('00') 
    ? cleanPhoneNumber.substring(2) 
    : cleanPhoneNumber;

  // محاولة استخدام API endpoint أولاً (لتجنب CORS)
  try {
    const apiUrl = '/api/whatsapp-send';
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message,
        type: 'text',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.warn('⚠️ API endpoint failed, using direct API call');
      throw new Error('API endpoint unavailable');
    }
  } catch (apiError: any) {
    // إذا لم يكن API endpoint متوفراً، نستخدم الطريقة المباشرة
    console.log('📤 Using direct Green API call');
    
    return greenApiPost('sendMessage', {
      chatId: `${formattedPhone}@c.us`, // Green API format: {phone}@c.us
      message: message,
    });
  }
}

/**
 * إرسال رسالة مع صورة عبر Green API
 */
export async function sendGreenApiImageMessage(
  to: string,
  imageUrl: string,
  caption?: string
) {
  if (!GREEN_API_URL || !GREEN_ID_INSTANCE || !GREEN_API_TOKEN) {
    throw new Error('Green API credentials غير مكتملة');
  }

  const cleanPhoneNumber = to.replace(/\s+/g, '').replace(/[+\-()]/g, '');
  const formattedPhone = cleanPhoneNumber.startsWith('00') 
    ? cleanPhoneNumber.substring(2) 
    : cleanPhoneNumber;

  return greenApiPost('sendFileByUrl', {
    chatId: `${formattedPhone}@c.us`,
    urlFile: imageUrl,
    fileName: 'image.jpg',
    caption: caption || '',
  });
}

/**
 * الحصول على معلومات الحساب
 */
export async function getGreenApiAccountState() {
  return greenApiGet('getStateInstance');
}

/**
 * الحصول على معلومات الجهاز
 */
export async function getGreenApiDeviceInfo() {
  return greenApiGet('getDeviceInfo');
}

/**
 * الحصول على إعدادات الحساب
 */
export async function getGreenApiSettings() {
  return greenApiGet('getSettings');
}

