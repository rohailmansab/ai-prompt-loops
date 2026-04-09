import { useState, useEffect } from 'react';
import { FiSend, FiMail, FiMapPin, FiPhone, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { contactAPI, settingsAPI } from '../services/api';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Ld_FAKE_SITE_KEY_XXXXXXXXXXXX';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const [settings, setSettings] = useState(null);

  // Load Google reCAPTCHA v3 asynchronously
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Fetch dynamic contact info from the settings API
  useEffect(() => {
    settingsAPI.getPublic()
      .then(({ data }) => setSettings(data.data))
      .catch(() => {/* show nothing if unavailable */});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ state: 'loading', message: '' });

    if (!window.grecaptcha) {
      return setStatus({ state: 'error', message: 'reCAPTCHA failed to load. Please disable adblockers.' });
    }

    try {
      window.grecaptcha.ready(async () => {
        try {
          let recaptchaToken = 'bypass';
          if (!SITE_KEY.includes('FAKE')) {
            recaptchaToken = await window.grecaptcha.execute(SITE_KEY, { action: 'submit_contact' });
          }
          await contactAPI.send({ ...form, recaptchaToken });
          setStatus({ state: 'success', message: 'Message sent successfully! We will get back to you soon.' });
          setForm({ name: '', email: '', subject: '', message: '' });
          setTimeout(() => setStatus({ state: 'idle', message: '' }), 6000);
        } catch (error) {
          setStatus({ state: 'error', message: error.response?.data?.error || 'Failed to submit the form.' });
        }
      });
    } catch (error) {
      setStatus({ state: 'error', message: 'A network error occurred. Please try again.' });
    }
  };

  // Build the contact info items based on visibility flags from settings
  const contactItems = [];
  if (settings) {
    if (settings.show_email === 'true' && settings.contact_email) {
      contactItems.push({ icon: <FiMail />, label: 'Email', value: settings.contact_email });
    }
    if (settings.show_address === 'true' && settings.contact_address) {
      contactItems.push({ icon: <FiMapPin />, label: 'Location', value: settings.contact_address });
    }
    if (settings.show_phone === 'true' && settings.contact_phone) {
      contactItems.push({ icon: <FiPhone />, label: 'Phone', value: settings.contact_phone });
    }
  }

  return (
    <>
      <SEO title="Contact Us" description="Get in touch with the AI Prompt Loops team." />
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <h1>Contact Us</h1>
            <p>We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.</p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: '1000px' }}>
            <div className="contact-grid">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)' }}>Get in Touch</h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-8)', lineHeight: 1.7 }}>
                  Have a question, suggestion, or partnership inquiry? Fill out the form and our team will get back to you within 24 hours.
                </p>

                {contactItems.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                    {contactItems.map(({ icon, label, value }) => (
                      <div key={label} style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-glow)', color: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                          {icon}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>{label}</div>
                          <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-8)' }} id="contact-form">
                  {status.state === 'success' && (
                    <div className="alert alert-success">
                      <FiCheck /> {status.message}
                    </div>
                  )}

                  {status.state === 'error' && (
                    <div className="alert alert-error">
                      <FiAlertCircle /> {status.message}
                    </div>
                  )}

                  <div className="grid grid-2">
                    <div className="form-group">
                      <label className="form-label">Name *</label>
                      <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" id="contact-name" maxLength={200} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email *</label>
                      <input className="form-input" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" id="contact-email" />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject *</label>
                    <input className="form-input" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What's this about?" id="contact-subject" maxLength={300} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message *</label>
                    <textarea className="form-textarea" required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." id="contact-message" maxLength={5000} />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ width: '100%' }}
                    disabled={status.state === 'loading'}
                    id="contact-submit"
                  >
                    <FiSend /> {status.state === 'loading' ? 'Verifying...' : 'Send Message'}
                  </button>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)', textAlign: 'center' }}>
                    This site is protected by reCAPTCHA and the Google{' '}
                    <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-light)', padding: '0 4px' }}>Privacy Policy</a> and{' '}
                    <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary-light)', padding: '0 4px' }}>Terms of Service</a> apply.
                  </p>
                </form>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;
