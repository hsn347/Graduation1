import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { TableDataView } from "@/components/TableDataView"
import { WhatsAppManager } from "@/components/WhatsAppManager"
import { MessagesView } from "@/components/MessagesView"

export const Dashboard = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<"table" | "whatsapp" | "messages">("table")

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedTable={selectedTable}
          onTableSelect={(table) => {
            setSelectedTable(table)
            setSelectedView("table")
          }}
          selectedView={selectedView}
          onViewSelect={setSelectedView}
        />
        {selectedView === "whatsapp" ? (
          <div className="flex-1 overflow-auto">
            <WhatsAppManager />
          </div>
        ) : selectedView === "messages" ? (
          <div className="flex-1 overflow-auto">
            <MessagesView />
          </div>
        ) : (
          <TableDataView tableName={selectedTable} />
        )}
      </div>
    </div>
  )
}

