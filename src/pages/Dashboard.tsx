import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { TableDataView } from "@/components/TableDataView"

export const Dashboard = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedTable={selectedTable}
          onTableSelect={setSelectedTable}
        />
        
        
        <TableDataView tableName={selectedTable} />
      </div>
    </div>
  )
}

