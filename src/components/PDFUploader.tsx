import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Upload, Loader2, X, CheckCircle2 } from "lucide-react"
import { supabase } from "@/CliantSupa"

interface PDFUploaderProps {
  tableName: string
  onSuccess: () => void
  onCancel: () => void
}

interface ExtractedData {
  department: string
  lecture_time: string
  day: string
  level: string
  lecture_title: string
  instructor: string
  room: string
  study_type: string
}

export const PDFUploader = ({
  tableName,
  onSuccess,
  onCancel,
}: PDFUploaderProps) => {
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [extractedCount, setExtractedCount] = useState(0)

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
  
  if (!GEMINI_API_KEY) {
    throw new Error("مفتاح Gemini API غير موجود. يرجى إضافته في ملف .env")
  }

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const getMimeType = (file: File): string => {
    if (file.type === "application/pdf") return "application/pdf"
    if (file.type.startsWith("image/")) return file.type
    // ملفات Word - Gemini يدعمها كـ PDF أو يمكن تحويلها
    if (
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      file.name.endsWith(".doc") ||
      file.name.endsWith(".docx")
    ) {
      // Gemini يمكنه معالجة ملفات Word كـ PDF
      return "application/pdf"
    }
    return "image/jpeg" // افتراضي
  }

  const extractDataFromFile = async (
    base64File: string,
    mimeType: string,
    fileName: string
  ): Promise<ExtractedData[]> => {
    const fileType = fileName.endsWith(".doc") || fileName.endsWith(".docx") 
      ? "ملف Word" 
      : mimeType === "application/pdf" 
      ? "PDF" 
      : "صورة"
    
    const prompt = `أنت مساعد ذكي. قم بتحليل هذا الملف (${fileType}) الذي يحتوي على جدول محاضرات.

استخرج جميع البيانات من الجدول وأرجعها كقائمة JSON. كل عنصر يجب أن يحتوي على:
- department: القسم (مثل: "علوم الحاسوب" أو "تقنية المعلومات")
- lecture_time: وقت المحاضرة (مثل: "08:00 - 09:40")
- day: اليوم بالعربي (مثل: "الأحد", "الاثنين", إلخ)
- level: المستوى (مثل: "المستوى الأول")
- lecture_title: المادة (مثل: "مقدمة في الحاسوب")
- instructor: اسم الدكتور (مثل: "د. مازن الكثيري")
- room: القاعة (مثل: "قاعة 10" أو "معمل 2")
- study_type: نوع الدراسة (يجب أن يكون أحد القيم التالية فقط: "Gen" أو "Per" أو "Net" أو "Dev". إذا لم تجد هذه المعلومات في الجدول، استخدم "Gen" كقيمة افتراضية)

أرجع النتيجة كقائمة JSON فقط، بدون أي نص إضافي. مثال:
[
  {
    "department": "علوم الحاسوب",
    "lecture_time": "08:00 - 09:40",
    "day": "الأحد",
    "level": "المستوى الأول",
    "lecture_title": "مقدمة في الحاسوب",
    "instructor": "د. مازن الكثيري",
    "room": "قاعة 10",
    "study_type": "Gen"
  }
]`

    try {
      const response = await fetch(
        `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: base64File,
                    },
                  },
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`خطأ في API: ${response.status} - ${errorData}`)
      }

      const data = await response.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!text) {
        throw new Error("لم يتم استخراج أي بيانات من الملف")
      }

      // استخراج JSON من النص
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("لم يتم العثور على بيانات JSON في الاستجابة")
      }

      const extractedData: ExtractedData[] = JSON.parse(jsonMatch[0])
      return extractedData
    } catch (error: any) {
      console.error("Error extracting data:", error)
      throw new Error(`خطأ في استخراج البيانات: ${error.message}`)
    }
  }

  const saveToSupabase = async (data: ExtractedData[]) => {
    try {
      const { error } = await supabase.from(tableName).insert(data)

      if (error) throw error

      return data.length
    } catch (error: any) {
      console.error("Error saving to Supabase:", error)
      throw new Error(`خطأ في حفظ البيانات: ${error.message}`)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) return

    // التحقق من نوع الملفات
    const validFiles = selectedFiles.filter((file) => {
      const isValid =
        file.type === "application/pdf" ||
        file.type.startsWith("image/") ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword" ||
        file.name.endsWith(".doc") ||
        file.name.endsWith(".docx")
      if (!isValid) {
        setError(`الملف ${file.name} غير مدعوم. الرجاء اختيار ملف PDF أو Word أو صورة`)
      }
      return isValid
    })

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles])
      setError(null)
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("الرجاء اختيار ملف واحد على الأقل")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      let allExtractedData: ExtractedData[] = []

      // معالجة كل ملف على حدة
      for (const file of files) {
        // تحويل الملف إلى Base64
        const base64File = await convertFileToBase64(file)
        const mimeType = getMimeType(file)

        // استخراج البيانات باستخدام Gemini
        const extractedData = await extractDataFromFile(base64File, mimeType, file.name)

        if (extractedData.length > 0) {
          allExtractedData = [...allExtractedData, ...extractedData]
        }
      }

      if (allExtractedData.length === 0) {
        throw new Error("لم يتم استخراج أي بيانات من الملفات")
      }

      // حفظ جميع البيانات في Supabase
      const count = await saveToSupabase(allExtractedData)

      setExtractedCount(count)
      setSuccess(true)
      setFiles([])

      // استدعاء onSuccess بعد ثانيتين
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء معالجة الملفات")
      console.error("Upload error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Input
          type="file"
          accept="application/pdf,image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          multiple
          onChange={handleFileChange}
          disabled={loading}
          className="cursor-pointer"
        />
        <p className="text-xs text-muted-foreground mt-2">
          يمكنك رفع ملفات PDF أو Word أو صور متعددة
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            الملفات المختارة ({files.length}):
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-accent rounded-md"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm text-foreground truncate">
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  disabled={loading}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          تم استخراج وحفظ {extractedCount} سجل بنجاح!
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          إلغاء
        </Button>
        <Button onClick={handleUpload} disabled={files.length === 0 || loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري المعالجة...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              رفع ومعالجة
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

