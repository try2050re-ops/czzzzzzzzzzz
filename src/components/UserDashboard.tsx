import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Calendar, Wifi, CreditCard as Edit, Save, X, Copy, PhoneCall, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Customer {
  id: number;
  customer_name: string;
  mobile_number: number;
  line_type: number;
  charging_date: string | null;
  arrival_time: string | null;
  provider: string | null;
  ownership: string | null;
  payment_status: string;
  monthly_price: number | null;
  renewal_status: string;
  notes?: string | null;
}

interface SuggestedName {
  id: string;
  mobile_number: string;
  suggested_name: string;
  created_at: string;
  updated_at: string;
}
interface UserDashboardProps {
  userType: string;
  username: string;
}

export const UserDashboard = ({ userType, username }: UserDashboardProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [suggestedName, setSuggestedName] = useState("");
  const [tempName, setTempName] = useState("");
  const [loadingSuggestedName, setLoadingSuggestedName] = useState(true);
  const [suggestedNames, setSuggestedNames] = useState<{[key: string]: string}>({});
  const [editingSuggestedName, setEditingSuggestedName] = useState<{id: number, name: string} | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomerData();
    if (userType === "single") {
      fetchSuggestedName();
    } else if (userType === "multiple") {
      fetchAllSuggestedNames();
    }
  }, [userType, username]);

  const fetchSuggestedName = async () => {
    if (userType !== "single") {
      setLoadingSuggestedName(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('suggested_names')
        .select('*')
        .eq('mobile_number', username)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSuggestedName(data.suggested_name);
      } else {
        setSuggestedName("");
      }
    } catch (error) {
      console.error('Error fetching suggested name:', error);
    } finally {
      setLoadingSuggestedName(false);
    }
  };

  const saveSuggestedName = async () => {
    if (!tempName.trim()) return;

    try {
      const { error } = await supabase
        .from('suggested_names')
        .upsert({
          mobile_number: username,
          suggested_name: tempName.trim()
        }, {
          onConflict: 'mobile_number'
        });

      if (error) throw error;

      setSuggestedName(tempName.trim());
      setIsEditingName(false);
      setTempName("");
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الاسم المقترح بنجاح",
      });
    } catch (error) {
      console.error('Error saving suggested name:', error);
      toast({
        title: "خطأ",
        description: `فشل في حفظ الاسم المقترح: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const fetchAllSuggestedNames = async () => {
    if (userType !== "multiple") return;

    try {
      const { data, error } = await supabase
        .from('suggested_names')
        .select('*');

      if (error) throw error;
      
      const namesMap: {[key: string]: string} = {};
      data?.forEach(item => {
        namesMap[item.mobile_number] = item.suggested_name;
      });
      setSuggestedNames(namesMap);
    } catch (error) {
      console.error('Error fetching suggested names:', error);
    }
  };

  const saveSuggestedNameForCustomer = async (mobileNumber: string, suggestedName: string) => {
    if (!suggestedName.trim()) return;

    try {
      const { error } = await supabase
        .from('suggested_names')
        .upsert({
          mobile_number: mobileNumber,
          suggested_name: suggestedName.trim()
        }, {
          onConflict: 'mobile_number'
        });

      if (error) throw error;

      setSuggestedNames(prev => ({
        ...prev,
        [mobileNumber]: suggestedName.trim()
      }));
      
      setEditingSuggestedName(null);
      setDialogOpen(false);
      
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الاسم المقترح بنجاح",
      });
    } catch (error) {
      console.error('Error saving suggested name:', error);
      toast({
        title: "خطأ",
        description: `فشل في حفظ الاسم المقترح: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const startEditing = () => {
    setTempName(suggestedName);
    setIsEditingName(true);
  };

  const cancelEditing = () => {
    setTempName("");
    setIsEditingName(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "تم النسخ",
        description: "تم نسخ الكود بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل في نسخ الكود",
        variant: "destructive",
      });
    }
  };

  const makeCall = (code: string) => {
    window.location.href = `tel:${code}`;
  };
  const fetchCustomerData = async () => {
    try {
      let query = supabase.from('customers').select(`
        id, customer_name, mobile_number, line_type, charging_date, 
        arrival_time, provider, ownership, payment_status, 
        monthly_price, renewal_status, created_at, updated_at
      `);
      
      if (userType === "multiple") {
        // For multiple user, filter by customer name
        query = query.eq('customer_name', username)
          .order('charging_date', { ascending: false })
          .order('line_type', { ascending: true });
      } else if (userType === "single") {
        // For single user, filter by mobile number
        query = query.eq('mobile_number', parseInt(username));
      }

      const { data, error } = await query;

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const parseDateAssume2025 = (dateString: string | null): Date | null => {
    if (!dateString) return null;

    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const ymdSlash = /^\d{4}\/\d{2}\/\d{2}$/;
    const dmySlash = /^\d{2}\/\d{2}\/\d{4}$/;
    const dMon = /^(\d{1,2})-(\w{3})$/i;

    if (iso.test(dateString)) return new Date(dateString + 'T00:00:00Z');
    if (ymdSlash.test(dateString)) return new Date(dateString.replace(/\//g, '-') + 'T00:00:00Z');
    if (dmySlash.test(dateString)) {
      const [dd, mm, yyyy] = dateString.split('/');
      return new Date(`${yyyy}-${mm}-${dd}T00:00:00Z`);
    }

    const m = dateString.match(dMon);
    if (m) {
      const day = parseInt(m[1], 10);
      const monAbbr = m[2].toLowerCase();
      const map: Record<string, number> = { jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12 };
      const month = map[monAbbr];
      if (month) return new Date(Date.UTC(2025, month - 1, day));
    }

    const d = new Date(dateString);
    if (!isNaN(d.getTime())) return d;
    return null;
  };

  const formatDate = (dateString: string | null) => {
    const d = parseDateAssume2025(dateString);
    if (!d) return 'غير محدد';
    return d.toLocaleDateString('ar-EG');
  };

  const computeRenewalDate = (charging: string | null, existingRenewal: string | null): Date | null => {
    const existing = parseDateAssume2025(existingRenewal);
    if (existing) return existing;
    const base = parseDateAssume2025(charging);
    if (!base) return null;
    const result = new Date(base);
    result.setUTCDate(result.getUTCDate() + 30);
    return result;
  };

  const formatRenewal = (charging: string | null, renewal: string | null) => {
    const existing = parseDateAssume2025(renewal);
    if (existing) return existing.toLocaleDateString('ar-EG');
    
    const base = parseDateAssume2025(charging);
    if (!base) return 'غير محدد';
    
    const result = new Date(base);
    result.setUTCDate(result.getUTCDate() + 30);
    
    const d = result;
    if (!d) return 'غير محدد';
    return d.toLocaleDateString('ar-EG');
  };

  const formatRenewalWithProvider = (charging: string | null, renewal: string | null, provider: string | null) => {
    const existing = parseDateAssume2025(renewal);
    if (existing) return existing.toLocaleDateString('ar-EG');
    
    const base = parseDateAssume2025(charging);
    if (!base) return 'غير محدد';
    
    const result = new Date(base);
    // Etisalat: 28 days (renewal on day 29)
    // Orange: 30 days (renewal on day 31)
    // WE: 30 days (renewal on day 31)
    if (provider === 'etisalat') {
      result.setUTCDate(result.getUTCDate() + 28);
    } else {
      result.setUTCDate(result.getUTCDate() + 30);
    }
    
    return result.toLocaleDateString('ar-EG');
  };

  const getRenewalAlert = (charging: string | null, renewal: string | null, provider: string | null) => {
    const existing = parseDateAssume2025(renewal);
    let renewalDate: Date;
    
    if (existing) {
      renewalDate = existing;
    } else {
      const base = parseDateAssume2025(charging);
      if (!base) return null;
      
      renewalDate = new Date(base);
      if (provider === 'etisalat') {
        renewalDate.setUTCDate(renewalDate.getUTCDate() + 28);
      } else {
        renewalDate.setUTCDate(renewalDate.getUTCDate() + 30);
      }
    }
    
    const today = new Date();
    const timeDiff = renewalDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 2 && daysDiff >= 0) {
      return {
        show: true,
        daysLeft: daysDiff,
        isToday: daysDiff === 0,
        isTomorrow: daysDiff === 1
      };
    }
    
    return null;
  };

  // Get display name for single user
  const getDisplayName = () => {
    if (userType !== "single") return username;
    
    // If there's a suggested name, use it
    if (suggestedName) return suggestedName;
    
    // If there's a customer name from database, use it
    if (customers.length > 0 && customers[0].customer_name) {
      return customers[0].customer_name;
    }
    
    // Fallback to mobile number
    return username;
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="text-muted-foreground text-lg">لا توجد بيانات متاحة</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in transition-all duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
          مرحباً {getDisplayName()}
        </h2>
        
        {/* Suggested Name Section */}
        {userType === "single" && (
          <div className="mt-4 space-y-2">
            {loadingSuggestedName ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
            ) : (
              !isEditingName ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="text-lg text-muted-foreground">
                    {suggestedName ? (
                      <span>الاسم المقترح: <span className="text-blue-600 font-semibold">{suggestedName}</span></span>
                    ) : (
                      <span>لا يوجد اسم مقترح</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditing}
                    className="hover-scale"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 max-w-md mx-auto">
                  <Input
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder="أدخل الاسم المقترح..."
                    className="text-center"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        saveSuggestedName();
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={saveSuggestedName}
                    className="hover-scale text-green-600"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelEditing}
                    className="hover-scale text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )
            )}
          </div>
        )}
        
        <p className="text-muted-foreground text-lg">
          {userType === "multiple" ? "بيانات خطوطك" : "بيانات خطك"}
        </p>
      </div>

      {/* Units Check Message for Single Users */}
      <div className="grid gap-6">
        {customers.map((customer, index) => (
          <Card key={customer.id} className="animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 border-l-blue-500 bg-black/80 text-white border-gray-600" style={{ animationDelay: `${index * 0.1}s` }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5 text-blue-600" />
                {userType === "multiple" ? `بيانات الخط - ${customer.customer_name}` : "بيانات الخط"}
                {userType === "multiple" && (
                  <Dialog open={dialogOpen && editingSuggestedName?.id === customer.id} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSuggestedName({
                            id: customer.id,
                            name: suggestedNames[String(customer.mobile_number)] || ''
                          });
                          setDialogOpen(true);
                        }}
                        className="ml-2 text-blue-400 hover:text-blue-300"
                      >
                        <Plus className="h-4 w-4" />
                        {suggestedNames[String(customer.mobile_number)] ? 'تعديل الاسم المقترح' : 'إضافة اسم مقترح'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>اسم مقترح للخط: {customer.mobile_number}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="suggested-name">الاسم المقترح</Label>
                          <Input
                            id="suggested-name"
                            value={editingSuggestedName?.name || ''}
                            onChange={(e) => setEditingSuggestedName(prev => 
                              prev ? { ...prev, name: e.target.value } : null
                            )}
                            placeholder="أدخل الاسم المقترح..."
                            className="text-right"
                          />
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingSuggestedName(null);
                              setDialogOpen(false);
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button
                            onClick={() => {
                              if (editingSuggestedName) {
                                saveSuggestedNameForCustomer(
                                  String(customer.mobile_number),
                                  editingSuggestedName.name
                                );
                              }
                            }}
                          >
                            حفظ
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {(() => {
                  const alert = getRenewalAlert(customer.charging_date, null, customer.provider);
                  if (alert?.show) {
                    return (
                      <Badge 
                        variant="destructive" 
                        className="ml-2 animate-pulse bg-red-600 text-white border-red-500"
                      >
                        {alert.isToday ? 'التجديد اليوم!' : 
                         alert.isTomorrow ? 'التجديد غداً!' : 
                         `باقي ${alert.daysLeft} يوم للتجديد`}
                      </Badge>
                    );
                  }
                  return null;
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* عرض الاسم المقترح للمستخدم المتعدد */}
              {userType === "multiple" && suggestedNames[String(customer.mobile_number)] && (
                <div className="mb-4 p-3 bg-blue-800/50 rounded-lg border border-blue-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300 font-medium">الاسم المقترح:</span>
                    <span className="text-blue-100 font-semibold">{suggestedNames[String(customer.mobile_number)]}</span>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-300" />
                  <span className="font-medium">رقم الموبايل:</span>
                  <span className="text-blue-600 font-semibold">{customer.mobile_number}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-gray-300" />
                  <span className="font-medium">نوع الخط:</span>
                  <Badge variant="outline" className="bg-green-800 text-green-300 border-green-600">{customer.line_type} جيجا</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-300" />
                  <span className="font-medium">تاريخ الشحن:</span>
                  <span className="text-purple-600 font-semibold">{formatDate(customer.charging_date)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-gray-300" />
                  <span className="font-medium">مزود الخدمة:</span>
                  <Badge variant="outline" className="bg-blue-800 text-blue-300 border-blue-600 capitalize">{customer.provider || 'غير محدد'}</Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-300" />
                  <span className="font-medium">تاريخ التجديد:</span>
                  <span className="text-orange-600 font-semibold">{formatRenewalWithProvider(customer.charging_date, null, customer.provider)}</span>
                </div>
              </div>

              {/* Units Check Message for Orange Users - Moved here and made smaller */}
              {userType === "single" && customer.provider === "orange" && (
                <div className="mt-4 p-3 bg-orange-900/30 rounded-lg border border-orange-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Phone className="h-4 w-4 text-orange-400" />
                    <span className="text-orange-300 font-medium text-sm">معرفة الوحدات المتبقية</span>
                  </div>
                  <div className="flex items-center justify-between bg-orange-800/30 p-2 rounded border border-dashed border-orange-500/50">
                    <code className="text-lg font-bold text-orange-300 font-mono">
                      #16*1*1#
                    </code>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard("#16*1*1#")}
                        className="h-7 px-2 text-xs text-orange-300 hover:text-orange-200 hover:bg-orange-800/50"
                      >
                        <Copy className="h-3 w-3 ml-1" />
                        نسخ
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => makeCall("#16*1*1#")}
                        className="h-7 px-2 text-xs text-orange-300 hover:text-orange-200 hover:bg-orange-800/50"
                      >
                        <PhoneCall className="h-3 w-3 ml-1" />
                        اتصال
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-orange-400 mt-1">
                    التكلفة: 4 قروش
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};