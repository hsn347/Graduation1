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

    // معالجة callback بعد المصادقة
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          setUser(session.user);
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
      } finally {
        setLoading(false);
      }
    };

    // التحقق من وجود hash في URL (callback من OAuth)
    if (window.location.hash) {
      handleAuthCallback();
    }

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // تنظيف URL بعد المصادقة الناجحة
      if (event === 'SIGNED_IN' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signInWithGithub = async () => {
    try {
      const redirectTo = `${window.location.origin}${window.location.pathname}`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectTo,
          queryParams: {
            prompt: "select_account",
            access_type: "offline",
          },
        },
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
        alert('حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      alert('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
    }
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
