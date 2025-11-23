# كيفية الحصول على Phone Number ID

## الخطوات السريعة:

### 1. اذهب إلى Facebook Developer Console
- افتح [Facebook Developers](https://developers.facebook.com/)
- سجل الدخول بحسابك

### 2. اختر تطبيقك
- اضغط على **My Apps** في القائمة العلوية
- اختر التطبيق الذي App ID الخاص به: `1412453170447570`

### 3. افتح صفحة WhatsApp API Setup
- من القائمة الجانبية، اضغط على **WhatsApp**
- أو اذهب مباشرة إلى: **WhatsApp** → **API Setup**

### 4. ابحث عن Phone Number ID
- في صفحة **API Setup**، ستجد قسم **"From"** أو **"Phone number ID"**
- سيكون الرقم موجود بجانب رقم الهاتف الخاص بك
- مثال: `123456789012345` (عادة يكون رقم طويل)

### 5. انسخ Phone Number ID
- انسخ الرقم بالكامل
- تأكد من عدم نسخ مسافات إضافية

### 6. أضفه في ملف .env.local
افتح ملف `.env.local` في مجلد المشروع وأضف:

```env
VITE_WHATSAPP_PHONE_NUMBER_ID=123456789012345
```

(استبدل `123456789012345` بالرقم الذي نسخته)

### 7. أعد تشغيل خادم التطوير
- أوقف الخادم (اضغط `Ctrl+C`)
- شغله مرة أخرى: `npm run dev`

## إذا لم تجد Phone Number ID:

### الحل البديل 1: من Graph API Explorer
1. اذهب إلى [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. اختر تطبيقك من القائمة المنسدلة
3. اختر Access Token الخاص بـ WhatsApp
4. في حقل البحث، اكتب: `/me/phone_numbers`
5. اضغط **Submit**
6. ستجد Phone Number ID في النتائج

### الحل البديل 2: من Business Settings
1. اذهب إلى [Meta Business Suite](https://business.facebook.com/)
2. اختر حساب الأعمال الخاص بك
3. اذهب إلى **Settings** → **WhatsApp Accounts**
4. اختر حساب WhatsApp الخاص بك
5. ستجد Phone Number ID في معلومات الحساب

## ملاحظات مهمة:

- ⚠️ Phone Number ID مختلف عن رقم الهاتف نفسه
- ⚠️ Phone Number ID هو رقم طويل (عادة 15-17 رقم)
- ⚠️ تأكد من نسخ الرقم بالكامل بدون مسافات
- ⚠️ بعد إضافة المتغير، يجب إعادة تشغيل خادم التطوير

## مثال على ملف .env.local الصحيح:

```env
# WhatsApp Business API Configuration
VITE_WHATSAPP_ACCESS_TOKEN=EAAUEnmF8hNIBQDshgwZBx1OZAfaZBfEpSBSCgldpfcV6jBv8gmoEkER1imhVZB3KNMO9bUFWMaxHk4KuSBypwpapFE0VXjaqBzkRrZB0NA4nSuhXqiU5DUhZBANIjPUlXtnr12oYjwGKYPZBqW8BHTfiG3mjNFDdit2g0ZCWjulniMwCWGbOW8MN5EaFd62C9rLI5eJfI7EWXMfywoVwlTGAOleOx9tccLWIlzIGwFDawQtNn9cjOFWEl9sPKcQF8gOZCnPHZA7ZCZAW2n78mRgmuwgh17A2
VITE_WHATSAPP_APP_ID=1412453170447570
VITE_WHATSAPP_PHONE_NUMBER_ID=123456789012345
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=
```

## استكشاف الأخطاء:

### الخطأ: "Phone Number ID not found"
- **السبب**: لم تقم بإضافة WhatsApp Business API إلى التطبيق
- **الحل**: اذهب إلى **Add Products** → **WhatsApp** → **Set Up**

### الخطأ: "Invalid phone number ID"
- **السبب**: الرقم الذي أدخلته غير صحيح
- **الحل**: تأكد من نسخ Phone Number ID الصحيح من صفحة API Setup

### الخطأ: "Phone number not verified"
- **السبب**: رقم الهاتف غير متحقق
- **الحل**: يجب التحقق من رقم الهاتف في Meta Business Suite أولاً

