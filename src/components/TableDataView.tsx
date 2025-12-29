import { useState, useEffect } from "react"
import { supabase } from "@/CliantSupa"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Upload, Loader2, Trash2, AlertTriangle, PenTool } from "lucide-react"
import { PDFUploader } from "./PDFUploader"
import { ManualEntry } from "./ManualEntry"

interface LectureSchedule {
  id?: number
  department: string
  lecture_time: string
  day: string
  level: string
  lecture_title: string
  instructor: string
  room: string
  study_type: string
  created_at?: string
}

interface TableDataViewProps {
  tableName: string | null
}

export const TableDataView = ({ tableName }: TableDataViewProps) => {
  const [data, setData] = useState<LectureSchedule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUploader, setShowUploader] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    if (tableName) {
      fetchData()
    }
  }, [tableName])

  const fetchData = async () => {
    if (!tableName) return

    setLoading(true)
    setError(null)

    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setData(fetchedData || [])
    } catch (err: any) {
      setError(err.message || "حدث خطأ في جلب البيانات")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDataAdded = () => {
    fetchData()
    setShowUploader(false)
    setShowManualEntry(false)
  }

  const handleDeleteAll = async () => {
    if (!tableName) return

    setDeleting(true)
    setError(null)

    try {
      // جلب جميع الـ IDs أولاً
      const { data: allRecords, error: fetchError } = await supabase
        .from(tableName)
        .select("id")

      if (fetchError) throw fetchError

      if (!allRecords || allRecords.length === 0) {
        setShowDeleteConfirm(false)
        return
      }

      // حذف جميع السجلات باستخدام الـ IDs
      const ids = allRecords.map((record) => record.id)
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .in("id", ids)

      if (deleteError) throw deleteError

      setShowDeleteConfirm(false)
      fetchData()
    } catch (err: any) {
      setError(err.message || "حدث خطأ في حذف البيانات")
      console.error("Error deleting data:", err)
    } finally {
      setDeleting(false)
    }
  }

  if (!tableName) {
    return (
      <div className="flex-1 p-8">
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            اختر جدولاً من القائمة لعرض البيانات
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{tableName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            عرض وإدارة بيانات الجدول ({data.length} سجل)
          </p>
        </div>
        <div className="flex gap-2">
          {data.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  حذف الكل
                </>
              )}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setShowManualEntry(true)
              setShowUploader(false)
            }}
          >
            <PenTool className="h-4 w-4 mr-2" />
            إدخال يدوي
          </Button>
          <Button
            onClick={() => {
              setShowUploader(true)
              setShowManualEntry(false)
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            رفع ملفات
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <Card className="mb-6 border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              تأكيد الحذف
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-foreground">
              هل أنت متأكد من حذف جميع البيانات ({data.length} سجل)؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                إلغاء
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    جاري الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    حذف الكل
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {showManualEntry && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إدخال بيانات يدوياً</CardTitle>
          </CardHeader>
          <CardContent>
            <ManualEntry
              tableName={tableName}
              onSuccess={handleDataAdded}
              onCancel={() => setShowManualEntry(false)}
            />
          </CardContent>
        </Card>
      )}

      {showUploader && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>رفع ملفات PDF أو Word أو صور لاستخراج البيانات</CardTitle>
          </CardHeader>
          <CardContent>
            <PDFUploader
              tableName={tableName}
              onSuccess={handleDataAdded}
              onCancel={() => setShowUploader(false)}
            />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">جاري تحميل البيانات...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8 text-center text-destructive">
            <p>{error}</p>
            <Button onClick={fetchData} className="mt-4" variant="outline">
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      ) : data.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>لا توجد بيانات في هذا الجدول</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button
                onClick={() => setShowManualEntry(true)}
                variant="outline"
              >
                <PenTool className="h-4 w-4 mr-2" />
                إدخال يدوي
              </Button>
              <Button
                onClick={() => setShowUploader(true)}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                رفع ملفات
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      القسم
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      وقت المحاضرة
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      اليوم
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      المستوى
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      المادة
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      الدكتور
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      القاعة
                    </th>
                    <th className="text-right p-4 text-sm font-semibold text-foreground">
                      نوع الدراسة
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={row.id || index}
                      className="border-b border-border hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-4 text-sm text-foreground">
                        {row.department}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {row.lecture_time}
                      </td>
                      <td className="p-4 text-sm text-foreground">{row.day}</td>
                      <td className="p-4 text-sm text-foreground">
                        {row.level}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {row.lecture_title}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {row.instructor}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {row.room}
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {row.study_type || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

