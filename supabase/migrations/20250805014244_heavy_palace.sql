/*
  # إنشاء جداول خطوط الإنترنت 20 و 60 ميجا

  1. جداول جديدة
    - `lines_20` - جدول خطوط 20 ميجا
    - `lines_60` - جدول خطوط 60 ميجا
    
  2. الحقول
    - `id` (رقم تسلسلي، مفتاح أساسي)
    - `customer_name` (اسم العميل)
    - `mobile_number` (رقم الموبايل)
    - `line_type` (نوع الخط - 20 أو 60)
    - `charging_date` (تاريخ الشحن)
    - `payment_status` (حالة الدفع)
    - `monthly_price` (السعر الشهري)
    - `renewal_status` (حالة التجديد)
    - `renewal_date` (معاد التجديد - جديد)
    - `days_until_renewal` (الأيام المتبقية للتجديد - محسوبة)
    - `is_renewal_due` (هل حان وقت التجديد - محسوبة)
    
  3. الأمان
    - تفعيل RLS على الجدولين
    - إضافة سياسات للوصول العام
    
  4. الوظائف
    - وظيفة لحساب الأيام المتبقية للتجديد
    - وظيفة لتحديث التواريخ تلقائياً
*/

-- إنشاء جدول خطوط 20 ميجا
CREATE TABLE IF NOT EXISTS public.lines_20 (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT '',
  mobile_number TEXT NOT NULL,
  line_type TEXT NOT NULL DEFAULT '20',
  charging_date DATE,
  payment_status TEXT DEFAULT 'لم يدفع',
  monthly_price DECIMAL(10,2),
  renewal_status TEXT DEFAULT 'لم يتم',
  renewal_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول خطوط 60 ميجا
CREATE TABLE IF NOT EXISTS public.lines_60 (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL DEFAULT '',
  mobile_number TEXT NOT NULL,
  line_type TEXT NOT NULL DEFAULT '60',
  charging_date DATE,
  payment_status TEXT DEFAULT 'لم يدفع',
  monthly_price DECIMAL(10,2),
  renewal_status TEXT DEFAULT 'لم يتم',
  renewal_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل Row Level Security
ALTER TABLE public.lines_20 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines_60 ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الوصول لجدول خطوط 20
CREATE POLICY "Enable read access for lines_20" ON public.lines_20 FOR SELECT USING (true);
CREATE POLICY "Enable insert access for lines_20" ON public.lines_20 FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for lines_20" ON public.lines_20 FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for lines_20" ON public.lines_20 FOR DELETE USING (true);

-- إنشاء سياسات الوصول لجدول خطوط 60
CREATE POLICY "Enable read access for lines_60" ON public.lines_60 FOR SELECT USING (true);
CREATE POLICY "Enable insert access for lines_60" ON public.lines_60 FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for lines_60" ON public.lines_60 FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for lines_60" ON public.lines_60 FOR DELETE USING (true);

-- إنشاء وظيفة لحساب معاد التجديد (تاريخ الشحن + 30 يوم)
CREATE OR REPLACE FUNCTION calculate_renewal_date(charging_date DATE)
RETURNS DATE AS $$
BEGIN
  IF charging_date IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN charging_date + INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إنشاء وظيفة لحساب الأيام المتبقية للتجديد
CREATE OR REPLACE FUNCTION days_until_renewal(renewal_date DATE)
RETURNS INTEGER AS $$
BEGIN
  IF renewal_date IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN (renewal_date - CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إنشاء trigger لتحديث معاد التجديد تلقائياً عند تغيير تاريخ الشحن
CREATE OR REPLACE FUNCTION update_renewal_date()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.charging_date IS NOT NULL THEN
    NEW.renewal_date = calculate_renewal_date(NEW.charging_date);
  ELSE
    NEW.renewal_date = NULL;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إضافة triggers للجدولين
CREATE TRIGGER update_lines_20_renewal_date
  BEFORE INSERT OR UPDATE ON public.lines_20
  FOR EACH ROW
  EXECUTE FUNCTION update_renewal_date();

CREATE TRIGGER update_lines_60_renewal_date
  BEFORE INSERT OR UPDATE ON public.lines_60
  FOR EACH ROW
  EXECUTE FUNCTION update_renewal_date();

-- إدراج بيانات خطوط 20 ميجا
INSERT INTO public.lines_20 (customer_name, mobile_number, line_type, charging_date, payment_status, monthly_price, renewal_status) VALUES
('ali essa', '1125394161', '20', '2024-08-03', 'دفع', 130, 'تم'),
('ali essa', '1556817248', '20', '2024-08-05', 'دفع', 130, 'تم'),
('anwar', '1501707481', '20', '2024-08-03', 'لم يدفع', 130, 'تم'),
('mohammed ashraf zawya', '1140359497', '20', '2024-07-05', 'دفع', 130, 'تم'),
('mohmmed zawya', '1126171143', '20', '2024-07-05', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1126171575', '20', '2024-06-04', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1140892070', '20', '2024-07-05', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1156818706', '20', '2024-07-05', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1156819299', '20', '2024-07-08', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1156819743', '20', '2024-07-06', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1501590518', '20', '2024-07-03', 'لم يدفع', NULL, 'لم يتم'),
('saeed zidan', '1140359689', '20', '2024-08-04', 'لم يدفع', NULL, 'تم'),
('saeed zidan', '1156818041', '20', '2024-07-29', 'دفع', 130, 'تم'),
('saeed zidan', '1140359597', '20', '2024-08-04', 'لم يدفع', NULL, 'تم'),
('saeed zidan', '1505642857', '20', '2024-08-04', 'لم يدفع', NULL, 'تم'),
('', '1500293204', '20', NULL, 'لم يدفع', NULL, 'لم يتم'),
('', '1158142153', '20', '2024-07-05', 'لم يدفع', NULL, 'لم يتم'),
('', '1500468535', '20', '2024-07-05', 'لم يدفع', NULL, 'لم يتم'),
('', '1501877831', '20', '2024-07-05', 'لم يدفع', NULL, 'لم يتم'),
('', '1556528731', '20', '2024-07-05', 'لم يدفع', NULL, 'لم يتم');

-- إدراج بيانات خطوط 60 ميجا
INSERT INTO public.lines_60 (customer_name, mobile_number, line_type, charging_date, payment_status, monthly_price, renewal_status) VALUES
('7ossam', '1119022947', '60', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('7ossam', '1125727842', '60', '2024-08-05', 'دفع', 275, 'تم'),
('7ossam', '1148615687', '60', '2024-08-01', 'دفع', 275, 'تم'),
('abo selem', '1507708813', '60', '2024-07-30', 'لم يدفع', NULL, 'تم'),
('abo selem', '1507708821', '60', '2024-07-29', 'لم يدفع', NULL, 'تم'),
('abo selem', '1507708873', '60', '2024-07-30', 'لم يدفع', NULL, 'تم'),
('abo selem', '1507708875', '60', '2024-07-30', 'لم يدفع', NULL, 'تم'),
('abo selem', '1508808871', '60', '2024-07-29', 'لم يدفع', NULL, 'تم'),
('abo selem', '1148340194', '60', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('abo selem', '1159210913', '60', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('abo selem', '1125702327', '60', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('abo selem', '1501900772', '60', '2024-08-31', 'لم يدفع', NULL, 'تم'),
('abo selem', '1501700688', '60', '2024-08-24', 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1108958468', '60', NULL, 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1156361393', '60', NULL, 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1148487150', '60', NULL, 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1140875800', '60', '2024-08-03', 'لم يدفع', NULL, 'تم'),
('ahmed eldeeb', '1149904862', '60', '2024-07-30', 'لم يدفع', NULL, 'تم'),
('ahmed eldeeb', '1149923028', '60', '2024-07-30', 'لم يدفع', NULL, 'تم'),
('ahmed fathy', '1204612682', '60', '2024-07-09', 'لم يدفع', NULL, 'لم يتم'),
('ahmed fathy', '1204613238', '60', '2024-07-09', 'لم يدفع', NULL, 'لم يتم'),
('ahmed fathy', '1149126459', '60', '2024-07-29', 'لم يدفع', NULL, 'لم يتم'),
('ahmed fathy', '1149126591', '60', '2024-07-29', 'لم يدفع', NULL, 'لم يتم'),
('ahmed fathy', '1100639707', '60', '2024-07-29', 'لم يدفع', NULL, 'لم يتم'),
('hamada zalabany', '1507708849', '60', '2024-07-24', 'لم يدفع', NULL, 'لم يتم'),
('hosam sallam', '1125667581', '60', '2024-07-06', 'لم يدفع', NULL, 'لم يتم'),
('mbadr', '1204612686', '60', '2024-07-09', 'لم يدفع', NULL, 'لم يتم'),
('mohammed magdy', '1220341335', '60', '2024-07-09', 'لم يدفع', NULL, 'لم يتم'),
('mohammed magdy', '1501900667', '60', '2024-07-29', 'دفع', NULL, 'تم'),
('mohammed magdy', '1148342935', '60', '2024-07-06', 'لم يدفع', NULL, 'لم يتم'),
('mohammed zawya', '1159513703', '60', '2024-07-06', 'لم يدفع', NULL, 'لم يتم'),
('saeed zidan', '1508804088', '60', '2024-07-30', 'لم يدفع', NULL, 'تم'),
('sameh saeed', '1501700664', '60', '2024-07-29', 'لم يدفع', NULL, 'تم'),
('mohammed taha', '1156982564', '60', '2024-08-01', 'دفع', 250, 'تم');

-- إنشاء view لعرض البيانات مع الحسابات
CREATE OR REPLACE VIEW public.lines_20_with_calculations AS
SELECT 
  *,
  days_until_renewal(renewal_date) as days_until_renewal,
  CASE 
    WHEN renewal_date IS NULL THEN false
    WHEN days_until_renewal(renewal_date) <= 3 THEN true
    ELSE false
  END as is_renewal_due
FROM public.lines_20;

CREATE OR REPLACE VIEW public.lines_60_with_calculations AS
SELECT 
  *,
  days_until_renewal(renewal_date) as days_until_renewal,
  CASE 
    WHEN renewal_date IS NULL THEN false
    WHEN days_until_renewal(renewal_date) <= 3 THEN true
    ELSE false
  END as is_renewal_due
FROM public.lines_60;