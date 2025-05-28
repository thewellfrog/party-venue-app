-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Core venue information with parent-focused fields
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  venue_type TEXT[], -- ['soft_play', 'bowling', 'trampoline', etc.]
  
  -- Location data
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  borough TEXT, -- For London venues (Hackney, Camden, etc.)
  county TEXT,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'UK',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  booking_link TEXT,
  
  -- Critical parent info
  parking_info TEXT, -- "Free parking for 50 cars" or "Street parking only"
  parking_free BOOLEAN,
  wheelchair_accessible BOOLEAN,
  baby_changing BOOLEAN,
  
  -- Capacity and space
  max_children INTEGER,
  max_adults INTEGER,
  private_party_room BOOLEAN,
  exclusive_hire_available BOOLEAN,
  simultaneous_parties BOOLEAN, -- Other parties at same time?
  
  -- Age suitability
  min_age INTEGER,
  max_age INTEGER,
  age_groups TEXT[], -- ['toddler', 'preschool', 'primary', 'tween']
  
  -- Safety and staff
  staff_dbs_checked BOOLEAN,
  first_aid_trained BOOLEAN,
  safety_certifications TEXT[],
  staff_ratio TEXT, -- "1:8 for under 5s"
  
  -- Food and catering
  food_provided BOOLEAN,
  outside_food_allowed BOOLEAN,
  allergy_accommodations BOOLEAN,
  allergy_info TEXT,
  halal_options BOOLEAN,
  vegetarian_options BOOLEAN,
  
  -- Parent amenities
  parent_seating_area BOOLEAN,
  cafe_onsite BOOLEAN,
  wifi_available BOOLEAN,
  viewing_area BOOLEAN,
  adults_must_stay BOOLEAN, -- For younger kids
  
  -- Media
  images TEXT[],
  featured_image TEXT,
  
  -- Business hours
  opening_hours JSONB,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  last_scraped_at TIMESTAMPTZ,
  source_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Party packages - detailed breakdown parents need
CREATE TABLE party_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing (what parents actually pay)
  base_price DECIMAL(10, 2), -- e.g., £200
  base_includes_children INTEGER, -- e.g., "for up to 10 children"
  additional_child_price DECIMAL(10, 2), -- e.g., £15 per extra child
  adult_charge DECIMAL(10, 2), -- Some venues charge for adults
  
  -- Duration and timing
  duration_minutes INTEGER,
  setup_time_included BOOLEAN,
  cleanup_time_included BOOLEAN,
  
  -- Capacity
  min_children INTEGER,
  max_children INTEGER,
  max_adults INTEGER,
  
  -- Age suitability
  suitable_age_min INTEGER,
  suitable_age_max INTEGER,
  
  -- What's included (detailed breakdown)
  activities_included TEXT[], -- ["2 hours soft play", "45 min party room", "party games"]
  food_included TEXT[], -- ["pizza", "juice", "party bags"]
  party_host_included BOOLEAN,
  decorations_included TEXT[], -- ["balloons", "tablecloth", "themed decorations"]
  
  -- What's NOT included (hidden costs)
  additional_costs TEXT[], -- ["£3 per additional adult", "£25 for face painter"]
  what_to_bring TEXT[], -- ["birthday cake", "candles", "party bags"]
  
  -- Booking info
  deposit_required DECIMAL(10, 2),
  advance_booking_days INTEGER, -- How far ahead to book
  cancellation_policy TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Venue amenities (for filtering)
CREATE TABLE amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT, -- 'parent_amenity', 'safety', 'food', 'facility'
  icon TEXT
);

-- Many-to-many venue amenities
CREATE TABLE venue_amenities (
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (venue_id, amenity_id)
);

-- FAQ/Additional info that parents ask
CREATE TABLE venue_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT, -- 'booking', 'party_day', 'food', 'rules'
  display_order INTEGER
);

-- Cities for SEO
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  county TEXT,
  meta_title TEXT,
  meta_description TEXT,
  content TEXT,
  venue_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- London boroughs (and potentially other city districts)
CREATE TABLE city_districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  district_type TEXT DEFAULT 'borough', -- 'borough', 'area', 'district'
  meta_title TEXT,
  meta_description TEXT,
  content TEXT,
  venue_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

-- Admin users
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'editor',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scraping queue
CREATE TABLE scraping_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  venue_name TEXT,
  search_query TEXT, -- What we searched for
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'review')),
  error_message TEXT,
  raw_html TEXT, -- Store raw scraped HTML
  extracted_data JSONB, -- OpenAI extracted data
  confidence_score DECIMAL(3, 2), -- How confident was the extraction
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES admin_users(id)
);

-- Create indexes
CREATE INDEX idx_venues_city ON venues(city);
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_type ON venues USING GIN(venue_type);
CREATE INDEX idx_venues_age ON venues(min_age, max_age);
CREATE INDEX idx_venues_location ON venues USING GIST (
  ST_Point(longitude, latitude)
);
CREATE INDEX idx_venues_search ON venues USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || city)
);

-- RLS Policies
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_faqs ENABLE ROW LEVEL SECURITY;

-- Public read access for published content
CREATE POLICY "Public venues are viewable by everyone" ON venues
  FOR SELECT USING (status = 'published');

CREATE POLICY "Public packages are viewable by everyone" ON party_packages
  FOR SELECT USING (
    venue_id IN (SELECT id FROM venues WHERE status = 'published')
  );

CREATE POLICY "Public cities are viewable by everyone" ON cities
  FOR SELECT USING (true);

CREATE POLICY "Public districts are viewable by everyone" ON city_districts
  FOR SELECT USING (true);

CREATE POLICY "Public amenities are viewable by everyone" ON amenities
  FOR SELECT USING (true);

CREATE POLICY "Public venue amenities are viewable by everyone" ON venue_amenities
  FOR SELECT USING (true);

CREATE POLICY "Public FAQs are viewable by everyone" ON venue_faqs
  FOR SELECT USING (
    venue_id IN (SELECT id FROM venues WHERE status = 'published')
  );

-- Admin full access (will be implemented with service role key)

-- Trigger to update venue_count in cities
CREATE OR REPLACE FUNCTION update_city_venue_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE cities SET venue_count = (
      SELECT COUNT(*) FROM venues WHERE city = NEW.city AND status = 'published'
    ) WHERE LOWER(name) = LOWER(NEW.city);
    
    -- Update borough count if applicable
    IF NEW.borough IS NOT NULL THEN
      UPDATE city_districts SET venue_count = (
        SELECT COUNT(*) FROM venues WHERE borough = NEW.borough AND status = 'published'
      ) WHERE LOWER(name) = LOWER(NEW.borough);
    END IF;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    UPDATE cities SET venue_count = (
      SELECT COUNT(*) FROM venues WHERE city = OLD.city AND status = 'published'
    ) WHERE LOWER(name) = LOWER(OLD.city);
    
    IF OLD.borough IS NOT NULL THEN
      UPDATE city_districts SET venue_count = (
        SELECT COUNT(*) FROM venues WHERE borough = OLD.borough AND status = 'published'
      ) WHERE LOWER(name) = LOWER(OLD.borough);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER venue_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON venues
  FOR EACH ROW
  EXECUTE FUNCTION update_city_venue_count();

-- Sample amenities data
INSERT INTO amenities (slug, name, category, icon) VALUES
('free-parking', 'Free Parking', 'parent_amenity', '🅿️'),
('wheelchair-access', 'Wheelchair Accessible', 'parent_amenity', '♿'),
('baby-changing', 'Baby Changing Facilities', 'parent_amenity', '👶'),
('cafe-onsite', 'Cafe On-Site', 'parent_amenity', '☕'),
('wifi', 'Free WiFi', 'parent_amenity', '📶'),
('party-host', 'Party Host Included', 'facility', '🎉'),
('food-included', 'Food Included', 'food', '🍕'),
('outside-food-ok', 'Outside Food Allowed', 'food', '🥪'),
('allergy-friendly', 'Allergy Accommodations', 'food', '⚠️'),
('dbs-checked', 'DBS Checked Staff', 'safety', '✓'),
('first-aid', 'First Aid Trained', 'safety', '🏥'),
('private-room', 'Private Party Room', 'facility', '🏠'),
('exclusive-hire', 'Exclusive Hire Available', 'facility', '🔒');

-- Sample cities
INSERT INTO cities (slug, name, county, meta_title, meta_description) VALUES
('london', 'London', 'Greater London', 'Kids Party Venues in London - Compare 100+ Options', 'Find the perfect party venue for your child in London. Compare packages, prices, and facilities across 100+ venues with detailed parent information.'),
('manchester', 'Manchester', 'Greater Manchester', 'Kids Party Venues in Manchester - Compare Packages & Prices', 'Discover amazing party venues for children in Manchester. Compare facilities, pricing, and book the perfect venue for your child''s special day.'),
('birmingham', 'Birmingham', 'West Midlands', 'Kids Party Venues in Birmingham - Find Your Perfect Venue', 'Browse party venues for children in Birmingham. Compare packages, check facilities, and find venues with everything you need for a great party.');

-- Sample London boroughs
INSERT INTO city_districts (city_id, slug, name, district_type, meta_title, meta_description) 
SELECT c.id, 'hackney', 'Hackney', 'borough', 
       'Party Venues in Hackney, London - Local Options & Prices',
       'Find kids party venues in Hackney with free parking, great facilities and competitive packages. Compare local options for your child''s birthday.'
FROM cities c WHERE c.slug = 'london';

INSERT INTO city_districts (city_id, slug, name, district_type, meta_title, meta_description) 
SELECT c.id, 'camden', 'Camden', 'borough',
       'Party Venues in Camden, London - Family-Friendly Options',
       'Discover family-friendly party venues in Camden. Compare packages, facilities and find the perfect venue for your child''s special celebration.'
FROM cities c WHERE c.slug = 'london';

INSERT INTO city_districts (city_id, slug, name, district_type, meta_title, meta_description) 
SELECT c.id, 'islington', 'Islington', 'borough',
       'Party Venues in Islington, London - Compare Local Venues',
       'Browse kids party venues in Islington with detailed package information, pricing, and parent-friendly facilities for stress-free celebrations.'
FROM cities c WHERE c.slug = 'london';