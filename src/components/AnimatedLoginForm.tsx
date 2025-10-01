import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Lock, User, Network } from "lucide-react";
import "./AnimatedLoginForm.css";

interface AnimatedLoginFormProps {
  onLogin: (userType: string, username: string) => void;
}

export const AnimatedLoginForm = ({ onLogin }: AnimatedLoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedUserType, setSelectedUserType] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getDisplayNameForSingleUser = async (mobileNumber: string) => {
    try {
      const { data: suggestedData } = await supabase
        .from('suggested_names')
        .select('suggested_name')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

      if (suggestedData?.suggested_name) {
        return suggestedData.suggested_name;
      }

      const { data: customerData } = await supabase
        .from('customers')
        .select('customer_name')
        .eq('mobile_number', parseInt(mobileNumber))
        .maybeSingle();

      if (customerData?.customer_name) {
        return customerData.customer_name;
      }

      return mobileNumber;
    } catch (error) {
      console.error('Error fetching display name:', error);
      return mobileNumber;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserType) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار نوع المستخدم",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let isValid = false;
      let actualUsername = "";

      if (selectedUserType === "admin") {
        if (username === "palestine71023" && password === "159200209Cc?") {
          isValid = true;
          actualUsername = "Admin";
        }
      } else if (selectedUserType === "multiple") {
        if (username === "aboselem892025" && password === "aymenseleemcardsINFO1125?") {
          isValid = true;
          actualUsername = "abo selem";
        } else if (username === "ahmedfathy892025" && password === "abofathyCARDSINFO@@?") {
          isValid = true;
          actualUsername = "ahmed fathy";
        } else if (username === "ahmedeldeeb982025" && password === "ahmedebrahim179355??SS") {
          isValid = true;
          actualUsername = "ahmed eldeeb";
        } else if (username === "saedzidan982025" && password === "saeedzidan159228Zz%%") {
          isValid = true;
          actualUsername = "saed zidan";
        }
      } else if (selectedUserType === "single") {
        if (username) {
          isValid = true;
          actualUsername = await getDisplayNameForSingleUser(username);
        }
      }

      if (isValid) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${actualUsername}`,
        });
        onLogin(selectedUserType, selectedUserType === "single" ? username : actualUsername);
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero content-overlay">
      <div className="main-box">
        <div className="form-box">
          <div id="after"></div>

          <div className="form-header">
            <h2 className="form-title">تسجيل الدخول</h2>
            <p className="form-subtitle">مرحباً بك في نظام إدارة خطوط الإنترنت</p>
          </div>

          <div className="social-icons">
            <button
              type="button"
              className={`icon-link ${selectedUserType === 'admin' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('admin')}
              title="مدير النظام"
            >
              <Lock className="cont-icon" />
            </button>
            <button
              type="button"
              className={`icon-link ${selectedUserType === 'multiple' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('multiple')}
              title="مستخدم متعدد الخطوط"
            >
              <Network className="cont-icon" />
            </button>
            <button
              type="button"
              className={`icon-link ${selectedUserType === 'single' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('single')}
              title="مستخدم عادي"
            >
              <User className="cont-icon" />
            </button>
          </div>

          <form id="login" className="input-group" onSubmit={handleSubmit}>
            <input
              type="text"
              className="input-field"
              placeholder={selectedUserType === "single" ? "رقم الموبايل" : "اسم المستخدم"}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

            {selectedUserType !== "single" && (
              <input
                type="password"
                className="input-field"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !selectedUserType}
            >
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
        <span className="sp sp-t"></span>
        <span className="sp sp-r"></span>
        <span className="sp sp-b"></span>
        <span className="sp sp-l"></span>
      </div>
      <Footer />
    </div>
  );
};
