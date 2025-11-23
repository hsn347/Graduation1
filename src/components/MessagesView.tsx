import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/CliantSupa"
import { Loader2, MessageSquare, Phone, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface WhatsAppMessage {
  id: string
  message_id: string
  from_number: string
  timestamp: string
  type: string
  text: string | null
  image: string | null
  video: string | null
  audio: string | null
  document: string | null
  location: string | null
  contacts: string | null
  status: string | null
  created_at: string
}

export const MessagesView = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // جلب الرسائل من Supabase
  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from("whatsapp_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      if (fetchError) {
        // إذا كان الجدول غير موجود، نعرض رسالة توضيحية
        if (fetchError.code === "42P01") {
          setError("الجدول 'whatsapp_messages' غير موجود في Supabase. يرجى إنشاؤه أولاً.")
        } else {
          setError(fetchError.message || "حدث خطأ أثناء جلب الرسائل")
        }
        console.error("Error fetching messages:", fetchError)
        return
      }

      setMessages(data || [])
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  // جلب الرسائل عند تحميل المكون
  useEffect(() => {
    fetchMessages()

    // إعداد real-time subscription
    const channel = supabase
      .channel("whatsapp_messages_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "whatsapp_messages",
        },
        (payload) => {
          console.log("📩 New message received:", payload)
          // إضافة الرسالة الجديدة في بداية القائمة
          setMessages((prev) => [payload.new as WhatsAppMessage, ...prev])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "whatsapp_messages",
        },
        (payload) => {
          console.log("📊 Message updated:", payload)
          // تحديث الرسالة في القائمة
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? (payload.new as WhatsAppMessage) : msg
            )
          )
        }
      )
      .subscribe()

    // تنظيف الاشتراك عند إلغاء تحميل المكون
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // تنسيق التاريخ والوقت
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "الآن"
    if (minutes < 60) return `منذ ${minutes} دقيقة`
    if (hours < 24) return `منذ ${hours} ساعة`
    if (days < 7) return `منذ ${days} يوم`
    
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // عرض محتوى الرسالة حسب النوع
  const renderMessageContent = (message: WhatsAppMessage) => {
    switch (message.type) {
      case "text":
        return (
          <div className="text-sm text-foreground whitespace-pre-wrap">
            {message.text || "رسالة نصية"}
          </div>
        )
      case "image":
        try {
          const imageData = message.image ? JSON.parse(message.image) : null
          return (
            <div className="space-y-2">
              {imageData?.caption && (
                <div className="text-sm text-foreground">{imageData.caption}</div>
              )}
              {imageData?.id && (
                <div className="text-xs text-muted-foreground">
                  صورة (ID: {imageData.id})
                </div>
              )}
            </div>
          )
        } catch {
          return <div className="text-sm text-muted-foreground">صورة</div>
        }
      case "video":
        return <div className="text-sm text-muted-foreground">فيديو</div>
      case "audio":
        return <div className="text-sm text-muted-foreground">رسالة صوتية</div>
      case "document":
        try {
          const docData = message.document ? JSON.parse(message.document) : null
          return (
            <div className="text-sm text-muted-foreground">
              مستند: {docData?.filename || "مستند"}
            </div>
          )
        } catch {
          return <div className="text-sm text-muted-foreground">مستند</div>
        }
      case "location":
        return <div className="text-sm text-muted-foreground">موقع</div>
      case "contacts":
        return <div className="text-sm text-muted-foreground">جهات اتصال</div>
      default:
        return (
          <div className="text-sm text-muted-foreground">
            نوع الرسالة: {message.type}
          </div>
        )
    }
  }

  if (loading && messages.length === 0) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">الرسائل الواردة</h2>
          <p className="text-muted-foreground">
            عرض الرسائل الواردة من WhatsApp
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">الرسائل الواردة</h2>
          <p className="text-muted-foreground">
            عرض الرسائل الواردة من WhatsApp
          </p>
        </div>
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              خطأ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4">{error}</p>
            {error.includes("غير موجود") && (
              <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
                <p className="font-medium">لإنشاء الجدول في Supabase:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>اذهب إلى Supabase Dashboard</li>
                  <li>افتح SQL Editor</li>
                  <li>نفذ هذا الأمر:</li>
                </ol>
                <pre className="mt-2 p-2 bg-background rounded text-xs overflow-auto">
{`CREATE TABLE whatsapp_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id TEXT UNIQUE,
  from_number TEXT NOT NULL,
  timestamp TEXT,
  type TEXT NOT NULL,
  text TEXT,
  image TEXT,
  video TEXT,
  audio TEXT,
  document TEXT,
  location TEXT,
  contacts TEXT,
  status TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_messages_from ON whatsapp_messages(from_number);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at DESC);

-- تفعيل Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;`}
                </pre>
              </div>
            )}
            <button
              onClick={fetchMessages}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
            >
              إعادة المحاولة
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">الرسائل الواردة</h2>
          <p className="text-muted-foreground">
            عرض الرسائل الواردة من WhatsApp ({messages.length} رسالة)
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "تحديث"
          )}
        </button>
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">لا توجد رسائل واردة</p>
            <p className="text-sm text-muted-foreground mt-2">
              سيتم عرض الرسائل الواردة هنا تلقائياً
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card key={message.id} className="hover:bg-muted/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">
                        {message.from_number}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(message.created_at)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {message.status && (
                      <span className="text-xs px-2 py-1 bg-muted rounded-full">
                        {message.status}
                      </span>
                    )}
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {message.type}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {renderMessageContent(message)}
                {message.message_id && (
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Message ID: {message.message_id}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

