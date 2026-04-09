import { useState, useEffect } from 'react';
import { FiUsers, FiTarget, FiHeart, FiGlobe, FiZap, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { settingsAPI } from '../services/api';

const About = () => {
  const [aboutContent, setAboutContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsAPI.getPublic()
      .then(({ data }) => {
        setAboutContent(data.data?.about_content || '');
      })
      .catch(() => {/* fall back to static content */})
      .finally(() => setLoading(false));
  }, []);

  const values = [
    { icon: <FiTarget />, title: 'Quality First', desc: 'Every prompt in our library is tested and refined for maximum effectiveness.' },
    { icon: <FiUsers />, title: 'Community Driven', desc: 'Built by prompt engineers, for prompt engineers. Community contributions welcome.' },
    { icon: <FiGlobe />, title: 'Open Access', desc: 'Free access to essential tools and resources for everyone.' },
    { icon: <FiZap />, title: 'Always Updated', desc: 'Continuously updated with the latest AI models and techniques.' },
    { icon: <FiHeart />, title: 'Passion for AI', desc: 'We are passionate about making AI accessible and useful for everyone.' },
    { icon: <FiAward />, title: 'Expert Curated', desc: 'Curated by industry experts with years of AI and ML experience.' },
  ];

  return (
    <>
      <SEO title="About Us" description="Learn about AI Prompt Loops - the ultimate resource for mastering AI prompts." />
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero" style={{ paddingBottom: 'var(--space-16)' }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1>About AI Prompt Loops</h1>
              <p style={{ maxWidth: '600px', margin: '0 auto' }}>Empowering creators, developers, and businesses with the tools and knowledge to master AI prompt engineering.</p>
            </motion.div>
          </div>
        </section>

        {/* ── CMS-editable content section ── */}
        {!loading && aboutContent ? (
          <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                {/* DOMPurify-sanitized on backend; rendered as rich HTML */}
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: aboutContent }}
                  style={{ lineHeight: 1.8, fontSize: 'var(--font-size-base)' }}
                />
              </motion.div>
            </div>
          </section>
        ) : (
          /* Fallback static mission content when no CMS content is set */
          <section className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                  <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Our Mission</span>
                </h2>
                <div className="prose" style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 'var(--font-size-lg)' }}>
                    AI Prompt Loops was created to bridge the gap between AI capability and human intent.
                    We believe that the quality of your AI interactions depends on the quality of your prompts,
                    and we&apos;re here to help you craft the perfect ones.
                  </p>
                  <p style={{ fontSize: 'var(--font-size-lg)' }}>
                    Whether you&apos;re a content creator, software developer, marketer, educator, or business leader,
                    our curated library of prompts and powerful tools are designed to help you get the most out of AI.
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
        )}

        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <h2>Our Values</h2>
              <p>The principles that guide everything we do</p>
            </div>
            <div className="grid grid-3">
              {values.map((v, i) => (
                <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <div className="card" style={{ textAlign: 'center' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-glow)', color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', margin: '0 auto var(--space-4)' }}>
                      {v.icon}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-2)' }}>{v.title}</h3>
                    <p style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>{v.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: '700px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, marginBottom: 'var(--space-4)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Built for the AI Era
            </h2>
            <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)' }}>
              As AI continues to evolve, so do we. Our platform is continuously updated with new prompts,
              tools, and resources to help you stay ahead of the curve.
            </p>
            <a href="/contact" className="btn btn-primary btn-lg">Get in Touch <FiZap /></a>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
