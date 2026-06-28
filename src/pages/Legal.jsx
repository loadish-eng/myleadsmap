import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TermsOfService from '@/components/legal/TermsOfService';
import SubscriptionAgreement from '@/components/legal/SubscriptionAgreement';

export default function Legal() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button onClick={() => navigate('/about')} className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-foreground" />
          <span className="font-heading font-bold text-xl">MyLeadsMap</span>
        </button>
        <button
          onClick={() => navigate('/about')}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to About
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-heading font-bold mb-1">Legal</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: June 23, 2026</p>

        <Tabs defaultValue="terms">
          <TabsList className="mb-8">
            <TabsTrigger value="terms">Terms of Service</TabsTrigger>
            <TabsTrigger value="subscription">Subscription Agreement</TabsTrigger>
          </TabsList>
          <TabsContent value="terms">
            <TermsOfService />
          </TabsContent>
          <TabsContent value="subscription">
            <SubscriptionAgreement />
          </TabsContent>
        </Tabs>
      </div>

      <footer className="border-t border-border py-6 text-center">
        <p className="text-sm text-muted-foreground">MyLeadsMap — Map your local business outreach</p>
      </footer>
    </div>
  );
}