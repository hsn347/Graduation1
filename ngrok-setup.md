# إعداد ngrok للـ Webhook

## الخطوات المطلوبة:

### 1. إنشاء حساب مجاني على ngrok
   - اذهب إلى: https://dashboard.ngrok.com/signup
   - سجل حساب مجاني

### 2. الحصول على Authtoken
   - بعد تسجيل الدخول، اذهب إلى: https://dashboard.ngrok.com/get-started/your-authtoken
   - انسخ الـ authtoken الخاص بك

### 3. إعداد ngrok
   ```powershell
   ngrok authtoken YOUR_TOKEN_HERE
   ```
   (استبدل YOUR_TOKEN_HERE بالـ token الذي نسخته)

### 4. تشغيل ngrok
   ```powershell
   ngrok http 5173
   ```

### 5. الحصول على الرابط العام
   - بعد تشغيل ngrok، افتح المتصفح على: http://localhost:4040
   - ستجد الرابط العام (public URL) في الواجهة
   - أو استخدم هذا الأمر:
   ```powershell
   (Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels[0].public_url
   ```

## ملاحظات:
- الرابط العام سيكون مثل: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`
- استخدم هذا الرابط لإعداد webhook في WhatsApp Business API
- ngrok يعمل في الخلفية، لا تغلق النافذة

