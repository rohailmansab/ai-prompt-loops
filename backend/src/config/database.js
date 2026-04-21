import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Railway MySQL proxy (*.rlwy.net / *.proxy.rlwy.net) normally requires TLS.
function shouldUseMysqlSsl() {
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL === 'true') return true;
  const host = process.env.DB_HOST || '';
  return /\.rlwy\.net$/i.test(host) || /\.railway\.internal$/i.test(host);
}

const ssl = shouldUseMysqlSsl() ? { rejectUnauthorized: false } : undefined;

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_prompt_hub',
  ...(ssl ? { ssl } : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export const initializeDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'editor', 'viewer') DEFAULT 'viewer',
        avatar VARCHAR(500) DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(100) DEFAULT NULL,
        color VARCHAR(20) DEFAULT '#6366f1',
        image VARCHAR(500) DEFAULT NULL,
        parent_id INT DEFAULT NULL,
        sort_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        meta_title VARCHAR(255) DEFAULT NULL,
        meta_description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS prompts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        slug VARCHAR(300) NOT NULL UNIQUE,
        description TEXT,
        content LONGTEXT NOT NULL,
        example_output TEXT,
        category_id INT DEFAULT NULL,
        author_id INT DEFAULT NULL,
        tags JSON DEFAULT NULL,
        difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'intermediate',
        ai_model VARCHAR(100) DEFAULT 'ChatGPT',
        use_case VARCHAR(200) DEFAULT NULL,
        views INT DEFAULT 0,
        likes INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_published BOOLEAN DEFAULT TRUE,
        meta_title VARCHAR(255) DEFAULT NULL,
        meta_description TEXT DEFAULT NULL,
        schema_markup JSON DEFAULT NULL,
        seo_title VARCHAR(255) DEFAULT NULL,
        focus_keyword VARCHAR(255) DEFAULT NULL,
        canonical_url VARCHAR(500) DEFAULT NULL,
        og_image VARCHAR(500) DEFAULT NULL,
        noindex BOOLEAN DEFAULT FALSE,
        schema_type ENUM('Article','HowTo','FAQ','WebPage') DEFAULT 'HowTo',
        seo_score INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_slug (slug),
        INDEX idx_category (category_id),
        INDEX idx_featured (is_featured),
        INDEX idx_published (is_published),
        INDEX idx_seo_score (seo_score),
        INDEX idx_created_at (created_at),
        FULLTEXT INDEX ft_search (title, description, content)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(300) NOT NULL,
        slug VARCHAR(300) NOT NULL UNIQUE,
        excerpt TEXT,
        content LONGTEXT NOT NULL,
        featured_image VARCHAR(500) DEFAULT NULL,
        author_id INT DEFAULT NULL,
        category VARCHAR(100) DEFAULT NULL,
        tags JSON DEFAULT NULL,
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        views INT DEFAULT 0,
        reading_time INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        meta_title VARCHAR(255) DEFAULT NULL,
        meta_description TEXT DEFAULT NULL,
        schema_markup JSON DEFAULT NULL,
        seo_title VARCHAR(255) DEFAULT NULL,
        focus_keyword VARCHAR(255) DEFAULT NULL,
        canonical_url VARCHAR(500) DEFAULT NULL,
        og_image VARCHAR(500) DEFAULT NULL,
        noindex BOOLEAN DEFAULT FALSE,
        schema_type ENUM('Article','HowTo','FAQ','WebPage') DEFAULT 'Article',
        seo_score INT DEFAULT 0,
        published_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_slug (slug),
        INDEX idx_status (status),
        INDEX idx_featured (is_featured),
        INDEX idx_seo_score (seo_score),
        INDEX idx_created_at (created_at),
        FULLTEXT INDEX ft_search (title, excerpt, content)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50) NOT NULL,
        path VARCHAR(255),
        item_id VARCHAR(100),
        duration INT DEFAULT 0,
        user_agent TEXT,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ads (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        placement   VARCHAR(50) NOT NULL,
        ad_code     LONGTEXT NOT NULL,
        status      BOOLEAN DEFAULT TRUE,
        priority    INT DEFAULT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_placement (placement),
        INDEX idx_status (status),
        INDEX idx_priority (priority)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS ad_events (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        ad_id       INT NOT NULL,
        placement   VARCHAR(50) NOT NULL,
        event_type  VARCHAR(20) NOT NULL,
        ip_address  VARCHAR(45) DEFAULT NULL,
        user_agent  TEXT DEFAULT NULL,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ad_id (ad_id),
        INDEX idx_placement (placement),
        INDEX idx_event_type (event_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── SEO Keywords Tracking ─────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS seo_keywords_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        keyword VARCHAR(255) NOT NULL,
        page_slug VARCHAR(300) NOT NULL,
        impressions INT DEFAULT 0,
        clicks INT DEFAULT 0,
        position FLOAT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_keyword (keyword),
        INDEX idx_page_slug (page_slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Slug Redirects (301) ──────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS slug_redirects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        old_slug VARCHAR(300) NOT NULL,
        new_slug VARCHAR(300) NOT NULL,
        content_type ENUM('prompt','blog','category') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_old_slug (old_slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── IndexNow Log ──────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS indexnow_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        urls JSON NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        response TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Site Settings (key-value CMS store) ───────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        \`key\` VARCHAR(100) NOT NULL UNIQUE,
        value LONGTEXT DEFAULT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_key (\`key\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Contact Messages (inbox) ──────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(300) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_is_read (is_read),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Seed default site_settings if table is empty ──────
    const [settingsCount] = await connection.query('SELECT COUNT(*) AS cnt FROM site_settings');
    if (settingsCount[0].cnt === 0) {
      const defaults = [
        ['contact_email', 'hello@aipromptloops.me'],
        ['contact_phone', ''],
        ['contact_address', ''],
        ['show_email', 'true'],
        ['show_phone', 'false'],
        ['show_address', 'false'],
        ['about_content', ''],
      ];
      for (const [key, value] of defaults) {
        await connection.query(
          'INSERT IGNORE INTO site_settings (\`key\`, value) VALUES (?, ?)',
          [key, value]
        );
      }
    }

    // ── CMS Pages ─────────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        content LONGTEXT DEFAULT NULL,
        meta_title VARCHAR(255) DEFAULT NULL,
        meta_description TEXT DEFAULT NULL,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_published (is_published)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Seed default CMS pages if table is empty ──────────
    const [pagesCount] = await connection.query('SELECT COUNT(*) AS cnt FROM pages');
    if (pagesCount[0].cnt === 0) {
      const defaultPages = [
        {
          title: 'About Us',
          slug: 'about',
          meta_title: 'About Us | AI Prompt Loops',
          meta_description: 'Learn about AI Prompt Loops — the ultimate resource for mastering AI prompt engineering.',
          content: `<h2>Our Mission</h2>
<p>AI Prompt Loops was created to bridge the gap between AI capability and human intent. We believe that the quality of your AI interactions depends on the quality of your prompts, and we're here to help you craft the perfect ones.</p>
<p>Whether you're a content creator, software developer, marketer, educator, or business leader, our curated library of prompts and powerful tools are designed to help you get the most out of AI.</p>
<h2>Our Values</h2>
<ul>
  <li><strong>Quality First</strong> — Every prompt is tested and refined for maximum effectiveness.</li>
  <li><strong>Community Driven</strong> — Built by prompt engineers, for prompt engineers.</li>
  <li><strong>Open Access</strong> — Free access to essential tools and resources for everyone.</li>
  <li><strong>Always Updated</strong> — Continuously updated with the latest AI models and techniques.</li>
</ul>`,
        },
        {
          title: 'Company',
          slug: 'company',
          meta_title: 'Company | AI Prompt Loops',
          meta_description: 'Discover the story behind AI Prompt Loops — our team, values, and vision for the future of AI.',
          content: `<h2>Who We Are</h2>
<p>AI Prompt Loops is a platform dedicated to making AI accessible and powerful for everyone. We are a team of engineers, researchers, and AI enthusiasts passionate about the future of human-AI collaboration.</p>
<h2>Our Story</h2>
<p>Founded in 2024, AI Prompt Loops grew from a simple idea: that better prompts lead to better AI outcomes. What started as a personal prompt library has grown into a comprehensive platform serving thousands of users worldwide.</p>
<h2>Our Vision</h2>
<p>We envision a world where every individual and business can harness the full power of AI without needing to be an expert. Our tools, prompts, and resources are the bridge to that future.</p>`,
        },
        {
          title: 'Privacy Policy',
          slug: 'privacy-policy',
          meta_title: 'Privacy Policy | AI Prompt Loops',
          meta_description: 'Read the Privacy Policy for AI Prompt Loops. Learn how we collect, use, and protect your personal data.',
          content: `<h2>1. Information We Collect</h2>
<p>We collect information you provide directly to us, such as when you fill out a form or contact us. This may include your name, email address, and any content you submit.</p>
<h2>2. How We Use Your Information</h2>
<ul>
  <li>Provide, maintain, and improve our services</li>
  <li>Send you technical notices and support messages</li>
  <li>Respond to your comments, questions, and requests</li>
  <li>Monitor and analyze trends, usage, and activities</li>
</ul>
<h2>3. Information Sharing</h2>
<p>We do not sell, trade, or otherwise transfer your personal information to outside parties without your consent.</p>
<h2>4. Data Security</h2>
<p>We implement a variety of security measures to maintain the safety of your personal information.</p>
<h2>5. Cookies</h2>
<p>We use cookies to understand and save your preferences for future visits and to compile aggregate data about site traffic.</p>
<h2>6. Your Rights</h2>
<p>You have the right to access, correct, delete, or transfer your personal data at any time. Contact us to exercise these rights.</p>
<h2>7. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aipromptloops.me">privacy@aipromptloops.me</a>.</p>`,
        },
        {
          title: 'Terms of Service',
          slug: 'terms',
          meta_title: 'Terms of Service | AI Prompt Loops',
          meta_description: 'Read the Terms of Service for AI Prompt Loops. Understand your rights and responsibilities when using our platform.',
          content: `<h2>1. Introduction</h2>
<p>Welcome to AI Prompt Loops ("we," "our," or "us"). By accessing or using our website and services, you agree to comply with and be bound by these Terms of Service.</p>
<h2>2. Use of AI Prompts</h2>
<p>The prompts available on our platform are designed to interact with third-party AI models. We do not guarantee the specific output, accuracy, or reliability of third-party AI models when using our prompts.</p>
<h2>3. Intellectual Property</h2>
<p>All original content, designs, and underlying code on this website are the intellectual property of AI Prompt Loops. You may copy and modify specific prompts for personal or commercial use but may not redistribute our database as a competing product.</p>
<h2>4. User Responsibilities</h2>
<p>When using our platform, you agree not to:</p>
<ul>
  <li>Engage in automated scraping or data harvesting</li>
  <li>Use our tools to generate illegal or harmful content</li>
  <li>Attempt to breach our security or authentication systems</li>
</ul>
<h2>5. Limitation of Liability</h2>
<p>To the maximum extent permitted by applicable law, AI Prompt Loops shall not be liable for any indirect, incidental, or consequential damages resulting from your use of our platform.</p>
<h2>6. Contact</h2>
<p>Questions about these Terms? Contact us at <a href="mailto:legal@aipromptloops.me">legal@aipromptloops.me</a>.</p>`,
        },
      ];

      for (const page of defaultPages) {
        await connection.query(
          `INSERT IGNORE INTO pages (title, slug, content, meta_title, meta_description, is_published)
           VALUES (?, ?, ?, ?, ?, TRUE)`,
          [page.title, page.slug, page.content, page.meta_title, page.meta_description]
        );
      }
    }

    // ── Footer Settings ───────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS footer_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        site_name VARCHAR(255) DEFAULT 'AI Prompt Loops',
        footer_text TEXT DEFAULT NULL,
        copyright_text VARCHAR(500) DEFAULT NULL,
        show_footer BOOLEAN DEFAULT TRUE,
        show_social BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Footer Links ──────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS footer_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        position INT DEFAULT 0,
        column_group VARCHAR(100) DEFAULT 'Links',
        is_visible BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_position (position)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Footer Socials ────────────────────────────────────
    await connection.query(`
      CREATE TABLE IF NOT EXISTS footer_socials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        platform VARCHAR(100) NOT NULL,
        url VARCHAR(1000) NOT NULL,
        is_visible BOOLEAN DEFAULT TRUE,
        position INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_position (position)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ── Seed footer_settings if empty ────────────────────
    const [fsCount] = await connection.query('SELECT COUNT(*) AS cnt FROM footer_settings');
    if (fsCount[0].cnt === 0) {
      await connection.query(`
        INSERT INTO footer_settings (site_name, footer_text, copyright_text, show_footer, show_social)
        VALUES (
          'AI Prompt Loops',
          'The ultimate AI prompt engineering resource. Discover, create, and master prompts for ChatGPT, Midjourney, and more.',
          '© ${new Date().getFullYear()} AI Prompt Loops. All rights reserved.',
          TRUE,
          TRUE
        )
      `);
    }

    // ── Seed footer_links if empty ────────────────────────
    const [flCount] = await connection.query('SELECT COUNT(*) AS cnt FROM footer_links');
    if (flCount[0].cnt === 0) {
      const defaultLinks = [
        ['Prompt Library', '/prompts', 'Product', 0],
        ['Categories', '/categories', 'Product', 1],
        ['AI Tools', '/tools', 'Product', 2],
        ['Blog', '/blog', 'Product', 3],
        
        ['About Us', '/about', 'Company', 4],
        ['Contact', '/contact', 'Company', 5],
        ['Privacy Policy', '/privacy-policy', 'Company', 6],
        ['Terms of Service', '/terms', 'Company', 7],
        
        ['Getting Started', '/blog', 'Resources', 8],
        ['Documentation', '/about', 'Resources', 9],
        ['Community', '/contact', 'Resources', 10],
      ];
      for (const [label, url, column_group, position] of defaultLinks) {
        await connection.query(
          'INSERT IGNORE INTO footer_links (label, url, column_group, position, is_visible) VALUES (?, ?, ?, ?, TRUE)',
          [label, url, column_group, position]
        );
      }
    }

    // ── Seed footer_socials if empty ──────────────────────
    const [socialCount] = await connection.query('SELECT COUNT(*) AS cnt FROM footer_socials');
    if (socialCount[0].cnt === 0) {
      const defaultSocials = [
        ['twitter', 'https://twitter.com/', 0],
        ['github', 'https://github.com/', 1],
        ['linkedin', 'https://linkedin.com/', 2],
        ['email', 'mailto:contact@domain.com', 3],
      ];
      for (const [platform, url, position] of defaultSocials) {
        await connection.query(
          'INSERT IGNORE INTO footer_socials (platform, url, position, is_visible) VALUES (?, ?, ?, TRUE)',
          [platform, url, position]
        );
      }
    }

    const alterStatements = [
      // prompts
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS og_image VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS schema_type ENUM('Article','HowTo','FAQ','WebPage') DEFAULT 'HowTo'`,
      `ALTER TABLE prompts ADD COLUMN IF NOT EXISTS seo_score INT DEFAULT 0`,
      // blog_posts
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS canonical_url VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS og_image VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS schema_type ENUM('Article','HowTo','FAQ','WebPage') DEFAULT 'Article'`,
      `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_score INT DEFAULT 0`,
      // categories
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_title VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS focus_keyword VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS og_image VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS noindex BOOLEAN DEFAULT FALSE`,
      `ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo_score INT DEFAULT 0`,
      // ads — add priority + convert placement to VARCHAR for new placement types
      `ALTER TABLE ads ADD COLUMN IF NOT EXISTS priority INT DEFAULT NULL`,
      `ALTER TABLE ads MODIFY COLUMN IF EXISTS placement VARCHAR(50) NOT NULL`,
      // ad_events — convert event_type to VARCHAR to support new event types
      `ALTER TABLE ad_events MODIFY COLUMN IF EXISTS event_type VARCHAR(20) NOT NULL`,
      // users — advance security columns (lockout, refresh token)
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until DATETIME DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login DATETIME DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INT DEFAULT 0`,
      // footer_links — column_group added in later schema version
      `ALTER TABLE footer_links ADD COLUMN IF NOT EXISTS column_group VARCHAR(100) DEFAULT 'Links'`,
      // footer_settings — ensure all columns exist
      `ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS site_name VARCHAR(255) DEFAULT 'AI Prompt Loops'`,
      `ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT NULL`,
      `ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS copyright_text VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS show_footer BOOLEAN DEFAULT TRUE`,
      `ALTER TABLE footer_settings ADD COLUMN IF NOT EXISTS show_social BOOLEAN DEFAULT TRUE`,
      `CREATE INDEX idx_created_at ON prompts(created_at) ALGORITHM=INPLACE LOCK=NONE`,
      `CREATE INDEX idx_created_at ON blog_posts(created_at) ALGORITHM=INPLACE LOCK=NONE`,
    ];
    for (const sql of alterStatements) {
      try { await connection.query(sql); } catch (_) { /* column may already exist */ }
    }

    console.log('✅ Database tables initialized successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

export default pool;
