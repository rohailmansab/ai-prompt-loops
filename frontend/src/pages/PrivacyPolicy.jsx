import SEO from '../components/SEO';

const PrivacyPolicy = () => {
  return (
    <>
      <SEO title="Privacy Policy" description="Privacy Policy for AI Prompt Engineering Hub." />
      <div className="page-enter" style={{ paddingTop: 'var(--header-height)' }}>
        <section className="prompts-hero">
          <div className="container">
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </section>

        <section className="section">
          <div className="container" style={{ maxWidth: '800px' }}>
            <div className="prose">
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, such as when you create an account, submit a prompt, fill out a form, or contact us. This may include your name, email address, and any content you submit.</p>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Send you technical notices and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Personalize and improve your experience</li>
              </ul>

              <h2>3. Information Sharing</h2>
              <p>We do not sell, trade, or otherwise transfer your personal information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>

              <h2>4. Data Security</h2>
              <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>

              <h2>5. Cookies</h2>
              <p>We use cookies to understand and save your preferences for future visits, keep track of advertisements, and compile aggregate data about site traffic and site interactions. You can choose to have your computer warn you each time a cookie is being sent, or you can choose to turn off all cookies.</p>

              <h2>6. Third-Party Links</h2>
              <p>Occasionally, at our discretion, we may include or offer third-party products or services on our website. These third-party sites have separate and independent privacy policies. We therefore have no responsibility or liability for the content and activities of these linked sites.</p>

              <h2>7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul>
                <li>Access the personal data we hold about you</li>
                <li>Request correction of your personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request transfer of your personal data</li>
              </ul>

              <h2>8. Children&apos;s Privacy</h2>
              <p>Our service is not directed to anyone under the age of 13. We do not knowingly collect personal information from children under 13.</p>

              <h2>9. Changes to This Policy</h2>
              <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.</p>

              <h2>10. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@aipromptloops.me">privacy@aipromptloops.me</a>.</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PrivacyPolicy;
