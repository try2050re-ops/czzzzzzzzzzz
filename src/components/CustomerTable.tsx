import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard as Edit, Trash2, Phone, Calendar, DollarSign, UserPlus, StickyNote, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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
  notes: string | null;
  created_at?: string;
  updated_at?: string;
}

interface SuggestedName {
  id: string;
  mobile_number: string;
  suggested_name: string;
  created_at: string;
  updated_at: string;
}
interface CustomerTableProps {
  onAddCustomer: () => void;
  onAddBulkCustomers: () => void;
  onBulkEdit: () => void;
  onEditCustomer: (customer: Customer) => void;
}

export const CustomerTable = ({ onAddCustomer, onAddBulkCustomers, onBulkEdit, onEditCustomer }: CustomerTableProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suggestedNames, setSuggestedNames] = useState<SuggestedName[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<{ id: number; note: string } | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [deleteCustomerId, setDeleteCustomerId] = useState<number | null>(null);
  const [deleteNoteCustomerId, setDeleteNoteCustomerId] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
    fetchSuggestedNames();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('line_type', { ascending: true })
        .order('customer_name', { ascending: true })
        .order('charging_date', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "خطأ",
        description: `فشل في تحميل بيانات العملاء: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedNames = async () => {
    try {
      const { data, error } = await supabase
        .from('suggested_names')
        .select('*');

      if (error) throw error;
      setSuggestedNames(data || []);
    } catch (error) {
      console.error('Error fetching suggested names:', error);
    }
  };

  const getSuggestedName = (mobileNumber: number): string | null => {
    const suggested = suggestedNames.find(s => s.mobile_number === String(mobileNumber));
    return suggested ? suggested.suggested_name : null;
  };
  const deleteCustomer = async (id: number) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomers(customers.filter(c => c.id !== id));
      setDeleteCustomerId(null);
      toast({
        title: "تم بنجاح",
        description: "تم حذف العميل بنجاح",
      });
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast({
        title: "خطأ",
        description: `فشل في حذف العميل: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const deleteCustomerNote = async (customerId: number) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ notes: null })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(customers.map(c =>
        c.id === customerId ? { ...c, notes: null } : c
      ));

      setDeleteNoteCustomerId(null);
      toast({
        title: "تم بنجاح",
        description: "تم حذف الملاحظة بنجاح",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "خطأ",
        description: `فشل في حذف الملاحظة: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const resetMonthlyPrices = async () => {
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          monthly_price: 0,
          payment_status: 'لم يدفع',
          renewal_status: 'لم يتم'
        })
        .neq('id', 0);

      if (error) throw error;

      await fetchCustomers();

      toast({
        title: "تم بنجاح",
        description: "تم إعادة تعيين السعر الشهري لجميع العملاء",
      });
    } catch (error) {
      console.error('Error resetting monthly prices:', error);
      toast({
        title: "خطأ",
        description: `فشل في إعادة تعيين الأسعار: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const updateCustomerNote = async (customerId: number, note: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ notes: note })
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(customers.map(c => 
        c.id === customerId ? { ...c, notes: note } : c
      ));
      
      toast({
        title: "تم بنجاح",
        description: "تم حفظ الملاحظة بنجاح",
      });
      
      setEditingNote(null);
      setNoteDialogOpen(false);
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "خطأ",
        description: `فشل في حفظ الملاحظة: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === 'paid' || status === 'دفع') {
      return <Badge variant="default" className="bg-green-500 hover:bg-green-600">دفع</Badge>;
    }
    return <Badge variant="secondary">لم يدفع</Badge>;
  };

  const getRenewalStatusBadge = (status: string) => {
    if (status === 'done' || status === 'تم') {
      return <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">تم التجديد</Badge>;
    }
    return <Badge variant="outline">لم يتم</Badge>;
  };

  const parseDateAssume2025 = (dateString: string | null): Date | null => {
    if (!dateString) return null;

    const iso = /^\d{4}-\d{2}-\d{2}$/;
    const ymdSlash = /^\d{4}\/\d{2}\/\d{2}$/;
    const dmySlash = /^\d{2}\/\d{2}\/\d{4}$/;
    const dMon = /^(\d{1,2})-(\w{3})$/i; // e.g., 5-Aug

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
    
    // Get provider from the customer data to determine renewal period
    // Default to 30 days (Orange), but this will be handled in the component
    result.setUTCDate(result.getUTCDate() + 30);
    return result;
  };

  const getRenewalInfo = (charging: string | null, renewal: string | null, provider: string | null) => {
    const existing = parseDateAssume2025(renewal);
    let renewalDate: Date;

    if (existing) {
      renewalDate = existing;
    } else {
      const base = parseDateAssume2025(charging);
      if (!base) return { date: 'غير محدد', status: 'none' };

      renewalDate = new Date(base);
      if (provider === 'etisalat') {
        renewalDate.setUTCDate(renewalDate.getUTCDate() + 28);
      } else {
        renewalDate.setUTCDate(renewalDate.getUTCDate() + 30);
      }
    }

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const renewalMidnight = new Date(renewalDate);
    renewalMidnight.setHours(0, 0, 0, 0);

    const diffTime = renewalMidnight.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status = 'normal';
    if (diffDays < 0) {
      status = 'overdue';
    } else if (diffDays <= 2) {
      status = 'warning';
    }

    return {
      date: renewalDate.toLocaleDateString('ar-EG'),
      status,
      daysRemaining: diffDays
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">قائمة العملاء</h2>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="hover-scale" disabled={isResetting}>
                <RefreshCw className={`h-4 w-4 ml-2 ${isResetting ? 'animate-spin' : ''}`} />
                إعادة تعيين الشهر
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription className="text-right">
                  سيتم إعادة تعيين السعر الشهري وحالة الدفع وحالة التجديد لجميع العملاء. هذا الإجراء سيؤثر على جميع السجلات.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={resetMonthlyPrices} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  تأكيد
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={onBulkEdit} variant="outline" className="hover-scale">
            <Users className="h-4 w-4 ml-2" />
            تعديل جماعي
          </Button>
          <Button onClick={onAddBulkCustomers} variant="outline" className="hover-scale">
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة عدة عملاء
          </Button>
          <Button onClick={onAddCustomer} className="hover-scale">
            <Plus className="h-4 w-4 ml-2" />
            إضافة عميل واحد
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">رقم العميل</TableHead>
              <TableHead className="text-right">اسم العميل</TableHead>
              <TableHead className="text-right">رقم الموبايل</TableHead>
              <TableHead className="text-right">نوع الخط</TableHead>
              <TableHead className="text-right">تاريخ الشحن</TableHead>
              <TableHead className="text-right">وقت الوصول</TableHead>
              <TableHead className="text-right">مزود الخدمة</TableHead>
              <TableHead className="text-right">ملكية الخط</TableHead>
              <TableHead className="text-right">تاريخ التجديد</TableHead>
              <TableHead className="text-right">حالة الدفع</TableHead>
              <TableHead className="text-right">السعر الشهري</TableHead>
              <TableHead className="text-right">حالة التجديد</TableHead>
              <TableHead className="text-right">ملاحظات</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer, index) => (
              <TableRow 
                key={customer.id} 
                className="hover:bg-muted/50 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <div className="group relative">
                    <div className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent hover:from-green-600 hover:to-blue-600 transition-all duration-300 cursor-pointer transform hover:scale-105">
                      {customer.customer_name || 'غير محدد'}
                    </div>
                    {/* عرض الاسم المقترح تحت الاسم الأصلي */}
                    {getSuggestedName(customer.mobile_number) && (
                      <div className="text-xs text-blue-500 mt-1 font-medium">
                        الاسم المقترح: {getSuggestedName(customer.mobile_number)}
                      </div>
                    )}
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-green-600 group-hover:w-full transition-all duration-300"></div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {String(customer.mobile_number)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{customer.line_type} جيجا</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {formatDate(customer.charging_date)}
                  </div>
                </TableCell>
                <TableCell>
                  {customer.arrival_time ? (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(customer.arrival_time)}
                    </div>
                  ) : (
                    'غير محدد'
                  )}
                </TableCell>
                <TableCell>
                  {customer.provider ? (
                    <Badge variant="outline" className="capitalize">
                      {customer.provider}
                    </Badge>
                  ) : (
                    'غير محدد'
                  )}
                </TableCell>
                <TableCell>
                  {customer.ownership ? (
                    <Badge variant="secondary" className="capitalize">
                      {customer.ownership}
                    </Badge>
                  ) : (
                    'غير محدد'
                  )}
                </TableCell>
                <TableCell>
                  {(() => {
                    const renewalInfo = getRenewalInfo(customer.charging_date, null, customer.provider);
                    return (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {renewalInfo.date}
                        </div>
                        {renewalInfo.status === 'warning' && (
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 text-xs">
                            متبقي {renewalInfo.daysRemaining} {renewalInfo.daysRemaining === 1 ? 'يوم' : 'يومين'}
                          </Badge>
                        )}
                        {renewalInfo.status === 'overdue' && (
                          <Badge variant="destructive" className="text-xs">
                            متاح التجديد
                          </Badge>
                        )}
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell>{getPaymentStatusBadge(customer.payment_status)}</TableCell>
                <TableCell>
                  {customer.monthly_price ? (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {customer.monthly_price} جنيه
                    </div>
                  ) : (
                    'غير محدد'
                  )}
                </TableCell>
                <TableCell>{getRenewalStatusBadge(customer.renewal_status)}</TableCell>
                <TableCell>
                  <Dialog open={noteDialogOpen && editingNote?.id === customer.id} onOpenChange={setNoteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingNote({ id: customer.id, note: customer.notes || '' });
                          setNoteDialogOpen(true);
                        }}
                        className="flex items-center gap-2 hover:bg-blue-50 transition-colors"
                      >
                        <StickyNote className={`h-4 w-4 ${customer.notes ? 'text-blue-600' : 'text-gray-400'}`} />
                        {customer.notes ? 'عرض' : 'إضافة'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>ملاحظة للعميل: {customer.customer_name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Textarea
                          value={editingNote?.note || ''}
                          onChange={(e) => setEditingNote(prev => prev ? { ...prev, note: e.target.value } : null)}
                          placeholder="اكتب ملاحظتك هنا..."
                          className="min-h-[100px] text-right"
                        />
                        <div className="flex gap-2 justify-end">
                          {customer.notes && (
                            <AlertDialog open={deleteNoteCustomerId === customer.id} onOpenChange={(open) => !open && setDeleteNoteCustomerId(null)}>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  onClick={() => setDeleteNoteCustomerId(customer.id)}
                                >
                                  حذف
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف الملاحظة</AlertDialogTitle>
                                  <AlertDialogDescription className="text-right">
                                    هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      deleteCustomerNote(customer.id);
                                      setEditingNote(null);
                                      setNoteDialogOpen(false);
                                    }}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    حذف
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <Button
                            variant="outline"
                            onClick={() => {
                              setEditingNote(null);
                              setNoteDialogOpen(false);
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button
                            onClick={() => {
                              if (editingNote) {
                                updateCustomerNote(editingNote.id, editingNote.note);
                              }
                            }}
                          >
                            حفظ
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEditCustomer(customer)}
                      className="h-8 w-8 hover-scale"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog open={deleteCustomerId === customer.id} onOpenChange={(open) => !open && setDeleteCustomerId(null)}>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteCustomerId(customer.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover-scale"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف العميل</AlertDialogTitle>
                          <AlertDialogDescription className="text-right">
                            هل أنت متأكد من حذف العميل "{customer.customer_name}"؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteCustomer(customer.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {customers.length === 0 && (
        <div className="text-center py-12 animate-fade-in">
          <div className="text-muted-foreground text-lg">لا توجد بيانات عملاء</div>
          <div className="flex gap-2 justify-center mt-4">
            <Button onClick={onBulkEdit} variant="outline" className="hover-scale">
              <Users className="h-4 w-4 ml-2" />
              تعديل جماعي
            </Button>
            <Button onClick={onAddBulkCustomers} variant="outline" className="hover-scale">
              <UserPlus className="h-4 w-4 ml-2" />
              إضافة عدة عملاء
            </Button>
            <Button onClick={onAddCustomer} className="hover-scale">
              <Plus className="h-4 w-4 ml-2" />
              إضافة عميل واحد
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};