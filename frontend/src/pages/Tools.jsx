import { useState, useCallback } from 'react';
import { FiZap, FiCopy, FiCheck, FiRefreshCw, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import AdGateModal from '../components/AdGateModal';
import { analyticsAPI } from '../services/api';
import './Tools.css';

/**
 * Tools — §1 Tool Action Ad Gating
 *
 * Flow for Generate / Enhance:
 *   1. User clicks button → intercept → show AdGateModal (placement: 'tool_action')
 *   2. User watches fullscreen ad for 4s → onUnlock fires
 *   3. isUnlocked[tool] = true → execute actual tool logic
 *   4. Lock resets after result is shown (requires new watch per session)
 *
 * State: adGate tracks which tool is awaiting unlock
 */
const Tools = () => {
  const [activeTab, setActiveTab] = useState('generator');

  // ── Ad gate state per tool ──────────────────────────────
  const [adGate, setAdGate] = useState(null); // null | 'generator' | 'enhancer'
  const [pendingAction, setPendingAction] = useState(null); // function to run after unlock

  // ── Per-session unlock (each session shows 1 ad per action) ──
  const [unlockedTools, setUnlockedTools] = useState(new Set());

  // Prompt Generator state
  const [genForm, setGenForm] = useState({
    topic: '',
    purpose: 'content writing',
    tone: 'professional',
    aiModel: 'ChatGPT',
    detail: 'detailed',
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  // Prompt Enhancer state
  const [enhanceInput, setEnhanceInput] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [enhanceCopied, setEnhanceCopied] = useState(false);

  // ── Core tool logic (runs AFTER unlock) ─────────────────
  const runGenerate = useCallback(() => {
    const { topic, purpose, tone, aiModel, detail } = genForm;
    if (!topic.trim()) return;

    const templates = {
      'content writing': `Act as an expert ${tone} content writer specializing in ${topic}.\n\nYour task is to create ${detail === 'detailed' ? 'comprehensive and in-depth' : 'concise and focused'} content about "${topic}".\n\nRequirements:\n1. Write in a ${tone} tone suitable for the target audience\n2. Include an attention-grabbing introduction\n3. Structure the content with clear headings and subheadings\n4. Provide practical examples and actionable insights\n5. End with a compelling conclusion and call-to-action\n6. Optimize for readability with short paragraphs and bullet points\n\nTarget ${aiModel} model for optimal output quality.\n\nBegin writing now.`,
      'code generation': `You are a senior software engineer with expertise in ${topic}.\n\nGenerate ${detail === 'detailed' ? 'production-ready, well-documented' : 'clean and functional'} code for the following:\n\nProject: ${topic}\nStyle: ${tone}\n\nRequirements:\n1. Follow best practices and design patterns\n2. Include error handling and input validation\n3. Add comprehensive comments explaining the logic\n4. Ensure the code is ${detail === 'detailed' ? 'fully tested and optimized' : 'functional and readable'}\n5. Use modern syntax and conventions\n\nProvide the complete implementation with explanations.`,
      'marketing': `Act as a senior marketing strategist with expertise in ${topic}.\n\nCreate a ${detail === 'detailed' ? 'comprehensive marketing strategy' : 'focused marketing plan'} with a ${tone} approach.\n\nDeliverables:\n1. Target audience analysis\n2. Key messaging and value proposition\n3. Channel strategy (social, email, content)\n4. Campaign ideas with timelines\n5. KPIs and measurement framework\n6. Budget allocation recommendations\n\nFocus on actionable, results-driven strategies.`,
      'education': `You are an experienced educator specializing in ${topic}.\n\nCreate a ${detail === 'detailed' ? 'comprehensive lesson plan' : 'focused teaching outline'} using a ${tone} teaching approach.\n\nInclude:\n1. Clear learning objectives (SMART format)\n2. Engaging introduction activity\n3. Main instruction with ${detail === 'detailed' ? 'detailed steps' : 'key points'}\n4. Practice exercises and activities\n5. Assessment methods\n6. Differentiation strategies\n\nMake it engaging, interactive, and effective.`,
      'analysis': `Act as a data analyst with expertise in ${topic}.\n\nPerform a ${detail === 'detailed' ? 'thorough and comprehensive' : 'focused'} analysis with a ${tone} approach.\n\nAnalysis Framework:\n1. Define the problem/question clearly\n2. Identify key data points and metrics\n3. Apply relevant analytical methods\n4. Present findings with supporting evidence\n5. Draw actionable conclusions\n6. Provide recommendations for next steps\n\nPresent the analysis in a clear, structured format.`,
    };

    const template = templates[purpose] || templates['content writing'];
    setGeneratedPrompt(template);
  }, [genForm]);

  const runEnhance = useCallback(() => {
    if (!enhanceInput.trim()) return;
    const enhanced = `## Enhanced Prompt\n\nYou are an expert AI assistant. Follow these instructions precisely:\n\n### Context\n${enhanceInput}\n\n### Additional Instructions\n- Think step by step before responding\n- Provide specific, actionable, and detailed responses\n- Use examples to illustrate key points\n- Structure your response with clear headings\n- If you're unsure about something, state your assumptions\n- Prioritize accuracy and depth over brevity\n- Include relevant best practices and expert insights\n\n### Output Format\nProvide your response in a well-organized format with:\n1. Executive summary (2-3 sentences)\n2. Detailed analysis/response\n3. Key takeaways or action items\n4. Additional recommendations (if applicable)`;
    setEnhancedPrompt(enhanced);
  }, [enhanceInput]);

  // ── Ad-gated click handler ───────────────────────────────
  const handleGatedClick = useCallback((toolId, action, validationFn) => {
    // Validation check before showing ad
    if (validationFn && !validationFn()) return;

    // If already unlocked this session, run directly
    if (unlockedTools.has(toolId)) {
      action();
      return;
    }

    // Otherwise show ad gate
    setPendingAction(() => action);
    setAdGate(toolId);
  }, [unlockedTools]);

  // ── Ad gate callbacks ────────────────────────────────────
  const handleUnlock = useCallback(() => {
    setAdGate(null);
    // Mark as unlocked for this session
    setUnlockedTools(prev => new Set([...prev, adGate]));
    // Execute the pending action
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  }, [adGate, pendingAction]);

  const handleAdClose = useCallback(() => {
    // User closed modal without completing — block action
    setAdGate(null);
    setPendingAction(null);
  }, []);

  const handleCopy = (text, setter) => {
    navigator.clipboard.writeText(text);
    setter(true);
    analyticsAPI.track({ event_type: 'tool_usage', item_id: activeTab, path: '/tools' }).catch(() => {});
    setTimeout(() => setter(false), 2000);
  };

  const tools = [
    { id: 'generator', label: 'Prompt Generator', icon: <FiZap /> },
    { id: 'enhancer', label: 'Prompt Enhancer', icon: <FiRefreshCw /> },
  ];

  const isLocked = (toolId) => !unlockedTools.has(toolId);

  return (
    <>
      <SEO
        title="AI Prompt Tools"
        description="Free AI prompt engineering tools. Generate optimized prompts and enhance existing ones."
        keywords="AI tools, prompt generator, prompt enhancer, ChatGPT tools"
      />

      {/* ── Ad Gate Modal (§1) ── */}
      {adGate && (
        <AdGateModal
          placement="tool_action"
          onUnlock={handleUnlock}
          onClose={handleAdClose}
          variant="fullscreen"
          countdownSeconds={4}
        />
      )}

      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <h1>AI Prompt Tools</h1>
            <p>Powerful tools to help you craft the perfect AI prompts</p>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="tools-tabs">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  className={`tool-tab ${activeTab === tool.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tool.id)}
                  id={`tab-${tool.id}`}
                >
                  {tool.icon} {tool.label}
                </button>
              ))}
            </div>

            {activeTab === 'generator' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tool-panel"
              >
                <div className="tool-grid">
                  <div className="tool-form">
                    <h2><FiZap /> Prompt Generator</h2>
                    <p className="tool-desc">Generate optimized prompts by filling in the details below</p>

                    <div className="form-group">
                      <label className="form-label">Topic / Subject *</label>
                      <input
                        className="form-input"
                        placeholder="e.g., React performance optimization, social media marketing..."
                        value={genForm.topic}
                        onChange={(e) => setGenForm({ ...genForm, topic: e.target.value })}
                        id="gen-topic"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Purpose</label>
                        <select
                          className="form-select"
                          value={genForm.purpose}
                          onChange={(e) => setGenForm({ ...genForm, purpose: e.target.value })}
                          id="gen-purpose"
                        >
                          <option value="content writing">Content Writing</option>
                          <option value="code generation">Code Generation</option>
                          <option value="marketing">Marketing</option>
                          <option value="education">Education</option>
                          <option value="analysis">Analysis</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tone</label>
                        <select
                          className="form-select"
                          value={genForm.tone}
                          onChange={(e) => setGenForm({ ...genForm, tone: e.target.value })}
                          id="gen-tone"
                        >
                          <option value="professional">Professional</option>
                          <option value="casual">Casual</option>
                          <option value="academic">Academic</option>
                          <option value="creative">Creative</option>
                          <option value="technical">Technical</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">AI Model</label>
                        <select
                          className="form-select"
                          value={genForm.aiModel}
                          onChange={(e) => setGenForm({ ...genForm, aiModel: e.target.value })}
                          id="gen-model"
                        >
                          <option value="ChatGPT">ChatGPT</option>
                          <option value="Claude">Claude</option>
                          <option value="Gemini">Gemini</option>
                          <option value="Midjourney">Midjourney</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Detail Level</label>
                        <select
                          className="form-select"
                          value={genForm.detail}
                          onChange={(e) => setGenForm({ ...genForm, detail: e.target.value })}
                          id="gen-detail"
                        >
                          <option value="concise">Concise</option>
                          <option value="detailed">Detailed</option>
                        </select>
                      </div>
                    </div>

                    {/* §1 — Ad-gated Generate button */}
                    <button
                      className={`btn btn-primary btn-lg${isLocked('generator') ? ' btn-gated' : ''}`}
                      onClick={() => handleGatedClick(
                        'generator',
                        runGenerate,
                        () => !!genForm.topic.trim()
                      )}
                      style={{ width: '100%' }}
                      id="generate-btn"
                    >
                      {isLocked('generator') ? <FiLock /> : <FiZap />}
                      {isLocked('generator') ? 'Generate Prompt (Watch Ad)' : 'Generate Prompt'}
                    </button>

                    {isLocked('generator') && (
                      <p style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                        marginTop: 'var(--space-2)',
                        textAlign: 'center',
                      }}>
                        🔒 A short ad plays before generating — helps keep this tool free!
                      </p>
                    )}
                  </div>

                  <div className="tool-output">
                    <div className="output-header">
                      <h3>Generated Prompt</h3>
                      {generatedPrompt && (
                        <button
                          className={`btn btn-sm ${copied ? 'btn-copied' : 'btn-secondary'}`}
                          onClick={() => handleCopy(generatedPrompt, setCopied)}
                          id="copy-gen-btn"
                        >
                          {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy</>}
                        </button>
                      )}
                    </div>
                    <div className="output-content">
                      {generatedPrompt ? (
                        <pre className="output-text">{generatedPrompt}</pre>
                      ) : (
                        <div className="output-placeholder">
                          <FiZap />
                          <p>Your generated prompt will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'enhancer' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="tool-panel"
              >
                <div className="tool-grid">
                  <div className="tool-form">
                    <h2><FiRefreshCw /> Prompt Enhancer</h2>
                    <p className="tool-desc">Paste your existing prompt and we&apos;ll enhance it for better results</p>

                    <div className="form-group">
                      <label className="form-label">Your Current Prompt *</label>
                      <textarea
                        className="form-textarea"
                        placeholder="Paste your prompt here..."
                        value={enhanceInput}
                        onChange={(e) => setEnhanceInput(e.target.value)}
                        rows={10}
                        id="enhance-input"
                      />
                    </div>

                    {/* §1 — Ad-gated Enhance button */}
                    <button
                      className={`btn btn-primary btn-lg${isLocked('enhancer') ? ' btn-gated' : ''}`}
                      onClick={() => handleGatedClick(
                        'enhancer',
                        runEnhance,
                        () => !!enhanceInput.trim()
                      )}
                      style={{ width: '100%' }}
                      id="enhance-btn"
                    >
                      {isLocked('enhancer') ? <FiLock /> : <FiRefreshCw />}
                      {isLocked('enhancer') ? 'Enhance Prompt (Watch Ad)' : 'Enhance Prompt'}
                    </button>

                    {isLocked('enhancer') && (
                      <p style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                        marginTop: 'var(--space-2)',
                        textAlign: 'center',
                      }}>
                        🔒 A short ad plays before enhancing — helps keep this tool free!
                      </p>
                    )}
                  </div>

                  <div className="tool-output">
                    <div className="output-header">
                      <h3>Enhanced Prompt</h3>
                      {enhancedPrompt && (
                        <button
                          className={`btn btn-sm ${enhanceCopied ? 'btn-copied' : 'btn-secondary'}`}
                          onClick={() => handleCopy(enhancedPrompt, setEnhanceCopied)}
                          id="copy-enhance-btn"
                        >
                          {enhanceCopied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy</>}
                        </button>
                      )}
                    </div>
                    <div className="output-content">
                      {enhancedPrompt ? (
                        <pre className="output-text">{enhancedPrompt}</pre>
                      ) : (
                        <div className="output-placeholder">
                          <FiRefreshCw />
                          <p>Your enhanced prompt will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default Tools;
