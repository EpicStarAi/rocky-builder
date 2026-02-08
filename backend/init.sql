-- ROCKY BUILDER Database Schema
-- PostgreSQL 16+ with JSONB support

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- для швидкого пошуку

-- ============================================
-- ДЖЕРЕЛА ДАНИХ (сайти-постачальники)
-- ============================================
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  base_url VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  sync_interval_minutes INT DEFAULT 360,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Початкові джерела
INSERT INTO sources (name, base_url) VALUES
  ('akm', 'https://akm.kiev.ua'),
  ('ac_rocky', 'https://www.ac-rocky.ua'),
  ('domfasad', 'https://domfasad.com.ua');

-- ============================================
-- КАТЕГОРІЇ ТОВАРІВ (уніфіковані)
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name_ua VARCHAR(255) NOT NULL,
  name_ru VARCHAR(255),
  description_ua TEXT,
  description_ru TEXT,
  image_url VARCHAR(500),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  seo_title_ua VARCHAR(255),
  seo_title_ru VARCHAR(255),
  seo_description_ua TEXT,
  seo_description_ru TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Індекс для ієрархії
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Основні категорії
INSERT INTO categories (slug, name_ua, name_ru, sort_order) VALUES
  ('pokrivlya', 'Покрівля', 'Кровля', 1),
  ('fasad', 'Фасад', 'Фасад', 2),
  ('termoizolatsiya', 'Теплоізоляція', 'Теплоизоляция', 3),
  ('vodostok', 'Водостічні системи', 'Водосточные системы', 4);

-- ============================================
-- ТОВАРИ (основна таблиця)
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(500) UNIQUE NOT NULL,
  sku VARCHAR(100),
  name_ua VARCHAR(500) NOT NULL,
  name_ru VARCHAR(500),
  description_ua TEXT,
  description_ru TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand VARCHAR(255),
  base_price DECIMAL(12,2),
  old_price DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'UAH',
  unit VARCHAR(50) DEFAULT 'шт',
  in_stock BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  is_moderated BOOLEAN DEFAULT false,
  weight_kg DECIMAL(8,3),
  attributes JSONB DEFAULT '{}',
  seo_title_ua VARCHAR(255),
  seo_title_ru VARCHAR(255),
  seo_description_ua TEXT,
  seo_description_ru TEXT,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Індекси для продуктивності
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_active ON products(is_active, is_moderated);
CREATE INDEX idx_products_price ON products(base_price);
CREATE INDEX idx_products_attributes ON products USING GIN(attributes);
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('ukrainian', name_ua || ' ' || COALESCE(description_ua, '')));

-- ============================================
-- ЗВ'ЯЗОК ТОВАРІВ З ДЖЕРЕЛАМИ (M:N)
-- ============================================
CREATE TABLE product_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  external_id VARCHAR(255),
  external_url VARCHAR(500),
  external_price DECIMAL(12,2),
  external_name VARCHAR(500),
  raw_data JSONB,
  last_scraped_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(source_id, external_id)
);

CREATE INDEX idx_product_sources_product ON product_sources(product_id);
CREATE INDEX idx_product_sources_source ON product_sources(source_id);

-- ============================================
-- ЗОБРАЖЕННЯ ТОВАРІВ
-- ============================================
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  width INT,
  height INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- ============================================
-- ІСТОРІЯ ЦІН
-- ============================================
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id),
  price DECIMAL(12,2) NOT NULL,
  recorded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_price_history_product ON price_history(product_id, recorded_at DESC);

-- ============================================
-- КОРИСТУВАЧІ
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  account_type VARCHAR(20) DEFAULT 'individual',
  company_id UUID,
  role_in_company VARCHAR(20),
  preferred_language VARCHAR(2) DEFAULT 'ua',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- ============================================
-- КОМПАНІЇ (B2B)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_name VARCHAR(255) NOT NULL,
  trade_name VARCHAR(255),
  edrpou VARCHAR(10),
  ipn VARCHAR(12),
  company_type VARCHAR(10),
  credit_limit DECIMAL(12,2) DEFAULT 0,
  payment_terms_days INT DEFAULT 0,
  discount_tier VARCHAR(20) DEFAULT 'standard',
  manager_user_id UUID REFERENCES users(id),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Зворотний зв'язок
ALTER TABLE users ADD CONSTRAINT fk_users_company 
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ============================================
-- АДРЕСИ
-- ============================================
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  label VARCHAR(100),
  city VARCHAR(100),
  region VARCHAR(100),
  street VARCHAR(255),
  building VARCHAR(20),
  apartment VARCHAR(20),
  postal_code VARCHAR(10),
  nova_poshta_ref VARCHAR(36),
  is_default BOOLEAN DEFAULT false,
  contact_name VARCHAR(200),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================
-- ЗАМОВЛЕННЯ
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id),
  company_id UUID REFERENCES companies(id),
  status VARCHAR(30) DEFAULT 'new',
  subtotal DECIMAL(12,2),
  discount_amount DECIMAL(12,2) DEFAULT 0,
  shipping_cost DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2),
  payment_method VARCHAR(30),
  payment_status VARCHAR(20) DEFAULT 'pending',
  delivery_method VARCHAR(30),
  delivery_address_id UUID REFERENCES addresses(id),
  nova_poshta_ttn VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================
-- ПОЗИЦІЇ ЗАМОВЛЕННЯ
-- ============================================
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity DECIMAL(10,3),
  unit_price DECIMAL(12,2),
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ============================================
-- СИСТЕМА ЗНИЖОК
-- ============================================
CREATE TABLE discount_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,2),
  max_discount_amount DECIMAL(12,2),
  min_order_value DECIMAL(12,2),
  min_quantity INT,
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,
  is_stackable BOOLEAN DEFAULT false,
  usage_limit INT,
  usage_per_user INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ПРОМОКОДИ
-- ============================================
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_rule_id UUID REFERENCES discount_rules(id),
  is_single_use BOOLEAN DEFAULT false,
  total_usage_limit INT,
  current_usage_count INT DEFAULT 0,
  valid_from TIMESTAMP,
  valid_to TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);

-- ============================================
-- ЛОЯЛЬНІСТЬ
-- ============================================
CREATE TABLE loyalty_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) UNIQUE,
  points_balance INT DEFAULT 0,
  tier VARCHAR(20) DEFAULT 'standard',
  lifetime_points INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loyalty_account_id UUID REFERENCES loyalty_accounts(id),
  transaction_type VARCHAR(10) NOT NULL,
  points INT NOT NULL,
  order_id UUID REFERENCES orders(id),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- ============================================
-- ФУНКЦІЇ ТА ТРИГЕРИ
-- ============================================

-- Автооновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Генерація order_number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := 'RB' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================
-- ДАНІ ДЛЯ ТЕСТУВАННЯ
-- ============================================

-- Тестовий користувач
INSERT INTO users (email, phone, first_name, last_name, password_hash, email_verified)
VALUES ('test@rocky-builder.ua', '+380501234567', 'Тест', 'Користувач', 
        '$2b$10$8K1p/a0dL3.I8.F9.9E0kuYqDuuNfDMcPYjZJ1kX5kU8JUjZJUjZJ', true);

COMMENT ON TABLE products IS 'Каталог товарів ROCKY BUILDER';
COMMENT ON TABLE product_sources IS 'Зв''язок товарів з джерелами (akm, ac_rocky, domfasad)';
COMMENT ON COLUMN products.attributes IS 'Гнучкі атрибути у форматі JSONB: {thickness_mm: 0.5, coating: "матовий"}';
