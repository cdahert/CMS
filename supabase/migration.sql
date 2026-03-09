-- GenioX Commerce Platform - Complete Database Schema
-- 18 tables with RLS, 4 SECURITY DEFINER functions, enums, triggers, and seed data

-- =============================================
-- 1. ENUMS
-- =============================================
CREATE TYPE app_role AS ENUM ('admin', 'commerce');
CREATE TYPE commerce_plan AS ENUM ('inicial', 'silver', 'gold', 'premium');

-- =============================================
-- 2. SECURITY DEFINER FUNCTIONS
-- =============================================

-- Function 1: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$;

-- Function 2: is_commerce_member
CREATE OR REPLACE FUNCTION public.is_commerce_member(_user_id uuid, _commerce_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.commerce_members
    WHERE user_id = _user_id AND commerce_id = _commerce_id
  );
END;
$$;

-- Function 3: handle_new_user (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'email', NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$;

-- Function 4: check_stock_and_deactivate (trigger function)
CREATE OR REPLACE FUNCTION public.check_stock_and_deactivate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.stock = 0 THEN
    NEW.active := false;
  END IF;
  RETURN NEW;
END;
$$;

-- =============================================
-- 3. TABLES (18 total)
-- =============================================

-- Table 1: profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Table 2: user_roles
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Table 3: commerces
CREATE TABLE public.commerces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  ruc text,
  email text,
  phone text,
  address text,
  logo_url text,
  plan commerce_plan DEFAULT 'inicial',
  owner_id uuid REFERENCES auth.users(id),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.commerces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all commerces" ON public.commerces
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view their commerce" ON public.commerces
  FOR SELECT USING (public.is_commerce_member(auth.uid(), id));

CREATE POLICY "Owner can update own commerce" ON public.commerces
  FOR UPDATE USING (auth.uid() = owner_id);

-- Table 4: commerce_members
CREATE TABLE public.commerce_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id uuid NOT NULL REFERENCES public.commerces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'viewer',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.commerce_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all members" ON public.commerce_members
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view co-members" ON public.commerce_members
  FOR SELECT USING (public.is_commerce_member(auth.uid(), commerce_id));

-- Table 5: commission_matrix
CREATE TABLE public.commission_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan commerce_plan NOT NULL,
  label text,
  commission_initial numeric DEFAULT 0,
  is_fixed boolean DEFAULT false,
  growth_discount numeric DEFAULT 0,
  management_discount numeric DEFAULT 0,
  communication_discount numeric DEFAULT 0,
  shipping_discount numeric DEFAULT 0,
  shipping_fixed numeric DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.commission_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage commission matrix" ON public.commission_matrix
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated can view commission matrix" ON public.commission_matrix
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Table 6: commission_matrix_history
CREATE TABLE public.commission_matrix_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matrix_id uuid REFERENCES public.commission_matrix(id) ON DELETE CASCADE,
  plan commerce_plan NOT NULL,
  field_changed text,
  old_value text,
  new_value text,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);
ALTER TABLE public.commission_matrix_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin only on commission history" ON public.commission_matrix_history
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Table 7: products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id uuid NOT NULL REFERENCES public.commerces(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text,
  description text,
  category text,
  image_url text,
  stock integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 5,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all products" ON public.products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can manage commerce products" ON public.products
  FOR ALL USING (public.is_commerce_member(auth.uid(), commerce_id));

-- Trigger for stock deactivation
CREATE TRIGGER trigger_check_stock_and_deactivate
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.check_stock_and_deactivate();

-- Table 8: prices
CREATE TABLE public.prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text DEFAULT 'BOB',
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all prices" ON public.prices
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can manage commerce prices" ON public.prices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_id
      AND public.is_commerce_member(auth.uid(), p.commerce_id)
    )
  );

-- Table 9: inventory_movements
CREATE TABLE public.inventory_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  commerce_id uuid NOT NULL REFERENCES public.commerces(id) ON DELETE CASCADE,
  quantity_change integer NOT NULL,
  stock_after integer NOT NULL,
  reason text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all inventory movements" ON public.inventory_movements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can insert and view movements" ON public.inventory_movements
  FOR SELECT USING (public.is_commerce_member(auth.uid(), commerce_id));

CREATE POLICY "Members can create movements" ON public.inventory_movements
  FOR INSERT WITH CHECK (public.is_commerce_member(auth.uid(), commerce_id));

-- Table 10: offers
CREATE TABLE public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id uuid REFERENCES public.commerces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  discount_type text DEFAULT 'percentage',
  discount_value numeric NOT NULL,
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  promo_code text,
  max_uses integer,
  active boolean DEFAULT true,
  is_multi_commerce boolean DEFAULT false,
  single_use_per_customer boolean DEFAULT false,
  categories text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all offers" ON public.offers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can manage commerce offers" ON public.offers
  FOR ALL USING (
    commerce_id IS NOT NULL AND public.is_commerce_member(auth.uid(), commerce_id)
  );

CREATE POLICY "Members can view global offers" ON public.offers
  FOR SELECT USING (commerce_id IS NULL AND auth.uid() IS NOT NULL);

-- Table 11: offer_products
CREATE TABLE public.offer_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE
);
ALTER TABLE public.offer_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage offer products" ON public.offer_products
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can manage offer products" ON public.offer_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.offers o
      WHERE o.id = offer_id
      AND o.commerce_id IS NOT NULL
      AND public.is_commerce_member(auth.uid(), o.commerce_id)
    )
  );

-- Table 12: offer_commerces
CREATE TABLE public.offer_commerces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  commerce_id uuid NOT NULL REFERENCES public.commerces(id) ON DELETE CASCADE
);
ALTER TABLE public.offer_commerces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage offer commerces" ON public.offer_commerces
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view offer commerces" ON public.offer_commerces
  FOR SELECT USING (public.is_commerce_member(auth.uid(), commerce_id));

-- Table 13: offer_redemptions
CREATE TABLE public.offer_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id uuid NOT NULL REFERENCES public.offers(id) ON DELETE CASCADE,
  commerce_id uuid NOT NULL REFERENCES public.commerces(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  redeemed_at timestamptz DEFAULT now()
);
ALTER TABLE public.offer_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all redemptions" ON public.offer_redemptions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can manage commerce redemptions" ON public.offer_redemptions
  FOR ALL USING (public.is_commerce_member(auth.uid(), commerce_id));

-- Table 14: bundles
CREATE TABLE public.bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id uuid NOT NULL REFERENCES public.commerces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all bundles" ON public.bundles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can manage commerce bundles" ON public.bundles
  FOR ALL USING (public.is_commerce_member(auth.uid(), commerce_id));

-- Table 15: bundle_items
CREATE TABLE public.bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id uuid NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1
);
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all bundle items" ON public.bundle_items
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can manage bundle items" ON public.bundle_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.bundles b
      WHERE b.id = bundle_id
      AND public.is_commerce_member(auth.uid(), b.commerce_id)
    )
  );

-- Table 16: settlements
CREATE TABLE public.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id uuid NOT NULL REFERENCES public.commerces(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_sales numeric DEFAULT 0,
  commission_rate numeric DEFAULT 0,
  growth_discount numeric DEFAULT 0,
  management_discount numeric DEFAULT 0,
  communication_discount numeric DEFAULT 0,
  final_commission_rate numeric DEFAULT 0,
  commission_amount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  net_payable numeric DEFAULT 0,
  status text DEFAULT 'pending',
  notes text,
  created_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all settlements" ON public.settlements
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Members can view commerce settlements" ON public.settlements
  FOR SELECT USING (public.is_commerce_member(auth.uid(), commerce_id));

-- Table 17: activity_log
CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  commerce_id uuid REFERENCES public.commerces(id) ON DELETE SET NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all activity logs" ON public.activity_log
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own activity" ON public.activity_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activity" ON public.activity_log
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Table 18: blog_posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content jsonb NOT NULL,
  excerpt text,
  cover_image_url text,
  category text NOT NULL,
  tags text[] DEFAULT '{}',
  author_id uuid NOT NULL REFERENCES auth.users(id),
  published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage all blog posts" ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view published posts" ON public.blog_posts
  FOR SELECT USING (published = true);

-- =============================================
-- 4. TRIGGERS
-- =============================================

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 5. SEED DATA - Commission Matrix
-- =============================================

INSERT INTO public.commission_matrix (plan, label, commission_initial, is_fixed, growth_discount, management_discount, communication_discount, shipping_discount, shipping_fixed)
VALUES
  ('inicial', 'Plan Inicial', 0.25, false, 0, 0, 0, 0, 0),
  ('silver', 'Plan Silver', 0.22, false, 0.01, 0.01, 0.005, 0.005, 0),
  ('gold', 'Plan Gold', 0.18, false, 0.02, 0.02, 0.01, 0.01, 0),
  ('premium', 'Plan Premium', 0.15, false, 0.03, 0.03, 0.02, 0.02, 0);

-- =============================================
-- 6. STORAGE BUCKETS
-- =============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('commerces', 'commerces', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);

-- Storage policies
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view commerce logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'commerces');

CREATE POLICY "Authenticated users can upload commerce logos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'commerces' AND auth.uid() IS NOT NULL);

CREATE POLICY "Public can view blog images" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog');

CREATE POLICY "Admin can upload blog images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog' AND auth.uid() IS NOT NULL);
