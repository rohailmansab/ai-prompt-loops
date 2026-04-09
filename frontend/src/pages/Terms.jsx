import { motion } from 'framer-motion';
import SEO from '../components/SEO';

const Terms = () => {
  return (
    <>
      <SEO 
        title="Terms of Service - AI Prompt Hub"
        description="Terms of Service and usage guidelines for the AI Prompt Engineering Hub platform."
        ogType="website"
      />
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)', paddingBottom: 'var(--space-16)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
            style={{ marginBottom: 'var(--space-12)' }}
          >
            <h1 style={{ fontSize: 'var(--font-size-5xl)', fontWeight: 800, marginBottom: 'var(--space-4)', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Terms of Service
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              Last updated: March 2026
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ 
              background: 'var(--color-bg-card)', 
              padding: 'var(--space-8)', 
              borderRadius: 'var(--radius-xl)', 
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              lineHeight: 1.7
            }}
          >
            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-primary-light)' }}>1. Introduction</h2>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                Welcome to the AI Prompt Engineering Hub ("we," "our," or "us"). By accessing or using our website and services, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website.
              </p>
            </section>

            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-primary-light)' }}>2. Use of AI Prompts</h2>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                The prompts ("Content") available on our platform are designed to interact with third-party Artificial Intelligence models (such as OpenAI's ChatGPT).
              </p>
              <ul style={{ paddingLeft: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                <li style={{ marginBottom: 'var(--space-2)' }}>We do not guarantee the specific output, accuracy, or reliability of third-party AI models when using our prompts.</li>
                <li style={{ marginBottom: 'var(--space-2)' }}>You agree to use our prompts in a lawful manner and in accordance with the terms of service of the respective AI platforms where you apply them.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-primary-light)' }}>3. Intellectual Property Policy</h2>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                All original content, designs, texts, graphics, and underlying code on this website are the intellectual property of AI Prompt Engineering Hub unless natively public domain.
              </p>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                You may copy and modify the specific "prompts" provided on this platform for personal or commercial use. However, you may not systematically scrape, reproduce, or redistribute our database of prompts as a competing product or service without explicit permission.
              </p>
            </section>

            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-primary-light)' }}>4. User Responsibilities</h2>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                When using our platform, you agree not to:
              </p>
              <ul style={{ paddingLeft: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
                <li style={{ marginBottom: 'var(--space-2)' }}>Engage in explicit automated scraping, data harvesting, or automated data extraction from the website.</li>
                <li style={{ marginBottom: 'var(--space-2)' }}>Use our tools to generate illegal, harmful, or maliciously deceptive content.</li>
                <li style={{ marginBottom: 'var(--space-2)' }}>Attempt to breach our security or authentication systems.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 'var(--space-8)' }}>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-primary-light)' }}>5. Limitation of Liability</h2>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                To the maximum extent permitted by applicable law, AI Prompt Engineering Hub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or digital assets resulting from your use of or inability to use our platform and prompts.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-4)', color: 'var(--color-primary-light)' }}>6. Contact Information</h2>
              <p style={{ marginBottom: 'var(--space-4)' }}>
                If you have any questions or concerns regarding these Terms of Service, please contact us.
              </p>
              <p>
                <strong>Email:</strong> legal@aiprompthub.com<br/>
                <strong>Address:</strong> 123 Tech Avenue, Software City, Digital Realm
              </p>
            </section>

          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Terms;
