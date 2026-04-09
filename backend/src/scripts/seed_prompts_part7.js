// seed_prompts_part7.js
// Procedural Generator for Business, Coding, Education, and Productivity (100 prompts)

export const promptsPart7 = [];

// ------------------------------------------------------------------
// 5. BUSINESS & MARKETING PROMPTS (30 PROMPTS)
// ------------------------------------------------------------------

const businessTopics = [
  "B2B Sales Funnel", "SaaS Landing Page", "Welcome Email Sequence", "Cart Abandonment Email", 
  "Re-engagement Campaign", "Facebook Lookalike Audience Ad", "Google Search Ad RSA", "LinkedIn Lead Gen Ad", 
  "Webinar Registration Page", "Webinar Pitch Script", "VSL Script", "Press Release", 
  "Influencer Outreach", "SEO Content Brief", "Pillar Page Strategy", "Local SEO Optimization", 
  "Google My Business Update", "Customer Survey Questions", "Net Promoter Score Email", "Partnership Proposal", 
  "Competitor Analysis", "USP Generator", "Brand Voice Guidelines", "Positioning Statement", 
  "Mission and Vision", "Core Values", "Pricing Table Copy", "Frequently Asked Questions", 
  "Return Policy", "Privacy Policy"
];

for (const topic of businessTopics) {
  const keyword = `chatgpt prompt for ${topic.toLowerCase()}`;
  const slugTarget = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  promptsPart7.push({
    title: `ChatGPT Prompt for ${topic} (Marketing Strategy)`,
    slug: `chatgpt-prompt-for-${slugTarget}`,
    description: `Deploy this highly effective ChatGPT prompt to generate professional, conversion-focused ${topic.toLowerCase()} for your business campaigns.`,
    content: `Act as a Chief Marketing Officer (CMO) and direct-response copywriter who has scaled 7-figure businesses. I need your expertise to create a comprehensive **${topic}**.

**My Business Details:**
- Product/Service Name: [INSERT PRODUCT NAME]
- Target Demographic: [INSERT IDEAL CUSTOMER PROFILE]
- Core Value Proposition: [INSERT YOUR MAIN BENEFIT]
- Primary Goal of this Campaign: [Sales / Brand Awareness / Lead Generation / Retention]
- Competitors: [INSERT 1-2 COMPETITORS]

**Deliverables:**
1. **Strategic Outline:** First, provide a high-level framework of how this ${topic.toLowerCase()} will be structured and why it beats the competition.
2. **The Copy/Content:** Write out the exact, word-for-word copy. Ensure the tone is persuasive, clear, and action-oriented. Use appropriate subheadings and bullet points.
3. **A/B Testing Variables:** Give me 2 distinct variations of the most critical element (e.g., the headline, the subject line, or the main CTA) so I can split-test performance.
4. **Implementation Tip:** Provide one advanced marketing tactic or psychological trigger to apply when deploying this.

Make the output clean, highly readable, and formatted with markdown so I can copy and paste it into my marketing stack immediately.`,
    example_output: `A strategic outline, full copy for your ${topic.toLowerCase()}, A/B testing suggestions, and psychological implementation tips.`,
    category_slug: "marketing",
    tags: ["marketing", "business strategy", "copywriting", "sales funnel", topic.toLowerCase()],
    difficulty: "advanced",
    ai_model: "ChatGPT",
    use_case: "Business Marketing",
    is_featured: topic.includes("Sales Funnel") || topic.includes("SaaS"),
    focus_keyword: keyword,
    meta_title: `ChatGPT Prompt for ${topic} (Copywriting) | AI Prompt Hub`,
    meta_description: `Generate high-converting marketing campaigns. Use this ChatGPT prompt to instantly write your ${topic.toLowerCase()} like a professional CMO.`,
    seo_title: `Best ChatGPT Prompt for ${topic} (Marketing & Copywriting)`,
    seo_score: 87
  });
}

// ------------------------------------------------------------------
// 6. CODING / DEV PROMPTS (30 PROMPTS)
// ------------------------------------------------------------------

const codingTopics = [
  "React Component Generator", "Tailwind CSS Layout", "Next.js Routing", "Node.js Express API", 
  "Python FastAPI", "Python Web Scraper", "SQL Query Optimizer", "MongoDB Aggregation", 
  "Dockerfile Config", "GitHub Actions CI/CD", "Jest Unit Test", "Cypress E2E Test", 
  "GraphQL Schema", "Apollo Client", "Redux Store", "Vue3 Setup", "Angular Component", 
  "Go Microservice", "Rust CLI Tool", "C++ Algorithm", "Java Spring Boot", 
  "Swift iOS App Structure", "Kotlin Android Setup", "Flutter UI Layout", "AWS Lambda Node", 
  "Terraform Script", "Kubernetes Deployment", "Bash Script Config", "Regex Pattern Generator", 
  "Git Conflict Resolver"
];

for (const topic of codingTopics) {
  const keyword = `chatgpt prompt for ${topic.toLowerCase()}`;
  const slugTarget = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  promptsPart7.push({
    title: `ChatGPT Prompt for ${topic} (Clean Code & Architecture)`,
    slug: `chatgpt-prompt-for-${slugTarget}`,
    description: `Generate production-ready code, configs, and architecture for ${topic.toLowerCase()} using this senior-developer ChatGPT prompt.`,
    content: `Act as a Staff Software Engineer and Senior Systems Architect who writes exceptionally clean, robust, and heavily commented code. I need you to act as a **${topic}**.

**Technical Requirements:**
- Primary Tech Stack/Language: [INSERT FRAMEWORK/LANGUAGE]
- Specific Task/Feature to Build: [DESCRIBE EXACTLY WHAT YOU NEED]
- Expected Input: [INSERT INPUT DATA / PARAMETERS]
- Expected Output: [INSERT WHAT SHOULD BE RETURNED / RENDERED]
- Key Constraints: [E.g., Must use functional components / O(N) time complexity / No third-party packages]

**Generation Rules:**
1. **System Architecture Check:** Briefly explain the design pattern or structural approach you will use before writing code.
2. **Production-Ready Code:** Write the complete, runnable code block. Handle edge cases natively. Do not leave placeholder functions like "// add logic here" unless explicitly told.
3. **Security & Performance:** Ensure the code is safe from common vulnerabilities (e.g., SQL injection, XSS) and mention 1 performance optimization you included.
4. **Testing Instructions:** Provide a quick snippet on how I can test this code locally to verify it works.

If there are any breaking changes in the latest versions of this technology, please note them so I avoid deprecation errors.`,
    example_output: `A structural explanation followed by clean, heavily commented code blocks for your ${topic.toLowerCase()}, edge cases handled, and local testing instructions.`,
    category_slug: "code-generation",
    tags: ["coding", "software engineering", "developer tools", "programming", topic.toLowerCase()],
    difficulty: "advanced",
    ai_model: "ChatGPT / GitHub Copilot",
    use_case: "Software Development",
    is_featured: topic.includes("React") || topic.includes("Python"),
    focus_keyword: keyword,
    meta_title: `ChatGPT Prompt for ${topic} (Dev Workflows) | AI Prompt Hub`,
    meta_description: `Generate clean, production-ready code for your ${topic.toLowerCase()} with this expert software engineering ChatGPT prompt. Save hours of dev time.`,
    seo_title: `Senior Dev ChatGPT Prompt for ${topic} Generation`,
    seo_score: 91
  });
}

// ------------------------------------------------------------------
// 7. EDUCATION & PRODUCTIVITY PROMPTS (40 PROMPTS)
// ------------------------------------------------------------------

const eduProdTopics = [
  "Feynman Technique Explainer", "Pomodoro Schedule", "spaced repetition flashcards", "Active Recall Questions", 
  "Essay Outline Generator", "Thesis Statement Creator", "Literature Review Summarizer", "Math Problem Solver", 
  "Physics Concept Analogy", "Chemistry Reaction Explainer", "Language Learning Plan", "Vocabulary Builder", 
  "Historical Event Timeline", "Geography Fact Sheet", "Biology Cell Structure", "GTD Weekly Review", 
  "Eisenhower Matrix Task Sorter", "Habit Tracker Design", "Morning Routine Optimizer", "Evening Routine Planner", 
  "Goal Setting SMART", "OKR Framework", "Deep Work Block Planner", "Time Blocking Template", 
  "Distraction Detox Guide", "Meeting Agenda Pro", "Project Management Timeline", "Notion Dashboard Layout", 
  "Second Brain Setup", "Zettelkasten Method", "Memory Palace Creator", "Speed Reading Training", 
  "Note Taking Outline", "Focus Music Recommendation", "Mind Map Generator", "Decision Matrix", 
  "Prioritization Matrix", "Delegation Email", "Inbox Zero Strategy", "Annual Review Template"
];

for (const topic of eduProdTopics) {
  const keyword = `chatgpt prompt for ${topic.toLowerCase()}`;
  const slugTarget = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  promptsPart7.push({
    title: `ChatGPT Prompt for ${topic} (Focus & Learning Optimization)`,
    slug: `chatgpt-prompt-for-${slugTarget}`,
    description: `Maximize your cognitive performance and structured learning with this specialized ChatGPT prompt for ${topic.toLowerCase()}.`,
    content: `Act as an elite Productivity Coach and Cognitive Psychologist who specializes in accelerated learning, deep work, and behavioral design. I want to build a system around a **${topic}**.

**My Current Status:**
- My Main Goal/Subject: [INSERT WHAT YOU ARE TRYING TO LEARN OR ACHIEVE]
- My Current Bottleneck/Struggle: [E.g., I get easily distracted / I can't remember complex formulas / Overwhelmed with tasks]
- Available Time per Day: [INSERT HOURS AVAILABLE]
- My Learning/Working Style: [Visual / Auditory / Kinesthetic / Sprint-based]

**What You Must Generate:**
1. **The Tactical Breakdown:** Explain exactly how this ${topic.toLowerCase()} works and why it scientifically applies directly to my specific goal. Let's ground this in neuroscience or proven behavioral frameworks.
2. **Step-by-Step Execution Plan:** Give me a highly rigid, zero-friction blueprint to implement this today. Do not give vague advice. Provide actual time blocks, exact questions to ask myself, and concrete rules.
3. **The 'Fail-State' Recovery:** Anticipate the #1 reason I will fail to maintain this habit/system in 2 weeks. Give me an exact contingency plan to recover my momentum.
4. **Immediate Action Item:** What is the ONE single thing I must do in the next 5 minutes after closing this chat?

Format everything clearly with bullet points and bold emphasis on the actionable steps.`,
    example_output: `A neuroscience-backed breakdown of the ${topic.toLowerCase()}, a concrete daily execution schedule, and a fail-state recovery plan.`,
    category_slug: "education",
    tags: ["productivity", "education", "learning strategy", "deep work", topic.toLowerCase()],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Personal Development",
    is_featured: false,
    focus_keyword: keyword,
    meta_title: `ChatGPT Prompt for ${topic} (Study & Work Hacks) | AI Prompt Hub`,
    meta_description: `Learn how to instantly generate a personalized ${topic.toLowerCase()} action plan using this neuroscience-backed ChatGPT prompt. Boost your focus today.`,
    seo_title: `Best ChatGPT Prompt for ${topic} Frameworks`,
    seo_score: 86
  });
}
