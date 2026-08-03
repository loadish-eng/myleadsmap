const Section = ({ title, children }) => (
  <section>
    <h2 className="text-lg font-heading font-semibold mb-2">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
  </section>
);

export default function SubscriptionAgreement() {
  return (
    <div className="space-y-8">
      <Section title="1. Subscription Plans">
        <p>MyLeadsMap offers two subscription plans:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Standard</strong> — $9.99 per month. Use your own Google API key, store up to 50 leads, and track a condensed open/closed pipeline.</li>
          <li><strong className="text-foreground">Premium</strong> — $19.99 per month. Unlimited searches via the app's shared API key, up to 1,000 stored leads, full pipeline tracking, and early access to new features.</li>
        </ul>
      </Section>

      <Section title="2. Billing and Payment">
        <p>Subscriptions are billed monthly in advance through Stripe, our payment processor. By subscribing, you authorize us to charge the subscription fee to your designated payment method each billing cycle until you cancel.</p>
      </Section>

      <Section title="3. Auto-Renewal">
        <p>All subscriptions auto-renew at the end of each billing cycle unless you cancel before the renewal date. You will be charged the then-current subscription rate on each renewal date.</p>
      </Section>

      <Section title="4. Cancellation">
        <p>You may cancel your subscription at any time from your Profile page. Cancellation takes effect at the end of your current billing period — you will retain access until then. No further charges will be made after cancellation.</p>
      </Section>

      <Section title="5. Refunds">
        <p>Subscription fees are non-refundable. We do not provide refunds or credits for partial billing periods. If you cancel, you keep access until the end of your paid period.</p>
      </Section>

      <Section title="6. Plan Limits">
        <p>Each plan has a maximum number of stored leads (50 for Standard, 1,000 for Premium). Once the limit is reached, you must delete existing leads or upgrade your plan to add more. Plan limits are per account and cannot be shared.</p>
      </Section>

      <Section title="7. Price Changes">
        <p>We may change subscription prices with at least 30 days' notice. Price changes take effect at the start of your next billing cycle following the notice. You may cancel before the price change takes effect to avoid the new rate.</p>
      </Section>

      <Section title="8. Payment Processing">
        <p>Payments are processed by Stripe. We do not store your full credit card number. Stripe's terms of service and privacy policy apply to your payment information. If a payment fails, we may suspend access until payment is resolved.</p>
      </Section>
    </div>
  );
}