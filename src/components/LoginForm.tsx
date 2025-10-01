import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, User, Phone, Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface LoginFormProps {
  onLogin: (userType: string, username: string) => void;
}

export const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [userType, setUserType] = useState<string>("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getDisplayNameForSingleUser = async (mobileNumber: string) => {
    try {
      // First, try to get suggested name
      const { data: suggestedData } = await supabase
        .from('suggested_names')
        .select('suggested_name')
        .eq('mobile_number', mobileNumber)
        .maybeSingle();

      if (suggestedData?.suggested_name) {
        return suggestedData.suggested_name;
      }

      // If no suggested name, try to get customer name from database
      const { data: customerData } = await supabase
        .from('customers')
        .select('customer_name')
        .eq('mobile_number', parseInt(mobileNumber))
        .maybeSingle();

      if (customerData?.customer_name) {
        return customerData.customer_name;
      }

      // Fallback to mobile number
      return mobileNumber;
    } catch (error) {
      console.error('Error fetching display name:', error);
      return mobileNumber;
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let isValid = false;
      let actualUsername = "";

      if (userType === "admin") {
        if (username === "palestine71023" && password === "159200209Cc?") {
          isValid = true;
          actualUsername = "Admin";
        }
      } else if (userType === "multiple") {
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
      } else if (userType === "single") {
        // For single user, username should be a mobile number, no password required
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
        // For single users, pass the mobile number (username), not the display name
        onLogin(userType, userType === "single" ? username : actualUsername);
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
    <div className="min-h-screen flex flex-col content-overlay relative">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl animate-scale-in transition-all duration-500 hover:shadow-3xl bg-card/50 backdrop-blur-md border-2 border-white/20 relative overflow-hidden">
            {/* Card decorative overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-green-500/10"></div>
            <div className="relative z-10">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-600 to-green-600 rounded-full w-16 h-16 flex items-center justify-center shadow-lg animate-pulse">
              <Network className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              تسجيل الدخول
            </CardTitle>
            
            {/* Islamic Verse */}
            <div className="mt-6 text-center animate-fade-in">
              <p className="golden-text text-lg font-bold leading-relaxed px-4" style={{ fontFamily: 'serif' }}>
                إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا
              </p>
              <p className="text-sm text-muted-foreground mt-2 opacity-80">
                صدق الله العظيم
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userType">نوع المستخدم</Label>
                <Select value={userType} onValueChange={setUserType} required>
                  <SelectTrigger className="transition-all duration-300 hover:border-blue-400 focus:border-blue-500">
                    <SelectValue placeholder="اختر نوع المستخدم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin" className="hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        مدير النظام
                      </div>
                    </SelectItem>
                    <SelectItem value="multiple" className="hover:bg-green-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4 text-green-600" />
                        مستخدم متعدد الخطوط
                      </div>
                    </SelectItem>
                    <SelectItem value="single" className="hover:bg-purple-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        مستخدم عادي
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">
                  {userType === "single" ? "رقم الموبايل" : "اسم المستخدم"}
                </Label>
                <div className="relative">
                  {userType === "single" ? (
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                  ) : (
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                  )}
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={userType === "single" ? "أدخل رقم الموبايل" : "أدخل اسم المستخدم"}
                    className="pl-10 text-right transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {userType !== "single" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة المرور"
                    className="pl-10 pr-10 text-right transition-all duration-300 hover:border-blue-400 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              )}

              <Button 
                type="submit" 
                className="w-full hover-scale bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                disabled={loading || !userType}
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>
          </CardContent>
            </div>
        </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};