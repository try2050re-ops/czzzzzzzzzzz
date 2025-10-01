/*
  # إضافة جداول ملاحظات المدير والأسماء المقترحة

  1. جداول جديدة
    - `admin_notes`
      - `id` (uuid, primary key)
      - `note_content` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `suggested_names`
      - `id` (uuid, primary key)
      - `mobile_number` (text, unique)
      - `suggested_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على الجدولين
    - إضافة سياسات للوصول العام للقراءة والكتابة
*/

-- إنشاء جدول ملاحظات المدير
CREATE TABLE IF NOT EXISTS admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  note_content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- إنشاء جدول الأسماء المقترحة
CREATE TABLE IF NOT EXISTS suggested_names (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_number text UNIQUE NOT NULL,
  suggested_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE admin_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggested_names ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول لجدول ملاحظات المدير
CREATE POLICY "Enable read access for all users" ON admin_notes FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON admin_notes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON admin_notes FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON admin_notes FOR DELETE TO public USING (true);

-- سياسات الوصول لجدول الأسماء المقترحة
CREATE POLICY "Enable read access for all users" ON suggested_names FOR SELECT TO public USING (true);
CREATE POLICY "Enable insert access for all users" ON suggested_names FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON suggested_names FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Enable delete access for all users" ON suggested_names FOR DELETE TO public USING (true);

-- إضافة trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_notes_updated_at BEFORE UPDATE ON admin_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suggested_names_updated_at BEFORE UPDATE ON suggested_names FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();