# استكشاف أخطاء Facebook Webhook

## المشكلة: "تعذر التحقق من صحة عنوان URL الاستدعاء أو رمز التحقق"

### الخطوات للتحقق:

#### 1. التحقق من Environment Variable في Vercel

1. اذهب إلى **Vercel Dashboard** → مشروعك → **Settings** → **Environment Variables**
2. تأكد من وجود `FACEBOOK_VERIFY_TOKEN` مع القيمة الصحيحة
3. تأكد من أن Environment يشمل **Production**
4. إذا قمت بتغيير القيمة، يجب **إعادة نشر** المشروع

#### 2. التحقق من Verify Token في Facebook

1. اذهب إلى **Facebook Developers** → تطبيقك → **Webhooks**
2. تأكد من أن **Verify Token** مطابق تماماً للقيمة في Vercel
3. **ملاحظة مهمة**: يجب أن يكون متطابقاً حرفياً (حساس لحالة الأحرف)

#### 3. التحقق من URL

- يجب أن يكون URL بالشكل التالي:
  ```
  https://your-project-name.vercel.app/api/facebook-webhook
  ```
- تأكد من استخدام **HTTPS** وليس HTTP
- تأكد من عدم وجود `/` في النهاية

#### 4. التحقق من Logs في Vercel

1. اذهب إلى **Vercel Dashboard** → مشروعك → **Deployments**
2. اختر آخر deployment
3. اضغط على **Functions** → `api/facebook-webhook`
4. حاول التحقق من Facebook مرة أخرى
5. تحقق من Logs لرؤية:
   - هل وصل الطلب؟
   - ما هي قيم `mode`, `token`, `challenge`؟
   - هل `tokenMatch` صحيح؟

#### 5. اختبار الـ Endpoint يدوياً

يمكنك اختبار الـ endpoint من المتصفح:
```
https://your-project-name.vercel.app/api/facebook-webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123
```

يجب أن يعيد `test123` إذا كان كل شيء صحيحاً.

#### 6. المشاكل الشائعة:

**المشكلة 1: Verify Token غير متطابق**
- ✅ الحل: تأكد من نسخ القيمة بالضبط من Vercel ولصقها في Facebook

**المشكلة 2: Environment Variable غير موجود في Production**
- ✅ الحل: تأكد من اختيار "Production" عند إضافة Environment Variable

**المشكلة 3: لم يتم إعادة نشر المشروع بعد إضافة Environment Variable**
- ✅ الحل: اذهب إلى Deployments واضغط "Redeploy"

**المشكلة 4: URL غير صحيح**
- ✅ الحل: تأكد من استخدام URL الكامل مع `/api/facebook-webhook`

**المشكلة 5: مسافات إضافية في Verify Token**
- ✅ الحل: تأكد من عدم وجود مسافات في البداية أو النهاية

#### 7. خطوات التحقق السريعة:

```bash
# 1. تحقق من Environment Variable في Vercel
# 2. انسخ القيمة بالضبط
# 3. الصقها في Facebook Developer
# 4. تأكد من عدم وجود مسافات
# 5. أعد نشر المشروع في Vercel
# 6. حاول التحقق مرة أخرى
```

#### 8. إذا استمرت المشكلة:

1. **تحقق من Logs**: راجع Logs في Vercel لرؤية ما يحدث بالضبط
2. **جرب token بسيط**: استخدم token بسيط مثل `test123` للتحقق من أن المشكلة ليست في التعقيد
3. **تحقق من Network**: تأكد من أن Vercel Function يعمل (جرب الوصول للـ URL في المتصفح)
4. **راجع الكود**: تأكد من أن الكود في `api/facebook-webhook.ts` صحيح

#### 9. مثال على Verify Token صحيح:

```
FACEBOOK_VERIFY_TOKEN=my_webhook_token_2024
```

في Facebook Developer يجب أن يكون:
```
my_webhook_token_2024
```

**⚠️ مهم**: لا تضع مسافات أو أحرف إضافية!

