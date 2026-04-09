/**
 * STANDALONE SEO BLOG SEEDER
 * Connects directly to MySQL — bypasses server bootstrap.
 * Usage: node src/scripts/run_seed_blogs.js
 */

import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// ─── Import blog data ────────────────────────────────────
import { blogsPart1 } from './seed_blogs_part1.js';
import { blogsPart2 } from './seed_blogs_part2.js';
import { blogsPart3 } from './seed_blogs_part3.js';

// ─── Combine all blogs ───────────────────────────────────
const allBlogs = [
  ...blogsPart1,
  ...blogsPart2,
  ...blogsPart3,
];

// ─── MAIN ─────────────────────────────────────────────────
const main = async () => {
  let connection;

  try {
    connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_prompt_hub',
      charset: 'utf8mb4',
    });

    console.log('✅ Database connected\n');
    console.log(`🚀 Starting SEO Blog Seeder — ${allBlogs.length} blogs to process\n`);

    // ── Fetch admin user ───────────────────────────────────
    const [users] = await connection.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const authorId = users.length > 0 ? users[0].id : null;

    // ── Fetch existing slugs ───────────────────────────────
    const [existing] = await connection.query('SELECT slug FROM blog_posts');
    const existingSlugs = new Set(existing.map(r => r.slug));
    console.log(`📝 Existing blogs in DB: ${existingSlugs.size}\n`);

    // ── Insert blogs ─────────────────────────────────────
    let inserted = 0;
    let skipped  = 0;
    const catStats = {};
    const topKeywordsMap = {};
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const b of allBlogs) {
      if (existingSlugs.has(b.slug)) { skipped++; continue; }

      await connection.query(
        `INSERT INTO blog_posts
          (title, slug, excerpt, content, featured_image, author_id,
           category, tags, status, reading_time, is_featured,
           meta_title, meta_description, focus_keyword, seo_score, seo_title,
           schema_type, published_at, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          b.title,
          b.slug,
          b.excerpt || '',
          b.content,
          b.featured_image || 'https://via.placeholder.com/1200x630.png?text=AI+Blog+Post',
          authorId,
          b.category || 'General',
          b.tags || JSON.stringify([]),
          b.status || 'published',
          b.reading_time || 5,
          b.is_featured ? 1 : 0,
          b.meta_title || b.title,
          b.meta_description || b.excerpt || '',
          b.focus_keyword || '',
          b.seo_score || 85,
          b.seo_title || b.title,
          b.schema_type || 'Article',
          now,
          now,
          now,
        ]
      );

      existingSlugs.add(b.slug);
      inserted++;
      
      // Tracking stats
      catStats[b.category] = (catStats[b.category] || 0) + 1;
      
      // Keyword tracking logic for report
      const keyWords = b.focus_keyword.split(' ').filter(w => w.length > 3);
      keyWords.forEach(w => {
        topKeywordsMap[w] = (topKeywordsMap[w] || 0) + 1;
      });

      process.stdout.write(`  Inserted: ${inserted}\r`);
    }

    // ── Report ─────────────────────────────────────────────
    console.log('\n\n═══════════════════════════════════════════════');
    console.log('        ✅  SEO BLOG SEEDER COMPLETE         ');
    console.log('═══════════════════════════════════════════════');
    console.log(`\n📊 RESULTS`);
    console.log(`  Total blogs in script  : ${allBlogs.length}`);
    console.log(`  Newly inserted         : ${inserted}`);
    console.log(`  Skipped (already exist): ${skipped}`);

    const [total] = await connection.query('SELECT COUNT(*) as c FROM blog_posts');
    console.log(`  Final absolute total   : ${total[0].c}`);

    console.log(`\n📂 CATEGORY DISTRIBUTION (this run)`);
    for (const [cat, count] of Object.entries(catStats)) {
      console.log(`  ${cat.padEnd(30)} : ${count}`);
    }

    const avgSeo = allBlogs.length > 0 
      ? Math.round(allBlogs.reduce((s, p) => s + (p.seo_score || 80), 0) / allBlogs.length)
      : 0;
    console.log(`\n🎯 AVERAGE SEO SCORE : ${avgSeo}/100`);

    console.log('\n🔑 TOP KEYWORDS USED (Freq > 3)');
    const topKeywords = Object.entries(topKeywordsMap)
      .sort((a,b) => b[1] - a[1])
      .filter(entry => entry[1] > 3)
      .slice(0, 8);
    topKeywords.forEach(([word, count]) => console.log(`  ▸ ${word.padEnd(20)} : ${count}`));

    console.log('\n═══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Seeder error:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
};

main();
