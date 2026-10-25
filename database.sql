-- ============================================================
-- ELITE MOTORS - BASE DE DATOS ESTRUCTURADA (SQL DDL & DML)
-- Compatible con PostgreSQL, MySQL y SQLite
-- ============================================================

-- 1. TABLA DE VEHÍCULOS (CATÁLOGO & COLECCIÓN)
CREATE TABLE IF NOT EXISTS cars (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  brand VARCHAR(64) NOT NULL,
  model VARCHAR(64) NOT NULL,
  year INT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  origin VARCHAR(32) NOT NULL,
  engine VARCHAR(128) NOT NULL,
  horsepower INT NOT NULL,
  torque INT NOT NULL,
  acceleration DECIMAL(4, 2) NOT NULL,
  top_speed INT NOT NULL,
  transmission VARCHAR(64) NOT NULL,
  drivetrain VARCHAR(32) NOT NULL,
  mileage INT NOT NULL,
  exterior_color VARCHAR(64) NOT NULL,
  interior_color VARCHAR(64) NOT NULL,
  vin VARCHAR(64) UNIQUE NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE USUARIOS & CLIENTES VIP
CREATE TABLE IF NOT EXISTS users (
  uid VARCHAR(64) PRIMARY KEY,
  display_name VARCHAR(128) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  phone VARCHAR(32),
  tier VARCHAR(64) DEFAULT 'VIP Client',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA DE FACTURAS PROFORMA & PAGOS DE APARTADO
CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  invoice_number VARCHAR(64) UNIQUE NOT NULL,
  date VARCHAR(64) NOT NULL,
  due_date VARCHAR(64) NOT NULL,
  buyer_name VARCHAR(128) NOT NULL,
  buyer_doc VARCHAR(64) NOT NULL,
  buyer_email VARCHAR(128) NOT NULL,
  buyer_address TEXT NOT NULL,
  car_name VARCHAR(128) NOT NULL,
  car_vin VARCHAR(64) NOT NULL,
  car_brand VARCHAR(64) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  deposit_paid DECIMAL(12, 2) NOT NULL,
  balance_due DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(128) NOT NULL,
  tax_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(64) DEFAULT 'Depósito Pagado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA DE ÓRDENES Y AUDITORÍA DE COMPRADORES EN FIREBASE STUDIOS
CREATE TABLE IF NOT EXISTS orders (
  order_id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(128) NOT NULL,
  customer_email VARCHAR(128) NOT NULL,
  customer_phone VARCHAR(32) NOT NULL,
  car_id VARCHAR(64) NOT NULL,
  car_name VARCHAR(128) NOT NULL,
  car_brand VARCHAR(64) NOT NULL,
  car_price DECIMAL(12, 2) NOT NULL,
  deposit_amount DECIMAL(12, 2) NOT NULL,
  payment_method VARCHAR(128) NOT NULL,
  reservation_code VARCHAR(64) NOT NULL,
  invoice_number VARCHAR(64) NOT NULL,
  buyer_evaluation_status VARCHAR(64) DEFAULT 'Verificado Aprobado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id)
);

-- INSERCIÓN DE DATOS INICIALES (CATÁLOGO DE SUPERDEPORTIVOS)
INSERT INTO cars (id, name, brand, model, year, price, origin, engine, horsepower, torque, acceleration, top_speed, transmission, drivetrain, mileage, exterior_color, interior_color, vin, in_stock, featured)
VALUES
('nissan-gtr-r34', 'Nissan Skyline GT-R V-Spec II (R34)', 'Nissan', 'Skyline GT-R R34', 2002, 185000.00, 'jdm', '2.6L Twin-Turbo RB26DETT', 327, 392, 4.6, 265, 'Manual Getrag 6 Velocidades', 'AWD', 28400, 'Midnight Purple III', 'Negro con Costuras Rojas', 'BNR34-402819', TRUE, TRUE),
('toyota-supra-mk4', 'Toyota Supra RZ Twin-Turbo (A80 MK4)', 'Toyota', 'Supra RZ Turbo', 1998, 145000.00, 'jdm', '3.0L Twin-Turbo 2JZ-GTE', 330, 451, 4.7, 250, 'Manual V160 6 Velocidades', 'RWD', 39500, 'Liquid Silver Metallic', 'Cuero Negro Deportivo', 'JZA80-008124', TRUE, FALSE),
('ford-mustang-shelby-gt500', 'Ford Mustang Shelby GT500 Predator', 'Ford', 'Shelby GT500', 2022, 118000.00, 'american', '5.2L V8 Supercharged Predator', 760, 847, 3.4, 290, 'Tremec Doble Embrague 7 Vel', 'RWD', 12800, 'Tungsten Grey Metallic', 'Cuero Ebony Recaro', '1FA6P8SJ4N550189', TRUE, TRUE),
('dodge-challenger-hellcat', 'Dodge Challenger SRT Hellcat Redeye', 'Dodge', 'Challenger SRT Redeye', 2023, 105000.00, 'american', '6.2L HEMI V8 Supercharged', 797, 959, 3.6, 326, 'TorqueFlite 8 Velocidades', 'RWD', 8200, 'TorRed', 'Cuero Laguna Negro', '2C3CDZL97PH618902', TRUE, FALSE),
('porsche-911-turbo-s', 'Porsche 911 Turbo S (Generación 992)', 'Porsche', '911 Turbo S', 2023, 238000.00, 'european', '3.8L Boxer 6 Cilindros Biturbo', 650, 800, 2.7, 330, 'PDK 8 Velocidades', 'AWD', 9400, 'Chalk Grey (Crayon)', 'Cuero Bitono Negro / Burdeos', 'WP0AD2A98PS251904', TRUE, TRUE),
('bmw-m3-e46', 'BMW M3 Coupe (Generación E46)', 'BMW', 'M3 E46', 2004, 79000.00, 'european', '3.2L Atmosférico S54B32', 343, 365, 5.1, 250, 'Manual 6 Velocidades', 'RWD', 54000, 'Laguna Seca Blue', 'Cuero Nappa Gris', 'WBABL91070JR90124', TRUE, FALSE),
('ferrari-458-italia', 'Ferrari 458 Italia', 'Ferrari', '458 Italia', 2014, 245000.00, 'italian', '4.5L V8 Atmosférico', 570, 540, 3.4, 325, 'F1 Doble Embrague 7 Vel', 'RWD', 16900, 'Rosso Corsa', 'Cuero Crema con Costuras Rojas', 'ZFF68NHA7E0198240', TRUE, TRUE),
('lamborghini-huracan-evo', 'Lamborghini Huracán EVO LP 640-4', 'Lamborghini', 'Huracán EVO', 2022, 285000.00, 'italian', '5.2L V10 Atmosférico', 640, 600, 2.9, 325, 'LDF Doble Embrague 7 Vel', 'AWD', 7100, 'Verde Mantis', 'Alcántara Nero Ade', 'ZHWE22ZF1NLA14902', TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- INSERCIÓN DE FACTURAS PROFORMA
INSERT INTO invoices (id, invoice_number, date, due_date, buyer_name, buyer_doc, buyer_email, buyer_address, car_name, car_vin, car_brand, total_price, deposit_paid, balance_due, payment_method, tax_amount, status)
VALUES
('inv-init-1', 'INV-2026-88120', '02 Octubre 2026', '09 Octubre 2026', 'Alexander Von Roth', 'CH-892014-Z', 'roth.holdings@geneva-capital.ch', 'Rue du Rhône 42, 1204 Ginebra, Suiza', 'Nissan Skyline GT-R V-Spec II (R34)', 'BNR34-402819', 'Nissan', 185000.00, 1500.00, 183500.00, 'Transferencia Bancaria Internacional SWIFT', 38850.00, 'Depósito Pagado'),
('inv-init-2', 'INV-2026-77341', '28 Septiembre 2026', '05 Octubre 2026', 'Beatriz Montero de Alba', 'ES-09248102B', 'b.montero@luxurylaw.es', 'Calle de Velázquez 88, 28001 Madrid, España', 'Porsche 911 Turbo S (Generación 992)', 'WP0AD2A98PS251904', 'Porsche', 238000.00, 1500.00, 236500.00, 'Tarjeta Bancaria Concierge', 49980.00, 'Depósito Pagado')
ON CONFLICT (id) DO NOTHING;
