# استكشاف أخطاء WhatsApp Business API

## المشكلة: الرسالة تم إرسالها بنجاح لكن لم تصل

### الأسباب المحتملة:

#### 1. الرقم غير موجود في قائمة الأرقام المسموحة (الأكثر شيوعاً)

**السبب**: في وضع الاختبار (Development Mode)، يجب إضافة الأرقام يدوياً.

**الحل**:
1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. اختر تطبيقك
3. اذهب إلى **WhatsApp** → **API Setup**
4. في قسم **"To"** أو **"Phone numbers"**، اضغط **"Add phone number"**
5. أدخل رقم الهاتف (بتنسيق دولي بدون + أو 0)
6. اضغط **Add**

**ملاحظة**: بعد إضافة الرقم، قد تحتاج إلى الانتظار بضع دقائق حتى يتم تفعيله.

#### 2. Access Token منتهي الصلاحية

**السبب**: إذا كنت تستخدم Temporary Access Token، فهو صالح لمدة 24 ساعة فقط.

**الحل**:
1. اذهب إلى [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. اختر تطبيقك
3. اختر الصفحة المرتبطة بحساب WhatsApp
4. اضغط **Generate Access Token**
5. اختر الأذونات: `whatsapp_business_messaging`, `whatsapp_business_management`
6. انسخ الـ Token الجديد
7. أضفه في ملف `.env.local`

#### 3. رقم الهاتف بتنسيق خاطئ

**السبب**: WhatsApp يتطلب تنسيق معين لرقم الهاتف.

**التنسيق الصحيح**:
- ✅ `966501234567` (صحيح)
- ❌ `+966501234567` (خطأ - لا تضع +)
- ❌ `0501234567` (خطأ - لا تضع 0 في البداية)
- ❌ `966 50 123 4567` (خطأ - لا تضع مسافات)

**الحل**: تأكد من أن الرقم:
- يبدأ برمز الدولة (مثلاً: 966 للسعودية)
- بدون رموز أو مسافات
- بين 10-15 رقم

#### 4. التطبيق في وضع Development Mode

**السبب**: في Development Mode، هناك قيود على إرسال الرسائل.

**الحل**:
- للاختبار: أضف الأرقام في قائمة الأرقام المسموحة
- للإنتاج: قدم طلب App Review للحصول على الأذونات الكاملة

#### 5. نافذة الـ 24 ساعة

**السبب**: يمكن إرسال رسائل عادية فقط خلال 24 ساعة من آخر رسالة واردة.

**الحل**:
- إذا مرت 24 ساعة، يجب استخدام **Message Templates** بدلاً من الرسائل العادية
- راجع ملف `WHATSAPP_API_USAGE.md` لمعرفة كيفية استخدام Templates

### كيفية التحقق من المشكلة:

#### 1. تحقق من Console في المتصفح

1. افتح Developer Tools (اضغط `F12`)
2. اذهب إلى تبويب **Console**
3. حاول إرسال رسالة
4. ابحث عن:
   - `WhatsApp API Request` - لرؤية الطلب المرسل
   - `WhatsApp API Response` - لرؤية الاستجابة
   - أي أخطاء باللون الأحمر

#### 2. تحقق من الاستجابة

بعد إرسال الرسالة، ستظهر تفاصيل الاستجابة في الواجهة. ابحث عن:
- `message_id`: إذا كان موجوداً، يعني أن الطلب تم قبوله
- `error`: إذا كان موجوداً، اقرأ رسالة الخطأ

#### 3. تحقق من Facebook Developer Console

1. اذهب إلى **WhatsApp** → **API Setup**
2. تحقق من:
   - **Phone number ID**: يجب أن يكون مطابقاً لما في `.env.local`
   - **Access Token**: تأكد من أنه صالح
   - **Phone numbers**: تحقق من أن الرقم موجود في القائمة

### الأخطاء الشائعة ورسائلها:

| رسالة الخطأ | السبب | الحل |
|------------|-------|------|
| `Recipient phone number not in allowed list` | الرقم غير موجود في القائمة | أضف الرقم في API Setup |
| `Invalid OAuth access token` | Token منتهي أو غير صحيح | قم بتحديث Access Token |
| `Invalid phone number` | تنسيق الرقم خاطئ | تأكد من التنسيق الصحيح |
| `Rate limit exceeded` | تجاوز الحد المسموح | انتظر قليلاً قبل المحاولة مرة أخرى |
| `Message template not found` | القالب غير موجود أو غير معتمد | أنشئ القالب في Message Templates |

### خطوات التحقق السريعة:

1. ✅ تحقق من أن `VITE_WHATSAPP_PHONE_NUMBER_ID` موجود في `.env.local`
2. ✅ تحقق من أن `VITE_WHATSAPP_ACCESS_TOKEN` صالح
3. ✅ تحقق من أن الرقم موجود في قائمة الأرقام المسموحة
4. ✅ تحقق من تنسيق رقم الهاتف (بدون + أو 0 أو مسافات)
5. ✅ تحقق من Console في المتصفح لرؤية تفاصيل الطلب والاستجابة
6. ✅ أعد تشغيل خادم التطوير بعد تحديث `.env.local`

### نصائح إضافية:

- **للاختبار**: استخدم رقم WhatsApp الخاص بك أولاً
- **للإنتاج**: تأكد من تقديم App Review للحصول على الأذونات الكاملة
- **Message Templates**: استخدم Templates للرسائل التي ترسل بعد 24 ساعة
- **Webhook**: قم بإعداد Webhook لاستقبال تحديثات حالة الرسائل

### الحصول على المساعدة:

إذا استمرت المشكلة:
1. تحقق من [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
2. راجع [WhatsApp Business API Status](https://developers.facebook.com/status/)
3. تحقق من [Facebook Developer Community](https://developers.facebook.com/community/)

