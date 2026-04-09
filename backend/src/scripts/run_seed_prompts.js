/**
 * STANDALONE SEO PROMPT SEEDER
 * Connects directly to MySQL — bypasses server bootstrap.
 * Usage: node src/scripts/run_seed_prompts.js
 */

import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// ─── Import prompt data ────────────────────────────────────
import { promptsPart1 } from './seed_prompts_part1.js';
import { promptsPart2 } from './seed_prompts_part2.js';
import { promptsPart3 } from './seed_prompts_part3.js';
import { promptsPart4 } from './seed_prompts_part4.js';
import { promptsPart5 } from './seed_prompts_part5.js';
import { promptsPart6 } from './seed_prompts_part6.js';
import { promptsPart7 } from './seed_prompts_part7.js';

// ─── Extra standalone prompts ──────────────────────────────
const extraPrompts = [
  {
    title: "ChatGPT Prompt for Business Name Generator (Brandable Names)",
    slug: "chatgpt-prompt-business-name-generator-brandable-names",
    description: "Generate creative, memorable, brandable business names with domain availability tips.",
    content: `Act as a branding expert and naming strategist. Generate business names for:

Business Type: [DESCRIBE WHAT THE BUSINESS DOES]
Industry: [INDUSTRY]
Target Market: [WHO YOUR CUSTOMERS ARE]
Tone: [Professional / Fun / Premium / Disruptive / Approachable]
Avoid: [WORDS OR STYLES TO STAY AWAY FROM]
Domain preference: [.com only / .io ok / Any TLD]

Generate 30 name options grouped by style:

COMPOUND WORDS (5) — merge two relevant words
INVENTED WORDS (5) — made-up, memorable names (think Spotify, Kodak)
METAPHOR NAMES (5) — symbolic meaning related to benefit
PERSON NAMES (3) — founder-style names
PLACE/NATURE INSPIRED (4) — evocative words
ACRONYM/ABBREVIATION (3) — if applicable
ACTION WORDS (5) — verbs that describe the transformation

For TOP 5 final picks provide:
- Pronunciation guide
- Why it works for this brand
- Potential domain variations (.com, .co, .io, .app)
- Trademark search tips
- Tagline suggestion

NAMING CRITERIA:
- Easy to spell and say
- Under 3 syllables preferred
- Global-friendly
- Not trademarked in obvious ways`,
    example_output: "30 business name options in 7 styles, top 5 picks with taglines and domain strategies.",
    category_slug: "business-strategy",
    tags: ["business name", "branding", "startup naming", "brand strategy"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Branding",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for business name generator",
    meta_title: "ChatGPT Prompt for Business Name Generator | AI Prompt Hub",
    meta_description: "Generate 30 creative, brandable business names with domain tips using this ChatGPT prompt for entrepreneurs and startups.",
    seo_score: 87,
  },
  {
    title: "ChatGPT Prompt for Viral Twitter X Thread (Engagement-Optimized)",
    slug: "chatgpt-prompt-viral-twitter-x-thread-engagement-optimized",
    description: "Write viral Twitter/X threads with scroll-stopping hooks that get retweeted, bookmarked, and grow your following.",
    content: `Act as a viral Twitter/X content strategist who has grown accounts to 100K+ followers. Write a 15-tweet thread for:

Account Niche: [TOPIC / SPACE]
Thread Topic: [EXACT TOPIC]
Goal: [Followers / Authority / Product promotion]
Audience: [WHO SHOULD SEE THIS]
Your Unique Angle: [CONTRARIAN OR INSIDER VIEW]

Write a 15-tweet thread:

TWEET 1 — THE HOOK
- Bold claim or counterintuitive statement
- Promise of what's in the thread
- Number format: "X [things/lessons] about [topic]:"

TWEETS 2-14 — THE CONTENT
For each:
- Point number + Tweet text (under 280 chars)
- Pattern: Big idea → Quick proof → Transition
- Alternating: Insight / Story moment / Actionable tip

TWEET 15 — THE CTA
- Genuine follow ask or resource link

BONUS:
- Best time to post this thread
- 3 accounts to engage
- How to repurpose this thread`,
    example_output: "A complete 15-tweet viral thread with hook, value content, CTA, and repurposing strategy.",
    category_slug: "marketing",
    tags: ["Twitter thread", "X thread", "social media", "viral content", "Twitter growth"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Twitter/X Marketing",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for Twitter thread",
    meta_title: "ChatGPT Prompt for Viral Twitter Thread | AI Prompt Hub",
    meta_description: "Write viral Twitter/X threads with scroll-stopping hooks using this ChatGPT prompt for social media creators.",
    seo_score: 90,
  },
  {
    title: "ChatGPT Prompt for Personal Statement Writing (College Application)",
    slug: "chatgpt-prompt-personal-statement-writing-college-application",
    description: "Write a compelling college application personal statement that showcases your unique story and gets you admitted.",
    content: `Act as a college admissions counselor who has helped 100+ students get into top universities. Help write a personal statement for:

Applying to: [COLLEGES]
Program: [MAJOR / UNDECIDED]
Word Limit: [650 / 250 / 500]
Prompt: [PASTE THE ACTUAL PROMPT]
My Unique Experience: [DEFINING EXPERIENCE]
What Makes Me Different: [YOUR GENUINE DIFFERENTIATOR]

Write:

1. ESSAY STRATEGY
   - Best angle for this student profile
   - Common mistakes to avoid

2. FULL ESSAY DRAFT
   OPENING LINE
   - Start in the middle of a scene
   - Sensory detail that draws them in

   MIDDLE — THE STORY
   - Specific details over generalizations
   - Show growth and transformation
   - Reflect, don't just narrate

   CLOSING — THE SO WHAT
   - What the experience means for who you are now
   - Bridge to what you'll bring to campus

3. SUPPLEMENTAL ESSAY TIPS (Why This School)
   - Research framework: 3 specific things to mention

4. REVISION CHECKLIST — 10 self-evaluation questions`,
    example_output: "A complete personal statement with opening scene, story, reflection, and supplemental essay tips.",
    category_slug: "education",
    tags: ["personal statement", "college application", "admissions essay", "student"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "College Applications",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for personal statement writing",
    meta_title: "ChatGPT Prompt for Personal Statement Writing (College App) | AI Prompt Hub",
    meta_description: "Write a compelling college application personal statement using this ChatGPT prompt — show your unique story and get admitted.",
    seo_score: 93,
  },
  {
    title: "ChatGPT Prompt for Amazon FBA Product Research and Listing Optimization",
    slug: "chatgpt-prompt-amazon-fba-product-research-listing-optimization",
    description: "Research profitable Amazon FBA products and write fully optimized listings that rank and convert to sales.",
    content: `Act as an Amazon FBA expert who has launched 20+ products generating $100K+/year. Help with:

Current Stage: [Looking for product / Have product / Need listing optimization]
Category Interest: [PRODUCT CATEGORY]
Budget: $[STARTUP CAPITAL]
Target: [$X monthly profit / number of units/month]

1. PRODUCT RESEARCH FRAMEWORK
   - 5 criteria for a winning FBA product
   - BSR target by category
   - Price point formula (3x markup rule)
   - Free research methods

2. PRODUCT IDEAS (5 specific for this category)
   For each:
   - Product name, estimated monthly sales, avg selling price
   - Estimated FBA fees and net margin
   - Competition level

3. AMAZON LISTING OPTIMIZATION
   - Title formula: Brand + Main Keyword + Feature + Size + Use Case
   - Backend search terms strategy

4. BULLET POINTS (5)
   - ALL CAPS feature — benefit explanation

5. PRODUCT DESCRIPTION
   - HTML-formatted for Amazon
   - Feature to benefit to emotion format

6. PPC STRATEGY STARTER
   - First campaign structure
   - Bid strategy for new listings`,
    example_output: "FBA product research with 5 product ideas, financials, listing copy, and PPC starter strategy.",
    category_slug: "business-strategy",
    tags: ["Amazon FBA", "e-commerce", "product research", "Amazon listing"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Amazon Selling",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for Amazon FBA product research",
    meta_title: "ChatGPT Prompt for Amazon FBA Product Research | AI Prompt Hub",
    meta_description: "Research profitable FBA products and write optimized listings using this expert ChatGPT prompt for Amazon sellers.",
    seo_score: 89,
  },
  {
    title: "ChatGPT Prompt for YouTube Short Script (60-Second Vertical Video)",
    slug: "chatgpt-prompt-youtube-short-script-60-second-vertical-video",
    description: "Write engaging YouTube Shorts scripts optimized for retention with scroll-stopping openings and memorable endings.",
    content: `Act as a YouTube Shorts expert who has created content hitting 10M+ views. Write a 60-second Shorts script for:

Niche: [YOUR TOPIC]
Short Topic: [SPECIFIC MICRO-TOPIC]
Goal: [Sub growth / Product awareness / Traffic to long video]
Tone: [Educational / Entertaining / How-to]

Write a 60-second script:

SECOND 0-3 — THE HOOK
- Pattern interrupt: Something unexpected
- State the value proposition clearly

SECOND 3-15 — THE SETUP
- Context in 2-3 sentences max
- Why this matters RIGHT NOW

SECOND 15-50 — THE CONTENT
- 3 punchy points, tips, or steps
- Each point: 10 seconds max
- Short sentences, simple words
- [VISUAL CUE: what to show on screen]

SECOND 50-60 — THE CLOSE
- Quick summary (1 sentence)
- CTA: Subscribe or watch next

ALSO PROVIDE:
- 3 title options
- Thumbnail concept
- 5 hashtags
- Best time to publish for this niche`,
    example_output: "A 60-second YouTube Shorts script with hook, content, CTA, and 3 title options.",
    category_slug: "content-writing",
    tags: ["YouTube Shorts", "short-form video", "content creation", "video script"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "YouTube Shorts",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for YouTube Shorts script",
    meta_title: "ChatGPT Prompt for YouTube Short Script | AI Prompt Hub",
    meta_description: "Write engaging YouTube Shorts scripts with scroll-stopping hooks using this ChatGPT prompt for content creators.",
    seo_score: 88,
  },
  {
    title: "ChatGPT Prompt for Market Validation (Lean Startup Method)",
    slug: "chatgpt-prompt-market-validation-lean-startup-method",
    description: "Validate your business idea before investing time and money using lean startup principles and customer discovery.",
    content: `Act as a lean startup mentor. Help me validate:

Business Idea: [DESCRIBE YOUR IDEA]
Target Customer: [WHO THIS IS FOR]
Problem Being Solved: [THE PAIN POINT]
Proposed Solution: [HOW YOU SOLVE IT]
Resources Available: [TIME + BUDGET]

Run full validation:

1. ASSUMPTION MAPPING
   - All assumptions the idea depends on
   - Rank by risk (which assumption kills the idea if wrong)

2. CUSTOMER DISCOVERY PLAN
   - Who to interview and how to find them
   - 10 discovery interview questions
   - How to spot patterns in responses

3. SOLUTION TESTING (before building)
   - Smoke test: Landing page test
   - Concierge MVP approach
   - Wizard of Oz MVP
   - Which to use for this idea

4. MVH DEFINITION
   - Smallest thing that proves core value
   - What to build vs. defer

5. VALIDATION METRICS
   - Numbers that prove you have something
   - Timeline: Validated or pivot in 30/60/90 days

6. PIVOT SCENARIOS
   - If customers love problem but hate solution
   - If no one has the problem
   - If competitors already dominate`,
    example_output: "A complete lean startup validation plan with discovery questions, MVP options, and metrics for any business idea.",
    category_slug: "business-strategy",
    tags: ["business validation", "lean startup", "product-market fit", "market research"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Startup Validation",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for market validation",
    meta_title: "ChatGPT Prompt for Market Validation (Lean Startup) | AI Prompt Hub",
    meta_description: "Validate your business idea with lean startup principles using this ChatGPT prompt for entrepreneurs.",
    seo_score: 88,
  },
  {
    title: "ChatGPT Prompt for Pinterest SEO and Pin Description Writing",
    slug: "chatgpt-prompt-pinterest-seo-pin-description-writing",
    description: "Write SEO-optimized Pinterest pin descriptions and board names that drive traffic and rank in Pinterest search.",
    content: `Act as a Pinterest SEO specialist driving 1M+ monthly views. Write Pinterest content for:

Blog/Business Niche: [YOUR NICHE]
Traffic Goal: [Blog traffic / Sales / Email signups]
Top Pin Topics: [LIST 5-7]

Create:

1. PINTEREST PROFILE OPTIMIZATION
   - Username strategy, display name, bio (160 chars + CTA)

2. BOARD NAMES (10 boards)
   - SEO-optimized board titles
   - Board descriptions keyword-rich (500 chars each)

3. PIN DESCRIPTIONS (for 10 pins)
   For each:
   - Main keyword, pin title (100 chars)
   - Description (400-500 chars):
     * Keyword in first line
     * Benefit-driven text
     * CTA + 3-5 hashtags
   - Pin design concept

4. KEYWORD RESEARCH
   - 30 high-volume Pinterest keywords
   - Seasonal opportunities
   - Low-competition long-tails

5. POSTING STRATEGY
   - Pins per day, fresh vs. repin ratio
   - Best posting times for this niche

6. ANALYTICS TO TRACK
   - Monthly viewers benchmark
   - Click-through rate target`,
    example_output: "A complete Pinterest strategy with 10 board names, pin descriptions, keyword list, and posting schedule.",
    category_slug: "marketing",
    tags: ["Pinterest SEO", "Pinterest marketing", "pin description", "blog traffic"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Pinterest Marketing",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for Pinterest SEO",
    meta_title: "ChatGPT Prompt for Pinterest SEO and Pin Descriptions | AI Prompt Hub",
    meta_description: "Write SEO-optimized Pinterest pin descriptions and boards that drive traffic using this ChatGPT prompt for bloggers.",
    seo_score: 87,
  },
  {
    title: "ChatGPT Prompt for Video Marketing Explainer Script",
    slug: "chatgpt-prompt-video-marketing-explainer-script",
    description: "Write an engaging product demo or explainer video script that clearly communicates value and drives action.",
    content: `Act as a video marketing specialist. Write a video script for:

Video Type: [Product demo / Explainer / Tutorial / Brand story]
Product/Service: [WHAT YOU'RE SHOWING]
Video Length: [60s / 90s / 2-3 min / 5 min]
Distribution: [Website / YouTube / Social / Sales]
Goal: [Sign up / Purchase / Get a demo]

Write:

1. HOOK (first 5-10 seconds) — CRITICAL
   - Stops the scroll
   - States why they should keep watching
   - 3 hook variations

2. PROBLEM STATEMENT (10-15 seconds)
   - Pain they recognize
   - "If you've ever experienced [X]..."

3. SOLUTION INTRODUCTION (10-15 seconds)
   - Introduce product as the answer
   - One-line promise

4. DEMO / CORE CONTENT
   - Feature → what it does → why it matters
   - [B-ROLL: visual descriptions for editor]
   - Show, don't just tell

5. PROOF POINT (15 seconds)
   - Result stat, customer quote, or before/after

6. CTA (10 seconds)
   - Specific action RIGHT NOW
   - URL or button instruction

7. PRODUCTION NOTES
   - Music style, pacing, text overlays`,
    example_output: "A complete video script with hooks, demo walkthrough, proof point, CTA, and production notes.",
    category_slug: "marketing",
    tags: ["video marketing", "explainer video", "product demo", "video script"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Video Marketing",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for explainer video script",
    meta_title: "ChatGPT Prompt for Video Marketing Explainer Script | AI Prompt Hub",
    meta_description: "Write engaging product demo and explainer video scripts with hooks using this ChatGPT prompt for video marketers.",
    seo_score: 87,
  },
];

// ─── Combine all prompts ───────────────────────────────────
const allPrompts = [
  ...promptsPart1,
  ...promptsPart2,
  ...promptsPart3,
  ...promptsPart4,
  ...promptsPart5,
  ...promptsPart6,
  ...promptsPart7,
  ...extraPrompts,
];

// ─── MAIN ─────────────────────────────────────────────────
const main = async () => {
  let connection;

  try {
    // Direct connection (no pool needed for one-off script)
    connection = await createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ai_prompt_hub',
      charset: 'utf8mb4',
    });

    console.log('✅ Database connected\n');
    console.log(`🚀 Starting SEO Prompt Seeder — ${allPrompts.length} prompts to process\n`);

    // ── Fetch or create required categories ───────────────
    const requiredCategories = [
      { name: 'Content Writing',   slug: 'content-writing',   icon: '✍️',  color: '#6366f1' },
      { name: 'Code Generation',   slug: 'code-generation',   icon: '💻',  color: '#06b6d4' },
      { name: 'Business Strategy', slug: 'business-strategy', icon: '📊',  color: '#10b981' },
      { name: 'Marketing',         slug: 'marketing',         icon: '📢',  color: '#8b5cf6' },
      { name: 'Education',         slug: 'education',         icon: '📚',  color: '#f59e0b' },
      { name: 'Creative Writing',  slug: 'creative-writing',  icon: '🖊️', color: '#ec4899' },
      { name: 'Image Generation',  slug: 'image-generation',  icon: '🎨',  color: '#fda4af' },
      { name: 'Video Generation',  slug: 'video-generation',  icon: '🎬',  color: '#dc2626' },
    ];

    const catMap = {};
    for (const cat of requiredCategories) {
      await connection.query(
        `INSERT IGNORE INTO categories (name, slug, description, icon, color)
         VALUES (?, ?, ?, ?, ?)`,
        [cat.name, cat.slug, `${cat.name} AI prompts`, cat.icon, cat.color]
      );
      const [rows] = await connection.query('SELECT id FROM categories WHERE slug = ?', [cat.slug]);
      catMap[cat.slug] = rows[0].id;
    }
    console.log('📂 Categories mapped:', Object.keys(catMap).join(', '));

    // ── Fetch admin user ───────────────────────────────────
    const [users] = await connection.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    const authorId = users.length > 0 ? users[0].id : null;

    // ── Fetch existing slugs ───────────────────────────────
    const [existing] = await connection.query('SELECT slug FROM prompts');
    const existingSlugs = new Set(existing.map(r => r.slug));
    console.log(`📝 Existing prompts in DB: ${existingSlugs.size}\n`);

    // ── Insert prompts ─────────────────────────────────────
    let inserted = 0;
    let skipped  = 0;
    const catStats = {};
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    for (const p of allPrompts) {
      if (existingSlugs.has(p.slug)) { skipped++; continue; }

      const catId = p.category_slug ? (catMap[p.category_slug] || null) : null;

      await connection.query(
        `INSERT INTO prompts
          (title, slug, description, content, example_output, category_id, author_id,
           tags, difficulty, ai_model, use_case, is_featured, is_published,
           meta_title, meta_description, focus_keyword, seo_score, seo_title,
           schema_type, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          p.title,
          p.slug,
          p.description || '',
          p.content,
          p.example_output || '',
          catId,
          authorId,
          JSON.stringify(p.tags || []),
          p.difficulty || 'intermediate',
          p.ai_model || 'ChatGPT',
          p.use_case || '',
          p.is_featured ? 1 : 0,
          1,
          p.meta_title || p.title,
          p.meta_description || p.description || '',
          p.focus_keyword || '',
          p.seo_score || 80,
          p.meta_title || p.title,
          'HowTo',
          now,
          now,
        ]
      );

      existingSlugs.add(p.slug);
      inserted++;
      catStats[p.category_slug || 'none'] = (catStats[p.category_slug || 'none'] || 0) + 1;
      process.stdout.write(`  Inserted: ${inserted}\r`);
    }

    // ── Report ─────────────────────────────────────────────
    console.log('\n\n═══════════════════════════════════════════════');
    console.log('        ✅  SEO PROMPT SEEDER COMPLETE         ');
    console.log('═══════════════════════════════════════════════');
    console.log(`\n📊 RESULTS`);
    console.log(`  Total prompts in script  : ${allPrompts.length}`);
    console.log(`  Newly inserted           : ${inserted}`);
    console.log(`  Skipped (already exist)  : ${skipped}`);

    const [total] = await connection.query('SELECT COUNT(*) as c FROM prompts');
    console.log(`  Total prompts in DB now  : ${total[0].c}`);

    console.log(`\n📂 CATEGORY DISTRIBUTION (this run)`);
    for (const [cat, count] of Object.entries(catStats)) {
      console.log(`  ${cat.padEnd(30)} : ${count}`);
    }

    console.log(`\n🎯 AVERAGE SEO SCORE : ${Math.round(allPrompts.reduce((s, p) => s + (p.seo_score || 80), 0) / allPrompts.length)}/100`);

    console.log('\n📋 SAMPLE PROMPTS (first 5)');
    allPrompts.slice(0, 5).forEach(p => console.log(`  ▸ ${p.title}`));
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
