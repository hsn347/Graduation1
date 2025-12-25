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
        // استخراج hash من URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        if (accessToken && refreshToken) {
          // تعيين الجلسة يدوياً
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          
          if (error) throw error;
          if (session) {
            setUser(session.user);
            // تنظيف URL وإعادة التوجيه إلى الصفحة الرئيسية
            const currentPath = window.location.pathname;
            window.history.replaceState(null, '', '/');
            // إذا كان المستخدم في صفحة أخرى غير الصفحة الرئيسية، إعادة التوجيه
            if (currentPath !== '/') {
              window.location.pathname = '/';
            }
          }
        } else {
          // محاولة جلب الجلسة العادية
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (session) {
            setUser(session.user);
          }
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
      } finally {
        setLoading(false);
      }
    };

    // التحقق من وجود hash في URL (callback من OAuth)
    if (window.location.hash && window.location.hash.includes('access_token')) {
      handleAuthCallback();
    }

    // الاستماع لتغييرات حالة المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // تنظيف URL وإعادة التوجيه إلى الصفحة الرئيسية بعد المصادقة الناجحة
      if (event === 'SIGNED_IN') {
        if (window.location.hash) {
          window.history.replaceState(null, '', '/');
        }
        // إذا كان المستخدم في صفحة أخرى غير الصفحة الرئيسية، إعادة التوجيه
        if (window.location.pathname !== '/') {
          window.location.pathname = '/';
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signInWithGithub = async () => {
    try {
      // دائماً إعادة التوجيه إلى الصفحة الرئيسية بعد تسجيل الدخول
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/`;
      
      console.log('Redirecting to:', redirectTo);
      
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
        alert(`حدث خطأ أثناء تسجيل الدخول: ${error.message}`);
      } else if (data?.url) {
        // إذا كان هناك URL، Supabase سيعيد التوجيه تلقائياً
        console.log('OAuth URL:', data.url);
      }
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error);
      alert(`حدث خطأ غير متوقع: ${error?.message || 'خطأ غير معروف'}`);
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
