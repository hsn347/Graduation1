import { supabase } from "@/CliantSupa"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface CacheEntry {
  response: string
  timestamp: number
}

// Cache للأسئلة المتكررة (في localStorage)
const CACHE_DURATION = 1000 * 60 * 60 // ساعة واحدة
const cache = new Map<string, CacheEntry>()

// تحميل الـ cache من localStorage
const loadCache = () => {
  try {
    const cached = localStorage.getItem("chat_cache")
    if (cached) {
      const parsed = JSON.parse(cached)
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        if (Date.now() - value.timestamp < CACHE_DURATION) {
          cache.set(key, value)
        }
      })
    }
  } catch (e) {
    console.error("Error loading cache:", e)
  }
}

// حفظ الـ cache في localStorage
const saveCache = () => {
  try {
    const cacheObj = Object.fromEntries(cache)
    localStorage.setItem("chat_cache", JSON.stringify(cacheObj))
  } catch (e) {
    console.error("Error saving cache:", e)
  }
}

// تحميل الـ cache عند التحميل
if (typeof window !== "undefined") {
  loadCache()
}

// جلب معلومات المحاضرات من Supabase (مع caching)
let lecturesCache: any[] | null = null
let lecturesCacheTime = 0
const LECTURES_CACHE_DURATION = 1000 * 60 * 10 // 10 دقائق

const getLecturesData = async (): Promise<any[]> => {
  const now = Date.now()
  if (lecturesCache && now - lecturesCacheTime < LECTURES_CACHE_DURATION) {
    return lecturesCache
  }

  try {
    const { data, error } = await supabase
      .from("lectures")
      .select("*")
      .limit(100) // تقليل البيانات المسترجعة

    if (error) throw error

    lecturesCache = data || []
    lecturesCacheTime = now
    return lecturesCache
  } catch (error) {
    console.error("Error fetching lectures:", error)
    return lecturesCache || []
  }
}

// البحث في بيانات المحاضرات بناءً على السؤال
const searchLectures = (query: string, lectures: any[]): any[] => {
  const lowerQuery = query.toLowerCase().trim()
  
  // إذا كان السؤال قصير جداً، لا نبحث
  if (lowerQuery.length < 2) {
    return []
  }

  // استخراج معلومات محددة من السؤال
  const getTodayInArabic = () => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    return days[new Date().getDay()]
  }
  const today = getTodayInArabic()
  
  // إذا كان السؤال يحتوي على "اليوم" أو "هذا اليوم"، استخدم اليوم الحالي
  const lowerQueryForToday = query.toLowerCase()
  if (lowerQueryForToday.includes("اليوم") || lowerQueryForToday.includes("هذا اليوم") || lowerQueryForToday.includes("الآن")) {
    // سيتم استخدام today في البحث
  }
  
  // البحث عن اليوم
  const dayKeywords: { [key: string]: string[] } = {
    "الأحد": ["الأحد", "احد", "sunday", "الأحد"],
    "الاثنين": ["الاثنين", "اثنين", "monday", "الاثنين"],
    "الثلاثاء": ["الثلاثاء", "ثلاثاء", "tuesday", "الثلاثاء"],
    "الأربعاء": ["الأربعاء", "اربعاء", "wednesday", "الأربعاء"],
    "الخميس": ["الخميس", "خميس", "thursday", "الخميس"],
    "الجمعة": ["الجمعة", "جمعة", "friday", "الجمعة"],
    "السبت": ["السبت", "سبت", "saturday", "السبت"],
  }

  // البحث عن المستوى
  const levelKeywords: { [key: string]: string[] } = {
    "المستوى الأول": ["مستوى اول", "مستوى 1", "اول", "1"],
    "المستوى الثاني": ["مستوى ثاني", "مستوى 2", "ثاني", "2"],
    "المستوى الثالث": ["مستوى ثالث", "مستوى 3", "ثالث", "3"],
    "المستوى الرابع": ["مستوى رابع", "مستوى 4", "رابع", "4"],
  }

  // البحث عن القسم
  const departmentKeywords: { [key: string]: string[] } = {
    "علوم حاسوب": ["علوم حاسوب", "حاسوب", "computer"],
    "تقنية معلومات": ["تقنية معلومات", "معلومات", "it"],
  }

  // تحديد اليوم المطلوب
  let targetDay: string | null = null
  for (const [day, keywords] of Object.entries(dayKeywords)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      targetDay = day
      break
    }
  }
  
  // إذا كان السؤال يحتوي على "اليوم" أو "هذا اليوم"، استخدم اليوم الحالي
  if (lowerQuery.includes("اليوم") || lowerQuery.includes("هذا اليوم") || lowerQuery.includes("الآن")) {
    targetDay = today
  }

  // تحديد المستوى المطلوب
  let targetLevel: string | null = null
  for (const [level, keywords] of Object.entries(levelKeywords)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      targetLevel = level
      break
    }
  }

  // تحديد القسم المطلوب
  let targetDepartment: string | null = null
  for (const [dept, keywords] of Object.entries(departmentKeywords)) {
    if (keywords.some((kw) => lowerQuery.includes(kw))) {
      targetDepartment = dept
      break
    }
  }

  // البحث المحدد
  let filteredLectures = lectures

  if (targetDay) {
    filteredLectures = filteredLectures.filter((lecture) => {
      const lectureDay = (lecture.day || "").toLowerCase().trim()
      const targetDayLower = targetDay!.toLowerCase().trim()
      // البحث بعدة طرق
      return (
        lectureDay === targetDayLower ||
        lectureDay.includes(targetDayLower.replace("ال", "")) ||
        lectureDay.includes(targetDayLower) ||
        targetDayLower.includes(lectureDay)
      )
    })
  }

  if (targetLevel) {
    filteredLectures = filteredLectures.filter((lecture) => {
      const lectureLevel = (lecture.level || "").toLowerCase().trim()
      const targetLevelLower = targetLevel!.toLowerCase().trim()
      // البحث بعدة طرق
      return (
        lectureLevel.includes(targetLevelLower) ||
        lectureLevel.includes(targetLevelLower.replace("المستوى ", "").replace("المستوى", "")) ||
        targetLevelLower.includes(lectureLevel)
      )
    })
  }

  if (targetDepartment) {
    filteredLectures = filteredLectures.filter((lecture) => {
      const lectureDept = (lecture.department || "").toLowerCase().trim()
      const targetDeptLower = targetDepartment!.toLowerCase().trim()
      // البحث بعدة طرق
      return (
        lectureDept.includes(targetDeptLower) ||
        targetDeptLower.includes(lectureDept) ||
        lectureDept.includes("حاسوب") && targetDeptLower.includes("حاسوب")
      )
    })
  }

  // إذا وجدنا نتائج محددة، أرجعها
  if (filteredLectures.length > 0) {
    return filteredLectures.slice(0, 10)
  }

  // إذا لم نجد نتائج محددة، استخدم البحث العام
  const stopWords = ["في", "من", "إلى", "على", "عن", "مع", "هو", "هي", "أن", "إن", "ما", "متى", "أين", "كيف", "لماذا", "ال", "في", "من", "إلى", "على", "عن", "مع", "هو", "هي", "أن", "إن", "ما", "متى", "أين", "كيف", "لماذا"]
  const keywords = lowerQuery
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.includes(w))

  const searchTerms = keywords.length > 0 ? keywords : [lowerQuery]

  const scoredLectures = lectures.map((lecture) => {
    const searchText = [
      lecture.department,
      lecture.lecture_title,
      lecture.instructor,
      lecture.room,
      lecture.day,
      lecture.level,
      lecture.lecture_time,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    let score = 0
    searchTerms.forEach((term) => {
      if (searchText.includes(term)) {
        if (searchText.includes(` ${term} `) || searchText.startsWith(term) || searchText.endsWith(term)) {
          score += 3
        } else {
          score += 1
        }
      }
    })

    return { lecture, score }
  })

  return scoredLectures
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.lecture)
}

export const sendChatMessage = async (
  message: string,
  _conversationHistory: ChatMessage[]
): Promise<string> => {
  // التحقق من الـ cache أولاً
  const cacheKey = message.toLowerCase().trim()
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.response
  }

  // الحصول على اليوم الحالي (يُستخدم في fallback و context)
  const getTodayInArabic = () => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"]
    return days[new Date().getDay()]
  }
  const today = getTodayInArabic()

  try {
    // جلب بيانات المحاضرات (مع caching)
    const lectures = await getLecturesData()

    // البحث في المحاضرات بناءً على السؤال
    const relevantLectures = searchLectures(message, lectures)

    // الحصول على التاريخ الكامل
    const currentDate = new Date().toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    })

    // بناء context من المحاضرات ذات الصلة (مختصر)
    let context = `\n\nمعلومة مهمة: اليوم هو ${today} (${currentDate})\n`
    
    if (relevantLectures.length > 0) {
      context += "\nالمحاضرات المتاحة:\n"
      // تقليل عدد المحاضرات وتقليل التفاصيل لتقليل طول الـ prompt
      relevantLectures.slice(0, 8).forEach((lecture, idx) => {
        context += `${idx + 1}. ${lecture.lecture_title || "بدون عنوان"} | ${lecture.day || ""} ${lecture.lecture_time || ""} | ${lecture.instructor || ""} | ${lecture.room || ""}\n`
      })
    } else if (lectures.length > 0) {
      context += `\nيوجد ${lectures.length} محاضرة في قاعدة البيانات.`
    } else {
      context += "\nقاعدة البيانات فارغة."
    }

    // استخدام Gemini API (مثل PDFUploader)
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
    const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

    if (!GEMINI_API_KEY) {
      throw new Error("مفتاح API غير موجود")
    }

    const systemPrompt = `أنت مساعد ذكي في الكلية. ساعد الطلاب في الإجابة على استفساراتهم حول المحاضرات.

${context}

تعليمات مهمة:
- اليوم الحالي هو ${today} - استخدم هذه المعلومة عند الإجابة على أسئلة عن "اليوم" أو "هذا اليوم"
- كن ودوداً ومهذباً
- استخدم emojis (📚 📅 🎓 💡 ✨ 📍 ⏰ 👨‍🏫)
- استخدم ** للعناوين و - للقوائم
- قدم المعلومات بشكل منظم
- إذا سأل الطالب عن محاضرات "اليوم" أو "هذا اليوم"، ابحث عن المحاضرات في يوم ${today}
- كن مختصراً وواضحاً

السؤال: ${message}

أجب بالعربية:`

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // زيادة عدد التوكنات
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      let errorMessage = `خطأ في API: ${response.status}`
      
      try {
        const errorJson = JSON.parse(errorData)
        if (errorJson.error) {
          if (errorJson.error.code === 403 && errorJson.error.message?.includes("leaked")) {
            errorMessage = "مفتاح API مسرب أو غير صالح. يرجى إنشاء مفتاح جديد من Google AI Studio وإضافته في ملف .env"
          } else if (errorJson.error.message?.includes("overloaded") || errorJson.error.message?.includes("overload")) {
            // إذا كان النموذج محمّل، استخدم fallback
            if (relevantLectures.length > 0) {
              let fallbackResponse = "مرحباً! 👋\n\n"
              fallbackResponse += `**المحاضرات المتاحة لليوم (${today}):**\n\n`
              relevantLectures.slice(0, 5).forEach((lecture, idx) => {
                fallbackResponse += `${idx + 1}. **${lecture.lecture_title || "بدون عنوان"}** 📚\n`
                fallbackResponse += `   - 📅 اليوم: ${lecture.day || "غير محدد"}\n`
                fallbackResponse += `   - ⏰ الوقت: ${lecture.lecture_time || "غير محدد"}\n`
                fallbackResponse += `   - 👨‍🏫 الدكتور: ${lecture.instructor || "غير محدد"}\n`
                fallbackResponse += `   - 📍 القاعة: ${lecture.room || "غير محدد"}\n`
                if (lecture.department) {
                  fallbackResponse += `   - 🏫 القسم: ${lecture.department}\n`
                }
                if (lecture.level) {
                  fallbackResponse += `   - 🎓 المستوى: ${lecture.level}\n`
                }
                fallbackResponse += `\n`
              })
              return fallbackResponse
            }
            errorMessage = "النموذج محمّل حالياً. يرجى المحاولة مرة أخرى بعد قليل."
          } else if (errorJson.error.message) {
            errorMessage = errorJson.error.message
          }
        }
      } catch (e) {
        // إذا فشل parsing، استخدم الرسالة الأصلية
      }
      
      throw new Error(errorMessage)
    }

    const data = await response.json()
    
    // معالجة أفضل للاستجابة
    console.log("Gemini API Response:", JSON.stringify(data, null, 2))
    
    // التحقق من وجود candidates
    if (!data.candidates || data.candidates.length === 0) {
      console.error("No candidates in response:", data)
      
      // التحقق من وجود safety ratings
      if (data.promptFeedback?.blockReason) {
        throw new Error(`تم حظر الطلب: ${data.promptFeedback.blockReason}`)
      }
      
      // التحقق من وجود errors
      if (data.error) {
        throw new Error(`خطأ من API: ${data.error.message || JSON.stringify(data.error)}`)
      }
      
      throw new Error("لم يتم الحصول على رد من الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.")
    }

    // التحقق من وجود content
    const candidate = data.candidates[0]
    
    if (!candidate.content) {
      console.error("No content in candidate:", candidate)
      throw new Error("الرد فارغ. يرجى المحاولة مرة أخرى.")
    }
    
    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      console.error("No content parts in candidate:", candidate)
      throw new Error("الرد فارغ. يرجى المحاولة مرة أخرى.")
    }

    // الحصول على النص - محاولة من عدة مصادر
    let text = candidate.content.parts[0].text
    
    // إذا لم يكن هناك text، جرب البحث في parts الأخرى
    if (!text && candidate.content.parts.length > 1) {
      for (let i = 1; i < candidate.content.parts.length; i++) {
        if (candidate.content.parts[i].text) {
          text = candidate.content.parts[i].text
          break
        }
      }
    }

    // التحقق من finishReason بعد استخراج النص
    if (candidate.finishReason && candidate.finishReason !== "STOP") {
      console.warn("Finish reason:", candidate.finishReason)
      if (candidate.finishReason === "SAFETY") {
        throw new Error("تم حظر الرد لأسباب أمنية. يرجى إعادة صياغة السؤال.")
      } else if (candidate.finishReason === "MAX_TOKENS") {
        // إذا كان الرد مقطوعاً لكن يوجد نص، استخدمه
        if (text && text.trim().length > 0) {
          console.warn("Response was truncated but has content, using it")
          // لا نرمي خطأ، نستخدم النص الموجود
        } else {
          // Fallback: إذا كان هناك محاضرات، أعرضها مباشرة
          if (relevantLectures.length > 0) {
            let fallbackResponse = "مرحباً! 👋\n\n"
            fallbackResponse += "**المحاضرات المتاحة:**\n\n"
            relevantLectures.slice(0, 5).forEach((lecture, idx) => {
              fallbackResponse += `${idx + 1}. **${lecture.lecture_title || "بدون عنوان"}** 📚\n`
              fallbackResponse += `   - 📅 اليوم: ${lecture.day || "غير محدد"}\n`
              fallbackResponse += `   - ⏰ الوقت: ${lecture.lecture_time || "غير محدد"}\n`
              fallbackResponse += `   - 👨‍🏫 الدكتور: ${lecture.instructor || "غير محدد"}\n`
              fallbackResponse += `   - 📍 القاعة: ${lecture.room || "غير محدد"}\n\n`
            })
            return fallbackResponse
          }
          throw new Error("الرد طويل جداً. يرجى المحاولة مرة أخرى.")
        }
      }
    }

    if (!text || text.trim().length === 0) {
      console.error("Empty text in response. Full candidate:", JSON.stringify(candidate, null, 2))
      
      // Fallback: إذا كان هناك محاضرات، أعرضها مباشرة
      if (relevantLectures.length > 0) {
        let fallbackResponse = "مرحباً! 👋\n\n"
        fallbackResponse += "**المحاضرات المتاحة:**\n\n"
        relevantLectures.slice(0, 5).forEach((lecture, idx) => {
          fallbackResponse += `${idx + 1}. **${lecture.lecture_title || "بدون عنوان"}** 📚\n`
          fallbackResponse += `   - 📅 اليوم: ${lecture.day || "غير محدد"}\n`
          fallbackResponse += `   - ⏰ الوقت: ${lecture.lecture_time || "غير محدد"}\n`
          fallbackResponse += `   - 👨‍🏫 الدكتور: ${lecture.instructor || "غير محدد"}\n`
          fallbackResponse += `   - 📍 القاعة: ${lecture.room || "غير محدد"}\n\n`
        })
        return fallbackResponse
      }
      
      throw new Error("الرد فارغ. يرجى المحاولة مرة أخرى.")
    }

    // حفظ في الـ cache
    cache.set(cacheKey, {
      response: text,
      timestamp: Date.now(),
    })
    saveCache()

    return text
  } catch (error: any) {
    console.error("Error in chat API:", error)
    
    // إذا كان الخطأ من API، أرسل رسالة واضحة
    if (error.message && error.message.includes("خطأ في API")) {
      throw error
    }
    
    // إذا كان الخطأ من network، أرسل رسالة مختلفة
    if (error.message && (error.message.includes("fetch") || error.message.includes("network"))) {
      throw new Error("حدث خطأ في الاتصال بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.")
    }
    
    // رسالة عامة
    throw new Error(`خطأ في الاتصال: ${error.message || "حدث خطأ غير متوقع"}`)
  }
}


