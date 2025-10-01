import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Users, Search } from "lucide-react";

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
}

interface BulkEditFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const BulkEditForm = ({ onSave, onCancel }: BulkEditFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    line_type: "no-change",
    charging_date: "",
    arrival_time: "",
    provider: "no-change",
    ownership: "no-change",
    payment_status: "no-change",
    monthly_price: "",
    renewal_status: "no-change",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('customer_name', { ascending: true });

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

  const filteredCustomers = customers.filter(customer =>
    customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(customer.mobile_number).includes(searchTerm)
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId: number, checked: boolean) => {
    if (checked) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomers.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب اختيار عميل واحد على الأقل للتعديل",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Prepare update data - only include fields that have values
      const updateData: any = {};
      
      if (editData.line_type && editData.line_type !== "no-change") updateData.line_type = parseInt(editData.line_type);
      if (editData.charging_date) updateData.charging_date = editData.charging_date;
      if (editData.arrival_time) updateData.arrival_time = editData.arrival_time;
      if (editData.provider && editData.provider !== "no-change") updateData.provider = editData.provider;
      if (editData.ownership && editData.ownership !== "no-change") updateData.ownership = editData.ownership;
      if (editData.payment_status && editData.payment_status !== "no-change") updateData.payment_status = editData.payment_status;
      if (editData.monthly_price) updateData.monthly_price = parseFloat(editData.monthly_price);
      if (editData.renewal_status && editData.renewal_status !== "no-change") updateData.renewal_status = editData.renewal_status;

      if (Object.keys(updateData).length === 0) {
        toast({
          title: "خطأ",
          description: "يجب تحديد حقل واحد على الأقل للتعديل",
          variant: "destructive",
        });
        return;
      }

      // Update selected customers
      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .in('id', selectedCustomers);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم تحديث بيانات ${selectedCustomers.length} عميل بنجاح`,
      });

      onSave();
    } catch (error) {
      console.error('Error updating customers:', error);
      toast({
        title: "خطأ",
        description: `فشل في تحديث بيانات العملاء: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="animate-scale-in">
      <Card className="max-w-6xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Users className="h-6 w-6" />
            تعديل جماعي للعملاء
          </CardTitle>
          <p className="text-center text-muted-foreground">
            اختر العملاء المراد تعديل بياناتهم
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">البحث في العملاء</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث بالاسم أو رقم الموبايل..."
                  className="pl-10 text-right"
                />
              </div>
            </div>

            {/* Customer Selection */}
            <Card className="max-h-96 overflow-y-auto">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="select-all"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                    <Label htmlFor="select-all">تحديد الكل ({filteredCustomers.length})</Label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    تم اختيار {selectedCustomers.length} عميل
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center space-x-2 p-2 border rounded">
                    <Checkbox
                      id={`customer-${customer.id}`}
                      checked={selectedCustomers.includes(customer.id)}
                      onCheckedChange={(checked) => handleSelectCustomer(customer.id, checked as boolean)}
                    />
                    <Label htmlFor={`customer-${customer.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{customer.customer_name}</span>
                        <span className="text-sm text-muted-foreground">{customer.mobile_number}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {customer.line_type} جيجا - {customer.provider || 'غير محدد'} - {customer.payment_status}
                      </div>
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Edit Fields */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">البيانات المراد تعديلها</CardTitle>
                <p className="text-sm text-muted-foreground">
                  اترك الحقول فارغة إذا كنت لا تريد تعديلها
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="line_type">نوع الخط</Label>
                    <Select 
                      value={editData.line_type} 
                      onValueChange={(value) => setEditData({ ...editData, line_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر نوع الخط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">لا تغيير</SelectItem>
                        <SelectItem value="20">20 جيجا</SelectItem>
                        <SelectItem value="40">40 جيجا</SelectItem>
                        <SelectItem value="50">50 جيجا</SelectItem>
                        <SelectItem value="60">60 جيجا</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="charging_date">تاريخ الشحن</Label>
                    <Input
                      id="charging_date"
                      type="date"
                      value={editData.charging_date}
                      onChange={(e) => setEditData({ ...editData, charging_date: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="arrival_time">وقت وصول الخط</Label>
                    <Input
                      id="arrival_time"
                      type="date"
                      value={editData.arrival_time}
                      onChange={(e) => setEditData({ ...editData, arrival_time: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="provider">مزود الخدمة</Label>
                    <Select 
                      value={editData.provider} 
                      onValueChange={(value) => setEditData({ ...editData, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مزود الخدمة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">لا تغيير</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="etisalat">Etisalat</SelectItem>
                        <SelectItem value="we">WE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ownership">ملكية الخط</Label>
                    <Select 
                      value={editData.ownership} 
                      onValueChange={(value) => setEditData({ ...editData, ownership: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر مالك الخط" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">لا تغيير</SelectItem>
                        <SelectItem value="nader">Nader</SelectItem>
                        <SelectItem value="amer">Amer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_status">حالة الدفع</Label>
                    <Select 
                      value={editData.payment_status} 
                      onValueChange={(value) => setEditData({ ...editData, payment_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">لا تغيير</SelectItem>
                        <SelectItem value="دفع">دفع</SelectItem>
                        <SelectItem value="لم يدفع">لم يدفع</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monthly_price">السعر الشهري</Label>
                    <Input
                      id="monthly_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={editData.monthly_price}
                      onChange={(e) => setEditData({ ...editData, monthly_price: e.target.value })}
                      placeholder="السعر بالجنيه"
                      className="text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="renewal_status">حالة التجديد</Label>
                    <Select 
                      value={editData.renewal_status} 
                      onValueChange={(value) => setEditData({ ...editData, renewal_status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة التجديد" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-change">لا تغيير</SelectItem>
                        <SelectItem value="تم">تم التجديد</SelectItem>
                        <SelectItem value="لم يتم">لم يتم التجديد</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-center pt-6 border-t">
              <Button type="submit" disabled={saving || selectedCustomers.length === 0} className="hover-scale">
                <Save className="h-4 w-4 ml-2" />
                {saving ? 'جاري الحفظ...' : `تحديث ${selectedCustomers.length} عميل`}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} className="hover-scale">
                <X className="h-4 w-4 ml-2" />
                إلغاء
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};