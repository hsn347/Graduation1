import { useState } from "react"
import { Dashboard } from "./pages/Dashboard"
import { ChatPage } from "./pages/ChatPage"
import { useAuth } from "./context/AuthContext1"
import { Button } from "./components/ui/button"
import { Loader2 } from "lucide-react"

function App() {
  const { user, loading, signInWithGithub } = useAuth()
  const [showDashboard, setShowDashboard] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">
            يرجى تسجيل الدخول للوصول إلى Dashboard
          </h1>
          <Button onClick={signInWithGithub}>تسجيل الدخول</Button>
        </div>
      </div>
    )
  }

  if (!showDashboard) {
    return <ChatPage onEnterDashboard={() => setShowDashboard(true)} />
  }

  return <Dashboard />
}

export default App;
