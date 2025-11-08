import type { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../CliantSupa";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGithub: () => void;
  signOut: () => void;
  she?: any;
  setShe: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [she, setShe] = useState<any>();

  useEffect(() => {
    // جلب الجلسة الحالية أولاً
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signInWithGithub = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });
  };
  const signOut = () => {
    supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInWithGithub, signOut, she, setShe }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("Error AuthContext");
  }
  return context;
};
