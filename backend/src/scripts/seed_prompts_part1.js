// PART 1: Business, Resume, Freelancing Prompts (prompts 1-100)
export const promptsPart1 = [
  // ── BUSINESS (1-25) ──────────────────────────────────────
  {
    title: "ChatGPT Prompt for Writing a Business Plan (Investor-Ready)",
    slug: "chatgpt-prompt-business-plan-investor-ready",
    description: "Generate a complete investor-ready business plan with financials, market analysis, and executive summary using ChatGPT.",
    content: `Act as a seasoned startup advisor and business plan consultant. Write a comprehensive, investor-ready business plan for the following venture:

Business Name: [BUSINESS NAME]
Industry: [INDUSTRY]
Product/Service: [BRIEF DESCRIPTION]
Target Market: [TARGET AUDIENCE]
Stage: [Idea/Pre-revenue/Revenue-generating]

Structure the business plan with these sections:

1. EXECUTIVE SUMMARY (1 page max)
   - Problem statement
   - Solution overview
   - Business model
   - Traction (if any)
   - Funding ask and use of funds

2. PROBLEM & OPPORTUNITY
   - Market pain point with data
   - Current solutions and their gaps
   - Total Addressable Market (TAM), SAM, SOM

3. SOLUTION & PRODUCT
   - Core features and benefits
   - Unique value proposition
   - Product roadmap (6-month, 1-year, 3-year)

4. BUSINESS MODEL
   - Revenue streams
   - Pricing strategy
   - Unit economics (CAC, LTV, margins)

5. MARKET ANALYSIS
   - Market size with cited data
   - Competitive landscape (5x5 matrix)
   - Competitive advantages

6. GO-TO-MARKET STRATEGY
   - Launch plan
   - Customer acquisition channels
   - Partnership opportunities

7. TEAM
   - Founder backgrounds
   - Key hires needed
   - Advisory board

8. FINANCIAL PROJECTIONS (3-Year)
   - Revenue forecast
   - Expense breakdown
   - Break-even analysis
   - Key assumptions

9. FUNDING REQUEST
   - Amount sought
   - Use of funds (pie chart breakdown)
   - Expected milestones

Format with clear headers, bullet points, and placeholders for charts. Use professional, confident language.`,
    example_output: "A 10-15 page investor-ready business plan with professional structure, realistic financial projections, and compelling narrative.",
    category_slug: "business-strategy",
    tags: ["business plan", "investor pitch", "startup", "ChatGPT business"],
    difficulty: "advanced",
    ai_model: "ChatGPT",
    use_case: "Business Planning",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for business plan",
    meta_title: "ChatGPT Prompt for Business Plan (Investor-Ready) | AI Prompt Hub",
    meta_description: "Use this ChatGPT prompt to write a complete investor-ready business plan with financial projections, market analysis, and executive summary.",
    seo_score: 92,
  },
  {
    title: "ChatGPT Prompt for Cold Email Outreach That Gets Replies",
    slug: "chatgpt-prompt-cold-email-outreach-gets-replies",
    description: "Write high-converting cold emails for B2B sales, partnerships, or freelance clients using this proven ChatGPT prompt.",
    content: `Act as a top-performing B2B sales copywriter who has sent thousands of cold emails with 40%+ open rates. Write a cold email for:

Sender: [YOUR NAME / COMPANY]
Recipient: [TARGET PERSON / COMPANY TYPE]
Goal: [Book a call / Partnership / Sale / Collaboration]
Product/Service being offered: [DESCRIPTION]
Key pain point addressed: [PAIN POINT]

Requirements for the email:
- Subject line (3 variations, A/B/C)
- Opening line that references something specific about them
- One-sentence value proposition
- Social proof element (result, client name, or metric)
- Clear, low-friction CTA
- Total length: under 120 words (body only)

Follow these rules:
- No "I hope this email finds you well"
- Lead with THEIR benefit, not your features
- Personalization hook in line 1
- Use pattern interrupt in subject line
- One clear ask — never two CTAs

Also provide:
- A 3-email follow-up sequence (Day 3, Day 7, Day 14)
- Subject line for each follow-up
- One-line pivot if no response`,
    example_output: "3 subject line variants, a 100-word cold email, and a 3-step follow-up sequence with clear CTAs.",
    category_slug: "marketing",
    tags: ["cold email", "B2B sales", "outreach", "copywriting"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Sales & Outreach",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for cold email",
    meta_title: "ChatGPT Prompt for Cold Email That Gets Replies | AI Prompt Hub",
    meta_description: "Generate high-converting cold emails with follow-up sequences using this ChatGPT prompt for B2B outreach, sales, and client acquisition.",
    seo_score: 90,
  },
  {
    title: "ChatGPT Prompt for Writing a Pitch Deck Script (VC-Ready)",
    slug: "chatgpt-prompt-pitch-deck-script-vc-ready",
    description: "Generate a compelling slide-by-slide pitch deck script to present to venture capitalists or angel investors.",
    content: `Act as a startup pitch coach who has helped founders raise over $50M. Write a VC-ready pitch deck script for:

Company: [NAME]
Industry: [INDUSTRY]
Problem: [CORE PROBLEM]
Solution: [YOUR SOLUTION]
Ask: [AMOUNT] at [VALUATION]
Traction: [KEY METRICS]

Create script for these 12 slides:

Slide 1 — TITLE
Slide 2 — PROBLEM (make it visceral; use a story)
Slide 3 — SOLUTION (demo narrative)
Slide 4 — WHY NOW (market timing)
Slide 5 — MARKET SIZE (TAM/SAM/SOM with sources)
Slide 6 — PRODUCT (key features, demo flow)
Slide 7 — BUSINESS MODEL (how you make money)
Slide 8 — TRACTION (metrics, growth rate, logos)
Slide 9 — COMPETITION (positioning matrix)
Slide 10 — TEAM (bios with credibility markers)
Slide 11 — FINANCIALS (3-year projection, key milestones)
Slide 12 — ASK (use of funds, timeline to next round)

For each slide provide:
- Spoken script (30-45 seconds)
- Key visual suggestion
- 1 power statistic or quote to include

Total presentation: 10-12 minutes`,
    example_output: "A complete 12-slide pitch deck script with spoken narrative, visual guidance, and statistics for each slide.",
    category_slug: "business-strategy",
    tags: ["pitch deck", "venture capital", "startup funding", "investor presentation"],
    difficulty: "advanced",
    ai_model: "ChatGPT",
    use_case: "Startup Fundraising",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for pitch deck",
    meta_title: "ChatGPT Prompt for Pitch Deck Script (VC-Ready) | AI Prompt Hub",
    meta_description: "Use this ChatGPT prompt to write a compelling VC-ready pitch deck script with slide-by-slide narrative, visuals, and statistics.",
    seo_score: 91,
  },
  {
    title: "ChatGPT Prompt for Market Research Report (Any Industry)",
    slug: "chatgpt-prompt-market-research-report-any-industry",
    description: "Generate detailed market research reports with competitive analysis, trends, and actionable insights for any industry.",
    content: `Act as a market research analyst from a top consulting firm (McKinsey/BCG level). Conduct a comprehensive market research report for:

Industry/Niche: [INDUSTRY]
Geographic Focus: [REGION/GLOBAL]
Purpose: [Investment / Product launch / Strategy / Academic]

Deliver a structured report with:

1. EXECUTIVE SUMMARY (3 bullet points max)

2. MARKET OVERVIEW
   - Market definition and scope
   - Current market size (with year and source)
   - Historical growth rate (5 years)
   - Projected CAGR and forecast

3. KEY MARKET DRIVERS
   - 5 forces driving growth
   - Technology enablers
   - Regulatory tailwinds

4. MARKET CHALLENGES
   - 4 main barriers/risks
   - Regulatory headwinds

5. COMPETITIVE LANDSCAPE
   - Top 5-7 players with market share estimate
   - Competitive strategies
   - Recent M&A activity

6. CONSUMER/BUYER ANALYSIS
   - Primary buyer personas (3)
   - Purchase decision factors
   - Emerging behavior shifts

7. TRENDS TO WATCH (Next 2-3 years)
   - Technology trends
   - Business model innovations
   - Geopolitical factors

8. OPPORTUNITY GAPS
   - 3 underserved segments
   - White-space opportunities

9. RECOMMENDATIONS
   - Strategic entry points
   - Risk mitigation

Format with section headers, bullet points, and data tables where applicable.`,
    example_output: "A 15-20 section market research report with competitive analysis, buyer personas, trend forecasts, and strategic recommendations.",
    category_slug: "business-strategy",
    tags: ["market research", "competitive analysis", "industry report", "business strategy"],
    difficulty: "advanced",
    ai_model: "ChatGPT",
    use_case: "Market Research",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for market research report",
    meta_title: "ChatGPT Prompt for Market Research Report | AI Prompt Hub",
    meta_description: "Generate a comprehensive market research report with competitive analysis, buyer personas, and strategic insights using this ChatGPT prompt.",
    seo_score: 88,
  },
  {
    title: "ChatGPT Prompt for Writing Terms and Conditions (Small Business)",
    slug: "chatgpt-prompt-writing-terms-conditions-small-business",
    description: "Generate a professional Terms and Conditions document for your website, SaaS, or ecommerce store without hiring a lawyer.",
    content: `Act as a legal document specialist who creates clear, professional terms and conditions. Draft a Terms and Conditions document for:

Business Type: [SaaS / E-commerce / Service Business / Blog / App]
Business Name: [NAME]
Website URL: [URL]
Country/Jurisdiction: [COUNTRY]
Services/Products offered: [BRIEF DESCRIPTION]

Include these sections (in plain English, not legalese):

1. ACCEPTANCE OF TERMS
2. DESCRIPTION OF SERVICES
3. USER ACCOUNTS & REGISTRATION
4. PAYMENT TERMS & BILLING (if applicable)
   - Pricing, billing cycle, refund policy
5. INTELLECTUAL PROPERTY RIGHTS
   - Who owns what
6. USER CONDUCT & PROHIBITED ACTIVITIES
7. PRIVACY & DATA HANDLING (reference Privacy Policy)
8. LIMITATION OF LIABILITY
9. DISCLAIMER OF WARRANTIES
10. TERMINATION OF SERVICE
    - Grounds and process
11. INDEMNIFICATION
12. GOVERNING LAW & DISPUTE RESOLUTION
13. CHANGES TO TERMS
14. CONTACT INFORMATION

Style requirements:
- Plain English where possible
- Numbered sections for easy reference
- Current date placeholder
- Avoid excessive legal jargon
- Add note recommending legal review`,
    example_output: "A complete, professional Terms & Conditions document with all standard sections, ready to publish after legal review.",
    category_slug: "business-strategy",
    tags: ["terms and conditions", "legal document", "small business", "website legal"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Legal Documents",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for terms and conditions",
    meta_title: "ChatGPT Prompt for Terms and Conditions (Small Business) | AI Prompt Hub",
    meta_description: "Generate a professional Terms and Conditions document for your website or app using this ChatGPT prompt — no lawyer needed for the first draft.",
    seo_score: 85,
  },
  {
    title: "ChatGPT Prompt for Creating a Sales Funnel Strategy",
    slug: "chatgpt-prompt-sales-funnel-strategy",
    description: "Design a complete sales funnel from awareness to conversion for any product or service using ChatGPT.",
    content: `Act as a conversion rate optimization expert and sales funnel architect. Design a complete sales funnel for:

Product/Service: [DESCRIPTION]
Price Point: [PRICE]
Target Audience: [DEMOGRAPHICS & PSYCHOGRAPHICS]
Traffic Source: [Organic / Paid / Social / Email]
Current Conversion Problem: [WHERE PEOPLE DROP OFF]

Build a detailed funnel covering:

STAGE 1 — AWARENESS (Top of Funnel)
- Content types that attract ideal customers
- SEO/Ad angles to use
- Lead magnet idea (title + format)

STAGE 2 — CONSIDERATION (Middle of Funnel)
- Email nurture sequence (5 emails, subject + preview)
- Retargeting ad copy (2 variants)
- Comparison/objection content

STAGE 3 — DECISION (Bottom of Funnel)
- Sales page structure (section-by-section)
- Offer stack (what to include)
- Urgency/scarcity elements
- Guarantee language

STAGE 4 — RETENTION & UPSELL
- Onboarding email (new customer)
- Upsell/cross-sell opportunity
- Referral program concept

For each stage include:
- Key message
- CTA
- Success metric to track`,
    example_output: "A complete 4-stage sales funnel with lead magnets, email sequences, sales page structure, and upsell strategy.",
    category_slug: "marketing",
    tags: ["sales funnel", "conversion optimization", "marketing strategy", "lead generation"],
    difficulty: "advanced",
    ai_model: "ChatGPT",
    use_case: "Sales & Marketing",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for sales funnel",
    meta_title: "ChatGPT Prompt for Sales Funnel Strategy | AI Prompt Hub",
    meta_description: "Use this ChatGPT prompt to design a complete 4-stage sales funnel with lead magnets, email sequences, and conversion strategies for any business.",
    seo_score: 90,
  },
  {
    title: "ChatGPT Prompt for Competitor Analysis Framework",
    slug: "chatgpt-prompt-competitor-analysis-framework",
    description: "Conduct a deep competitor analysis with positioning gaps and strategic insights using ChatGPT.",
    content: `Act as a competitive intelligence analyst. Conduct a thorough competitor analysis for:

My Business: [NAME & DESCRIPTION]
My Product/Service: [WHAT I SELL]
Competitor 1: [NAME]
Competitor 2: [NAME]
Competitor 3: [NAME]
My Target Market: [AUDIENCE]

For EACH COMPETITOR analyze:

1. BUSINESS PROFILE
   - Estimated revenue/funding
   - Team size
   - Years in market
   - Business model

2. PRODUCT/SERVICE ANALYSIS
   - Core features
   - Pricing structure
   - What they do better than me
   - Their weaknesses

3. MARKETING & POSITIONING
   - Key messaging and tagline
   - Target audience segment
   - Main traffic channels
   - Content strategy

4. CUSTOMER SENTIMENT
   - Common praise (based on typical reviews)
   - Common complaints
   - Overall satisfaction signals

THEN PROVIDE:

5. POSITIONING MAP (text-based, 2x2 matrix)
   - Plot competitors on price vs. quality
   - Plot competitors on niche vs. broad

6. OPPORTUNITY GAPS
   - 3 underserved customer needs
   - 2 messaging angles competitors miss

7. STRATEGIC RECOMMENDATIONS
   - How to differentiate
   - Quick wins (next 30 days)
   - Long-term positioning strategy`,
    example_output: "A detailed competitor analysis with positioning maps, opportunity gaps, and strategic differentiation recommendations.",
    category_slug: "business-strategy",
    tags: ["competitor analysis", "business strategy", "market positioning", "competitive intelligence"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Business Strategy",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for competitor analysis",
    meta_title: "ChatGPT Prompt for Competitor Analysis Framework | AI Prompt Hub",
    meta_description: "Run a deep competitor analysis with positioning maps and strategic gaps using this ChatGPT prompt for any business or product.",
    seo_score: 87,
  },
  {
    title: "ChatGPT Prompt for Pricing Strategy Optimization",
    slug: "chatgpt-prompt-pricing-strategy-optimization",
    description: "Optimize your product or service pricing with psychological pricing tactics and revenue maximization strategies.",
    content: `Act as a pricing strategy consultant who has worked with SaaS, e-commerce, and service businesses. Help me optimize pricing for:

Business/Product: [NAME]
Current Price: [AMOUNT]
Cost to deliver: [COGS or effort]
Target margin: [%]
Competitors' prices: [LIST]
Customer segment: [WHO BUYS]
Willingness-to-pay signals: [ANY FEEDBACK]

Deliver:

1. PRICING MODEL EVALUATION
   - Why current pricing may be leaving money on table
   - Best pricing model for my business type
   (flat fee / tiered / usage-based / freemium / value-based)

2. PSYCHOLOGICAL PRICING TACTICS
   - Anchoring strategy
   - Decoy pricing setup (if applicable)
   - Charm pricing vs. round numbers (and when to use each)
   - Price framing (per day, per outcome, etc.)

3. TIERED PLAN STRUCTURE (if applicable)
   - Starter / Pro / Enterprise names and price points
   - Feature allocation per tier
   - What to use as the "most popular" badge

4. PRICE INCREASE STRATEGY (if underpriced)
   - How to raise prices without losing customers
   - Grandfather vs. migrate existing customers
   - Announcement messaging

5. REVENUE MAXIMIZATION
   - Upsell opportunity
   - Annual vs. monthly pricing ratio
   - Bundle strategy`,
    example_output: "A complete pricing strategy with tier structure, psychological tactics, and revenue maximization recommendations.",
    category_slug: "business-strategy",
    tags: ["pricing strategy", "SaaS pricing", "business revenue", "value-based pricing"],
    difficulty: "advanced",
    ai_model: "ChatGPT",
    use_case: "Business Strategy",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for pricing strategy",
    meta_title: "ChatGPT Prompt for Pricing Strategy Optimization | AI Prompt Hub",
    meta_description: "Optimize your pricing with psychological tactics, tier structures, and revenue strategies using this expert ChatGPT prompt for businesses.",
    seo_score: 86,
  },
  {
    title: "ChatGPT Prompt for Writing a Partnership Proposal",
    slug: "chatgpt-prompt-writing-partnership-proposal",
    description: "Write a persuasive business partnership proposal that clearly communicates shared value and terms.",
    content: `Act as a business development executive with 10+ years experience structuring partnerships. Write a partnership proposal for:

My Company: [NAME + BRIEF DESCRIPTION]
Partner Company: [NAME + WHAT THEY DO]
Partnership Type: [Co-marketing / Revenue share / Integration / Distribution]
What I bring to the table: [MY VALUE]
What I want from them: [THEIR VALUE]
Proposed terms: [ANY INITIAL IDEAS]

Structure the proposal:

1. EXECUTIVE SUMMARY (1 paragraph)
   - Partnership concept in plain terms

2. ABOUT US
   - 5 credibility bullets
   - Relevant metrics/traction

3. THE OPPORTUNITY
   - Market gap this partnership addresses
   - Why us together is better than separate

4. PARTNERSHIP STRUCTURE
   - What each party contributes
   - What each party receives
   - Exclusivity or non-compete notes

5. REVENUE MODEL (if applicable)
   - How revenue is split
   - Payment terms
   - Reporting cadence

6. GO-TO-MARKET PLAN
   - Launch timeline (90-day plan)
   - Joint marketing activities
   - Co-branded assets needed

7. SUCCESS METRICS
   - Key KPIs to measure partnership
   - Review cadence

8. NEXT STEPS
   - Decision deadline
   - Who to contact
   - Call scheduling CTA`,
    example_output: "A professional partnership proposal with value exchange, revenue model, and 90-day launch plan.",
    category_slug: "business-strategy",
    tags: ["partnership proposal", "business development", "B2B partnerships", "collaboration"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Business Development",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for partnership proposal",
    meta_title: "ChatGPT Prompt for Business Partnership Proposal | AI Prompt Hub",
    meta_description: "Write a persuasive business partnership proposal with value structure and launch plan using this ChatGPT prompt for business development.",
    seo_score: 84,
  },
  {
    title: "ChatGPT Prompt for Customer Persona Development (B2B & B2C)",
    slug: "chatgpt-prompt-customer-persona-development-b2b-b2c",
    description: "Build detailed, research-backed customer personas for B2B or B2C businesses with psychographics and buying triggers.",
    content: `Act as a market research specialist and customer psychology expert. Create detailed buyer personas for:

Business: [NAME]
Product/Service: [WHAT YOU SELL]
Business Type: [B2B / B2C / Both]
Industry: [INDUSTRY]
Price Point: [AFFORDABLE / MID-MARKET / PREMIUM]

For EACH persona (create 3), provide:

DEMOGRAPHIC PROFILE
- Name (fictional), age, gender, location
- Job title and seniority (B2B) OR lifestyle segment (B2C)
- Income level / company size
- Education level

PSYCHOGRAPHIC PROFILE
- Core values (what do they care most about?)
- Identity (how do they see themselves?)
- Aspirations (where do they want to be?)
- Fears and frustrations

BUYING BEHAVIOR
- How they discover products in this space
- Platforms and media they trust
- Information sources before buying
- Decision-making timeline

PAIN POINTS (related to your product)
- Top 3 problems they face daily
- Emotional cost of these problems
- What they've tried before (and why it failed)

BUYING TRIGGERS
- What would push them to buy NOW
- Objections to overcome
- Magic words that resonate

MESSAGING FRAMEWORK
- Headline angle for this persona
- Value prop statement
- Best channel to reach them`,
    example_output: "3 detailed buyer personas with demographics, psychographics, pain points, and targeted messaging frameworks.",
    category_slug: "marketing",
    tags: ["buyer persona", "customer research", "target audience", "marketing strategy"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Marketing Research",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for customer persona",
    meta_title: "ChatGPT Prompt for Customer Persona Development | AI Prompt Hub",
    meta_description: "Build research-backed B2B and B2C customer personas with psychographics and buying triggers using this ChatGPT prompt for marketers.",
    seo_score: 89,
  },

  // ── RESUME / JOB / INTERVIEW (11-30) ──────────────────────
  {
    title: "ChatGPT Prompt for Resume Writing (Professional ATS-Optimized CV)",
    slug: "chatgpt-prompt-resume-writing-professional-ats-optimized-cv",
    description: "Create an ATS-optimized, professionally written resume that lands interviews — tailored to specific job descriptions.",
    content: `Act as a professional resume writer and career coach with 10+ years experience helping candidates land roles at top companies. Write an ATS-optimized resume for:

Candidate Name: [NAME]
Target Job Title: [JOB TITLE]
Target Company Type: [Startup / Enterprise / Agency / Government]
Years of Experience: [NUMBER]
Current Role: [CURRENT JOB TITLE]
Key Skills: [LIST 8-10]
Current Resume Content: [PASTE YOUR EXISTING BULLET POINTS OR EXPERIENCE]
Job Description to Target: [PASTE JOB DESCRIPTION]

Create a resume with:

1. HEADER
   - Name, phone, email, LinkedIn URL, portfolio/GitHub (if applicable)

2. PROFESSIONAL SUMMARY (3-4 lines)
   - Lead with years of experience + title
   - Include 2 quantified achievements
   - Mirror keywords from the job description

3. CORE COMPETENCIES (12-15 keywords)
   - Extracted from job description
   - Formatted as a keyword grid

4. WORK EXPERIENCE (reverse chronological)
   For each role:
   - Company | Title | Date range | Location
   - 4-6 bullet points using: [Action Verb] + [Task] + [Quantified Result]
   - Start each bullet with a strong action verb
   - Include at least 3 numbers/metrics per role

5. EDUCATION
   - Degree, Major, University, Year
   - GPA (if 3.5+), Honors, Relevant coursework

6. CERTIFICATIONS & SKILLS
   - Technical skills formatted for ATS parsing

Rules: No tables, no graphics, no headers in text boxes. Use standard fonts. Tailor to the job description keywords.`,
    example_output: "A complete ATS-optimized resume with quantified achievements, keyword-rich summary, and properly formatted sections ready to submit.",
    category_slug: "content-writing",
    tags: ["resume writing", "ATS resume", "CV", "job application", "career"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Career Development",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for resume writing",
    meta_title: "ChatGPT Prompt for Resume Writing (ATS-Optimized CV) | AI Prompt Hub",
    meta_description: "Write an ATS-optimized, professional resume that lands interviews using this ChatGPT prompt — tailored to any job description.",
    seo_score: 95,
  },
  {
    title: "ChatGPT Prompt for Cover Letter Writing (Job Application)",
    slug: "chatgpt-prompt-cover-letter-writing-job-application",
    description: "Generate a compelling, personalized cover letter that gets you past initial screening and into interviews.",
    content: `Act as a professional career coach who has helped 500+ candidates land their dream jobs. Write a compelling cover letter for:

Applicant Name: [NAME]
Job Title Applying For: [TITLE]
Company Name: [COMPANY]
Company's mission/values: [FROM THEIR WEBSITE]
Hiring Manager Name: [IF KNOWN]
Years of relevant experience: [NUMBER]
Your biggest relevant achievement: [QUANTIFIED RESULT]
Why this specific company: [GENUINE REASON]
Job Description: [PASTE HERE]

Write the cover letter with this structure:

OPENING PARAGRAPH (3-4 sentences)
- Hook: Start with a compelling statement or shared value
- State the role and how you heard about it
- Immediately demonstrate you understand their business

MIDDLE PARAGRAPH 1 — RELEVANCE
- Your most relevant experience
- 2 quantified achievements that match their needs
- Mirror language from the job description

MIDDLE PARAGRAPH 2 — FIT
- Why THIS company specifically (not generic)
- Cultural fit signals
- What you'd bring in first 90 days

CLOSING PARAGRAPH
- Express enthusiasm without desperation
- Clear CTA (when you'll follow up)
- Professional sign-off

Formatting rules:
- Under 400 words
- Professional but human tone
- No "I am writing to apply for..." opener
- No generic phrases like "team player" or "detail-oriented"`,
    example_output: "A personalized 350-word cover letter with a compelling opening, quantified achievements, and a clear call to action.",
    category_slug: "content-writing",
    tags: ["cover letter", "job application", "career", "interview", "resume"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Career Development",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for cover letter",
    meta_title: "ChatGPT Prompt for Cover Letter Writing | AI Prompt Hub",
    meta_description: "Generate a compelling, personalized cover letter that gets you past screening using this ChatGPT prompt for any job application.",
    seo_score: 93,
  },
  {
    title: "ChatGPT Prompt for Job Interview Preparation (Behavioral Questions)",
    slug: "chatgpt-prompt-job-interview-preparation-behavioral-questions",
    description: "Prepare for any job interview with STAR-method answers to the most common behavioral and situational questions.",
    content: `Act as an executive career coach and former Fortune 500 hiring manager. Help me prepare for a job interview for:

Job Title: [TITLE]
Company: [COMPANY]
Industry: [INDUSTRY]
My Background: [BRIEF SUMMARY OF EXPERIENCE]
Level: [Entry / Mid / Senior / Executive]

1. GENERATE STAR-METHOD ANSWERS for these common questions:
   a) "Tell me about yourself" (60-second pitch)
   b) "Tell me about a time you failed"
   c) "Describe a conflict with a coworker and how you resolved it"
   d) "Tell me about your greatest achievement"
   e) "Why do you want to leave your current job?"
   f) "Where do you see yourself in 5 years?"
   g) "Tell me about a time you handled a difficult client"
   h) "Give an example of leading a team through change"

For EACH answer:
- Situation (brief context)
- Task (what was your responsibility)
- Action (specific steps you took)
- Result (quantified outcome)
- Why this matters for THIS role

2. TOP 5 QUESTIONS TO ASK THE INTERVIEWER
   - Questions that show strategic thinking
   - Questions that demonstrate you've done research

3. SALARY NEGOTIATION SCRIPT
   - How to respond when asked about salary expectations
   - Counter-offer language

4. RED FLAGS TO AVOID
   - Common mistakes for this role/level`,
    example_output: "Full STAR-method answers for 8 behavioral questions, 5 intelligent interview questions, and salary negotiation scripts.",
    category_slug: "content-writing",
    tags: ["job interview", "behavioral questions", "STAR method", "career", "interview prep"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Career Development",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for job interview preparation",
    meta_title: "ChatGPT Prompt for Job Interview Preparation | AI Prompt Hub",
    meta_description: "Prepare STAR-method answers for behavioral interview questions using this ChatGPT prompt — includes salary negotiation scripts too.",
    seo_score: 94,
  },
  {
    title: "ChatGPT Prompt for LinkedIn Profile Optimization (All-Star Status)",
    slug: "chatgpt-prompt-linkedin-profile-optimization-all-star",
    description: "Rewrite your LinkedIn profile to achieve All-Star status, attract recruiters, and generate inbound opportunities.",
    content: `Act as a LinkedIn profile expert and personal branding specialist who has helped 200+ professionals attract recruiters and clients. Optimize my LinkedIn profile for:

Name: [NAME]
Current Role: [TITLE]
Target Role / Goal: [WHAT YOU WANT — Job / Clients / Speaking / Partnerships]
Industry: [INDUSTRY]
Years of Experience: [NUMBER]
Top 3 Skills: [LIST]
Biggest Achievement: [QUANTIFIED RESULT]
Current Profile Content: [PASTE HEADLINE, ABOUT, AND EXPERIENCE]

Rewrite:

1. HEADLINE (220 characters max)
   - Include: Current role + Value delivered + Key keyword
   - 3 variations (recruiter-facing, client-facing, authority-positioning)

2. ABOUT SECTION (2,600 chars max)
   - Hook: First 2 lines must work before "see more" cutoff
   - Paragraph 1: Who you are and what you do
   - Paragraph 2: Key results + proof points (numbers)
   - Paragraph 3: How you work / methodology
   - Paragraph 4: Types of people you help
   - CTA: How to contact you / what they should do next
   - Format with spacing and emojis for scanability

3. EXPERIENCE BULLET POINT REWRITES
   - Rewrite 3 role entries with achievement-led bullets

4. SKILLS SECTION
   - Top 15 skills to add for your target goal

5. FEATURED SECTION IDEAS
   - 3 content pieces to feature that build credibility`,
    example_output: "3 headline variants, a compelling About section with hook and CTA, rewritten experience bullets, and skills optimization list.",
    category_slug: "content-writing",
    tags: ["LinkedIn optimization", "personal branding", "career", "LinkedIn profile", "recruiters"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Career Development",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for LinkedIn profile optimization",
    meta_title: "ChatGPT Prompt for LinkedIn Profile Optimization | AI Prompt Hub",
    meta_description: "Rewrite your LinkedIn profile to All-Star status and attract recruiters using this comprehensive ChatGPT prompt for professionals.",
    seo_score: 92,
  },
  {
    title: "ChatGPT Prompt for Salary Negotiation Email (Counter Offer)",
    slug: "chatgpt-prompt-salary-negotiation-email-counter-offer",
    description: "Write a confident, professional salary negotiation email that increases your offer without damaging the relationship.",
    content: `Act as a career coach specialized in compensation negotiation. Write a salary negotiation email for:

Name: [YOUR NAME]
Position Offered: [JOB TITLE]
Offer Received: $[AMOUNT] + [BENEFITS]
Salary Target: $[TARGET AMOUNT]
Reason for negotiation: [Market rate / Competing offer / Experience level]
Competing offer (if any): $[AMOUNT] from [COMPANY] (keep vague if preferred)
Special circumstances: [Relocation / Remote / Skills gap, if any]

Write 2 versions:

VERSION A — EMAIL COUNTER OFFER
- Professional opening that expresses genuine excitement
- One sentence anchoring to the market or competing data
- Specific counter number (not a range)
- Non-salary requests if appropriate (equity, start date, title, signing bonus)
- Language that signals flexibility while being firm
- Closing that keeps the relationship warm

VERSION B — PHONE SCRIPT
- Opening line after getting the offer
- How to pause before responding
- 3 sentences to negotiate on the call
- How to handle "this is our best offer"
- How to close the call regardless of outcome

Include:
- What to say if they say NO
- Negotiation timing advice
- Red lines (when to accept vs. walk away)`,
    example_output: "Two negotiation scripts (email and phone), objection handling, and advice on timing and red lines for offer acceptance.",
    category_slug: "content-writing",
    tags: ["salary negotiation", "counter offer", "job offer", "career", "compensation"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Career Development",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for salary negotiation",
    meta_title: "ChatGPT Prompt for Salary Negotiation Email | AI Prompt Hub",
    meta_description: "Write a confident salary negotiation email and phone script using this ChatGPT prompt — increase your job offer without damaging relationships.",
    seo_score: 90,
  },

  // ── FREELANCING / FIVERR / UPWORK (16-30) ────────────────
  {
    title: "ChatGPT Prompt for Writing Fiverr Gig Description That Converts",
    slug: "chatgpt-prompt-writing-fiverr-gig-description-converts",
    description: "Write a high-converting Fiverr gig description that ranks in search and convinces buyers to order immediately.",
    content: `Act as a top-rated Fiverr seller and conversion copywriter who has generated over $100K on the platform. Write a high-converting Fiverr gig description for:

Service: [WHAT YOU OFFER]
Category: [FIVERR CATEGORY]
Target Buyer: [WHO NEEDS THIS]
Your Experience Level: [Years + Notable results]
Starting Price: $[PRICE] for [STARTER PACKAGE DELIVERABLE]

Write a gig description with this Fiverr-optimized structure:

OPENING HOOK (Line 1-2)
- Lead with their pain or desire, not your credential
- Make them feel understood immediately

WHAT I OFFER SECTION
- 3-4 sentences describing the service in clear terms
- Use "you" more than "I"

WHAT YOU'LL GET (Bullet format)
- 8-10 clear deliverables
- Start each bullet with a checkmark ✅ or → 
- Include specifics (file formats, revisions, turnaround)

WHY CHOOSE ME
- 3 credibility bullets (numbers/results if possible)
- One unique differentiator

THE PROCESS (optional but powerful)
- 3-step process: [Step 1] → [Step 2] → [Step 3]

CALL TO ACTION
- Direct, urgent, low-friction
- "Message me before ordering if you have questions"

Also create:
- Gig Title (optimized for Fiverr search, 75 chars)
- 5 gig tags/keywords
- FAQ section (5 questions buyers ask)`,
    example_output: "A complete Fiverr gig with optimized title, full description, FAQ section, and keyword tags for maximum conversion and ranking.",
    category_slug: "content-writing",
    tags: ["Fiverr gig", "freelancing", "gig description", "Fiverr SEO", "copywriting"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Freelancing",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for Fiverr gig description",
    meta_title: "ChatGPT Prompt for Fiverr Gig Description That Converts | AI Prompt Hub",
    meta_description: "Write a high-converting Fiverr gig description that ranks in search and gets orders using this expert ChatGPT prompt for freelancers.",
    seo_score: 93,
  },
  {
    title: "ChatGPT Prompt for Upwork Proposal That Wins Projects",
    slug: "chatgpt-prompt-upwork-proposal-wins-projects",
    description: "Write a persuasive Upwork proposal that stands out from 50+ competitors and wins high-paying freelance contracts.",
    content: `Act as a top-rated Upwork freelancer who consistently wins projects with a 60%+ proposal acceptance rate. Write a winning Upwork proposal for:

My Service: [WHAT I DO]
My Skill Level: [Skill + Years of experience]
Client's Job Post: [PASTE JOB DESCRIPTION]
My Relevant Experience: [MOST RELEVANT PROJECT]
My Rate: $[HOURLY OR FIXED]

Write the proposal with this structure:

LINE 1 — THE HOOK (most important)
- Reference something SPECIFIC in their job post
- Show you actually read it (not a template)
- DO NOT start with "Dear Client" or "Hi, I'm [NAME]"

PARAGRAPH 1 — UNDERSTANDING
- Restate their problem in your own words
- Show empathy for their situation

PARAGRAPH 2 — SOLUTION
- How you'd approach this specific project
- 2-3 specific steps you'd take
- Any questions that show expertise

PARAGRAPH 3 — PROOF
- 1 specific past project with result
- One quantified achievement
- Link to relevant portfolio piece (placeholder)

PARAGRAPH 4 — THE ASK
- Clear next step (quick call / discovery questions)
- Available start date
- Why now is a good time to start

Rules:
- Under 250 words
- No clichés: "passionate", "hardworking", "best"
- Ask 1-2 clarifying questions to show expertise
- End with confidence, not desperation`,
    example_output: "A 200-word Upwork proposal with a compelling hook, problem-solution framing, proof, and a clear next step.",
    category_slug: "content-writing",
    tags: ["Upwork proposal", "freelancing", "client acquisition", "freelance writing", "Upwork"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Freelancing",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for Upwork proposal",
    meta_title: "ChatGPT Prompt for Upwork Proposal That Wins Projects | AI Prompt Hub",
    meta_description: "Write a winning Upwork proposal that stands out from competitors using this proven ChatGPT prompt for freelancers — get more clients today.",
    seo_score: 94,
  },
  {
    title: "ChatGPT Prompt for Setting Freelance Rates (Pricing Calculator Guide)",
    slug: "chatgpt-prompt-setting-freelance-rates-pricing-guide",
    description: "Calculate the right freelance rate for your skills and market using this ChatGPT prompt with income goal framework.",
    content: `Act as a freelance business coach who has helped 300+ freelancers double their income. Help me set the right freelance rates for:

My Skill/Service: [WHAT I DO]
My Experience Level: [Beginner / Intermediate / Expert]
My Location: [COUNTRY/CITY]
Desired Annual Income: $[TARGET]
Hours Available to Work Per Week: [NUMBER]
Current Rate (if any): $[AMOUNT]

Provide:

1. RATE CALCULATION FRAMEWORK
   - Calculate minimum viable rate based on income goal
   - Factor in: taxes, expenses, vacation, sick days, non-billable time
   - Show the math step-by-step

2. MARKET RATE RESEARCH
   - Typical rate range for my skill on Upwork, Fiverr, and direct clients
   - What separates the $25/hr from the $150/hr freelancer in this niche

3. RATE TIERS TO OFFER
   - Starter rate (for testimonials/new clients)
   - Standard rate (most projects)
   - Premium rate (rush / high-complexity)

4. HOW TO JUSTIFY YOUR RATE
   - Value-based framing script
   - How to present ROI to clients
   - Words that increase perceived value

5. WHEN AND HOW TO RAISE RATES
   - Signals you're ready to raise rates
   - How to announce a rate increase to existing clients
   - Email template for raising rates`,
    example_output: "A personalized rate calculation with market context, 3 tier pricing structure, value framing scripts, and rate increase strategy.",
    category_slug: "business-strategy",
    tags: ["freelance rates", "pricing", "freelancing", "remote work", "income"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Freelancing",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for freelance rates",
    meta_title: "ChatGPT Prompt for Setting Freelance Rates | AI Prompt Hub",
    meta_description: "Calculate the right freelance rate for your skills and income goals using this ChatGPT prompt with value framing and rate increase strategies.",
    seo_score: 88,
  },
  {
    title: "ChatGPT Prompt for Freelance Contract Template (Client Protection)",
    slug: "chatgpt-prompt-freelance-contract-template-client-protection",
    description: "Generate a professional freelance contract that protects you legally and sets clear expectations with clients.",
    content: `Act as a freelance business attorney and contract specialist. Draft a professional freelance service contract for:

Freelancer Name: [NAME]
Service Provided: [TYPE OF WORK]
Client Type: [Individual / Small Business / Enterprise]
Project Scope: [BRIEF DESCRIPTION]
Payment Terms: $[AMOUNT] [per hour / fixed / milestone]
Project Duration: [TIMELINE]
Jurisdiction: [STATE/COUNTRY]

Create a contract including:

1. PARTIES & ENGAGEMENT
   - Freelancer and client identification
   - Effective date

2. SCOPE OF WORK
   - Detailed deliverables
   - What is NOT included (exclusions)
   - Revision policy (number of rounds)

3. TIMELINE & MILESTONES
   - Start and end dates
   - Milestone schedule with deliverable dates
   - Late-delivery clause

4. PAYMENT TERMS
   - Total fee or rate
   - Invoice schedule (deposit / milestones / final)
   - Late payment fee (% per week)
   - Accepted payment methods

5. INTELLECTUAL PROPERTY
   - Who owns the work after payment
   - Usage rights
   - Portfolio/display rights for freelancer

6. CONFIDENTIALITY (NDA clause)

7. INDEPENDENT CONTRACTOR STATUS
   - Not an employee clause

8. TERMINATION
   - By either party notice period
   - Kill fee (work completed but project cancelled)

9. LIMITATION OF LIABILITY

10. DISPUTE RESOLUTION
    - Mediation first, then jurisdiction

Include signature blocks and date fields.`,
    example_output: "A complete freelance contract with all protective clauses, payment terms, IP assignment, and dispute resolution ready for e-signature.",
    category_slug: "business-strategy",
    tags: ["freelance contract", "client contract", "legal document", "freelancing", "protection"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Freelancing",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for freelance contract",
    meta_title: "ChatGPT Prompt for Freelance Contract Template | AI Prompt Hub",
    meta_description: "Generate a professional freelance contract that protects you legally with payment terms, IP rights, and kill fee clauses — use this ChatGPT prompt.",
    seo_score: 87,
  },
  {
    title: "ChatGPT Prompt for Finding Your Freelance Niche (Profitable Specialization)",
    slug: "chatgpt-prompt-finding-freelance-niche-profitable-specialization",
    description: "Discover your most profitable freelance niche by analyzing your skills, market demand, and competition with ChatGPT.",
    content: `Act as a freelance career strategist who has helped hundreds of generalist freelancers 3x their income by niching down. Help me find my most profitable freelance niche:

My current skills: [LIST 5-10 SKILLS]
Industries I've worked in: [LIST]
Services I've offered before: [LIST]
What I enjoy most: [WHAT EXCITES YOU]
What I want to avoid: [WHAT YOU DISLIKE]
Income goal: $[MONTHLY TARGET]
Available hours per week: [NUMBER]

Analyze and provide:

1. SKILLS INVENTORY ANALYSIS
   - Rank my skills by market demand
   - Identify my unfair advantages
   - Spot the intersection of skill + passion + profit

2. NICHE RECOMMENDATIONS (give 3 options)
   For each option:
   - Niche definition (exactly who I help with what)
   - Target client profile
   - Estimated earning potential
   - Competition level (1-10)
   - How to enter this niche in 30 days

3. NICHE VALIDATION CHECKLIST
   - 5 questions to validate before committing

4. POSITIONING STATEMENT
   - 1-sentence version: "I help [WHO] achieve [RESULT] using [YOUR METHOD]"
   - Variations for different platforms

5. FIRST 30 DAYS NICHE LAUNCH PLAN
   - Where to find first 3 clients
   - Portfolio pieces to create
   - Platforms to set up`,
    example_output: "A personalized niche analysis with 3 specific recommendations, earning potential, and a 30-day launch plan for each.",
    category_slug: "business-strategy",
    tags: ["freelance niche", "freelancing", "specialization", "remote work", "self-employment"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Freelancing",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for freelance niche",
    meta_title: "ChatGPT Prompt for Finding Your Freelance Niche | AI Prompt Hub",
    meta_description: "Find your most profitable freelance niche with market demand analysis and 30-day launch plan using this ChatGPT prompt for freelancers.",
    seo_score: 86,
  },

  // ── MAKE MONEY / PASSIVE INCOME (21-30) ──────────────────
  {
    title: "ChatGPT Prompt for Digital Product Ideas That Sell Online",
    slug: "chatgpt-prompt-digital-product-ideas-sell-online",
    description: "Generate validated digital product ideas in your niche that solve real problems and generate passive income.",
    content: `Act as a digital product strategist and passive income expert who has launched 20+ digital products. Generate validated digital product ideas for:

My Niche/Expertise: [WHAT YOU KNOW]
Target Audience: [WHO YOU HELP]
Platforms I'm on: [YouTube / Instagram / Blog / LinkedIn / None]
Budget to create: [LOW ($0-500) / MEDIUM ($500-2K) / HIGH ($2K+)]
Time to create: [1 week / 1 month / 3 months]

Generate 10 digital product ideas in these categories:

TEMPLATES & TOOLS (fastest to make)
- 3 template products with: what it is, who buys it, price point, platform to sell

COURSES & TRAINING (highest price)
- 3 course concepts with: topic, format, target student, pricing, launch method

WRITTEN PRODUCTS (easiest entry)
- 2 ideas: guides, playbooks, SOPs, swipe files

COMMUNITIES & MEMBERSHIPS (recurring revenue)
- 2 ideas with: niche focus, value delivery model, price/month

For EACH idea include:
- Product name (marketing-ready)
- One-line description
- Who buys it and why NOW
- Recommended price
- Platform to sell (Gumroad / Teachable / Etsy / Own site)
- Validation method (how to test before building)
- Estimated monthly revenue potential`,
    example_output: "10 validated digital product ideas across 4 categories with pricing, platforms, validation methods, and revenue estimates.",
    category_slug: "business-strategy",
    tags: ["digital products", "passive income", "make money online", "online business", "e-commerce"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Online Business",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for digital product ideas",
    meta_title: "ChatGPT Prompt for Digital Product Ideas That Sell Online | AI Prompt Hub",
    meta_description: "Generate 10 validated digital product ideas in your niche with pricing and revenue estimates using this ChatGPT prompt for passive income.",
    seo_score: 91,
  },
  {
    title: "ChatGPT Prompt for Starting a Profitable Blog (Monetization Roadmap)",
    slug: "chatgpt-prompt-starting-profitable-blog-monetization-roadmap",
    description: "Build a 12-month roadmap to start a profitable blog from scratch with SEO strategy and multiple income streams.",
    content: `Act as a professional blogger who earns $20K+/month and has built multiple six-figure blogs. Create a complete blogging roadmap for:

Niche: [YOUR NICHE]
Starting Budget: $[AMOUNT]
Time Available: [Hours per week]
Previous experience: [None / Some / Experienced]
Goal income: $[MONTHLY TARGET] by [TIMEFRAME]

Deliver a complete roadmap:

PHASE 1 — FOUNDATION (Month 1-2)
- Niche validation process
- Domain name strategy + recommendations
- Hosting setup and tech stack
- Blog structure and categories
- First 10 content pillars

PHASE 2 — CONTENT MACHINE (Month 3-6)
- Content calendar (posting frequency)
- Keyword research strategy for beginners
- SEO basics checklist
- Content templates for this niche
- Internal linking strategy

PHASE 3 — TRAFFIC GROWTH (Month 4-9)
- SEO traffic milestones (realistic)
- Pinterest/social strategy specific to niche
- Email list building from day 1
- Guest posting targets

PHASE 4 — MONETIZATION (Month 6+)
- Monetization timeline (what to add when)
- Affiliate marketing: best programs for this niche
- Ad revenue: when and which network
- Digital products: natural fit for this niche
- Sponsored content: how to attract brands

REALISTIC INCOME PROJECTIONS
- Month 3, 6, 9, 12 income estimates
- Traffic needed for each income level`,
    example_output: "A 12-month blog roadmap with content strategy, monetization timeline, income projections, and niche-specific opportunities.",
    category_slug: "content-writing",
    tags: ["blogging", "make money blogging", "blog monetization", "passive income", "SEO blogging"],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Blogging",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for starting a profitable blog",
    meta_title: "ChatGPT Prompt for Starting a Profitable Blog | AI Prompt Hub",
    meta_description: "Get a complete 12-month blogging roadmap with SEO, content strategy, and monetization plan using this ChatGPT prompt for new bloggers.",
    seo_score: 92,
  },
  {
    title: "ChatGPT Prompt for Affiliate Marketing Content Strategy",
    slug: "chatgpt-prompt-affiliate-marketing-content-strategy",
    description: "Build a complete affiliate marketing content strategy with high-converting review content and SEO-optimized articles.",
    content: `Act as a super affiliate marketer who earns $50K+/month. Build a complete affiliate marketing strategy for:

Niche: [YOUR NICHE]
Platform: [Blog / YouTube / TikTok / Instagram / Email]
Affiliate Programs to Promote: [LIST 3-5 PROGRAMS]
Traffic Source: [Organic SEO / Paid / Social]
Monthly Budget: $[AMOUNT]

Create strategy covering:

1. CONTENT ARCHITECTURE
   - Top 10 money pages to create first
   - Content types that convert best: review / comparison / "best of" / tutorial
   - Funnel: Awareness content → Comparison → Purchase intent pages

2. HIGH-CONVERTING CONTENT TEMPLATES
   - Outline for a product review article (that ranks and converts)
   - Outline for "Best [X] for [Y]" listicle
   - Outline for "[Product A] vs [Product B]" comparison

3. SEO KEYWORD STRATEGY
   - Buyer-intent keyword types to target
   - How to find affiliate keywords with low competition
   - Internal linking structure for authority

4. CONVERSION OPTIMIZATION
   - Where to place affiliate links for maximum CTR
   - Disclosure best practices (FTC compliant)
   - CTA language that converts without being spammy
   - Tools to track affiliate conversions

5. CONTENT CALENDAR
   - Month 1: Foundation content
   - Month 2-3: Expansion content
   - Month 4+: Update and scale

6. INCOME PROJECTIONS
   - Traffic → Click rate → Conversion rate → Commission math`,
    example_output: "A complete affiliate marketing content strategy with money page templates, SEO keyword framework, and income projection model.",
    category_slug: "marketing",
    tags: ["affiliate marketing", "make money online", "content strategy", "SEO", "passive income"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Affiliate Marketing",
    is_featured: true,
    focus_keyword: "ChatGPT prompt for affiliate marketing",
    meta_title: "ChatGPT Prompt for Affiliate Marketing Content Strategy | AI Prompt Hub",
    meta_description: "Build a complete affiliate marketing content strategy with high-converting templates and SEO keyword framework using this ChatGPT prompt.",
    seo_score: 91,
  },
  {
    title: "ChatGPT Prompt for Dropshipping Product Research (Winning Products)",
    slug: "chatgpt-prompt-dropshipping-product-research-winning-products",
    description: "Find and validate winning dropshipping products with supplier research, pricing analysis, and marketing angles.",
    content: `Act as a 7-figure dropshipping entrepreneur. Guide me through finding and validating winning products for:

Store Type: [General / Niche: SPECIFY]
Platform: [Shopify / WooCommerce / Amazon FBA]
Target Market: [US / UK / Global / SPECIFIC COUNTRY]
Budget: $[MONTHLY BUDGET for testing]
Current Products Tested: [IF ANY]

Provide:

1. PRODUCT RESEARCH FRAMEWORK
   - 5 criteria for a winning dropshipping product
   - Red flags to avoid
   - Profit margin calculation formula

2. PRODUCT RESEARCH METHODS (step-by-step)
   - How to find trending products on TikTok Shop
   - How to use Facebook Ads Library for product ideas
   - How to analyze AliExpress for demand signals
   - How to use Google Trends for validation

3. WINNING PRODUCT PROFILE
   Generate a hypothetical winning product for my niche with:
   - Product name and category
   - AliExpress sourcing estimate
   - Recommended selling price
   - Target margin (%)
   - Primary audience
   - Marketing angle that works (emotional hook)

4. AD CREATIVE STRATEGY
   - Hook for video ad (first 3 seconds)
   - Pain → Solution → CTA framework
   - UGC vs. professional video (which works better and why)

5. LAUNCH BUDGET PLAN
   - Day 1-7: Testing budget
   - Scaling triggers (when to scale)
   - Kill criteria (when to cut the product)`,
    example_output: "A complete dropshipping product research framework with a validated winning product profile, ad creative strategy, and launch budget plan.",
    category_slug: "business-strategy",
    tags: ["dropshipping", "product research", "e-commerce", "Shopify", "make money online"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "E-commerce",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for dropshipping product research",
    meta_title: "ChatGPT Prompt for Dropshipping Product Research | AI Prompt Hub",
    meta_description: "Find and validate winning dropshipping products with supplier research and marketing angles using this expert ChatGPT prompt for e-commerce.",
    seo_score: 89,
  },
  {
    title: "ChatGPT Prompt for Creating an Online Course Outline",
    slug: "chatgpt-prompt-creating-online-course-outline",
    description: "Build a structured, results-driven online course outline that students complete and rave about.",
    content: `Act as an instructional designer and online course creator who has helped 10,000+ students. Create a complete online course outline for:

Course Topic: [TOPIC]
Your Expertise Level: [Beginner / Intermediate / Expert]
Target Student: [WHO IS THIS FOR]
Student's Starting Point: [WHAT THEY KNOW NOW]
Desired Transformation: [WHAT THEY'LL ACHIEVE]
Format: [Video / Text / Live / Hybrid]
Price Point: [$AMOUNT]

Design the course with:

1. COURSE PROMISE & POSITIONING
   - Course title (3 options, keyword-rich)
   - Subtitle
   - One-sentence transformation statement
   - What makes this different from free content

2. LEARNING OBJECTIVES (by module)
   - 5-7 measurable outcomes students achieve

3. FULL COURSE OUTLINE
   - Module structure (aim for 6-10 modules)
   - For EACH module:
     * Module title
     * 4-6 lessons with titles
     * One action item / homework per module
     * Estimated completion time

4. QUICK WIN LESSON (Module 1)
   - Design the first lesson to deliver a result in 10 minutes
   - Why this is critical for completion rates

5. COURSE ASSETS TO CREATE
   - Worksheets needed
   - Templates to include
   - Resources and tools list

6. LAUNCH STRATEGY QUICK PLAN
   - Pre-launch email sequence (3 emails)
   - Beta pricing strategy`,
    example_output: "A complete 8-module course outline with lesson titles, learning objectives, action items, and launch strategy.",
    category_slug: "education",
    tags: ["online course", "course creation", "e-learning", "passive income", "teaching"],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Online Education",
    is_featured: false,
    focus_keyword: "ChatGPT prompt for online course outline",
    meta_title: "ChatGPT Prompt for Creating an Online Course Outline | AI Prompt Hub",
    meta_description: "Build a structured online course outline with module design and launch strategy using this ChatGPT prompt for course creators.",
    seo_score: 88,
  },
];
