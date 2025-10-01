-- Create customers table for internet lines management
CREATE TABLE public.customers (
  id SERIAL PRIMARY KEY,
  customer_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  line_type TEXT NOT NULL DEFAULT '40',
  charging_date DATE,
  payment_status TEXT DEFAULT 'لم يدفع',
  monthly_price DECIMAL(10,2),
  renewal_status TEXT DEFAULT 'لم يتم',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a business management tool)
CREATE POLICY "Enable read access for all users" ON public.customers FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.customers FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.customers FOR DELETE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data from the Excel sheet
INSERT INTO public.customers (customer_name, mobile_number, line_type, charging_date, payment_status, monthly_price, renewal_status) VALUES
('abdelbary', '1146855881', '40', NULL, 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1142763305', '40', '2024-07-09', 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1142760196', '40', '2024-07-09', 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1142762605', '40', '2024-07-09', 'لم يدفع', NULL, 'لم يتم'),
('abo selem', '1142760434', '40', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('ahmed eldeeb', '1556796813', '40', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('ahmed eldeeb', '1142760352', '40', '2024-08-05', 'دفع', 2050, 'تم'),
('ahmed eldeeb', '1142762335', '40', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('ahmed eldeeb', '1159635875', '40', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('ahmed eldeeb', '1556842947', '40', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('ahmed eldeeb', '1142764116', '40', '2024-07-08', 'لم يدفع', NULL, 'لم يتم'),
('ahmed eldeeb', '1204610524', '40', '2024-07-04', 'لم يدفع', NULL, 'لم يتم'),
('ahmed fathy', '1142763433', '40', '2024-06-16', 'لم يدفع', NULL, 'لم يتم'),
('ahmed safan', '1142762249', '40', '2024-07-06', 'لم يدفع', NULL, 'لم يتم'),
('elmalah', '1142762397', '40', '2024-06-11', 'لم يدفع', NULL, 'لم يتم'),
('elpopos', '1556802934', '40', '2024-08-05', 'لم يدفع', NULL, 'تم'),
('gehad zawya', '1142760478', '40', '2024-07-12', 'لم يدفع', NULL, 'لم يتم'),
('mohammed ashraf zawya', '1157538703', '40', '2024-07-10', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1556792854', '40', '2024-06-06', 'لم يدفع', NULL, 'لم يتم'),
('mohmmed zawya', '1142762275', '40', '2024-07-11', 'لم يدفع', NULL, 'لم يتم'),
('naser zawya', '1556802693', '40', '2024-08-05', 'دفع', 150, 'تم'),
('naser zawya', '1142760213', '40', '2024-08-05', 'دفع', 250, 'تم'),
('', '1142763068', '40', '2024-08-15', 'لم يدفع', NULL, 'لم يتم');