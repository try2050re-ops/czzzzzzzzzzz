import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Plus, Minus, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CustomerData {
  customer_name: string;
  mobile_number: string;
  line_type: string;
  charging_date: string;
  arrival_time: string;
  provider: string;
  ownership: string;
  payment_status: string;
  monthly_price: string;
  renewal_status: string;
}

interface BulkCustomerFormProps {
  onSave: () => void;
  onCancel: () => void;
}

export const BulkCustomerForm = ({ onSave, onCancel }: BulkCustomerFormProps) => {
  const [customers, setCustomers] = useState<CustomerData[]>([
    {
      customer_name: '',
      mobile_number: '',
      line_type: '40',
      charging_date: '',
      arrival_time: '',
      provider: 'orange',
      ownership: 'nader',
      payment_status: 'لم يدفع',
      monthly_price: '',
      renewal_status: 'لم يتم',
    }
  ]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addCustomerRow = () => {
    if (customers.length < 20) {
      setCustomers([...customers, {
        customer_name: '',
        mobile_number: '',
        line_type: '40',
        charging_date: '',
        arrival_time: '',
        provider: 'orange',
        ownership: 'nader',
        payment_status: 'لم يدفع',
        monthly_price: '',
        renewal_status: 'لم يتم',
      }]);
    }
  };

  const removeCustomerRow = (index: number) => {
    if (customers.length > 1) {
      const newCustomers = customers.filter((_, i) => i !== index);
      setCustomers(newCustomers);
    }
  };

  const updateCustomer = (index: number, field: keyof CustomerData, value: string) => {
    const newCustomers = [...customers];
    newCustomers[index][field] = value;
    setCustomers(newCustomers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate that at least one customer has required fields
      const validCustomers = customers.filter(customer => 
        customer.customer_name.trim() && customer.mobile_number.trim()
      );

      if (validCustomers.length === 0) {
        toast({
          title: "خطأ",
          description: "يجب إدخال بيانات عميل واحد على الأقل (الاسم ورقم الموبايل)",
          variant: "destructive",
        });
        return;
      }

      // Prepare data for insertion
      const dataToInsert = validCustomers.map(customer => ({
        customer_name: customer.customer_name.trim(),
        mobile_number: customer.mobile_number ? parseInt(customer.mobile_number) : null,
        line_type: customer.line_type ? parseInt(customer.line_type) : 40,
        charging_date: customer.charging_date || null,
        arrival_time: customer.arrival_time || null,
        provider: customer.provider,
        ownership: customer.ownership,
        payment_status: customer.payment_status,
        monthly_price: customer.monthly_price ? parseFloat(customer.monthly_price) : null,
        renewal_status: customer.renewal_status,
      }));

      console.log('Data to insert:', dataToInsert);

      const { error } = await supabase
        .from('customers')
        .insert(dataToInsert);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: `تم إضافة ${validCustomers.length} عميل بنجاح`,
      });

      onSave();
    } catch (error) {
      console.error('Error saving customers:', error);
      toast({
        title: "خطأ",
        description: `فشل في حفظ بيانات العملاء: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    const sampleCustomers: CustomerData[] = [
      {
        customer_name: 'أحمد محمد',
        mobile_number: '01234567890',
        line_type: '40',
        charging_date: '2025-01-01',
        arrival_time: '10:30',
        provider: 'orange',
        ownership: 'nader',
        payment_status: 'دفع',
        monthly_price: '150',
        renewal_status: 'تم',
      },
      {
        customer_name: 'فاطمة علي',
        mobile_number: '01234567891',
        line_type: '60',
        charging_date: '2025-01-02',
        arrival_time: '14:15',
        provider: 'etisalat',
        ownership: 'amer',
        payment_status: 'لم يدفع',
        monthly_price: '200',
        renewal_status: 'لم يتم',
      },
      {
        customer_name: 'محمود حسن',
        mobile_number: '01234567892',
        line_type: '50',
        charging_date: '2025-01-03',
        arrival_time: '16:45',
        provider: 'we',
        ownership: 'nader',
        payment_status: 'دفع',
        monthly_price: '175',
        renewal_status: 'تم',
      }
    ];
    setCustomers(sampleCustomers);
  };

  return (
    <div className="animate-scale-in">
      <Card className="max-w-6xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Users className="h-6 w-6" />
            إضافة عدة عملاء
          </CardTitle>
          <p className="text-center text-muted-foreground">
            يمكنك إضافة حتى 20 عميل في المرة الواحدة
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">إدخال يدوي</TabsTrigger>
              <TabsTrigger value="sample" onClick={fillSampleData}>بيانات تجريبية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    عدد العملاء: {customers.length} / 20
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCustomerRow}
                      disabled={customers.length >= 20}
                      className="hover-scale"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة عميل
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {customers.map((customer, index) => (
                    <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">عميل رقم {index + 1}</h4>
                        {customers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeCustomerRow(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`customer_name_${index}`}>اسم العميل *</Label>
                          <Input
                            id={`customer_name_${index}`}
                            value={customer.customer_name}
                            onChange={(e) => updateCustomer(index, 'customer_name', e.target.value)}
                            placeholder="أدخل اسم العميل"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`mobile_number_${index}`}>رقم الموبايل *</Label>
                          <Input
                            id={`mobile_number_${index}`}
                            value={customer.mobile_number}
                            onChange={(e) => updateCustomer(index, 'mobile_number', e.target.value)}
                            placeholder="أدخل رقم الموبايل"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`line_type_${index}`}>نوع الخط</Label>
                          <Select 
                            value={customer.line_type} 
                            onValueChange={(value) => updateCustomer(index, 'line_type', value)}
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
                          <Label htmlFor={`charging_date_${index}`}>تاريخ الشحن</Label>
                          <Input
                            id={`charging_date_${index}`}
                            type="date"
                            value={customer.charging_date}
                            onChange={(e) => updateCustomer(index, 'charging_date', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`arrival_time_${index}`}>وقت وصول الخط</Label>
                          <Input
                            id={`arrival_time_${index}`}
                            type="date"
                            value={customer.arrival_time}
                            onChange={(e) => updateCustomer(index, 'arrival_time', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`provider_${index}`}>مزود الخدمة</Label>
                          <Select 
                            value={customer.provider} 
                            onValueChange={(value) => updateCustomer(index, 'provider', value)}
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
                          <Label htmlFor={`ownership_${index}`}>ملكية الخط</Label>
                          <Select 
                            value={customer.ownership} 
                            onValueChange={(value) => updateCustomer(index, 'ownership', value)}
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
                          <Label htmlFor={`payment_status_${index}`}>حالة الدفع</Label>
                          <Select 
                            value={customer.payment_status} 
                            onValueChange={(value) => updateCustomer(index, 'payment_status', value)}
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
                          <Label htmlFor={`monthly_price_${index}`}>السعر الشهري</Label>
                          <Input
                            id={`monthly_price_${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={customer.monthly_price}
                            onChange={(e) => updateCustomer(index, 'monthly_price', e.target.value)}
                            placeholder="السعر بالجنيه"
                            className="text-right"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`renewal_status_${index}`}>حالة التجديد</Label>
                          <Select 
                            value={customer.renewal_status} 
                            onValueChange={(value) => updateCustomer(index, 'renewal_status', value)}
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
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-4 justify-center pt-6 border-t">
                  <Button type="submit" disabled={loading} className="hover-scale">
                    <Save className="h-4 w-4 ml-2" />
                    {loading ? 'جاري الحفظ...' : `حفظ ${customers.filter(c => c.customer_name.trim() && c.mobile_number.trim()).length} عميل`}
                  </Button>
                  <Button type="button" variant="outline" onClick={onCancel} className="hover-scale">
                    <X className="h-4 w-4 ml-2" />
                    إلغاء
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="sample" className="mt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  تم تعبئة النموذج ببيانات تجريبية. يمكنك تعديلها أو إضافة المزيد من العملاء.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {customers.map((customer, index) => (
                      <Card key={index} className="p-4 border-l-4 border-l-green-500">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">عميل رقم {index + 1}</h4>
                          {customers.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCustomerRow(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`customer_name_${index}`}>اسم العميل *</Label>
                            <Input
                              id={`customer_name_${index}`}
                              value={customer.customer_name}
                              onChange={(e) => updateCustomer(index, 'customer_name', e.target.value)}
                              placeholder="أدخل اسم العميل"
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`mobile_number_${index}`}>رقم الموبايل *</Label>
                            <Input
                              id={`mobile_number_${index}`}
                              value={customer.mobile_number}
                              onChange={(e) => updateCustomer(index, 'mobile_number', e.target.value)}
                              placeholder="أدخل رقم الموبايل"
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`line_type_${index}`}>نوع الخط</Label>
                            <Select 
                              value={customer.line_type} 
                              onValueChange={(value) => updateCustomer(index, 'line_type', value)}
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
                            <Label htmlFor={`charging_date_${index}`}>تاريخ الشحن</Label>
                            <Input
                              id={`charging_date_${index}`}
                              type="date"
                              value={customer.charging_date}
                              onChange={(e) => updateCustomer(index, 'charging_date', e.target.value)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`payment_status_${index}`}>حالة الدفع</Label>
                            <Select 
                              value={customer.payment_status} 
                              onValueChange={(value) => updateCustomer(index, 'payment_status', value)}
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
                            <Label htmlFor={`monthly_price_${index}`}>السعر الشهري</Label>
                            <Input
                              id={`monthly_price_${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              value={customer.monthly_price}
                              onChange={(e) => updateCustomer(index, 'monthly_price', e.target.value)}
                              placeholder="السعر بالجنيه"
                              className="text-right"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`renewal_status_${index}`}>حالة التجديد</Label>
                            <Select 
                              value={customer.renewal_status} 
                              onValueChange={(value) => updateCustomer(index, 'renewal_status', value)}
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
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex gap-4 justify-center pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addCustomerRow}
                      disabled={customers.length >= 20}
                      className="hover-scale"
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      إضافة عميل آخر
                    </Button>
                    <Button type="submit" disabled={loading} className="hover-scale">
                      <Save className="h-4 w-4 ml-2" />
                      {loading ? 'جاري الحفظ...' : `حفظ ${customers.filter(c => c.customer_name.trim() && c.mobile_number.trim()).length} عميل`}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} className="hover-scale">
                      <X className="h-4 w-4 ml-2" />
                      إلغاء
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};