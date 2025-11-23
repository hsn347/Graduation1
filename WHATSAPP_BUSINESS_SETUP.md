# دليل إعداد WhatsApp Business API في Facebook Developer

## الخطوات المطلوبة في موقع Facebook Developer

### الخطوة 1: إنشاء أو اختيار تطبيق Facebook

1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. اضغط على **My Apps** في القائمة العلوية
3. إما:
   - **إنشاء تطبيق جديد**: اضغط **Create App** → اختر **Business** → أدخل اسم التطبيق
   - **استخدام تطبيق موجود**: اختر التطبيق من القائمة

### الخطوة 2: إضافة منتج WhatsApp Business API

1. في لوحة تحكم التطبيق، اذهب إلى **Add Products** أو **Products** في القائمة الجانبية
2. ابحث عن **WhatsApp** في قائمة المنتجات
3. اضغط على **Set Up** بجانب **WhatsApp**
4. سيتم توجيهك إلى صفحة إعداد WhatsApp Business API

### الخطوة 3: الحصول على Access Token

1. بعد إضافة منتج WhatsApp، اذهب إلى **WhatsApp** في القائمة الجانبية
2. اضغط على **API Setup** أو **Getting Started**
3. ستجد قسم **Temporary access token** أو **Access Tokens**
4. **للاختبار**: يمكنك استخدام **Temporary access token** (صالح لمدة 24 ساعة)
5. **للإنتاج**: يجب إنشاء **Permanent access token**:
   - اذهب إلى **Tools** → **Graph API Explorer**
   - اختر تطبيقك من القائمة المنسدلة
   - اختر الصفحة (Page) المرتبطة بحساب WhatsApp Business
   - اضغط **Generate Access Token**
   - اختر الأذونات المطلوبة: `whatsapp_business_messaging`, `whatsapp_business_management`
   - انسخ الـ Access Token

### الخطوة 4: الحصول على Phone Number ID

1. في صفحة **WhatsApp** → **API Setup**
2. ستجد قسم **Phone number ID** أو **From**
3. انسخ **Phone number ID** (يبدأ عادة بـ `10` أو `11`)

### الخطوة 5: الحصول على Business Account ID

1. في صفحة **WhatsApp** → **API Setup**
2. ابحث عن **Business Account ID** أو **WhatsApp Business Account ID**
3. أو يمكنك الحصول عليه من:
   - **Business Settings** → **WhatsApp Accounts**
   - انسخ **WhatsApp Business Account ID**

### الخطوة 6: الحصول على App ID

1. في صفحة التطبيق، اذهب إلى **Settings** → **Basic**
2. ستجد **App ID** في أعلى الصفحة
3. انسخ **App ID**

### الخطوة 7: إعداد Webhook (اختياري - لاستقبال الرسائل)

1. في صفحة **WhatsApp** → **Configuration**
2. اضغط على **Edit** بجانب **Webhook**
3. أدخل:
   - **Callback URL**: `https://your-project-name.vercel.app/api/facebook-webhook`
   - **Verify Token**: نفس الرمز الذي أضفته في Vercel Environment Variables
4. اضغط **Verify and Save**
5. بعد التحقق الناجح، اضغط **Manage** بجانب **Webhook fields**
6. اختر الأحداث التي تريد الاشتراك فيها:
   - ✅ **messages**: لاستقبال الرسائل الواردة
   - ✅ **message_status**: لمعرفة حالة الرسائل المرسلة

### الخطوة 8: إعداد الأذونات (Permissions)

1. اذهب إلى **App Review** → **Permissions and Features**
2. تأكد من طلب الأذونات التالية:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
3. إذا كانت الأذونات في وضع **Development Mode**، يمكنك استخدامها للاختبار فقط
4. للإنتاج، يجب تقديم طلب مراجعة (App Review)

### الخطوة 9: إعداد رقم الهاتف (Phone Number)

1. في صفحة **WhatsApp** → **Phone Numbers**
2. إذا لم يكن لديك رقم:
   - يمكنك استخدام **Meta Business Suite** لإضافة رقم
   - أو شراء رقم من مزود معتمد
3. تأكد من أن الرقم **متحقق** (Verified)
4. انسخ **Phone Number ID** المرتبط بالرقم

### الخطوة 10: إنشاء قوالب الرسائل (Message Templates)

1. اذهب إلى **WhatsApp** → **Message Templates**
2. اضغط **Create Template**
3. اختر نوع القالب:
   - **Text**: رسالة نصية بسيطة
   - **Media**: رسالة مع صورة أو فيديو
   - **Interactive**: رسالة تفاعلية مع أزرار
4. أدخل:
   - **Name**: اسم القالب (مثلاً: `welcome_message`)
   - **Category**: اختر **MARKETING** أو **UTILITY** أو **AUTHENTICATION**
   - **Language**: اختر اللغة (مثلاً: `Arabic`)
   - **Content**: محتوى الرسالة
5. اضغط **Submit** وانتظر الموافقة (قد يستغرق بضع دقائق)

## ملخص المعلومات المطلوبة

بعد إكمال الخطوات أعلاه، ستحتاج إلى جمع المعلومات التالية:

1. **Access Token**: `EAAUEnmF8hNIBQDshgwZBx1OZAfaZBfEpSBSCgldpfcV6jBv8gmoEkER1imhVZB3KNMO9bUFWMaxHk4KuSBypwpapFE0VXjaqBzkRrZB0NA4nSuhXqiU5DUhZBANIjPUlXtnr12oYjwGKYPZBqW8BHTfiG3mjNFDdit2g0ZCWjulniMwCWGbOW8MN5EaFd62C9rLI5eJfI7EWXMfywoVwlTGAOleOx9tccLWIlzIGwFDawQtNn9cjOFWEl9sPKcQF8gOZCnPHZA7ZCZAW2n78mRgmuwgh17A2`
2. **App ID**: `1412453170447570`
3. **Phone Number ID**: (احصل عليه من الخطوة 4)
4. **Business Account ID**: (احصل عليه من الخطوة 5)

## إضافة المعلومات إلى ملف .env.local

بعد جمع جميع المعلومات، أضفها إلى ملف `.env.local`:

```env
# WhatsApp Business API Configuration
VITE_WHATSAPP_ACCESS_TOKEN=your_access_token_here
VITE_WHATSAPP_APP_ID=1412453170447570
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

## ملاحظات مهمة

### 1. Access Token
- **Temporary Token**: صالح لمدة 24 ساعة فقط، للاختبار
- **Permanent Token**: للاستخدام في الإنتاج، يحتاج إلى إعداد من Graph API Explorer

### 2. Phone Number ID
- يجب أن يكون الرقم **متحقق** (Verified)
- يمكنك الحصول على Phone Number ID من صفحة API Setup

### 3. Business Account ID
- قد يكون نفس App ID في بعض الحالات
- أو يمكن الحصول عليه من Business Settings

### 4. Webhook
- مطلوب فقط إذا كنت تريد **استقبال** الرسائل
- إذا كنت تريد **إرسال** الرسائل فقط، لا حاجة لـ Webhook

### 5. Message Templates
- **مطلوبة** لإرسال رسائل إلى أرقام لم تتواصل معك من قبل
- بعد 24 ساعة من آخر رسالة، يجب استخدام Template مرة أخرى
- يمكن إرسال رسائل عادية فقط خلال نافذة الـ 24 ساعة

## استكشاف الأخطاء

### خطأ: "Invalid OAuth access token"
- **السبب**: Access Token غير صحيح أو منتهي الصلاحية
- **الحل**: قم بتحديث Access Token

### خطأ: "Phone number ID not found"
- **السبب**: Phone Number ID غير صحيح
- **الحل**: تأكد من نسخ Phone Number ID الصحيح من صفحة API Setup

### خطأ: "Insufficient permissions"
- **السبب**: التطبيق لا يملك الأذونات المطلوبة
- **الحل**: أضف الأذونات في App Review → Permissions

### خطأ: "Message template not found"
- **السبب**: اسم القالب غير صحيح أو غير معتمد
- **الحل**: تأكد من أن القالب معتمد (Approved) في Message Templates

## روابط مفيدة

- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Meta Business Suite](https://business.facebook.com/)
- [WhatsApp Business API Getting Started](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

