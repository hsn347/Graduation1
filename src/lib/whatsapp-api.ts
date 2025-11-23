// إعداد واجهة WhatsApp Business API

// الحصول على Access Token و App ID من متغيرات البيئة
const WHATSAPP_ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN as string;
const WHATSAPP_APP_ID = import.meta.env.VITE_WHATSAPP_APP_ID as string;
const WHATSAPP_PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID as string;
const WHATSAPP_BUSINESS_ACCOUNT_ID = import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID as string;

// Base URL لـ WhatsApp Business API (Graph API)
const WHATSAPP_GRAPH_API_BASE = 'https://graph.facebook.com/v22.0';

// التحقق من وجود المتغيرات المطلوبة
if (!WHATSAPP_ACCESS_TOKEN) {
  console.warn('⚠️ VITE_WHATSAPP_ACCESS_TOKEN غير موجود في متغيرات البيئة');
}

if (!WHATSAPP_APP_ID) {
  console.warn('⚠️ VITE_WHATSAPP_APP_ID غير موجود في متغيرات البيئة');
}

if (!WHATSAPP_PHONE_NUMBER_ID) {
  console.warn('⚠️ VITE_WHATSAPP_PHONE_NUMBER_ID غير موجود في متغيرات البيئة');
}

/**
 * إعدادات WhatsApp Business API
 */
export const whatsappConfig = {
  accessToken: WHATSAPP_ACCESS_TOKEN,
  appId: WHATSAPP_APP_ID,
  phoneNumberId: WHATSAPP_PHONE_NUMBER_ID,
  businessAccountId: WHATSAPP_BUSINESS_ACCOUNT_ID,
  graphApiBase: WHATSAPP_GRAPH_API_BASE,
};

/**
 * إنشاء URL لـ WhatsApp Business API
 */
export function createWhatsAppApiUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${WHATSAPP_GRAPH_API_BASE}${endpoint}`);
  
  // إضافة معاملات إضافية إذا كانت موجودة
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}

/**
 * إرسال طلب GET إلى WhatsApp Business API
 */
export async function whatsappApiGet<T = any>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = createWhatsAppApiUrl(endpoint, params);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * إرسال طلب POST إلى WhatsApp Business API
 */
export async function whatsappApiPost<T = any>(
  endpoint: string,
  data?: Record<string, any>,
  params?: Record<string, string>
): Promise<T> {
  const url = createWhatsAppApiUrl(endpoint, params);
  
  console.log('WhatsApp API Request:', {
    url: url,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    },
    data: data,
  });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    console.log('WhatsApp API Response Status:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });
    
    const responseText = await response.text();
    console.log('WhatsApp API Response Text:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`Failed to parse response: ${responseText.substring(0, 200)}`);
    }
    
    console.log('WhatsApp API Response Data:', responseData);
    
    if (!response.ok) {
      const errorMessage = responseData.error?.message || 
                          responseData.error?.error_user_msg || 
                          responseData.error?.error_subcode ||
                          responseData.error?.code ||
                          JSON.stringify(responseData);
      throw new Error(`WhatsApp API Error (${response.status}): ${errorMessage}`);
    }
    
    // التحقق من وجود أخطاء في الاستجابة حتى لو كان status 200
    if (responseData.error) {
      const errorMessage = responseData.error.message || 
                          responseData.error.error_user_msg || 
                          responseData.error.error_subcode ||
                          responseData.error.code ||
                          JSON.stringify(responseData.error);
      throw new Error(`WhatsApp API Error: ${errorMessage}`);
    }
    
    return responseData;
  } catch (fetchError: any) {
    console.error('❌ Fetch Error:', fetchError);
    
    // معالجة أخطاء CORS
    if (fetchError.message.includes('CORS') || fetchError.message.includes('Failed to fetch')) {
      throw new Error('خطأ في الاتصال بالشبكة (CORS). قد تحتاج إلى استخدام Proxy أو إرسال الطلب من الخادم بدلاً من المتصفح.');
    }
    
    throw fetchError;
  }
}

/**
 * إرسال رسالة نصية عبر WhatsApp
 */
export async function sendWhatsAppTextMessage(
  to: string,
  message: string
) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID غير محدد. يرجى إضافة VITE_WHATSAPP_PHONE_NUMBER_ID في ملف .env.local. راجع ملف WHATSAPP_BUSINESS_SETUP.md للخطوات التفصيلية.');
  }

  console.log('📤 إرسال رسالة نصية:', { to, messageLength: message.length });

  return whatsappApiPost(
    `/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'text',
      text: {
        preview_url: false,
        body: message,
      },
    }
  );
}

/**
 * إرسال رسالة مع صورة عبر WhatsApp
 */
export async function sendWhatsAppImageMessage(
  to: string,
  imageUrl: string,
  caption?: string
) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID غير محدد');
  }

  return whatsappApiPost(
    `/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'image',
      image: {
        link: imageUrl,
        caption: caption || '',
      },
    }
  );
}

/**
 * إرسال رسالة مع مستند عبر WhatsApp
 */
export async function sendWhatsAppDocumentMessage(
  to: string,
  documentUrl: string,
  filename?: string,
  caption?: string
) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID غير محدد');
  }

  return whatsappApiPost(
    `/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'document',
      document: {
        link: documentUrl,
        filename: filename,
        caption: caption || '',
      },
    }
  );
}

/**
 * إرسال رسالة تفاعلية (Interactive Message) عبر WhatsApp
 */
export async function sendWhatsAppInteractiveMessage(
  to: string,
  body: string,
  buttons: Array<{ type: 'reply'; reply: { id: string; title: string } }>
) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID غير محدد');
  }

  return whatsappApiPost(
    `/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: body,
        },
        action: {
          buttons: buttons,
        },
      },
    }
  );
}

/**
 * الحصول على معلومات رقم الهاتف (Phone Number)
 */
export async function getPhoneNumberInfo() {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID غير محدد. يرجى إضافة VITE_WHATSAPP_PHONE_NUMBER_ID في ملف .env.local. راجع ملف WHATSAPP_BUSINESS_SETUP.md للخطوات التفصيلية.');
  }

  return whatsappApiGet(`/${WHATSAPP_PHONE_NUMBER_ID}`, {
    fields: 'verified_name,display_phone_number,quality_rating,code_verification_status',
  });
}

/**
 * الحصول على معلومات Business Account
 */
export async function getBusinessAccountInfo() {
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID غير محدد');
  }

  return whatsappApiGet(`/${WHATSAPP_BUSINESS_ACCOUNT_ID}`, {
    fields: 'id,name,timezone_id,message_template_namespace',
  });
}

/**
 * الحصول على قائمة أرقام الهواتف المرتبطة بـ Business Account
 */
export async function getPhoneNumbers() {
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID غير محدد');
  }

  return whatsappApiGet(`/${WHATSAPP_BUSINESS_ACCOUNT_ID}/phone_numbers`, {
    fields: 'id,verified_name,display_phone_number,quality_rating',
  });
}

/**
 * الحصول على قوالب الرسائل (Message Templates)
 */
export async function getMessageTemplates() {
  if (!WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID غير محدد');
  }

  return whatsappApiGet(`/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`, {
    fields: 'id,name,category,language,status,components',
  });
}

/**
 * إرسال رسالة باستخدام قالب (Template Message)
 */
export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = 'ar',
  parameters?: Array<{ type: string; text?: string; image?: { link: string } }>
) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID غير محدد');
  }

  console.log('📤 إرسال Template Message:', { to, templateName, languageCode });

  const templateData: any = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
    },
  };

  if (parameters && parameters.length > 0) {
    templateData.template.components = [
      {
        type: 'body',
        parameters: parameters,
      },
    ];
  }

  return whatsappApiPost(`/${WHATSAPP_PHONE_NUMBER_ID}/messages`, templateData);
}

/**
 * التحقق من صحة Access Token
 */
export async function debugToken() {
  return whatsappApiGet('/debug_token', {
    input_token: WHATSAPP_ACCESS_TOKEN,
  });
}

/**
 * الحصول على معلومات التطبيق
 */
export async function getAppInfo() {
  return whatsappApiGet(`/${WHATSAPP_APP_ID}`, {
    fields: 'id,name,category,link',
  });
}

/**
 * التحقق من حالة رسالة معينة
 */
export async function getMessageStatus(messageId: string) {
  if (!WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_PHONE_NUMBER_ID غير محدد');
  }

  return whatsappApiGet(`/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    message_id: messageId,
  });
}

