import { useState, useRef, useEffect } from "react"
import { Send, Loader2, MessageCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendChatMessage } from "@/lib/chat-api"
import { MessageRenderer } from "@/components/MessageRenderer"

interface Message {
  id: string
  text: string
  sender: "user" | "assistant"
  timestamp: Date
}

// تحميل المحادثات من localStorage
const loadMessagesFromStorage = (): Message[] => {
  try {
    const saved = localStorage.getItem("chat_messages")
    if (saved) {
      const parsed = JSON.parse(saved)
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }))
    }
  } catch (e) {
    console.error("Error loading messages:", e)
  }
  return [
    {
      id: "1",
      text: "مرحباً! أنا مساعدك الذكي في الكلية. كيف يمكنني مساعدتك اليوم؟",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]
}

// حفظ المحادثات في localStorage
const saveMessagesToStorage = (messages: Message[]) => {
  try {
    // حفظ آخر 50 رسالة فقط لتقليل استهلاك المساحة
    const toSave = messages.slice(-50)
    localStorage.setItem("chat_messages", JSON.stringify(toSave))
  } catch (e) {
    console.error("Error saving messages:", e)
  }
}

export const ChatPage = ({ onEnterDashboard }: { onEnterDashboard: () => void }) => {
  const [messages, setMessages] = useState<Message[]>(loadMessagesFromStorage)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // حفظ المحادثات عند التغيير
  useEffect(() => {
    saveMessagesToStorage(messages)
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await sendChatMessage(
        userMessage.text,
        messages.slice(-10).map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }))
      )

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error("Error sending message:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.message || "عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    if (confirm("هل أنت متأكد من مسح المحادثة؟")) {
      const initialMessage: Message = {
        id: "1",
        text: "مرحباً! أنا مساعدك الذكي في الكلية. كيف يمكنني مساعدتك اليوم؟",
        sender: "assistant",
        timestamp: new Date(),
      }
      setMessages([initialMessage])
      localStorage.removeItem("chat_messages")
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[#0b141a]">
      {/* Header */}
      <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25d366] flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-medium">مساعد الكلية الذكي</h2>
            <p className="text-xs text-[#8696a0]">متصل الآن</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={clearChat}
            variant="ghost"
            className="text-white hover:bg-[#2a3942] p-2"
            title="مسح المحادثة"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          <Button
            onClick={onEnterDashboard}
            variant="ghost"
            className="text-white hover:bg-[#2a3942]"
          >
            الانتقال إلى Dashboard
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-[#0b141a] bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3Cpattern id=%22grid%22 width=%2260%22 height=%2260%22 patternUnits=%22userSpaceOnUse%22%3E%3Cpath d=%22M 60 0 L 0 0 0 60%22 fill=%22none%22 stroke=%22%23112127%22 stroke-width=%221%22/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=%22100%25%22 height=%22100%25%22 fill=%22url(%23grid)%22/%3E%3C/svg%3E')]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-3 shadow-lg ${
                message.sender === "user"
                  ? "bg-[#005c4b] text-white rounded-tr-none"
                  : "bg-[#202c33] text-[#e9edef] rounded-tl-none border border-[#2a3942]"
              }`}
            >
              {message.sender === "assistant" ? (
                <MessageRenderer text={message.text} />
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.text}</p>
              )}
              <p
                className={`text-xs mt-2 flex items-center gap-1 ${
                  message.sender === "user" ? "text-[#99beb7]" : "text-[#8696a0]"
                }`}
              >
                {message.timestamp.toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#202c33] text-[#e9edef] rounded-lg rounded-tl-none px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-[#8696a0] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#202c33] px-4 py-3 border-t border-[#2a3942]">
        <div className="flex items-end gap-2">
          <div className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="اكتب رسالتك..."
              className="bg-transparent border-0 text-white placeholder:text-[#8696a0] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-[#005c4b] hover:bg-[#006d5a] text-white rounded-full w-12 h-12 p-0 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

