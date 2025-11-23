# إعداد Facebook Webhook

## الخطوات المطلوبة:

### 1. الحصول على URL الخاص بـ Webhook

بعد رفع المشروع على Vercel، سيكون URL الخاص بـ webhook:
```
https://your-project-name.vercel.app/api/facebook-webhook
```
(استبدل `your-project-name` باسم مشروعك في Vercel)

**مثال**: إذا كان URL موقعك هو `https://graduation-aeua7j9w1-hsns-projects-3ab61095.vercel.app`
فإن URL الـ webhook سيكون:
```
https://graduation-aeua7j9w1-hsns-projects-3ab61095.vercel.app/api/facebook-webhook
```

### 2. إعداد متغير البيئة في Vercel

1. اذهب إلى **Vercel Dashboard** → **Settings** → **Environment Variables**
2. أضف متغير جديد:
   - **Name**: `FACEBOOK_VERIFY_TOKEN`
   - **Value**: اختر رمز تحقق قوي (مثلاً: `my_secure_token_12345`)
   - **Environment**: Production, Preview, Development

### 3. إعداد Webhook في Facebook Developer

1. اذهب إلى [Facebook Developers](https://developers.facebook.com/)
2. اختر تطبيقك أو أنشئ تطبيق جديد
3. اذهب إلى **Settings** → **Basic**
4. في قسم **Webhooks**، اضغط على **Add Product**
5. اختر المنتج الذي تريده (مثلاً: Messenger, Instagram, WhatsApp Business API)
6. اضغط على **Set Up** بجانب Webhooks
7. اضغط على **Add Callback URL**
8. أدخل:
   - **Callback URL**: `https://your-project-name.vercel.app/api/facebook-webhook`
   - **Verify Token**: نفس الرمز الذي أضفته في Vercel Environment Variables (مثلاً: `my_secure_token_12345`)
9. اضغط على **Verify and Save**

### 4. اختيار الأحداث (Subscription Fields)

بعد التحقق الناجح، يمكنك اختيار الأحداث التي تريد الاشتراك فيها:
- **messages**: لاستقبال الرسائل
- **messaging_postbacks**: لاستقبال Postback events
- **messaging_optins**: لاستقبال Opt-in events
- وغيرها حسب احتياجك

### 5. الاختبار

بعد الإعداد، يمكنك اختبار webhook من Facebook Developer Console:
1. اذهب إلى **Webhooks** في تطبيقك
2. اضغط على **Test** بجانب webhook الخاص بك
3. اختر نوع الحدث وارسل test event

## ملاحظات مهمة:

- **Verify Token**: يجب أن يكون نفس الرمز في Vercel Environment Variables و Facebook Developer
- **HTTPS فقط**: Facebook يتطلب HTTPS، لذا تأكد من استخدام URL الخاص بـ Vercel (ليس localhost)
- **Security**: استخدم رمز تحقق قوي ومعقد
- **Logs**: يمكنك مراقبة logs في Vercel Dashboard → **Deployments** → **Functions**

## للتطوير المحلي:

إذا كنت تريد اختبار webhook محلياً، يمكنك استخدام ngrok:
1. شغل ngrok: `ngrok http 5173`
2. استخدم URL الذي يعطيه ngrok في Facebook Developer
3. تأكد من تحديث `VERIFY_TOKEN` في الكود أو استخدام environment variable

## مثال على Verify Token:

```
FACEBOOK_VERIFY_TOKEN=fb_webhook_2024_secure_token_xyz123
```

## استكشاف الأخطاء:

- إذا فشل التحقق: تأكد من أن Verify Token متطابق في Vercel و Facebook
- إذا لم تصل الأحداث: تأكد من اختيار Subscription Fields الصحيحة
- تحقق من Vercel Function Logs لرؤية أي أخطاء

