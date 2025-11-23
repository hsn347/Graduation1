# معلومات Webhook الخاصة بك

## URL موقعك:
```
https://graduation-aeua7j9w1-hsns-projects-3ab61095.vercel.app
```

## URL الخاص بـ Webhook:
```
https://graduation-aeua7j9w1-hsns-projects-3ab61095.vercel.app/api/facebook-webhook
```

## خطوات الإعداد:

### 1. في Vercel Dashboard:
1. اذهب إلى **Settings** → **Environment Variables**
2. أضف:
   - **Name**: `FACEBOOK_VERIFY_TOKEN`
   - **Value**: اختر رمز (مثلاً: `fb_webhook_2024_secure`)
   - **Environment**: ✅ Production, ✅ Preview, ✅ Development
3. **احفظ** ثم **أعد نشر** المشروع

### 2. في Facebook Developer:
1. اذهب إلى تطبيقك → **Webhooks**
2. اضغط **Add Callback URL**
3. أدخل:
   - **Callback URL**: 
     ```
     https://graduation-aeua7j9w1-hsns-projects-3ab61095.vercel.app/api/facebook-webhook
     ```
   - **Verify Token**: نفس الرمز الذي أضفته في Vercel
4. اضغط **Verify and Save**

### 3. اختبار يدوي:
يمكنك اختبار الـ endpoint من المتصفح:
```
https://graduation-aeua7j9w1-hsns-projects-3ab61095.vercel.app/api/facebook-webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123
```
(استبدل `YOUR_TOKEN` بالرمز الذي أضفته في Vercel)

يجب أن يعيد `test123` إذا كان كل شيء صحيحاً.

## ملاحظات:
- ⚠️ تأكد من نسخ URL بالضبط بدون `@` في البداية
- ⚠️ تأكد من أن Verify Token متطابق في Vercel و Facebook
- ⚠️ بعد إضافة Environment Variable، يجب إعادة نشر المشروع

