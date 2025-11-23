// إعداد واجهة Facebook API

// الحصول على Access Token و App ID من متغيرات البيئة
const FACEBOOK_ACCESS_TOKEN = import.meta.env.VITE_FACEBOOK_ACCESS_TOKEN as string;
const FACEBOOK_APP_ID = import.meta.env.VITE_FACEBOOK_APP_ID as string;

// Base URL لـ Facebook Graph API
const FACEBOOK_GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

// التحقق من وجود المتغيرات المطلوبة
if (!FACEBOOK_ACCESS_TOKEN) {
  console.warn('⚠️ VITE_FACEBOOK_ACCESS_TOKEN غير موجود في متغيرات البيئة');
}

if (!FACEBOOK_APP_ID) {
  console.warn('⚠️ VITE_FACEBOOK_APP_ID غير موجود في متغيرات البيئة');
}

/**
 * إعدادات Facebook API
 */
export const facebookConfig = {
  accessToken: FACEBOOK_ACCESS_TOKEN,
  appId: FACEBOOK_APP_ID,
  graphApiBase: FACEBOOK_GRAPH_API_BASE,
};

/**
 * إنشاء URL لـ Facebook Graph API مع Access Token
 */
export function createFacebookApiUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(`${FACEBOOK_GRAPH_API_BASE}${endpoint}`);
  
  // إضافة Access Token
  url.searchParams.append('access_token', FACEBOOK_ACCESS_TOKEN);
  
  // إضافة معاملات إضافية إذا كانت موجودة
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  return url.toString();
}

/**
 * إرسال طلب GET إلى Facebook Graph API
 */
export async function facebookApiGet<T = any>(
  endpoint: string,
  params?: Record<string, string>
): Promise<T> {
  const url = createFacebookApiUrl(endpoint, params);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * إرسال طلب POST إلى Facebook Graph API
 */
export async function facebookApiPost<T = any>(
  endpoint: string,
  data?: Record<string, any>,
  params?: Record<string, string>
): Promise<T> {
  const url = createFacebookApiUrl(endpoint, params);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`Facebook API Error: ${JSON.stringify(error)}`);
  }
  
  return response.json();
}

/**
 * الحصول على معلومات الصفحة (Page)
 */
export async function getPageInfo(pageId: string) {
  return facebookApiGet(`/${pageId}`, {
    fields: 'id,name,about,phone,website,location,fan_count,link',
  });
}

/**
 * الحصول على معلومات التطبيق
 */
export async function getAppInfo() {
  return facebookApiGet(`/${FACEBOOK_APP_ID}`, {
    fields: 'id,name,category,link',
  });
}

/**
 * إرسال رسالة عبر Messenger API
 */
export async function sendMessage(recipientId: string, message: string) {
  return facebookApiPost(`/me/messages`, {
    recipient: { id: recipientId },
    message: { text: message },
  });
}

/**
 * الحصول على قائمة الصفحات المرتبطة بالتطبيق
 */
export async function getPages() {
  return facebookApiGet(`/me/accounts`, {
    fields: 'id,name,access_token,category,tasks',
  });
}

/**
 * التحقق من صحة Access Token
 */
export async function debugToken() {
  return facebookApiGet('/debug_token', {
    input_token: FACEBOOK_ACCESS_TOKEN,
  });
}

