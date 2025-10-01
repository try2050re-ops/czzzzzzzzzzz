import { useState, useEffect } from "react";
import { AnimatedLoginForm } from "@/components/AnimatedLoginForm";
import { AdminDashboard } from "@/components/AdminDashboard";
import { UserDashboard } from "@/components/UserDashboard";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  const SESSION_DURATION = 300000; // 5 minutes in milliseconds

  const handleLogin = (type: string, user: string) => {
    setIsLoggedIn(true);
    setUserType(type);
    setUsername(user);
    // Only start session timer for non-admin users
    if (type !== "admin") {
      startSessionTimer();
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType("");
    setUsername("");
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  };

  const startSessionTimer = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    const timeout = setTimeout(() => {
      handleLogout();
    }, SESSION_DURATION);
    
    setSessionTimeout(timeout);
  };

  // Reset session timer on user activity
  useEffect(() => {
    if (isLoggedIn && userType !== "admin") {
      const resetTimer = () => {
        startSessionTimer();
      };

      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, resetTimer, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimer, true);
        });
      };
    }
  }, [isLoggedIn, userType]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [sessionTimeout]);

  if (!isLoggedIn) {
    return <AnimatedLoginForm onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    if (userType === "admin") {
      return <AdminDashboard />;
    } else {
      return <UserDashboard userType={userType} username={username} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col content-overlay">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-12 animate-fade-in">
          <div className="text-center flex-1">
            <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              نظام إدارة خطوط الإنترنت
            </h1>
            <p className="text-xl text-muted-foreground">
              {userType === "admin" 
                ? "إدارة عملاء خطوط الإنترنت والاشتراكات الشهرية بكل سهولة"
                : userType === "multiple"
                ? "عرض بيانات خطوطك"
                : "عرض بيانات خطك"
              }
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 hover-scale"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </header>
        
        {renderDashboard()}
      </div>
      <Footer />
    </div>
  );
};

export default Index;