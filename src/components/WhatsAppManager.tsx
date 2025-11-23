import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  sendWhatsAppTextMessage,
  sendTemplateMessage,
  getPhoneNumberInfo,
  getBusinessAccountInfo,
  getMessageTemplates,
  debugToken,
  getAppInfo,
  whatsappConfig,
} from "@/lib/whatsapp-api"
import { Loader2, Send, CheckCircle2, XCircle, Info } from "lucide-react"
import { Select } from "@/components/ui/select"

export const WhatsAppManager = () => {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"text" | "template">("text")
  const [templateName, setTemplateName] = useState("hello_world")
  const [templateLanguage, setTemplateLanguage] = useState("en_US")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [infoData, setInfoData] = useState<any>(null)
  const [infoLoading, setInfoLoading] = useState(false)

  const handleSendMessage = async () => {
    if (!phoneNumber) {
      setError("يرجى إدخال رقم الهاتف")
      return
    }

    if (messageType === "text" && !message) {
      setError("يرجى إدخال الرسالة")
      return
    }

    if (messageType === "template" && !templateName) {
      setError("يرجى إدخال اسم القالب")
      return
    }

    // تنظيف رقم الهاتف (إزالة المسافات والرموز)
    const cleanPhoneNumber = phoneNumber.replace(/\s+/g, '').replace(/[+\-()]/g, '')
    
    console.log('📱 رقم الهاتف الأصلي:', phoneNumber)
    console.log('📱 رقم الهاتف بعد التنظيف:', cleanPhoneNumber)
    console.log('📱 طول الرقم:', cleanPhoneNumber.length)
    
    // التحقق من تنسيق رقم الهاتف
    if (!/^\d{10,15}$/.test(cleanPhoneNumber)) {
      const errorMsg = `تنسيق رقم الهاتف غير صحيح. الرقم بعد التنظيف: "${cleanPhoneNumber}" (${cleanPhoneNumber.length} رقم). يجب أن يكون بين 10-15 رقم بدون رموز أو مسافات`
      console.error('❌', errorMsg)
      setError(errorMsg)
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      console.log('🚀 بدء إرسال الرسالة...', {
        type: messageType,
        phoneNumber: cleanPhoneNumber,
        templateName: messageType === "template" ? templateName : undefined,
        message: messageType === "text" ? message.substring(0, 50) + "..." : undefined,
      })
      
      let response
      if (messageType === "template") {
        console.log('📤 إرسال Template Message:', { to: cleanPhoneNumber, template: templateName, language: templateLanguage })
        response = await sendTemplateMessage(cleanPhoneNumber, templateName, templateLanguage)
      } else {
        console.log('📤 إرسال Text Message:', { to: cleanPhoneNumber, messageLength: message.length })
        response = await sendWhatsAppTextMessage(cleanPhoneNumber, message)
      }
      
      console.log('✅ استجابة API:', response)
      
      setResult(response)
      if (messageType === "text") {
        setMessage("") // مسح الرسالة بعد الإرسال الناجح
      }
      
      // عرض تحذير إذا كانت هناك معلومات إضافية
      if (response.contacts && response.contacts[0]?.wa_id) {
        console.log('✅ تم إرسال الرسالة إلى:', response.contacts[0].wa_id)
      }
      
      if (response.messages && response.messages[0]?.id) {
        console.log('✅ Message ID:', response.messages[0].id)
      }
    } catch (err: any) {
      console.error('❌ خطأ في إرسال الرسالة:', err)
      console.error('❌ تفاصيل الخطأ:', {
        message: err.message,
        stack: err.stack,
        name: err.name,
      })
      
      // تحسين رسالة الخطأ
      let errorMessage = err.message || "حدث خطأ أثناء إرسال الرسالة"
      
      // رسائل خطأ شائعة
      if (errorMessage.includes('Recipient phone number not in allowed list')) {
        errorMessage = "الرقم غير موجود في قائمة الأرقام المسموحة. يرجى إضافة الرقم في Facebook Developer Console → WhatsApp → API Setup → Add phone number"
      } else if (errorMessage.includes('Invalid phone number')) {
        errorMessage = `رقم الهاتف غير صحيح. الرقم المدخل: "${phoneNumber}" → بعد التنظيف: "${cleanPhoneNumber}". تأكد من تنسيق الرقم (مثال: 967778076543)`
      } else if (errorMessage.includes('Rate limit')) {
        errorMessage = "تم تجاوز الحد المسموح من الرسائل. يرجى الانتظار قليلاً"
      } else if (errorMessage.includes('expired') || errorMessage.includes('Invalid OAuth')) {
        errorMessage = "Access Token منتهي الصلاحية أو غير صحيح. يرجى تحديثه من Facebook Developer Console"
      } else if (errorMessage.includes('template') || errorMessage.includes('Template')) {
        errorMessage = "خطأ في القالب. تأكد من أن اسم القالب صحيح وأنه معتمد (Approved) في Message Templates"
      } else if (errorMessage.includes('CORS') || errorMessage.includes('Network')) {
        errorMessage = "خطأ في الاتصال بالشبكة. تحقق من اتصالك بالإنترنت"
      } else if (errorMessage.includes('24 hour') || errorMessage.includes('24-hour') || errorMessage.includes('message window')) {
        errorMessage = "⚠️ نافذة الـ 24 ساعة: لا يمكن إرسال رسائل نصية عادية بعد مرور 24 ساعة من آخر رسالة واردة. استخدم 'رسالة قالب (Template)' بدلاً منها."
      } else if (errorMessage.includes('message') && errorMessage.includes('window')) {
        errorMessage = "⚠️ نافذة الرسائل: لا يمكن إرسال رسائل نصية عادية. استخدم 'رسالة قالب (Template)' بدلاً منها."
      } else if (errorMessage.includes('1008') || errorMessage.includes('message_expired')) {
        errorMessage = "⚠️ نافذة الـ 24 ساعة: لا يمكن إرسال رسائل نصية عادية بعد مرور 24 ساعة. استخدم 'رسالة قالب (Template)' بدلاً منها."
      }
      
      // إذا كانت الرسالة نصية عادية وفشلت، اقترح استخدام Template
      if (messageType === "text" && !errorMessage.includes('Template')) {
        errorMessage += "\n\n💡 نصيحة: جرب استخدام 'رسالة قالب (Template)' بدلاً من الرسالة النصية العادية."
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGetInfo = async (type: "phone" | "business" | "templates" | "token" | "app") => {
    setInfoLoading(true)
    setError(null)
    setInfoData(null)

    try {
      let data
      switch (type) {
        case "phone":
          data = await getPhoneNumberInfo()
          break
        case "business":
          data = await getBusinessAccountInfo()
          break
        case "templates":
          data = await getMessageTemplates()
          break
        case "token":
          data = await debugToken()
          break
        case "app":
          data = await getAppInfo()
          break
      }
      setInfoData(data)
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء جلب المعلومات")
    } finally {
      setInfoLoading(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">إدارة WhatsApp Business</h2>
        <p className="text-muted-foreground">
          إرسال رسائل WhatsApp والتحقق من معلومات الحساب
        </p>
      </div>

      {/* تحذير إذا كان Phone Number ID غير محدد */}
      {!whatsappConfig.phoneNumberId && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-500">
              <XCircle className="h-5 w-5" />
              إعداد غير مكتمل
            </CardTitle>
            <CardDescription className="text-yellow-700 dark:text-yellow-400">
              Phone Number ID غير محدد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              يجب إضافة <code className="bg-background px-2 py-1 rounded">VITE_WHATSAPP_PHONE_NUMBER_ID</code> في ملف <code className="bg-background px-2 py-1 rounded">.env.local</code>
            </p>
            <div className="space-y-2 text-sm">
              <p className="font-medium">خطوات الحصول على Phone Number ID:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>اذهب إلى <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline">Facebook Developers</a></li>
                <li>اختر تطبيقك (App ID: {whatsappConfig.appId || "غير محدد"})</li>
                <li>اذهب إلى <strong>WhatsApp</strong> → <strong>API Setup</strong></li>
                <li>انسخ <strong>Phone number ID</strong> من قسم "From"</li>
                <li>أضفه في ملف <code className="bg-background px-1 rounded">.env.local</code></li>
                <li>أعد تشغيل خادم التطوير</li>
              </ol>
              <p className="mt-4 text-xs text-muted-foreground">
                راجع ملف <code className="bg-background px-1 rounded">WHATSAPP_BUSINESS_SETUP.md</code> للخطوات التفصيلية
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* معلومات الإعداد */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            معلومات الإعداد
          </CardTitle>
          <CardDescription>
            تحقق من إعدادات WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">App ID</p>
              <p className="font-mono text-sm">
                {whatsappConfig.appId || "غير محدد"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Phone Number ID</p>
              <p className={`font-mono text-sm ${!whatsappConfig.phoneNumberId ? "text-destructive" : ""}`}>
                {whatsappConfig.phoneNumberId || "⚠️ غير محدد"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Business Account ID</p>
              <p className="font-mono text-sm">
                {whatsappConfig.businessAccountId || "غير محدد"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Access Token</p>
              <p className="font-mono text-sm truncate">
                {whatsappConfig.accessToken
                  ? `${whatsappConfig.accessToken.substring(0, 20)}...`
                  : "غير محدد"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGetInfo("app")}
              disabled={infoLoading}
            >
              {infoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "معلومات التطبيق"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGetInfo("phone")}
              disabled={infoLoading}
            >
              {infoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "معلومات الرقم"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGetInfo("business")}
              disabled={infoLoading}
            >
              {infoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "معلومات الحساب"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGetInfo("templates")}
              disabled={infoLoading}
            >
              {infoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "قوالب الرسائل"
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleGetInfo("token")}
              disabled={infoLoading}
            >
              {infoLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "التحقق من Token"
              )}
            </Button>
          </div>

          {infoData && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(infoData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* إرسال رسالة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            إرسال رسالة WhatsApp
          </CardTitle>
          <CardDescription>
            أرسل رسالة نصية أو قالب إلى رقم WhatsApp (يجب أن يكون الرقم بتنسيق دولي: 966xxxxxxxxx)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              نوع الرسالة
            </label>
            <Select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as "text" | "template")}
              disabled={loading}
            >
              <option value="text">رسالة نصية عادية</option>
              <option value="template">رسالة قالب (Template)</option>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              رقم الهاتف (مع رمز الدولة)
            </label>
            <Input
              type="tel"
              placeholder="966xxxxxxxxx"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              مثال: 966501234567 (بدون + أو 0)
            </p>
            <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
              <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">⚠️ مهم للاختبار:</p>
              <p className="text-blue-700 dark:text-blue-300">
                يجب إضافة الرقم في Facebook Developer Console أولاً:
              </p>
              <ol className="list-decimal list-inside mt-1 space-y-0.5 text-blue-600 dark:text-blue-400">
                <li>WhatsApp → API Setup</li>
                <li>اضغط "Add phone number"</li>
                <li>أدخل الرقم وأضفه</li>
              </ol>
            </div>
          </div>

          {messageType === "text" ? (
            <div>
              <label className="text-sm font-medium mb-2 block">الرسالة</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="اكتب رسالتك هنا..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading}
                rows={4}
              />
              <div className="mt-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                <p className="font-medium text-yellow-600 dark:text-yellow-400 mb-1">⚠️ مهم جداً:</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  الرسائل النصية العادية تعمل فقط خلال <strong>24 ساعة</strong> من آخر رسالة واردة من المستخدم.
                </p>
                <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                  إذا لم تصل الرسالة، استخدم <strong>رسالة قالب (Template)</strong> بدلاً منها.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">اسم القالب (Template Name)</label>
                <Input
                  type="text"
                  placeholder="hello_world"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  مثال: hello_world (يجب أن يكون القالب معتمداً في Message Templates)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">لغة القالب</label>
                <Select
                  value={templateLanguage}
                  onChange={(e) => setTemplateLanguage(e.target.value)}
                  disabled={loading}
                >
                  <option value="en_US">English (US)</option>
                  <option value="ar">العربية</option>
                  <option value="en_GB">English (UK)</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </Select>
              </div>
            </div>
          )}

          <Button
            onClick={handleSendMessage}
            disabled={loading || !phoneNumber || (messageType === "text" && !message) || (messageType === "template" && !templateName) || !whatsappConfig.phoneNumberId}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                جاري الإرسال...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                إرسال الرسالة
              </>
            )}
          </Button>

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <XCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-2">خطأ</p>
                <p className="text-sm text-destructive/80 whitespace-pre-line">{error}</p>
                {messageType === "text" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      setMessageType("template")
                      setError(null)
                      setTemplateName("hello_world")
                      setTemplateLanguage("en_US")
                    }}
                  >
                    التبديل إلى Template Message
                  </Button>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-500">تم إرسال الطلب بنجاح!</p>
                <div className="mt-2 space-y-2">
                  {result.messages && result.messages[0] && (
                    <div className="text-xs">
                      <p><strong>Message ID:</strong> {result.messages[0].id}</p>
                      {result.messages[0].message_status && (
                        <p><strong>Status:</strong> {result.messages[0].message_status}</p>
                      )}
                    </div>
                  )}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      عرض تفاصيل الاستجابة الكاملة
                    </summary>
                    <pre className="mt-2 p-2 bg-background rounded overflow-auto max-h-60">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </details>
                </div>
                <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                  <p className="font-medium text-yellow-600 dark:text-yellow-500 mb-1">ملاحظة مهمة:</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700 dark:text-yellow-400">
                    <li>إذا لم تصل الرسالة، تأكد من أن الرقم موجود في قائمة الأرقام المسموحة</li>
                    <li>للاختبار: اذهب إلى Facebook Developer → WhatsApp → API Setup → Add phone number</li>
                    <li>تحقق من Console في المتصفح (F12) لرؤية تفاصيل الطلب والاستجابة</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

