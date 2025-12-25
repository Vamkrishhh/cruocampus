import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GraduationCap, Building2, Calendar, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-bg min-h-screen flex flex-col">
        <header className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xl font-display font-bold text-primary-foreground">CRUO</span>
          </div>
          <Button asChild variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Link to="/auth">Get Started</Link>
          </Button>
        </header>

        <main className="flex-1 container mx-auto px-4 flex items-center">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-display font-bold text-primary-foreground leading-tight">
              Campus Resource
              <span className="block gradient-text">Utilization Optimizer</span>
            </h1>
            <p className="text-xl text-primary-foreground/70 mt-6 max-w-xl">
              AI-powered room booking platform that maximizes campus space utilization with smart scheduling and real-time availability.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-lg">
                <Link to="/auth">Start Booking <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
              {[
                { icon: <Building2 className="w-6 h-6" />, label: 'Smart Room Discovery' },
                { icon: <Calendar className="w-6 h-6" />, label: 'Instant Booking' },
                { icon: <Sparkles className="w-6 h-6" />, label: 'AI Recommendations' },
                { icon: <CheckCircle className="w-6 h-6" />, label: 'QR Check-In' },
              ].map((f, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center mx-auto text-accent">{f.icon}</div>
                  <p className="text-sm text-primary-foreground/70 mt-3">{f.label}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
