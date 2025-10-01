import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";

interface Customer {
  id?: number;
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

interface CustomerFormProps {
  customer?: Customer | null;
  onSave: () => void;
  onCancel: () => void;
}

export const CustomerForm = ({ customer, onSave, onCancel }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    customer_name: customer?.customer_name || '',
    mobile_number: customer?.mobile_number ? String(customer.mobile_number) : '',
    line_type: customer?.line_type ? String(customer.line_type) : '40',
    charging_date: customer?.charging_date || '',
    arrival_time: customer?.arrival_time || '',
    provider: customer?.provider || 'orange',
    ownership: customer?.ownership || 'nader',
    payment_status: customer?.payment_status || 'لم يدفع',
    monthly_price: customer?.monthly_price ? String(customer.monthly_price) : '',
    renewal_status: customer?.renewal_status || 'لم يتم',
    notes: customer?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        customer_name: formData.customer_name,
        mobile_number: formData.mobile_number ? parseInt(formData.mobile_number) : null,
        line_type: formData.line_type ? parseInt(formData.line_type) : null,
        charging_date: formData.charging_date || null,
        arrival_time: formData.arrival_time || null,
        provider: formData.provider,
        ownership: formData.ownership,
        payment_status: formData.payment_status,
        monthly_price: formData.monthly_price ? parseFloat(formData.monthly_price) : null,
        renewal_status: formData.renewal_status,
        notes: formData.notes || null,
      };

      console.log('Data to save:', dataToSave); // للتأكد من البيانات

      if (customer?.id) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update(dataToSave)
          .eq('id', customer.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث بيانات العميل بنجاح",
        });
      } else {
        // Create new customer
        const { error } = await supabase
          .from('customers')
          .insert([dataToSave]);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة العميل الجديد بنجاح",
        });
      }

      onSave();
    } catch (error) {
      console.error('Error saving customer:', error);
      toast({
        title: "خطأ",
        description: `فشل في حفظ بيانات العميل: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-scale-in">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            {customer?.id ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="customer_name">اسم العميل</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile_number">رقم الموبايل</Label>
                <Input
                  id="mobile_number"
                  value={formData.mobile_number}
                  onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                  placeholder="أدخل رقم الموبايل"
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="line_type">نوع الخط</Label>
                <Select 
                  value={formData.line_type} 
                  onValueChange={(value) => setFormData({ ...formData, line_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الخط" />
                  </SelectTrigger>
                  <SelectContent>
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
                  value={formData.charging_date || ''}
                  onChange={(e) => setFormData({ ...formData, charging_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="arrival_time">وقت وصول الخط</Label>
                <Input
                  id="arrival_time"
                  type="date"
                  value={formData.arrival_time || ''}
                  onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">مزود الخدمة</Label>
                <Select 
                  value={formData.provider} 
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مزود الخدمة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="orange">Orange</SelectItem>
                    <SelectItem value="etisalat">Etisalat</SelectItem>
                    <SelectItem value="we">WE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownership">ملكية الخط</Label>
                <Select 
                  value={formData.ownership} 
                  onValueChange={(value) => setFormData({ ...formData, ownership: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مالك الخط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nader">Nader</SelectItem>
                    <SelectItem value="amer">Amer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_status">حالة الدفع</Label>
                <Select 
                  value={formData.payment_status} 
                  onValueChange={(value) => setFormData({ ...formData, payment_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="دفع">دفع</SelectItem>
                    <SelectItem value="لم يدفع">لم يدفع</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthly_price">السعر الشهري (جنيه)</Label>
                <Input
                  id="monthly_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthly_price || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    monthly_price: e.target.value 
                  })}
                  placeholder="أدخل السعر الشهري"
                  className="text-right"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="renewal_status">حالة التجديد</Label>
                <Select 
                  value={formData.renewal_status} 
                  onValueChange={(value) => setFormData({ ...formData, renewal_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة التجديد" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="تم">تم التجديد</SelectItem>
                    <SelectItem value="لم يتم">لم يتم التجديد</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">ملاحظات (للمدير فقط)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    notes: e.target.value 
                  })}
                  placeholder="اكتب أي ملاحظات خاصة بالعميل..."
                  className="text-right min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-6">
              <Button type="submit" disabled={loading} className="hover-scale">
                <Save className="h-4 w-4 ml-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ'}
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