-- Complete Database Schema for Admin-Acmedix Project
-- Generated on 2025-08-26

-- =====================================================
-- 1. CONTACT SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE contact_submissions (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    source VARCHAR(50) DEFAULT 'website',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. CAREER POSITIONS TABLE
-- =====================================================
CREATE TABLE career_positions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    responsibilities TEXT NOT NULL,
    salary_range VARCHAR(100),
    experience_required VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CAREER APPLICATIONS TABLE
-- =====================================================
CREATE TABLE career_applications (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    position_applied VARCHAR(255) NOT NULL,
    cover_letter TEXT,
    resume_file_name VARCHAR(255),
    resume_file_path VARCHAR(500),
    resume_file_size INTEGER,
    resume_file_type VARCHAR(100),
    application_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. BLOG CATEGORIES TABLE
-- =====================================================
CREATE TABLE blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7), -- For hex color codes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. BLOG AUTHORS TABLE
-- =====================================================
CREATE TABLE blog_authors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(500),
    social_links JSONB, -- For storing social media links
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. BLOG POSTS TABLE
-- =====================================================
CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image VARCHAR(500),
    category_id INTEGER REFERENCES blog_categories(id) ON DELETE SET NULL,
    author_id INTEGER REFERENCES blog_authors(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    read_time INTEGER DEFAULT 0, -- in minutes
    meta_title VARCHAR(255),
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. BLOG POSTS WITH DETAILS VIEW
-- =====================================================
CREATE VIEW blog_posts_with_details AS
SELECT 
    bp.*,
    bc.name as category_name,
    bc.slug as category_slug,
    bc.color as category_color,
    ba.name as author_name,
    ba.email as author_email,
    ba.bio as author_bio,
    ba.avatar_url as author_avatar
FROM blog_posts bp
LEFT JOIN blog_categories bc ON bp.category_id = bc.id
LEFT JOIN blog_authors ba ON bp.author_id = ba.id;

-- =====================================================
-- INDEXES FOR BETTER PERFORMANCE
-- =====================================================

-- Contact submissions indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_date ON contact_submissions(submission_date);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- Career positions indexes
CREATE INDEX idx_career_positions_status ON career_positions(status);
CREATE INDEX idx_career_positions_department ON career_positions(department);
CREATE INDEX idx_career_positions_created_at ON career_positions(created_at);

-- Career applications indexes
CREATE INDEX idx_career_applications_email ON career_applications(email);
CREATE INDEX idx_career_applications_position ON career_applications(position_applied);
CREATE INDEX idx_career_applications_status ON career_applications(application_status);
CREATE INDEX idx_career_applications_created_at ON career_applications(created_at);

-- Blog posts indexes
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);

-- Blog categories indexes
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);

-- Blog authors indexes
CREATE INDEX idx_blog_authors_email ON blog_authors(email);

-- =====================================================
-- TRIGGERS FOR AUTOMATIC UPDATED_AT
-- =====================================================

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_positions_updated_at 
    BEFORE UPDATE ON career_positions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_applications_updated_at 
    BEFORE UPDATE ON career_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_categories_updated_at 
    BEFORE UPDATE ON blog_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_authors_updated_at 
    BEFORE UPDATE ON blog_authors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Sample blog categories
INSERT INTO blog_categories (name, slug, description, color) VALUES 
('Technology', 'technology', 'Tech-related articles and updates', '#3B82F6'),
('Healthcare', 'healthcare', 'Healthcare industry insights', '#10B981'),
('Business', 'business', 'Business and industry news', '#F59E0B'),
('Research', 'research', 'Research and development updates', '#8B5CF6');

-- Sample blog author
INSERT INTO blog_authors (name, email, bio) VALUES 
('Admin User', 'admin@acmedix.com', 'Content administrator for Acmedix Pharma');

-- =====================================================
-- STORAGE BUCKETS (For Supabase)
-- =====================================================

-- Note: These are Supabase-specific storage bucket creation commands
-- Run these in Supabase SQL editor or via Supabase CLI

-- CREATE BUCKET resumes WITH (public = false);
-- CREATE BUCKET blog_images WITH (public = true);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES (Optional - for Supabase)
-- =====================================================

-- Enable RLS on tables
-- ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE career_positions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;

-- Example policies (adjust as needed)
-- CREATE POLICY "Public can view published blog posts" ON blog_posts
--     FOR SELECT USING (status = 'published');

-- CREATE POLICY "Public can view blog categories" ON blog_categories
--     FOR SELECT USING (true);

-- CREATE POLICY "Public can view blog authors" ON blog_authors
--     FOR SELECT USING (true);