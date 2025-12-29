import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Select } from "./ui/select"
import { Loader2, Save, X, Plus } from "lucide-react"
import { supabase } from "@/CliantSupa"

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

interface ManualEntryProps {
  tableName: string
  onSuccess: () => void
  onCancel: () => void
}

export const ManualEntry = ({
  tableName,
  onSuccess,
  onCancel,
}: ManualEntryProps) => {
  const [records, setRecords] = useState<ExtractedData[]>([
    {
      department: "",
      lecture_time: "",
      day: "",
      level: "",
      lecture_title: "",
      instructor: "",
      room: "",
      study_type: "",
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const addNewRecord = () => {
    setRecords([
      ...records,
      {
        department: "",
        lecture_time: "",
        day: "",
        level: "",
        lecture_title: "",
        instructor: "",
        room: "",
        study_type: "",
      },
    ])
  }

  const removeRecord = (index: number) => {
    if (records.length > 1) {
      setRecords(records.filter((_, i) => i !== index))
    }
  }

  const updateRecord = (index: number, field: keyof ExtractedData, value: string) => {
    const updated = [...records]
    updated[index] = { ...updated[index], [field]: value }
    setRecords(updated)
  }

  const handleSave = async () => {
    // التحقق من صحة البيانات
    const validRecords = records.filter(
      (record) =>
        record.department.trim() &&
        record.lecture_time.trim() &&
        record.day.trim() &&
        record.level.trim() &&
        record.lecture_title.trim() &&
        record.instructor.trim() &&
        record.room.trim() &&
        record.study_type.trim()
    )

    if (validRecords.length === 0) {
      setError("الرجاء إدخال بيانات صحيحة لسجل واحد على الأقل")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(validRecords)

      if (insertError) throw insertError

      setSuccess(true)
      setRecords([
        {
          department: "",
          lecture_time: "",
          day: "",
          level: "",
          lecture_title: "",
          instructor: "",
          room: "",
          study_type: "",
        },
      ])

      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "حدث خطأ في حفظ البيانات")
      console.error("Error saving data:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">إدخال يدوي</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addNewRecord}
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          إضافة سجل
        </Button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {records.map((record, index) => (
          <div
            key={index}
            className="p-4 border border-border rounded-lg bg-card space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                السجل #{index + 1}
              </span>
              {records.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRecord(index)}
                  disabled={loading}
                  className="h-6 w-6"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  القسم *
                </label>
                <Input
                  value={record.department}
                  onChange={(e) =>
                    updateRecord(index, "department", e.target.value)
                  }
                  placeholder="مثل: علوم الحاسوب"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  وقت المحاضرة *
                </label>
                <Input
                  value={record.lecture_time}
                  onChange={(e) =>
                    updateRecord(index, "lecture_time", e.target.value)
                  }
                  placeholder="مثل: 08:00 - 09:40"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  اليوم *
                </label>
                <Input
                  value={record.day}
                  onChange={(e) => updateRecord(index, "day", e.target.value)}
                  placeholder="مثل: الأحد"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  المستوى *
                </label>
                <Input
                  value={record.level}
                  onChange={(e) =>
                    updateRecord(index, "level", e.target.value)
                  }
                  placeholder="مثل: المستوى الأول"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  المادة *
                </label>
                <Input
                  value={record.lecture_title}
                  onChange={(e) =>
                    updateRecord(index, "lecture_title", e.target.value)
                  }
                  placeholder="مثل: مقدمة في الحاسوب"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  الدكتور *
                </label>
                <Input
                  value={record.instructor}
                  onChange={(e) =>
                    updateRecord(index, "instructor", e.target.value)
                  }
                  placeholder="مثل: د. مازن الكثيري"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  القاعة *
                </label>
                <Input
                  value={record.room}
                  onChange={(e) => updateRecord(index, "room", e.target.value)}
                  placeholder="مثل: قاعة 10"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  نوع الدراسة *
                </label>
                <Select
                  value={record.study_type}
                  onChange={(e) =>
                    updateRecord(index, "study_type", e.target.value)
                  }
                  disabled={loading}
                >
                  <option value="">اختر النوع</option>
                  <option value="Gen">Gen</option>
                  <option value="Per">Per</option>
                  <option value="Net">Net</option>
                  <option value="Dev">Dev</option>
                </Select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
          تم حفظ البيانات بنجاح!
        </div>
      )}

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          إلغاء
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              حفظ
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

