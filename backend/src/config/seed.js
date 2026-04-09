import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

const seedDatabase = async () => {
  try {
    const connection = await pool.getConnection();

    // Check if admin already exists
    const [existingAdmin] = await connection.query(
      'SELECT id FROM users WHERE username = ?',
      ['admin']
    );

    if (existingAdmin.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await connection.query(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        ['admin', 'admin@aiprompt.hub', hashedPassword, 'admin']
      );
      console.log('✅ Admin user created (username: admin, password: admin123)');
    }

    // Check if categories exist
    const [existingCategories] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (existingCategories[0].count === 0) {
      const categories = [
        { name: 'Content Writing', slug: 'content-writing', description: 'Prompts for creating compelling articles, blog posts, and marketing copy', icon: '✍️', color: '#6366f1' },
        { name: 'Code Generation', slug: 'code-generation', description: 'Generate code snippets, functions, and complete programs', icon: '💻', color: '#06b6d4' },
        { name: 'Image Prompts', slug: 'image-prompts', description: 'Craft perfect prompts for AI image generation tools', icon: '🎨', color: '#f43f5e' },
        { name: 'Business Strategy', slug: 'business-strategy', description: 'Strategic thinking and business planning prompts', icon: '📊', color: '#10b981' },
        { name: 'Education', slug: 'education', description: 'Learning, teaching, and educational content prompts', icon: '📚', color: '#f59e0b' },
        { name: 'Marketing', slug: 'marketing', description: 'Digital marketing, SEO, and advertising prompts', icon: '📢', color: '#8b5cf6' },
        { name: 'Data Analysis', slug: 'data-analysis', description: 'Data science and analytical thinking prompts', icon: '📈', color: '#14b8a6' },
        { name: 'Creative Writing', slug: 'creative-writing', description: 'Fiction, poetry, and creative storytelling prompts', icon: '🖊️', color: '#ec4899' },
      ];

      for (const cat of categories) {
        await connection.query(
          'INSERT INTO categories (name, slug, description, icon, color) VALUES (?, ?, ?, ?, ?)',
          [cat.name, cat.slug, cat.description, cat.icon, cat.color]
        );
      }
      console.log('✅ Categories seeded');
    }

    // Check if prompts exist
    const [existingPrompts] = await connection.query('SELECT COUNT(*) as count FROM prompts');
    if (existingPrompts[0].count === 0) {
      const prompts = [
        {
          title: 'Blog Post Generator',
          slug: 'blog-post-generator',
          description: 'Generate comprehensive, SEO-optimized blog posts on any topic with proper structure and engaging content.',
          content: 'Write a comprehensive blog post about [TOPIC]. Include:\n\n1. An attention-grabbing headline\n2. An engaging introduction with a hook\n3. At least 5 main sections with H2 headers\n4. Practical examples and actionable tips\n5. Statistics or data points where relevant\n6. A compelling conclusion with a call-to-action\n\nTone: [TONE - professional/casual/academic]\nTarget audience: [AUDIENCE]\nWord count: approximately [NUMBER] words\n\nEnsure the content is:\n- SEO-optimized with natural keyword placement\n- Easy to scan with bullet points and short paragraphs\n- Original and provides unique value\n- Free of jargon unless the audience expects it',
          example_output: 'A well-structured blog post with headers, bullet points, and actionable insights.',
          category_id: 1,
          author_id: 1,
          tags: JSON.stringify(['blog', 'content writing', 'SEO', 'marketing']),
          difficulty: 'beginner',
          ai_model: 'ChatGPT',
          use_case: 'Content Marketing',
          is_featured: true,
        },
        {
          title: 'React Component Generator',
          slug: 'react-component-generator',
          description: 'Generate production-ready React components with proper structure, hooks, and TypeScript support.',
          content: 'Create a React component with the following specifications:\n\nComponent Name: [NAME]\nPurpose: [DESCRIPTION]\n\nRequirements:\n1. Use functional component with React hooks\n2. Include TypeScript interfaces for all props\n3. Implement proper error handling\n4. Add loading states where applicable\n5. Include accessibility attributes (ARIA)\n6. Add JSDoc comments for documentation\n7. Follow the single responsibility principle\n\nStyling approach: [CSS Modules / Styled Components / Tailwind]\nState management: [useState / useReducer / Context]\n\nInclude:\n- Component file\n- Test file with basic test cases\n- Storybook story (if applicable)',
          example_output: 'A complete React component with TypeScript, tests, and documentation.',
          category_id: 2,
          author_id: 1,
          tags: JSON.stringify(['react', 'code', 'typescript', 'frontend']),
          difficulty: 'intermediate',
          ai_model: 'ChatGPT',
          use_case: 'Web Development',
          is_featured: true,
        },
        {
          title: 'Midjourney Photorealistic Portrait',
          slug: 'midjourney-photorealistic-portrait',
          description: 'Create stunning photorealistic portrait prompts for Midjourney with precise lighting and composition control.',
          content: 'Create a photorealistic portrait with these parameters:\n\nSubject: [DESCRIPTION OF PERSON/CHARACTER]\nSetting: [ENVIRONMENT/BACKGROUND]\nLighting: [TYPE - natural/studio/golden hour/dramatic]\nMood: [EMOTION/ATMOSPHERE]\n\nPrompt structure:\n[Subject description], [setting], [lighting type] lighting, [camera angle], shot on [camera model], [lens focal length], [additional style modifiers]\n\n--ar [ASPECT RATIO]\n--v 6\n--style raw\n--q 2\n\nTips:\n- Use specific camera references for realism\n- Include skin texture and detail descriptors\n- Reference specific photographers for style\n- Add film grain or color grading preferences',
          example_output: 'A detailed Midjourney prompt producing photorealistic portrait photography.',
          category_id: 3,
          author_id: 1,
          tags: JSON.stringify(['midjourney', 'image generation', 'portrait', 'photography']),
          difficulty: 'advanced',
          ai_model: 'Midjourney',
          use_case: 'Visual Content',
          is_featured: true,
        },
        {
          title: 'SWOT Analysis Generator',
          slug: 'swot-analysis-generator',
          description: 'Generate comprehensive SWOT analyses for any business or project with actionable strategic insights.',
          content: 'Conduct a thorough SWOT analysis for:\n\nBusiness/Project: [NAME]\nIndustry: [INDUSTRY]\nMarket: [TARGET MARKET]\nCurrent Stage: [startup/growth/mature]\n\nFor each quadrant, provide:\n\nStrengths (Internal Positive):\n- At least 5 key strengths\n- Evidence or metrics supporting each\n\nWeaknesses (Internal Negative):\n- At least 5 honest weaknesses\n- Impact assessment for each\n\nOpportunities (External Positive):\n- At least 5 market opportunities\n- Timeline and feasibility for each\n\nThreats (External Negative):\n- At least 5 potential threats\n- Mitigation strategies for each\n\nAdditionally provide:\n- Strategic recommendations based on SO, WO, ST, WT combinations\n- Priority action items (top 3)\n- Key metrics to track',
          example_output: 'A complete SWOT matrix with strategic recommendations and action items.',
          category_id: 4,
          author_id: 1,
          tags: JSON.stringify(['business', 'strategy', 'analysis', 'planning']),
          difficulty: 'intermediate',
          ai_model: 'ChatGPT',
          use_case: 'Business Planning',
          is_featured: false,
        },
        {
          title: 'Lesson Plan Creator',
          slug: 'lesson-plan-creator',
          description: 'Design engaging and structured lesson plans for any subject with clear learning objectives.',
          content: 'Create a detailed lesson plan:\n\nSubject: [SUBJECT]\nTopic: [SPECIFIC TOPIC]\nGrade/Level: [LEVEL]\nDuration: [TIME]\nClass Size: [NUMBER]\n\nInclude:\n1. Learning Objectives (SMART format)\n2. Required Materials & Resources\n3. Warm-up Activity (5-10 min)\n4. Main Instruction (detailed steps)\n5. Guided Practice Activities\n6. Independent Practice\n7. Assessment Methods\n8. Differentiation strategies for:\n   - Advanced learners\n   - Struggling students\n   - ELL students\n9. Homework/Extension Activity\n10. Reflection Questions\n\nTeaching methodology: [traditional/inquiry-based/project-based/flipped]\nTechnology integration: [yes/no - specify tools]',
          example_output: 'A comprehensive lesson plan with activities, assessments, and differentiation.',
          category_id: 5,
          author_id: 1,
          tags: JSON.stringify(['education', 'teaching', 'lesson plan', 'curriculum']),
          difficulty: 'beginner',
          ai_model: 'ChatGPT',
          use_case: 'Education',
          is_featured: false,
        },
        {
          title: 'Social Media Campaign Strategy',
          slug: 'social-media-campaign-strategy',
          description: 'Build comprehensive social media campaign strategies with content calendars and KPIs.',
          content: 'Design a complete social media campaign:\n\nBrand: [BRAND NAME]\nProduct/Service: [DESCRIPTION]\nCampaign Goal: [AWARENESS/ENGAGEMENT/LEADS/SALES]\nBudget: [AMOUNT]\nDuration: [TIMEFRAME]\nTarget Audience: [DEMOGRAPHICS & PSYCHOGRAPHICS]\n\nDeliver:\n1. Campaign concept & theme\n2. Platform strategy (why each platform)\n3. Content pillars (3-5 themes)\n4. 2-week content calendar with:\n   - Post types (image/video/carousel/story)\n   - Copy drafts for each post\n   - Hashtag strategy\n   - Best posting times\n5. Paid advertising recommendations\n6. Influencer collaboration ideas\n7. Community management guidelines\n8. KPIs and measurement framework\n9. A/B testing recommendations\n10. Crisis management protocol',
          example_output: 'A full campaign strategy with content calendar, ad recommendations, and KPIs.',
          category_id: 6,
          author_id: 1,
          tags: JSON.stringify(['marketing', 'social media', 'campaign', 'strategy']),
          difficulty: 'advanced',
          ai_model: 'ChatGPT',
          use_case: 'Digital Marketing',
          is_featured: true,
        },
        {
          title: 'Python Data Pipeline Builder',
          slug: 'python-data-pipeline-builder',
          description: 'Generate production-ready Python data pipeline code for ETL processes and data transformations.',
          content: 'Create a Python data pipeline with these specifications:\n\nData Source: [SOURCE TYPE - API/CSV/Database/S3]\nData Destination: [DESTINATION]\nTransformations needed:\n1. [TRANSFORMATION 1]\n2. [TRANSFORMATION 2]\n3. [TRANSFORMATION 3]\n\nRequirements:\n- Use pandas for data manipulation\n- Include error handling and logging\n- Add data validation checks\n- Implement retry logic for API calls\n- Add monitoring and alerting hooks\n- Include unit tests\n- Follow PEP 8 standards\n- Add type hints throughout\n\nScheduling: [cron/airflow/manual]\nScale: [EXPECTED DATA VOLUME]\n\nProvide:\n- Main pipeline script\n- Configuration file\n- Docker setup\n- Documentation',
          example_output: 'A complete ETL pipeline with error handling, tests, and Docker configuration.',
          category_id: 7,
          author_id: 1,
          tags: JSON.stringify(['python', 'data', 'ETL', 'pipeline', 'code']),
          difficulty: 'advanced',
          ai_model: 'ChatGPT',
          use_case: 'Data Engineering',
          is_featured: false,
        },
        {
          title: 'Short Story Framework',
          slug: 'short-story-framework',
          description: 'Create captivating short stories with rich characters, vivid settings, and compelling plot arcs.',
          content: 'Write a short story with these parameters:\n\nGenre: [GENRE]\nTheme: [CENTRAL THEME]\nTone: [TONE - dark/light/humorous/suspenseful]\nWord Count: [TARGET WORDS]\nPOV: [FIRST/THIRD/OMNISCIENT]\n\nCharacter Details:\n- Protagonist: [DESCRIPTION, MOTIVATION, FLAW]\n- Antagonist/Conflict source: [DESCRIPTION]\n- Supporting characters: [IF ANY]\n\nSetting:\n- Time period: [WHEN]\n- Location: [WHERE]\n- Atmosphere: [MOOD OF SETTING]\n\nPlot Structure:\n1. Hook (opening line that grabs attention)\n2. Setup (establish character & world)\n3. Inciting incident\n4. Rising action with at least 2 complications\n5. Climax\n6. Resolution (avoid deus ex machina)\n\nStyle notes:\n- Show, don\'t tell\n- Use sensory details\n- Include meaningful dialogue\n- End with resonance, not just conclusion',
          example_output: 'A polished short story with rich characterization and a satisfying arc.',
          category_id: 8,
          author_id: 1,
          tags: JSON.stringify(['creative writing', 'fiction', 'story', 'narrative']),
          difficulty: 'intermediate',
          ai_model: 'ChatGPT',
          use_case: 'Creative Projects',
          is_featured: false,
        },
      ];

      for (const prompt of prompts) {
        await connection.query(
          `INSERT INTO prompts (title, slug, description, content, example_output, category_id, author_id, tags, difficulty, ai_model, use_case, is_featured)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [prompt.title, prompt.slug, prompt.description, prompt.content, prompt.example_output,
           prompt.category_id, prompt.author_id, prompt.tags, prompt.difficulty, prompt.ai_model,
           prompt.use_case, prompt.is_featured]
        );
      }
      console.log('✅ Prompts seeded');
    }

    // Check if blog posts exist
    const [existingPosts] = await connection.query('SELECT COUNT(*) as count FROM blog_posts');
    if (existingPosts[0].count === 0) {
      const blogPosts = [
        {
          title: 'The Ultimate Guide to AI Prompt Engineering in 2025',
          slug: 'ultimate-guide-ai-prompt-engineering-2025',
          excerpt: 'Master the art of prompt engineering with our comprehensive guide covering techniques, best practices, and advanced strategies for working with AI models.',
          content: `<h2>What is Prompt Engineering?</h2>
<p>Prompt engineering is the practice of crafting effective instructions for AI models to produce desired outputs. As AI becomes more integrated into workflows across industries, the ability to communicate effectively with these models has become a crucial skill.</p>

<h2>Why Prompt Engineering Matters</h2>
<p>The quality of your prompts directly impacts the quality of AI outputs. A well-crafted prompt can mean the difference between generic, unusable content and precisely targeted, valuable results.</p>

<h2>Key Techniques</h2>
<h3>1. Be Specific and Clear</h3>
<p>Vague prompts produce vague results. Always specify the format, length, tone, and audience for your desired output.</p>

<h3>2. Use Role-Based Prompting</h3>
<p>Assign a role to the AI: "Act as a senior marketing strategist" gives the model context for the expertise level expected.</p>

<h3>3. Provide Examples (Few-Shot Learning)</h3>
<p>Include one or more examples of the desired output to guide the AI's response pattern.</p>

<h3>4. Chain of Thought</h3>
<p>Ask the AI to "think step by step" to improve reasoning quality on complex tasks.</p>

<h3>5. Iterative Refinement</h3>
<p>Start with a basic prompt and refine based on the output. Each iteration should address specific shortcomings.</p>

<h2>Advanced Strategies</h2>
<p>Once you've mastered the basics, explore techniques like tree-of-thought prompting, constitutional AI approaches, and multi-step workflow automation.</p>

<h2>Conclusion</h2>
<p>Prompt engineering is both an art and a science. By applying these techniques consistently, you'll dramatically improve your AI interactions and outputs.</p>`,
          author_id: 1,
          category: 'Guide',
          tags: JSON.stringify(['prompt engineering', 'AI', 'guide', 'tutorial']),
          status: 'published',
          reading_time: 8,
          is_featured: true,
          published_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        },
        {
          title: 'Top 10 ChatGPT Prompts for Content Creators',
          slug: 'top-10-chatgpt-prompts-content-creators',
          excerpt: 'Discover the most effective ChatGPT prompts that every content creator should have in their toolkit for producing high-quality content efficiently.',
          content: `<h2>Supercharge Your Content Creation</h2>
<p>Content creators are leveraging AI to produce better content faster. Here are the top 10 prompts that will transform your workflow.</p>

<h2>1. The Content Ideation Prompt</h2>
<p>Use this prompt to generate unlimited content ideas based on your niche, audience, and trending topics.</p>

<h2>2. The Headline Optimizer</h2>
<p>Transform boring headlines into click-worthy titles that drive engagement without being clickbait.</p>

<h2>3. The SEO Content Brief</h2>
<p>Generate comprehensive content briefs with keyword targets, structure, and competitive analysis.</p>

<h2>4. The Repurposing Engine</h2>
<p>Turn one piece of content into multiple formats: blog to social posts, threads, newsletters, and video scripts.</p>

<h2>5. The Hook Generator</h2>
<p>Create compelling opening lines that stop the scroll and demand attention.</p>

<h2>6. The Email Sequence Builder</h2>
<p>Design nurture email sequences that convert subscribers into customers.</p>

<h2>7. The Social Media Calendar</h2>
<p>Plan a month of social content with themed days, post types, and engagement strategies.</p>

<h2>8. The Video Script Template</h2>
<p>Structure YouTube videos and short-form content with proper pacing and retention hooks.</p>

<h2>9. The Audience Research Prompt</h2>
<p>Deep-dive into audience psychology, pain points, and desires for targeted content.</p>

<h2>10. The Content Audit Assistant</h2>
<p>Analyze existing content for gaps, improvement opportunities, and consolidation possibilities.</p>

<h2>Start Using These Today</h2>
<p>Each prompt is a starting point. Customize them for your specific niche and voice for the best results.</p>`,
          author_id: 1,
          category: 'Tips',
          tags: JSON.stringify(['ChatGPT', 'content creation', 'prompts', 'productivity']),
          status: 'published',
          reading_time: 6,
          is_featured: true,
          published_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        },
        {
          title: 'How AI is Transforming Software Development',
          slug: 'how-ai-transforming-software-development',
          excerpt: 'Explore how artificial intelligence is revolutionizing the way developers write code, test applications, and ship products faster than ever.',
          content: `<h2>The AI Revolution in Development</h2>
<p>Software development is experiencing its biggest transformation since the advent of version control. AI coding assistants are changing how we write, review, and maintain code.</p>

<h2>AI-Powered Code Generation</h2>
<p>Tools like GitHub Copilot and Cursor have made AI pair programming mainstream. Developers can now describe functionality in natural language and receive working code implementations.</p>

<h2>Automated Testing</h2>
<p>AI can generate test cases, identify edge cases, and even predict where bugs are likely to occur based on code patterns.</p>

<h2>Code Review Enhancement</h2>
<p>AI assistants can review pull requests, suggest improvements, identify security vulnerabilities, and ensure code style consistency.</p>

<h2>Documentation Generation</h2>
<p>From inline comments to comprehensive API documentation, AI can generate and maintain documentation automatically.</p>

<h2>The Future</h2>
<p>As AI capabilities evolve, we can expect even deeper integration into the development lifecycle, from requirements gathering to deployment optimization.</p>`,
          author_id: 1,
          category: 'Industry',
          tags: JSON.stringify(['AI', 'software development', 'coding', 'technology']),
          status: 'published',
          reading_time: 5,
          is_featured: false,
          published_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        },
      ];

      for (const post of blogPosts) {
        await connection.query(
          `INSERT INTO blog_posts (title, slug, excerpt, content, author_id, category, tags, status, reading_time, is_featured, published_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [post.title, post.slug, post.excerpt, post.content, post.author_id, post.category,
           post.tags, post.status, post.reading_time, post.is_featured, post.published_at]
        );
      }
      console.log('✅ Blog posts seeded');
    }

    connection.release();
    console.log('✅ Database seeding complete');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
};

export default seedDatabase;
