// Mass content seeder - imports 120 prompts, 30 blog articles, 10 categories
import dotenv from 'dotenv';
dotenv.config();

import pool from './database.js';
import bcrypt from 'bcryptjs';
import categories from './content-data/categories.js';
import prompts_batch_1 from './content-data/prompts_batch_1.js';
import prompts_batch_2 from './content-data/prompts_batch_2.js';
import prompts_batch_3 from './content-data/prompts_batch_3.js';
import prompts_batch_4 from './content-data/prompts_batch_4.js';
import prompts_batch_5 from './content-data/prompts_batch_5.js';
import blog_batch_1 from './content-data/blog_batch_1.js';
import blog_batch_2 from './content-data/blog_batch_2.js';

const allPrompts = [
  ...prompts_batch_1,
  ...prompts_batch_2,
  ...prompts_batch_3,
  ...prompts_batch_4,
  ...prompts_batch_5,
];

const allBlogs = [
  ...blog_batch_1,
  ...blog_batch_2,
];

const seedContent = async () => {
  console.log('🚀 Starting mass content seed...\n');

  try {
    // 1. Clear existing data (in reverse dependency order)
    console.log('🗑️  Clearing existing data...');
    await pool.query('DELETE FROM prompts');
    await pool.query('DELETE FROM blog_posts');
    await pool.query('DELETE FROM categories');
    console.log('   ✅ Existing data cleared\n');

    // 2. Ensure admin user exists
    console.log('👤 Ensuring admin user...');
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE username = ?', ['admin']);
    let adminId;
    if (existingUsers.length > 0) {
      adminId = existingUsers[0].id;
      console.log('   ✅ Admin user already exists (id: ' + adminId + ')\n');
    } else {
      const hashedPassword = await bcrypt.hash('admin123', 12);
      const [userResult] = await pool.query(
        'INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
        ['admin', 'admin@aiprompt.hub', hashedPassword, 'admin', true]
      );
      adminId = userResult.insertId;
      console.log('   ✅ Admin user created (id: ' + adminId + ')\n');
    }

    // 3. Seed categories
    console.log('📂 Seeding 10 categories...');
    const categoryIdMap = {}; // maps sort_order -> inserted id
    for (const cat of categories) {
      const [result] = await pool.query(
        `INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active, meta_title, meta_description)
         VALUES (?, ?, ?, ?, ?, ?, TRUE, ?, ?)`,
        [cat.name, cat.slug, cat.description, cat.icon, cat.color, cat.sort_order,
         cat.meta_title, cat.meta_description]
      );
      categoryIdMap[cat.sort_order] = result.insertId;
      console.log(`   ✅ Category: ${cat.name} (id: ${result.insertId})`);
    }
    console.log('');

    // 4. Seed prompts
    console.log(`📝 Seeding ${allPrompts.length} prompts...`);
    let promptCount = 0;
    for (const p of allPrompts) {
      // Map the category_id from the data file (1-10) to the actual inserted id
      const actualCategoryId = categoryIdMap[p.category_id];
      
      const schemaMarkup = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: p.title,
        description: p.description,
      });

      await pool.query(
        `INSERT INTO prompts (title, slug, description, content, example_output, category_id,
         author_id, tags, difficulty, ai_model, use_case, is_featured, is_published,
         meta_title, meta_description, schema_markup)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, ?, ?, ?)`,
        [p.title, p.slug, p.description, p.content, p.example_output || '',
         actualCategoryId, adminId, p.tags, p.difficulty, p.ai_model, p.use_case,
         p.is_featured || false, p.title, p.meta_description, schemaMarkup]
      );
      promptCount++;
      if (promptCount % 12 === 0) {
        console.log(`   ✅ ${promptCount}/${allPrompts.length} prompts inserted...`);
      }
    }
    console.log(`   ✅ All ${promptCount} prompts inserted!\n`);

    // 5. Seed blog posts
    console.log(`📰 Seeding ${allBlogs.length} blog articles...`);
    let blogCount = 0;
    for (const b of allBlogs) {
      const schemaMarkup = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: b.title,
        description: b.excerpt,
      });

      await pool.query(
        `INSERT INTO blog_posts (title, slug, excerpt, content, author_id, category, tags,
         status, reading_time, is_featured, meta_title, meta_description, schema_markup, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [b.title, b.slug, b.excerpt, b.content, adminId, b.category, b.tags,
         b.status, b.reading_time, b.is_featured || false,
         b.meta_title, b.meta_description, schemaMarkup]
      );
      blogCount++;
    }
    console.log(`   ✅ All ${blogCount} blog articles inserted!\n`);

    // 6. Summary
    console.log('═══════════════════════════════════════════');
    console.log('   🎉 MASS CONTENT SEED COMPLETE!');
    console.log('═══════════════════════════════════════════');
    console.log(`   📂 Categories:    ${categories.length}`);
    console.log(`   📝 Prompts:       ${promptCount}`);
    console.log(`   📰 Blog Articles: ${blogCount}`);
    console.log(`   👤 Admin User:    admin / admin123`);
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    console.error(error);
    process.exit(1);
  }
};

seedContent();
