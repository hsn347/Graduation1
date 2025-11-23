import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Database, MessageSquare, Inbox } from "lucide-react"

interface SidebarProps {
  selectedTable: string | null
  onTableSelect: (tableName: string) => void
  selectedView?: "table" | "whatsapp" | "messages"
  onViewSelect?: (view: "table" | "whatsapp" | "messages") => void
}

export const Sidebar = ({ selectedTable, onTableSelect, selectedView = "table", onViewSelect }: SidebarProps) => {
  const [tables, setTables] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTables = async () => {
      try {
        // طريقة بديلة: جلب الجداول من information_schema
        // لكن Supabase لا يدعم ذلك مباشرة، لذا سنستخدم قائمة ثابتة للبداية
        // يمكن إضافة جداول أخرى لاحقاً
        const defaultTables = ["lectures"] // الجدول الأساسي
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
      <h2 className="text-lg font-semibold mb-4 text-foreground">القوائم</h2>
      <nav className="space-y-2">
        {onViewSelect && (
          <>
            <button
              onClick={() => onViewSelect("whatsapp")}
              className={cn(
                "w-full text-right px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                selectedView === "whatsapp"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              إرسال رسائل
            </button>
            <button
              onClick={() => onViewSelect("messages")}
              className={cn(
                "w-full text-right px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                selectedView === "messages"
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent text-foreground"
              )}
            >
              <Inbox className="h-4 w-4" />
              الرسائل الواردة
            </button>
          </>
        )}
        <div className="pt-2 border-t border-border mt-2">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">الجداول</h3>
          {tables.map((table) => (
            <button
              key={table}
              onClick={() => onTableSelect(table)}
              className={cn(
                "w-full text-right px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                selectedTable === table && selectedView === "table"
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

