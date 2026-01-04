import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, 
  Building2, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Clock, 
  BarChart3,
  QrCode,
  Map,
  Repeat,
  Bell,
  Shield,
  Zap,
  Star
} from 'lucide-react';
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
                <Link to="/auth">Get Started Free</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 flex items-center">
            <div className="max-w-3xl animate-fade-in">
              <Badge className="mb-6 bg-accent/20 text-accent border-accent/30 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1" /> #1 Campus Space Management Solution
              </Badge>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-primary-foreground leading-tight">
                Smart Scheduling
                <span className="block text-accent">Made Simple</span>
              </h1>
              <p className="text-xl text-primary-foreground/80 mt-6 max-w-xl">
                Reserve and manage campus rooms, view interactive floor plans, and track space utilization—all on the most powerful academic scheduling platform.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-8 text-lg">
                  <Link to="/auth">Start Booking <ArrowRight className="ml-2 w-5 h-5" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/auth">View Demo</Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 mt-8 text-primary-foreground/70 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Free to start
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Setup in minutes
                </div>
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

      {/* Core Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4">Core Features</Badge>
            <h2 className="text-4xl font-display font-bold">Everything You Need</h2>
            <p className="text-muted-foreground mt-4">
              A complete solution for campus resource management with powerful features designed for students, faculty, and administrators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Map className="w-6 h-6" />,
                title: 'Interactive Floor Plans',
                description: 'View real-time room availability on beautiful, interactive campus maps with live status indicators.',
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: 'Smart Scheduling',
                description: 'Day, week, and month calendar views with drag-and-drop booking and conflict detection.',
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: 'Quick Booking',
                description: 'Book available rooms instantly with one click. See available slots and reserve in seconds.',
              },
              {
                icon: <Repeat className="w-6 h-6" />,
                title: 'Recurring Bookings',
                description: 'Schedule regular meetings easily. Set up daily or weekly recurring reservations.',
              },
              {
                icon: <QrCode className="w-6 h-6" />,
                title: 'QR Check-In',
                description: 'Validate bookings with unique QR codes. Auto-release unused slots after 15 minutes.',
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: 'AI Recommendations',
                description: 'Get intelligent slot suggestions based on your needs, patterns, and availability.',
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: 'Analytics Dashboard',
                description: 'Track usage patterns, peak hours, and room utilization with comprehensive insights.',
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'Role-Based Access',
                description: 'Different permissions for students, faculty, and administrators with secure controls.',
              },
              {
                icon: <Bell className="w-6 h-6" />,
                title: 'Smart Notifications',
                description: 'Get reminded about upcoming bookings and receive alerts when rooms become available.',
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

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge className="mb-4">Simple Process</Badge>
            <h2 className="text-4xl font-display font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-4">
              Book your campus spaces in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '01',
                title: 'Browse & Search',
                description: 'Explore available rooms using our interactive floor plan or list view. Filter by capacity, equipment, and location.',
              },
              {
                step: '02',
                title: 'Book Instantly',
                description: 'Select your preferred time slot and confirm your booking. Set up recurring meetings if needed.',
              },
              {
                step: '03',
                title: 'Check In & Use',
                description: 'Scan your QR code at the room to validate your booking. Your space is ready to use!',
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-display font-bold text-accent">{item.step}</span>
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} className="w-6 h-6 fill-warning text-warning" />
              ))}
            </div>
            <blockquote className="text-2xl md:text-3xl font-display font-medium mb-6">
              "CRUO has transformed how we manage campus spaces. Booking rooms used to be a hassle, now it takes seconds."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                JD
              </div>
              <div className="text-left">
                <p className="font-semibold">Dr. Jane Doe</p>
                <p className="text-sm text-muted-foreground">Department Head, Computer Science</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-bg relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        </div>
        <div className="container mx-auto px-4 text-center relative">
          <Badge className="mb-6 bg-accent/20 text-accent border-accent/30">
            Ready to get started?
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6">
            Start Optimizing Your Campus Today
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Join thousands of students and faculty who are already using CRUO to find and book campus spaces efficiently.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground h-14 px-10 text-lg">
              <Link to="/auth">Get Started Free <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/60 mt-6">
            No credit card required • Free for students • Setup in 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-display font-bold">CRUO</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The most powerful campus resource management platform for academic institutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground">Floor Plans</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Scheduling</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Analytics</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">AI Assistant</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground">Documentation</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Help Center</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/auth" className="hover:text-foreground">About Us</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Privacy Policy</Link></li>
                <li><Link to="/auth" className="hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8">
            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Campus Resource Utilization Optimizer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
