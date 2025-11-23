# دليل استخدام WhatsApp Business API

## الإعداد

تم إعداد واجهة WhatsApp Business API بنجاح! تم إضافة:

1. **ملف الإعداد**: `src/lib/whatsapp-api.ts`
2. **مكون React**: `src/components/WhatsAppManager.tsx`
3. **متغيرات البيئة**: `.env.local`

## المتغيرات المطلوبة

في ملف `.env.local`:
```env
VITE_WHATSAPP_ACCESS_TOKEN=your_access_token_here
VITE_WHATSAPP_APP_ID=1412453170447570
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

**ملاحظة مهمة**: يجب الحصول على `PHONE_NUMBER_ID` و `BUSINESS_ACCOUNT_ID` من Facebook Developer Console. راجع ملف `WHATSAPP_BUSINESS_SETUP.md` للخطوات التفصيلية.

## الاستخدام في الكود

### 1. استيراد الدوال

```typescript
import { 
  sendWhatsAppTextMessage,
  sendWhatsAppImageMessage,
  sendWhatsAppDocumentMessage,
  sendWhatsAppInteractiveMessage,
  getPhoneNumberInfo,
  getBusinessAccountInfo,
  getMessageTemplates,
  sendTemplateMessage,
  debugToken
} from '@/lib/whatsapp-api';
```

### 2. إرسال رسالة نصية

```typescript
try {
  const result = await sendWhatsAppTextMessage(
    '966501234567', // رقم الهاتف مع رمز الدولة (بدون + أو 0)
    'مرحباً! هذه رسالة تجريبية من WhatsApp Business API'
  );
  console.log('تم إرسال الرسالة:', result);
} catch (error) {
  console.error('خطأ في إرسال الرسالة:', error);
}
```

### 3. إرسال رسالة مع صورة

```typescript
try {
  const result = await sendWhatsAppImageMessage(
    '966501234567',
    'https://example.com/image.jpg',
    'هذه صورة تجريبية'
  );
  console.log('تم إرسال الصورة:', result);
} catch (error) {
  console.error('خطأ في إرسال الصورة:', error);
}
```

### 4. إرسال رسالة مع مستند

```typescript
try {
  const result = await sendWhatsAppDocumentMessage(
    '966501234567',
    'https://example.com/document.pdf',
    'document.pdf',
    'هذا مستند تجريبي'
  );
  console.log('تم إرسال المستند:', result);
} catch (error) {
  console.error('خطأ في إرسال المستند:', error);
}
```

### 5. إرسال رسالة تفاعلية (مع أزرار)

```typescript
try {
  const result = await sendWhatsAppInteractiveMessage(
    '966501234567',
    'اختر أحد الخيارات:',
    [
      {
        type: 'reply',
        reply: {
          id: 'option1',
          title: 'الخيار الأول'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'option2',
          title: 'الخيار الثاني'
        }
      }
    ]
  );
  console.log('تم إرسال الرسالة التفاعلية:', result);
} catch (error) {
  console.error('خطأ في إرسال الرسالة التفاعلية:', error);
}
```

### 6. إرسال رسالة باستخدام قالب (Template)

```typescript
try {
  const result = await sendTemplateMessage(
    '966501234567',
    'welcome_message', // اسم القالب المعتمد
    'ar', // رمز اللغة
    [
      { type: 'text', text: 'أحمد' } // معاملات القالب
    ]
  );
  console.log('تم إرسال القالب:', result);
} catch (error) {
  console.error('خطأ في إرسال القالب:', error);
}
```

### 7. الحصول على معلومات الرقم

```typescript
try {
  const phoneInfo = await getPhoneNumberInfo();
  console.log('معلومات الرقم:', phoneInfo);
} catch (error) {
  console.error('خطأ في جلب معلومات الرقم:', error);
}
```

### 8. الحصول على معلومات Business Account

```typescript
try {
  const businessInfo = await getBusinessAccountInfo();
  console.log('معلومات الحساب:', businessInfo);
} catch (error) {
  console.error('خطأ في جلب معلومات الحساب:', error);
}
```

### 9. الحصول على قوالب الرسائل

```typescript
try {
  const templates = await getMessageTemplates();
  console.log('قوالب الرسائل:', templates);
} catch (error) {
  console.error('خطأ في جلب القوالب:', error);
}
```

### 10. التحقق من صحة Access Token

```typescript
try {
  const debugInfo = await debugToken();
  console.log('معلومات Token:', debugInfo);
} catch (error) {
  console.error('خطأ في التحقق من Token:', error);
}
```

## استخدام المكون في Dashboard

تم إضافة مكون `WhatsAppManager` إلى Dashboard. يمكنك الوصول إليه من القائمة الجانبية:

1. افتح Dashboard
2. اضغط على **WhatsApp Business** في القائمة الجانبية
3. ستظهر واجهة لإرسال الرسائل والتحقق من المعلومات

## مثال كامل في React Component

```typescript
import { useState } from 'react';
import { sendWhatsAppTextMessage, getPhoneNumberInfo } from '@/lib/whatsapp-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const WhatsAppSender = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    setLoading(true);
    try {
      const response = await sendWhatsAppTextMessage(phoneNumber, message);
      setResult(response);
      setMessage(''); // مسح الرسالة بعد الإرسال
    } catch (error: any) {
      console.error('خطأ:', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="tel"
        placeholder="966501234567"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="اكتب رسالتك..."
        rows={4}
      />
      <Button onClick={handleSend} disabled={loading}>
        {loading ? 'جاري الإرسال...' : 'إرسال'}
      </Button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
};
```

## ملاحظات مهمة

### 1. تنسيق رقم الهاتف
- يجب أن يكون الرقم بتنسيق دولي **بدون** `+` أو `0` في البداية
- مثال: `966501234567` (السعودية) بدلاً من `+966501234567` أو `0501234567`

### 2. نافذة الـ 24 ساعة
- يمكنك إرسال رسائل عادية فقط خلال **24 ساعة** من آخر رسالة واردة
- بعد 24 ساعة، يجب استخدام **Message Templates** فقط

### 3. Message Templates
- يجب إنشاء القوالب في Facebook Developer Console أولاً
- يجب أن تكون القوالب **معتمدة** (Approved) قبل الاستخدام
- راجع `WHATSAPP_BUSINESS_SETUP.md` لمعرفة كيفية إنشاء القوالب

### 4. Access Token
- **Temporary Token**: صالح لمدة 24 ساعة فقط (للاختبار)
- **Permanent Token**: للاستخدام في الإنتاج
- راجع `WHATSAPP_BUSINESS_SETUP.md` لمعرفة كيفية الحصول على Permanent Token

### 5. الأذونات المطلوبة
- `whatsapp_business_messaging`: لإرسال الرسائل
- `whatsapp_business_management`: لإدارة الحساب

## الأخطاء الشائعة

### خطأ: "Invalid OAuth access token"
- **السبب**: Access Token غير صحيح أو منتهي الصلاحية
- **الحل**: قم بتحديث Access Token في `.env.local`

### خطأ: "Phone number ID not found"
- **السبب**: Phone Number ID غير محدد أو غير صحيح
- **الحل**: تأكد من إضافة `VITE_WHATSAPP_PHONE_NUMBER_ID` في `.env.local`

### خطأ: "Recipient phone number not in allowed list"
- **السبب**: الرقم غير موجود في قائمة الأرقام المسموحة (للاختبار)
- **الحل**: أضف الرقم في Facebook Developer Console → WhatsApp → API Setup → Add phone number

### خطأ: "Message template not found"
- **السبب**: اسم القالب غير صحيح أو غير معتمد
- **الحل**: تأكد من أن القالب معتمد في Message Templates

### خطأ: "Rate limit exceeded"
- **السبب**: تجاوز الحد المسموح من الرسائل
- **الحل**: انتظر قليلاً قبل إرسال المزيد من الرسائل

## المراجع

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business API Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Message Templates Guide](https://developers.facebook.com/docs/whatsapp/business-management-api/message-templates)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

