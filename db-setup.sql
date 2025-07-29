-- JSS Database Setup Script
-- Run this script to create all required tables

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gst_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    gst_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    unit VARCHAR(50) DEFAULT 'sqft',
    default_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create deliveries table (enhanced)
CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,
    slip_number VARCHAR(100) NOT NULL UNIQUE,
    date DATE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(255),
    vendor_id INTEGER REFERENCES vendors(id),
    vendor_name VARCHAR(255),
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255),
    length_ft DECIMAL(10,2),
    width_ft DECIMAL(10,2),
    total_sqft DECIMAL(10,2),
    rate DECIMAL(10,2),
    total_amount DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments table for tracking payments made
CREATE TABLE IF NOT EXISTS payments_made (
    id SERIAL PRIMARY KEY,
    payment_date DATE NOT NULL,
    payment_type VARCHAR(50) NOT NULL, -- 'vendor', 'customer', 'expense'
    party_id INTEGER, -- vendor_id, customer_id, or null for expenses
    party_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'bank', 'cheque', 'online'
    reference_number VARCHAR(255),
    bank_account VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create payments received table for tracking payments received
CREATE TABLE IF NOT EXISTS payments_received (
    id SERIAL PRIMARY KEY,
    payment_date DATE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- 'cash', 'bank', 'cheque', 'online'
    reference_number VARCHAR(255),
    bank_source VARCHAR(255),
    invoice_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for customers
INSERT INTO customers (name, contact_person, phone, email, address) VALUES
('ABC Construction', 'Rajesh Kumar', '9876543210', 'rajesh@abc.com', '123 Main Street, Delhi'),
('XYZ Builders', 'Priya Sharma', '9876543211', 'priya@xyz.com', '456 Park Avenue, Mumbai'),
('Cash Customer', 'Walk-in', '0000000000', '', 'Various Locations'),
('PQR Developers', 'Amit Singh', '9876543212', 'amit@pqr.com', '789 Business District, Bangalore')
ON CONFLICT DO NOTHING;

-- Insert sample data for vendors
INSERT INTO vendors (name, contact_person, phone, email, address) VALUES
('Steel Suppliers Ltd', 'Mohan Das', '9876543220', 'mohan@steel.com', '321 Industrial Area, Gurgaon'),
('Marble World', 'Sunita Devi', '9876543221', 'sunita@marble.com', '654 Stone Market, Jaipur'),
('Cash Vendor', 'Retail Purchase', '0000000000', '', 'Various Suppliers'),
('Granite Plus', 'Vikram Gupta', '9876543222', 'vikram@granite.com', '987 Quarry Road, Udaipur')
ON CONFLICT DO NOTHING;

-- Insert sample data for products
INSERT INTO products (name, description, unit, default_rate) VALUES
('Marble Flooring', 'Premium quality marble for flooring', 'sqft', 150.00),
('Granite Countertop', 'Polished granite for kitchen countertops', 'sqft', 200.00),
('Ceramic Tiles', 'Standard ceramic tiles for walls and floors', 'sqft', 80.00),
('Natural Stone', 'Various natural stone products', 'sqft', 120.00),
('Quartz Surface', 'Engineered quartz for premium applications', 'sqft', 250.00)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON deliveries(date);
CREATE INDEX IF NOT EXISTS idx_deliveries_customer ON deliveries(customer_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_vendor ON deliveries(vendor_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_product ON deliveries(product_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_slip ON deliveries(slip_number);

CREATE INDEX IF NOT EXISTS idx_payments_made_date ON payments_made(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_made_type ON payments_made(payment_type);

CREATE INDEX IF NOT EXISTS idx_payments_received_date ON payments_received(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_received_customer ON payments_received(customer_id);

-- Create a view for delivery summary with all related information
CREATE OR REPLACE VIEW delivery_summary AS
SELECT 
    d.id,
    d.slip_number,
    d.date,
    d.customer_id,
    d.customer_name,
    d.vendor_id,
    d.vendor_name,
    d.product_id,
    d.product_name,
    d.length_ft,
    d.width_ft,
    d.total_sqft,
    d.rate,
    d.total_amount,
    d.notes,
    c.phone as customer_phone,
    c.email as customer_email,
    v.phone as vendor_phone,
    v.email as vendor_email,
    p.unit as product_unit
FROM deliveries d
LEFT JOIN customers c ON d.customer_id = c.id
LEFT JOIN vendors v ON d.vendor_id = v.id
LEFT JOIN products p ON d.product_id = p.id;

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

