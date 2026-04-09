// seed_prompts_part5.js
// Procedural Generator for Image & Video Generation Prompts (90 prompts)

export const promptsPart5 = [];

// ------------------------------------------------------------------
// 1. IMAGE GENERATION PROMPTS (50 PROMPTS)
// ------------------------------------------------------------------

const imageNiches = [
  "Architecture", "Interior Design", "Food Photography", "Product Mockups", "Character Design", 
  "Anime Art", "Cinematic Portraits", "Landscape Photography", "UI/UX Web Design", "Logo Design", 
  "T-Shirt Designs", "Cyberpunk Art", "Watercolor Illustrations", "Tattoo Designs", "NFT Art", 
  "Coloring Books", "Real Estate Listings", "Fantasy Landscapes", "Sci-Fi Vehicles", "Isometric Rooms", 
  "Sneaker Design", "Jewelry Mockups", "Tarot Cards", "Board Game Assets", "Abstract Wall Art", 
  "Album Covers", "Book Covers", "Podcast Covers", "Vintage Posters", "Minimalist Logos", 
  "Mascot Logos", "Emotes for Twitch", "Pixel Art", "3D Icons", "App Icons", "Concept Art", 
  "Storyboard Panels", "Fashion Editorial", "Street Photography", "Wedding Photography", 
  "Pet Portraits", "Botanical Illustrations", "Sci-Fi Characters", "Cyberpunk Cities", 
  "Steampunk Gadgets", "Space Exploration", "Underwater Scenes", "Magical Items", 
  "Weapon Concepts", "Vehicle Concepts"
];

for (const niche of imageNiches) {
  const keyword = `midjourney prompts for ${niche.toLowerCase()}`;
  const slugTarget = niche.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  promptsPart5.push({
    title: `Best Midjourney Prompts for ${niche} (High Quality & Photorealistic)`,
    slug: `best-midjourney-prompts-for-${slugTarget}`,
    description: `Copy and paste these highly optimized Midjourney v6 prompts to generate stunning, elite-level ${niche.toLowerCase()} images.`,
    content: `**Core Formula for ${niche}:**
/imagine prompt: A stunning ${niche.toLowerCase()} featuring [MAIN_SUBJECT], designed with [SPECIFIC_STYLE_OR_VIBE], [LIGHTING_CONDITION], shot on [CAMERA_TYPE/LENS], [COLOR_PALETTE], highly detailed, 8k resolution, cinematic lighting --ar [ASPECT_RATIO] --v 6.0 --style raw

**Step-by-Step Instructions:**
1. **Replace [MAIN_SUBJECT]:** Be hyper-specific about the core focus of your ${niche.toLowerCase()} generation.
2. **Replace [SPECIFIC_STYLE_OR_VIBE]:** E.g., minimalist, brutalist, ethereal, hyper-realistic, illustration.
3. **Lighting & Camera:** E.g., golden hour, studio lighting, volumetric rays, Sony A7R IV, 35mm lens.
4. **Adjust Aspect Ratio:** Use \`--ar 16:9\` for widescreen or \`--ar 9:16\` for vertical formats.

**Why This Works (Prompt Engineering Breakdown):**
Midjourney v6 thrives on natural language rather than keyword salads. By structuring the prompt with a clear subject, atmospheric lighting, and precise camera parameters, we guide the AI's diffusion model to prioritize realism and specific artistic intent over generic randomness.

**Advanced Tweaks:**
- Add \`--chaos 20\` or higher to get wildly different compositional variations.
- Add \`--stylize 250\` to increase Midjourney's default artistic flair.
- Add \`--no [element]\` (e.g., \`--no text, watermarks\`) if you want to explicitly exclude elements from your ${niche.toLowerCase()}.`,
    example_output: `An impeccably rendered ${niche.toLowerCase()} image combining your specified subject and style, outputted as a 4-image grid in Midjourney.`,
    category_slug: "image-generation",
    tags: ["midjourney", "image generation", "ai art", niche.toLowerCase(), "prompt engineering"],
    difficulty: "intermediate",
    ai_model: "Midjourney",
    use_case: "Image Generation",
    is_featured: niche === "Architecture" || niche === "Character Design",
    focus_keyword: keyword,
    meta_title: `Midjourney Prompts for ${niche} (Best Settings) | AI Prompt Hub`,
    meta_description: `Learn the exact Midjourney formulas and parameters to generate professional ${niche.toLowerCase()}. High-quality, tested AI art prompts.`,
    seo_title: `Best Midjourney Prompts for ${niche} (Photorealistic & Artistic)`,
    seo_score: 92
  });
}

// ------------------------------------------------------------------
// 2. VIDEO GENERATION PROMPTS (40 PROMPTS)
// ------------------------------------------------------------------

const videoNiches = [
  "Cinematic Drone Flights", "Slow Motion Nature", "Cyberpunk City Walkthrough", "3D Product Rotation", 
  "Food Commercial B-Roll", "Character Lip Sync", "Explosive VFX", "Historical Recreation", 
  "Timelapse Weather", "Macro Photography Video", "Anime Fight Scene", "Sci-Fi Portal Opening", 
  "Real Estate Tour", "Car Commercial", "Abstract Fluid Dynamics", "Music Video Backgrounds", 
  "Underwater Exploration", "Magic Spell Effects", "Sci-Fi Hologram", "Glitch Art Transitions", 
  "Vintage Film Look", "Stop Motion Animation", "Claymation", "Neon Sign Flickering", 
  "Floating Particles", "Space Nebula Zoom", "Microscopic Cell Division", "Lava Flowing", 
  "Waterfall Aerial", "Forest Morning Mist", "Desert Sandstorm", "Snow Falling", 
  "Cyberpunk Rain", "Neon Reflections on Puddle", "Time Travel Portal", "Superhero Landing", 
  "Glowing Runes", "Fire Breathing Dragon", "Futuristic Train Ride", "Virtual Reality HUD"
];

for (const niche of videoNiches) {
  const keyword = `ai video prompt for ${niche.toLowerCase()}`;
  const slugTarget = niche.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  promptsPart5.push({
    title: `Best AI Video Prompts for ${niche} (Runway & Sora)`,
    slug: `ai-video-prompts-for-${slugTarget}`,
    description: `Create stunning, continuous ${niche.toLowerCase()} utilizing these master AI video prompts optimized for Runway Gen-2, Pika, and Sora.`,
    content: `**Core Video AI Prompt Formula:**
A high-quality, cinematic video of [SPECIFIC_SCENE_ACTION], [CAMERA_MOVEMENT], [LIGHTING_CHANGES], [ENVIRONMENTAL_EFFECTS]. The focal point is [SUBJECT_DETAILS]. Rendered in 4K resolution, photorealistic, 60fps frame rate, smooth motion.

**How to Use:**
1. **Scene Action:** Clearly describe what is physically moving in your ${niche.toLowerCase()}. E.g., "A sleek sports car drifting around a neon corner."
2. **Camera Movement:** Direct the AI's virtual camera. Use terms like: Pan left, track forward, zoom slowly, drone shot, handheld camera shake.
3. **Lighting & Effects:** Specify dynamic lighting (e.g., lens flare, glowing embers, volumetric fog). 
4. **Tool-Specific Settings:** 
   - **For Runway Gen-2:** Keep the prompt descriptive and under 320 characters. Use the Motion Brush if you only want a specific element to move.
   - **For Pika Labs:** Use parameters like \`-camera pan right\` or \`-motion 2\` to guide intensity.
   - **For Sora:** Be hyper-verbose about the physics and timeline of the scene.

**Expected Output:**
A hyper-realistic 3-to-4-second generative video clip depicting a smooth ${niche.toLowerCase()} sequence, free of major warping or anatomical artifacts.

**Why This Works (SEO + Logic):**
Video generation models rely heavily on structural descriptions of *motion* rather than just aesthetic descriptors. Telling the AI *how the camera moves* combined with *how the subject moves* dramatically reduces hallucinations and results in professional b-roll quality footage.`,
    example_output: `A 4K photorealistic 3-second generated video featuring smooth ${niche.toLowerCase()} with accurate physics and lighting.`,
    category_slug: "video-generation",
    tags: ["runway ml", "sora", "pika labs", "video generation", "ai video", niche.toLowerCase()],
    difficulty: "advanced",
    ai_model: "Sora / RunwayML",
    use_case: "Video Generation",
    is_featured: niche === "Cinematic Drone Flights",
    focus_keyword: keyword,
    meta_title: `AI Video Prompts for ${niche} (Runway, Pika, Sora) | AI Prompt Hub`,
    meta_description: `Copy and paste these master AI video prompts to generate realistic ${niche.toLowerCase()} footage using Sora, Runway, or Pika. Step-by-step camera motion formulas.`,
    seo_title: `Master AI Video Prompts for ${niche} Generations`,
    seo_score: 90
  });
}
