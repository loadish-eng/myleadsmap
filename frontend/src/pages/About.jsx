import { useNavigate } from 'react-router-dom';
import { MapPin, Search, ListChecks, Map, Sparkles, Download, Bot, ArrowRight, Check } from 'lucide-react';

const ABOUT_IMAGE = '/images/about-hero.png';
const DETAIL_IMAGE = '/images/about-detail.png';

const FEATURES = [
  { icon: Search, title: 'Discover Local Businesses', desc: 'Search Google Places for any business type near you — dental offices, restaurants, manufacturers, and more.' },
  { icon: Map, title: 'Interactive Map View', desc: 'See every prospect plotted on a live map with custom category markers for quick visual scanning.' },
  { icon: ListChecks, title: 'Lead Pipeline Tracking', desc: 'Move leads through stages from Prospect to Closed. Log every call, email, and conversation.' },
  { icon: MapPin, title: 'Contact Management', desc: 'Store contact names, phone numbers, and emails for each lead with full action history.' },
];

const ROADMAP = [
  { icon: Sparkles, title: 'More to Come', desc: 'Team collaboration, email integrations, and advanced analytics are on the roadmap.' },
  { icon: Bot, title: 'AI Pipeline Automation', desc: 'Let AI suggest next actions, draft follow-up messages, and auto-advance leads through your pipeline.' },
  { icon: Download, title: 'Exportable Lead Data', desc: 'Export your leads and full action history to CSV or PDF for reporting and CRM sync.' },
];

const FAQS = [
  { q: 'What is MyLeadsMap?', a: 'MyLeadsMap is a lead generation and sales pipeline tool that turns Google Places into a visual, map-based pipeline. Search any local business type, plot prospects on a map, and track every interaction from first call to closed deal.' },
  { q: 'How does lead pipeline tracking work?', a: 'Leads move through stages — Prospect, Pitched, Following Up, and Closed. Log every call, email, and conversation, and view the full action history for each lead at a glance.' },
  { q: "What's the difference between Standard and Premium?", a: 'Standard ($9.99/mo) lets you use your own free Google API key with 50 lead storage and a condensed open/closed pipeline. Premium ($19.99/mo) includes unlimited searches, 1,000 lead storage, full pipeline tracking, and first to new features' },
  { q: 'Can I use my own Google API key?', a: 'Yes. Standard plan users bring their own free Google Maps API key for business searches. Premium users get unlimited searches covered by the app.' },
  { q: 'How many leads can I store?', a: 'Standard plan supports up to 50 leads. Premium plan supports up to 1,000 leads, each with full action history.' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-foreground" />
          <span className="font-heading font-bold text-xl">MyLeadsMap</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-12 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight">
          Find, map, and close local business leads
        </h1>
        <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
          MyLeadsMap turns Google Places into a visual sales pipeline. Search any business type,
          plot prospects on a map, and track every interaction from first call to closed deal.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Get Started <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            Log In
          </button>
        </div>
      </section>

      {/* App Screenshot */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
          <img src={ABOUT_IMAGE} alt="MyLeadsMap interface showing map view, lead list, and lead detail panel" className="w-full" />
        </div>
      </section>

      {/* Lead Detail Screenshot */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-3">Track every interaction</h2>
            <p className="text-muted-foreground">
              Open any lead to see contact details, pipeline stage, and a full action history timeline —
              every call, email, and note logged in one place.
            </p>
          </div>
          <div className="flex justify-center">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg max-w-[280px] w-full">
              <img src={DETAIL_IMAGE} alt="MyLeadsMap lead detail panel showing contact info, pipeline stage, and action history timeline" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-heading font-bold text-center mb-2">What MyLeadsMap offers</h2>
        <p className="text-muted-foreground text-center mb-10">Everything you need to manage local business outreach in one place.</p>
        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Roadmap */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-muted-foreground mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Coming Soon
            </span>
            <h2 className="text-2xl font-heading font-bold">What's on the roadmap</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {ROADMAP.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="rounded-xl border border-border bg-card p-5">
                  <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-background" />
                  </div>
                  <h3 className="font-heading font-semibold mb-1">{r.title}</h3>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-heading font-bold text-center mb-10">Frequently asked questions</h2>
        <div className="space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-heading font-semibold mb-1">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-heading font-bold mb-3">Start mapping your leads today</h2>
        <p className="text-muted-foreground mb-8">Join MyLeadsMap and turn local business searches into a tracked, visual sales pipeline.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Create an Account <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 rounded-lg border border-border text-sm font-medium hover:bg-secondary transition-colors"
          >
            Log In
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center">
        <p className="text-sm text-muted-foreground">MyLeadsMap — Map your local business outreach</p>
        <p className="text-xs text-muted-foreground mt-2">
          <button onClick={() => navigate('/legal')} className="hover:text-foreground underline">Terms &amp; Subscription Agreement</button>
        </p>
      </footer>
    </div>
  );
}