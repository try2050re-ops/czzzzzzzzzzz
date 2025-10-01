/*
  # إضافة حقل الملاحظات للعملاء

  1. تعديل الجدول
    - إضافة عمود `notes` (text, nullable) لحفظ ملاحظات المدير
  
  2. الأمان
    - الحقل متاح فقط للمدير وليس للمستخدمين العاديين
*/

-- إضافة عمود الملاحظات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE customers ADD COLUMN notes text;
  END IF;
END $$;