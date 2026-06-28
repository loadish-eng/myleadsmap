const Section = ({ title, children }) => (
  <section>
    <h2 className="text-lg font-heading font-semibold mb-2">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

export default function TermsOfService() {
  return (
    <div className="space-y-8">
      <Section title="1. Acceptance of Terms">
        <p>By creating an account or using MyLeadsMap ("the Service"), you agree to these Terms of Service ("Terms"). If you do not agree, you may not access or use the Service.</p>
      </Section>

      <Section title="2. Description of Service">
        <p>MyLeadsMap is a lead generation and sales pipeline tool that allows you to search for local businesses using Google Places data, plot prospects on an interactive map, and track interactions through a customizable pipeline. The Service is offered in two subscription tiers: Standard and Premium.</p>
      </Section>

      <Section title="3. User Accounts">
        <p>You must be at least 18 years old to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You agree to provide accurate information during registration and to keep it updated.</p>
      </Section>

      <Section title="4. Acceptable Use">
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the Service for any unlawful purpose</li>
          <li>Attempt to access data belonging to other users</li>
          <li>Reverse engineer, decompile, or disassemble the Service</li>
          <li>Use automated tools to scrape or extract data at excessive rates</li>
          <li>Resell or redistribute data obtained through the Service without authorization</li>
          <li>Interfere with the proper functioning of the Service</li>
        </ul>
      </Section>

      <Section title="5. Your Data">
        <p>You retain ownership of all lead data, contact information, and notes you enter into the Service. You are responsible for ensuring you have the right to collect and store contact information for the businesses you track. We do not claim ownership of your data. Your data is stored securely and is not shared with other users.</p>
      </Section>

      <Section title="6. Google API Keys (Standard Plan)">
        <p>Standard plan users must provide their own Google Maps API key for business searches. You are solely responsible for your API key, including its security, usage limits, and any costs charged by Google. We are not responsible for any charges incurred through your use of your own API key. Premium plan users use the app's shared API key, subject to fair use.</p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>The Service, including its design, features, and branding, is owned by MyLeadsMap and protected by intellectual property laws. You may not copy, modify, or distribute any part of the Service without our written permission.</p>
      </Section>

      <Section title="8. Third-Party Services">
        <p>The Service relies on third-party services including Google Places and Stripe. We are not responsible for the availability, accuracy, or policies of these third-party services. Your use of Google Places data is subject to Google's terms of service.</p>
      </Section>

      <Section title="9. Disclaimers">
        <p>The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that search results will be accurate or complete. Business data from Google Places may be outdated or incorrect.</p>
      </Section>

      <Section title="10. Limitation of Liability">
        <p>To the maximum extent permitted by law, MyLeadsMap shall not be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or business opportunities. Our total liability shall not exceed the amount you paid in the three months preceding the claim.</p>
      </Section>

      <Section title="11. Indemnification">
        <p>You agree to indemnify and hold MyLeadsMap harmless from claims, damages, or expenses arising from your use of the Service, your violation of these Terms, or your infringement of any third-party rights.</p>
      </Section>

      <Section title="12. Termination">
        <p>We may suspend or terminate your account if you violate these Terms. You may cancel your subscription at any time through your Profile page. Upon termination, your data may be deleted after a reasonable period.</p>
      </Section>

      <Section title="13. Changes to These Terms">
        <p>We may update these Terms from time to time. We will notify users of material changes. Continued use of the Service after changes take effect constitutes acceptance of the updated Terms.</p>
      </Section>

      <Section title="14. Governing Law">
        <p>These Terms are governed by the laws of the United States and the state in which MyLeadsMap is operated, without regard to conflict of law principles.</p>
      </Section>

      <Section title="15. Contact">
        <p>For questions about these Terms, contact support through the app or at the email associated with your account.</p>
      </Section>
    </div>
  );
}