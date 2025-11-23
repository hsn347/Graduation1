# دليل استخدام Facebook API

## الإعداد

تم إعداد واجهة Facebook API بنجاح! تم إضافة:

1. **ملف الإعداد**: `src/lib/facebook-api.ts`
2. **متغيرات البيئة**: `.env.local`

## المتغيرات المطلوبة

في ملف `.env.local`:
```
VITE_FACEBOOK_ACCESS_TOKEN=your_access_token_here
VITE_FACEBOOK_APP_ID=your_app_id_here
```

## الاستخدام

### 1. استيراد الدوال

```typescript
import { 
  facebookApiGet, 
  facebookApiPost,
  getPageInfo,
  getAppInfo,
  sendMessage,
  getPages,
  debugToken
} from '@/lib/facebook-api';
```

### 2. الحصول على معلومات التطبيق

```typescript
try {
  const appInfo = await getAppInfo();
  console.log('معلومات التطبيق:', appInfo);
} catch (error) {
  console.error('خطأ في الحصول على معلومات التطبيق:', error);
}
```

### 3. الحصول على معلومات الصفحة

```typescript
try {
  const pageInfo = await getPageInfo('page_id_here');
  console.log('معلومات الصفحة:', pageInfo);
} catch (error) {
  console.error('خطأ في الحصول على معلومات الصفحة:', error);
}
```

### 4. الحصول على قائمة الصفحات

```typescript
try {
  const pages = await getPages();
  console.log('الصفحات المرتبطة:', pages);
} catch (error) {
  console.error('خطأ في الحصول على الصفحات:', error);
}
```

### 5. إرسال رسالة عبر Messenger

```typescript
try {
  const result = await sendMessage('recipient_id_here', 'مرحباً! هذه رسالة تجريبية');
  console.log('تم إرسال الرسالة:', result);
} catch (error) {
  console.error('خطأ في إرسال الرسالة:', error);
}
```

### 6. التحقق من صحة Access Token

```typescript
try {
  const debugInfo = await debugToken();
  console.log('معلومات Token:', debugInfo);
} catch (error) {
  console.error('خطأ في التحقق من Token:', error);
}
```

### 7. استخدام API مباشرة (GET)

```typescript
import { facebookApiGet } from '@/lib/facebook-api';

try {
  // مثال: الحصول على معلومات المستخدم
  const userInfo = await facebookApiGet('/me', {
    fields: 'id,name,email'
  });
  console.log('معلومات المستخدم:', userInfo);
} catch (error) {
  console.error('خطأ:', error);
}
```

### 8. استخدام API مباشرة (POST)

```typescript
import { facebookApiPost } from '@/lib/facebook-api';

try {
  // مثال: إنشاء منشور
  const result = await facebookApiPost('/me/feed', {
    message: 'هذا منشور تجريبي'
  });
  console.log('تم إنشاء المنشور:', result);
} catch (error) {
  console.error('خطأ:', error);
}
```

## مثال كامل في React Component

```typescript
import { useState, useEffect } from 'react';
import { getAppInfo, getPages } from '@/lib/facebook-api';

export const FacebookInfo = () => {
  const [appInfo, setAppInfo] = useState(null);
  const [pages, setPages] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [appData, pagesData] = await Promise.all([
          getAppInfo(),
          getPages()
        ]);
        
        setAppInfo(appData);
        setPages(pagesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div>
      <h2>معلومات التطبيق</h2>
      <pre>{JSON.stringify(appInfo, null, 2)}</pre>
      
      <h2>الصفحات</h2>
      <pre>{JSON.stringify(pages, null, 2)}</pre>
    </div>
  );
};
```

## ملاحظات مهمة

1. **Access Token**: قد تنتهي صلاحية Access Token. تأكد من تحديثه عند الحاجة.
2. **الأذونات**: تأكد من أن التطبيق لديه الأذونات المطلوبة (Permissions) في Facebook Developer.
3. **Rate Limits**: Facebook يحد من عدد الطلبات. تأكد من التعامل مع الأخطاء بشكل صحيح.
4. **الأمان**: لا تشارك Access Token في الكود العام. استخدم متغيرات البيئة دائماً.

## الأخطاء الشائعة

### خطأ: "Invalid OAuth access token"
- **السبب**: Access Token غير صحيح أو منتهي الصلاحية
- **الحل**: قم بتحديث Access Token في `.env.local`

### خطأ: "Insufficient permissions"
- **السبب**: التطبيق لا يملك الأذونات المطلوبة
- **الحل**: أضف الأذونات المطلوبة في Facebook Developer Console

### خطأ: "App ID not found"
- **السبب**: App ID غير صحيح
- **الحل**: تأكد من صحة App ID في `.env.local`

## المراجع

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)

