import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Building2, Calendar, Sparkles, ArrowRight, CheckCircle, Users, Clock, BarChart3 } from 'lucide-react';
import heroCampus from '@/assets/hero-campus.jpg';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={heroCampus} alt="Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/70" />
        </div>

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="container mx-auto px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-accent" />
              </div>
              <span className="text-xl font-display font-bold text-primary-foreground">CRUO</span>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 flex items-center">
            <div className="max-w-3xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm text-accent mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">AI-Powered Campus Optimization</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-primary-foreground leading-tight">
                Campus Resource
                <span className="block text-accent">Utilization Optimizer</span>
              </h1>
              <p className="text-xl text-primary-foreground/80 mt-6 max-w-xl">
                Smart room booking platform that maximizes campus space utilization with AI-powered scheduling, real-time availability, and seamless check-in.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-lg">
                  <Link to="/auth">Start Booking <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/auth">Learn More</Link>
                </Button>
              </div>
            </div>
          </main>

          {/* Floating Stats */}
          <div className="container mx-auto px-4 pb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: <Building2 className="w-5 h-5" />, value: '50+', label: 'Campus Rooms' },
                { icon: <Users className="w-5 h-5" />, value: '1000+', label: 'Active Users' },
                { icon: <Calendar className="w-5 h-5" />, value: '5000+', label: 'Bookings Made' },
                { icon: <Clock className="w-5 h-5" />, value: '98%', label: 'Check-in Rate' },
              ].map((stat, i) => (
                <div key={i} className="bg-card/10 backdrop-blur-md rounded-xl p-4 text-center border border-primary-foreground/10">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent/20 text-accent mb-2">
                    {stat.icon}
                  </div>
                  <p className="text-2xl font-display font-bold text-primary-foreground">{stat.value}</p>
                  <p className="text-sm text-primary-foreground/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-display font-bold">Everything You Need</h2>
            <p className="text-muted-foreground mt-4">
              A complete solution for campus resource management with powerful features designed for students, faculty, and administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Building2 className="w-6 h-6" />,
                title: 'Smart Room Discovery',
                description: 'Browse available rooms with real-time availability, capacity, equipment, and location information.',
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: 'Instant Booking',
                description: 'Book rooms in seconds with conflict detection, time slot visualization, and automatic confirmation.',
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Recommendations',
                description: 'Get intelligent slot suggestions based on your needs, historical patterns, and room availability.',
              },
              {
                icon: <CheckCircle className="w-6 h-6" />,
                title: 'QR Check-In',
                description: 'Validate bookings with unique QR codes. Auto-release unused slots after 15 minutes.',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Analytics Dashboard',
                description: 'Track usage patterns, peak hours, and room utilization with comprehensive analytics.',
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: 'Role-Based Access',
                description: 'Different permissions for students, faculty, and administrators with secure access control.',
              },
            ].map((feature, i) => (
              <Card key={i} className="card-hover border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
            Ready to Optimize Your Campus?
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of students and faculty who are already using CRUO to find and book campus spaces efficiently.
          </p>
          <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-10 text-lg">
            <Link to="/auth">Get Started Free <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">CRUO</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Campus Resource Utilization Optimizer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
