/*
  # التأكد من وجود جدول العملاء مع الهيكل الصحيح

  1. إنشاء الجدول إذا لم يكن موجوداً
  2. إضافة الفهارس والقيود اللازمة
  3. تفعيل RLS
  4. إضافة السياسات الأمنية
*/

-- إنشاء جدول العملاء إذا لم يكن موجوداً
CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  mobile_number BIGINT UNIQUE NOT NULL,
  line_type INTEGER NOT NULL DEFAULT 40,
  charging_date DATE,
  payment_status TEXT NOT NULL DEFAULT 'لم يدفع',
  monthly_price DECIMAL(10,2),
  renewal_status TEXT NOT NULL DEFAULT 'لم يتم',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إنشاء فهرس على رقم الموبايل للبحث السريع
CREATE INDEX IF NOT EXISTS idx_customers_mobile_number ON customers(mobile_number);

-- إنشاء فهرس على اسم العميل للبحث السريع
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(customer_name);

-- تفعيل Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- حذف السياسات الموجودة إذا كانت موجودة
DROP POLICY IF EXISTS "Enable read access for all users" ON customers;
DROP POLICY IF EXISTS "Enable insert access for all users" ON customers;
DROP POLICY IF EXISTS "Enable update access for all users" ON customers;
DROP POLICY IF EXISTS "Enable delete access for all users" ON customers;

-- إضافة السياسات الأمنية
CREATE POLICY "Enable read access for all users"
  ON customers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Enable insert access for all users"
  ON customers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable update access for all users"
  ON customers
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete access for all users"
  ON customers
  FOR DELETE
  TO public
  USING (true);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث updated_at
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();