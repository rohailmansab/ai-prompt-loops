// seed_prompts_part6.js
// Procedural Generator for Freelancing & Social Media Prompts (80 prompts)

export const promptsPart6 = [];

// ------------------------------------------------------------------
// 3. MAKE MONEY / FREELANCING PROMPTS (40 PROMPTS)
// ------------------------------------------------------------------

const freelanceTopics = [
  "Fiverr Copywriting Gig", "Fiverr Graphic Design", "Fiverr Voiceover", "Upwork Web Dev Proposal", 
  "Upwork SEO Expert Proposal", "Upwork Virtual Assistant Proposal", "Dropshipping Product Description", 
  "Dropshipping Ad Copy", "Dropshipping Landing Page", "Affiliate Marketing Email", 
  "Affiliate Blog Post", "Affiliate Pinterest Pin", "Faceless YouTube Script", "Faceless TikTok Niche", 
  "Faceless Instagram Reels", "Course Creation Outline", "Digital Product Ideas", "Notion Template Sales Page", 
  "Ebook Title Generator", "Etsy Print on Demand SEO", "Etsy Listing Optimization", "Freelance Contract Template", 
  "Follow-up Email to Client", "Cold Pitch to Brand", "Sponsorship Proposal", "Grant Writing", 
  "Newsletter Sponsorship", "Patreon Tier Ideas", "Gumroad Sales Page", "Lead Magnet Creator", 
  "Resume for Freelancer", "Agency Pitch Deck", "Pricing Strategy for Services", "High Ticket Closing Script", 
  "Discovery Call Script", "Client Onboarding Email", "Offboarding Email", "Testimonial Request", 
  "Case Study Outline", "Upwork Profile Bio"
];

for (const topic of freelanceTopics) {
  const keyword = `chatgpt prompt for ${topic.toLowerCase()}`;
  const slugTarget = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  promptsPart6.push({
    title: `ChatGPT Prompt for ${topic} (High Converting)`,
    slug: `chatgpt-prompt-for-${slugTarget}`,
    description: `Use this ChatGPT prompt to instantly generate a high-converting ${topic.toLowerCase()} that gets clients and drives sales.`,
    content: `Act as an elite conversion copywriter and freelance business strategist who has generated millions in client revenue. Your task is to generate a highly optimized **${topic}** for my freelance/side-hustle business.

**Context about my business:**
1. My specific niche/industry: [INSERT YOUR NICHE]
2. Who my target client/buyer is: [INSERT TARGET AUDIENCE]
3. The core problem I solve for them: [INSERT PAIN POINT]
4. My unique selling proposition (USP): [INSERT YOUR ADVANTAGE]
5. Tone of voice: [Professional / Conversational / Urgent / Empathetic]

**What you need to generate:**
1. **The Hook:** A powerful opening that immediately catches attention and addresses the buyer's exact problem.
2. **The Value Stack:** A bulleted list of 3-5 specific benefits (not just features) they get by choosing this service or product.
3. **The Authority Trust Builder:** A statement establishing credibility, why I'm the expert, or overcoming a major buyer objection.
4. **The Immediate Call to Action (CTA):** What exact step they need to take next to hire me / buy from me.

Please deliver the final text formatted cleanly with bold headers, ready to be copy-pasted. Before you write it out, briefly tell me 1 psychological reason why this structure converts well for my specific niche.`,
    example_output: `A 3-part structured response featuring a conversion-optimized ${topic.toLowerCase()}, psychological breakdown, and CTA.`,
    category_slug: "business-strategy",
    tags: ["freelancing", "make money online", "side hustle", "client acquisition", topic.toLowerCase()],
    difficulty: "beginner",
    ai_model: "ChatGPT",
    use_case: "Freelancing & Sales",
    is_featured: topic.includes("Upwork") || topic.includes("Dropshipping"),
    focus_keyword: keyword,
    meta_title: `ChatGPT Prompt for ${topic} | AI Prompt Hub`,
    meta_description: `Get clients and increase sales with this highly optimized ChatGPT prompt for ${topic.toLowerCase()}. Step-by-step freelance conversion formula.`,
    seo_title: `Best ChatGPT Prompt for ${topic} (Convert Clients Instantly)`,
    seo_score: 88
  });
}

// ------------------------------------------------------------------
// 4. SOCIAL MEDIA GROWTH PROMPTS (40 PROMPTS)
// ------------------------------------------------------------------

const socialMediaTopics = [
  "TikTok Viral Hook", "TikTok Storytime Script", "TikTok Educational Script", "IG Reels Transition Guide", 
  "IG Reels Trending Audio Idea", "IG Carousel Outline", "IG Bio Optimizer", "IG Caption length", 
  "Twitter Thread on Productivity", "Twitter Thread on Crypto", "Twitter Thread on Marketing", 
  "Twitter Reply Strategy", "LinkedIn Personal Story", "LinkedIn Thought Leadership", "LinkedIn Job Update", 
  "LinkedIn Connection Message", "YouTube Title Generator", "YouTube CTR Optimizer", "YouTube Intro Script", 
  "YouTube CTA", "Pinterest Idea Pin", "Pinterest Board Strategy", "Facebook Group Welcome", 
  "Facebook Ad Copy", "Facebook Engagement Post", "Podcast Title Generator", "Podcast Interview Questions", 
  "Podcast Outro", "Newsletter Subject Line", "Newsletter Welcome Sequence", "Newsletter Referral Program", 
  "Meme Caption Generator", "Community Challenge Idea", "Discord Server Setup", "Reddit Post Title", 
  "Reddit AMA Outline", "Quora Answer Strategy", "Medium Article Headline", "Substack Growth Tactic", 
  "Social Media Content Calendar"
];

for (const topic of socialMediaTopics) {
  const keyword = `chatgpt prompt for ${topic.toLowerCase()}`;
  const slugTarget = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  promptsPart6.push({
    title: `ChatGPT Prompt for ${topic} (Viral Growth)`,
    slug: `chatgpt-prompt-for-${slugTarget}`,
    description: `Generate a highly engaging, algorithm-friendly ${topic.toLowerCase()} with this expert ChatGPT prompt. Ideal for creators and marketers.`,
    content: `Act as a top-tier social media strategist and viral content creator who regularly helps accounts grow past 100k+ followers. I need you to generate a **${topic}**.

**My Content Context:**
- Platform: [TikTok / Instagram / Twitter / LinkedIn / YouTube]
- My Brand's Niche: [INSERT YOUR NICHE]
- Target Audience: [INSERT WHO YOU ARE TALKING TO]
- The main goal of this post: [Engagement / Followers / Newsletter Signups / Sales]
- The core value/lesson I am sharing: [INSERT CORE IDEA]

**Generation Requirements:**
Please generate 5 unique options for this ${topic.toLowerCase()}. 
For each option, you MUST follow these viral framework rules:
1. **Pattern Interrupt:** Start with a hook that is counter-intuitive, asks a burning question, or states a bold claim. No boring introductions.
2. **Pacing:** Keep sentences short and punchy. Assume the reader has a 3-second attention span.
3. **Emotional Trigger:** Lean into one specific emotion per option (Curiosity, FOMO, Relief, Inspiration, or Humor).
4. **Formatting:** Use minimal but strategic emojis, proper line breaks, and clear typography choices if applicable.

After providing the 5 options, tell me which one you think the algorithm will favor most today and exactly why.`,
    example_output: `5 highly distinct, hook-driven variations for your ${topic.toLowerCase()}, complete with psychological insights and algorithmic predictions.`,
    category_slug: "marketing",
    tags: ["social media", "viral content", "marketing", "audience growth", topic.toLowerCase()],
    difficulty: "intermediate",
    ai_model: "ChatGPT",
    use_case: "Social Media Growth",
    is_featured: topic.includes("TikTok Viral") || topic.includes("YouTube Hook"),
    focus_keyword: keyword,
    meta_title: `ChatGPT Prompt for ${topic} (Viral Hooks & Growth) | AI Prompt Hub`,
    meta_description: `Beat the algorithm with this ChatGPT prompt for ${topic.toLowerCase()}. Generate viral, engagement-optimized social media content in seconds.`,
    seo_title: `Viral ChatGPT Prompt for ${topic} (Grow Faster)`,
    seo_score: 89
  });
}
