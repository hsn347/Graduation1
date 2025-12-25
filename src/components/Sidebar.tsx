import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Database } from "lucide-react"

interface SidebarProps {
  selectedTable: string | null
  onTableSelect: (tableName: string) => void
}

export const Sidebar = ({ selectedTable, onTableSelect }: SidebarProps) => {
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTables = async () => {
      try {
        // طريقة بديلة: جلب الجداول من information_schema
        // لكن Supabase لا يدعم ذلك مباشرة، لذا سنستخدم قائمة ثابتة للبداية
        // يمكن إضافة جداول أخرى لاحقاً
        const defaultTables = ["lectures", "Students","Classes"] // الجدول الأساسي
        setTables(defaultTables)
      } catch (error) {
        console.error("Error fetching tables:", error)
        // في حالة الخطأ، نستخدم الجدول الافتراضي
        setTables(["lectures"])
      } finally {
        setLoading(false)
      }
    }

    fetchTables()
  }, [])

  if (loading) {
    return (
      <aside className="w-64 border-r border-border bg-card p-4">
        <div className="text-sm text-muted-foreground">جاري التحميل...</div>
      </aside>
    )
  }

  return (
    <aside className="w-64 border-r border-border bg-card p-4">
      <nav className="space-y-2">
        <div>
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">الجداول</h3>
          {tables.map((table) => (
            <button
              key={table}
              onClick={() => onTableSelect(table)}
              className={cn(
                "w-full text-right px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                selectedTable === table
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <Database className="h-4 w-4" />
              {table}
            </button>
          ))}
        </div>
      </nav>
    </aside>
  )
}

