import { BookOpen, Calendar, Clock, MapPin, User, GraduationCap, Sparkles } from "lucide-react"

interface MessageRendererProps {
  text: string
}

// دالة لتحويل النص إلى مكونات React مع دعم Markdown البسيط والأيقونات
export const MessageRenderer = ({ text }: MessageRendererProps) => {
  // معالجة النص مع دعم Markdown والأيقونات
  const renderContent = () => {
    const lines = text.split("\n")
    const result: JSX.Element[] = []
    let listItems: string[] = []
    let listKey = 0

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim()

      // معالجة القوائم
      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("• ")) {
        const listItem = trimmedLine.replace(/^[-•]\s*/, "")
        listItems.push(listItem)
      } else {
        // إذا كانت هناك قائمة مفتوحة، أغلقها
        if (listItems.length > 0) {
          result.push(
            <ul key={`list-${listKey++}`} className="list-disc list-inside space-y-1 my-2 mr-4">
              {listItems.map((item, idx) => (
                <li key={idx} className="mr-4">
                  {renderLine(item)}
                </li>
              ))}
            </ul>
          )
          listItems = []
        }

        // معالجة السطور العادية
        if (trimmedLine) {
          result.push(
            <div key={`line-${lineIndex}`} className="my-1 leading-relaxed">
              {renderLine(trimmedLine)}
            </div>
          )
        } else if (lineIndex < lines.length - 1) {
          result.push(<br key={`br-${lineIndex}`} />)
        }
      }
    })

    // إغلاق القائمة المتبقية
    if (listItems.length > 0) {
      result.push(
        <ul key={`list-${listKey}`} className="list-disc list-inside space-y-1 my-2 mr-4">
          {listItems.map((item, idx) => (
            <li key={idx} className="mr-4">
              {renderLine(item)}
            </li>
          ))}
        </ul>
      )
    }

    return result.length > 0 ? result : [<div key="default">{renderLine(text)}</div>]
  }

  // معالجة سطر واحد مع Markdown والأيقونات
  const renderLine = (line: string) => {
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0

    // معالجة **text** للعناوين المهمة
    const boldRegex = /\*\*(.+?)\*\*/g
    let match

    while ((match = boldRegex.exec(line)) !== null) {
      // إضافة النص قبل **
      if (match.index > lastIndex) {
        const beforeText = line.substring(lastIndex, match.index)
        parts.push(...processEmojis(beforeText))
      }
      // إضافة النص المهم بخط عريض
      parts.push(
        <strong key={`bold-${match.index}`} className="font-semibold text-white">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }

    // إضافة النص المتبقي
    if (lastIndex < line.length) {
      const remainingText = line.substring(lastIndex)
      parts.push(...processEmojis(remainingText))
    }

    // إذا لم يكن هناك **، معالجة النص كله
    if (parts.length === 0) {
      parts.push(...processEmojis(line))
    }

    return <>{parts}</>
  }

  // معالجة Emojis وتحويلها إلى أيقونات React
  const processEmojis = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = []
    let lastIndex = 0

    // أيقونات مدعومة
    const iconMap: { [key: string]: JSX.Element } = {
      "📚": <BookOpen className="inline w-4 h-4 mx-1 align-middle" />,
      "📅": <Calendar className="inline w-4 h-4 mx-1 align-middle" />,
      "🎓": <GraduationCap className="inline w-4 h-4 mx-1 align-middle" />,
      "💡": <Sparkles className="inline w-4 h-4 mx-1 align-middle text-yellow-400" />,
      "✨": <Sparkles className="inline w-4 h-4 mx-1 align-middle text-yellow-300" />,
      "📍": <MapPin className="inline w-4 h-4 mx-1 align-middle" />,
      "⏰": <Clock className="inline w-4 h-4 mx-1 align-middle" />,
      "👨‍🏫": <User className="inline w-4 h-4 mx-1 align-middle" />,
      "🏫": <GraduationCap className="inline w-4 h-4 mx-1 align-middle" />,
      "📝": <BookOpen className="inline w-4 h-4 mx-1 align-middle" />,
    }

    // regex لجميع emojis شائعة
    const emojiRegex = /([📚📅🎓💡✨📍⏰👨‍🏫🏫📝👋😔😊🙂🎉✅❌⚠️ℹ️🔍💬🌟⭐🎯🚀💪🎊🎈🎁🎀🎪🎨🎬🎭🎮🎲🎰🎸🎺🎻🎤🎧🎵🎶🎼🎹])/g

    let match
    while ((match = emojiRegex.exec(text)) !== null) {
      // إضافة النص قبل الـ emoji
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index))
      }

      // إضافة الـ emoji كأيقونة React إذا كان موجوداً في iconMap
      const emoji = match[0]
      if (iconMap[emoji]) {
        parts.push(iconMap[emoji])
      } else {
        // إذا لم يكن هناك أيقونة React، اترك الـ emoji كما هو
        parts.push(emoji)
      }

      lastIndex = match.index + match[0].length
    }

    // إضافة النص المتبقي
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex))
    }

    // إذا لم يكن هناك emojis، أضف النص كله
    if (parts.length === 0) {
      parts.push(text)
    }

    return parts
  }

  return <div className="space-y-1">{renderContent()}</div>
}

