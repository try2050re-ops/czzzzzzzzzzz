/*
  # إضافة عمود وقت وصول الخط

  1. تحديثات
    - إضافة عمود arrival_time إلى جدول customers
    - إضافة عمود provider إلى جدول customers  
    - إضافة عمود ownership إلى جدول customers
    
  2. الأمان
    - تحديث السياسات الموجودة
*/

-- إضافة الأعمدة المطلوبة إذا لم تكن موجودة
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'arrival_time'
  ) THEN
    ALTER TABLE customers ADD COLUMN arrival_time DATE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'provider'
  ) THEN
    ALTER TABLE customers ADD COLUMN provider TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'ownership'
  ) THEN
    ALTER TABLE customers ADD COLUMN ownership TEXT;
  END IF;
END $$;