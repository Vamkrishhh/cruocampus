import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QuickBookWidget from '@/components/QuickBookWidget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Calendar,
  Clock,
  TrendingUp,
  Users,
  QrCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Map,
  CalendarDays,
} from 'lucide-react';

interface Stats {
  totalRooms: number;
  myBookings: number;
  upcomingBookings: number;
  todayCheckins: number;
}

interface RecentBooking {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  room_id: string;
  room: {
    name: string;
    building: string;
  };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile, role } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalRooms: 0,
    myBookings: 0,
    upcomingBookings: 0,
    todayCheckins: 0,
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch room count
        const { count: roomCount } = await supabase
          .from('rooms')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true);

        // Fetch user's booking stats
        const today = new Date().toISOString().split('T')[0];
        
        const { count: totalBookings } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true });

        const { count: upcomingCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .gte('date', today)
          .in('status', ['pending', 'confirmed']);

        // Fetch recent bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select(`
            id,
            title,
            date,
            start_time,
            end_time,
            status,
            room_id,
            rooms (name, building)
          `)
          .order('date', { ascending: false })
          .order('start_time', { ascending: false })
          .limit(5);

        setStats({
          totalRooms: roomCount || 0,
          myBookings: totalBookings || 0,
          upcomingBookings: upcomingCount || 0,
          todayCheckins: 0,
        });

        if (bookingsData) {
          setRecentBookings(
            bookingsData.map((b: any) => ({
              id: b.id,
              title: b.title,
              date: b.date,
              start_time: b.start_time,
              end_time: b.end_time,
              status: b.status,
              room_id: b.room_id,
              room: {
                name: b.rooms?.name || 'Unknown',
                building: b.rooms?.building || 'Unknown',
              },
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="status-available">Confirmed</Badge>;
      case 'checked_in':
        return <Badge className="bg-info/10 text-info border-info/20">In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge className="status-occupied">Cancelled</Badge>;
      case 'no_show':
        return <Badge className="status-occupied">No Show</Badge>;
      default:
        return <Badge className="status-pending">Pending</Badge>;
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl gradient-bg p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          <div className="relative">
            <h1 className="text-3xl font-display font-bold text-primary-foreground">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-primary-foreground/70 mt-2 max-w-xl">
              Manage your campus room bookings, check-in to your reservations, and discover available spaces.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button asChild variant="secondary" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link to="/rooms">
                  <Building2 className="w-4 h-4 mr-2" />
                  Browse Rooms
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/schedule">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  View Schedule
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/floor-plan">
                  <Map className="w-4 h-4 mr-2" />
                  Floor Plan
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/ai-suggest">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Suggestions
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Rooms</p>
                  <p className="text-3xl font-display font-bold mt-1">{stats.totalRooms}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Bookings</p>
                  <p className="text-3xl font-display font-bold mt-1">{stats.myBookings}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-3xl font-display font-bold mt-1">{stats.upcomingBookings}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Check-ins Today</p>
                  <p className="text-3xl font-display font-bold mt-1">{stats.todayCheckins}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Book, Quick Actions & Recent Bookings */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Book Widget */}
          <div className="space-y-6">
            <QuickBookWidget />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display">Quick Actions</CardTitle>
                <CardDescription>Common tasks at your fingertips</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild variant="outline" className="w-full justify-start h-auto py-3">
                  <Link to="/schedule">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                      <CalendarDays className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">View Schedule</p>
                      <p className="text-xs text-muted-foreground">Day, week, month views</p>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full justify-start h-auto py-3">
                  <Link to="/floor-plan">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mr-3">
                      <Map className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Floor Plan</p>
                      <p className="text-xs text-muted-foreground">Interactive campus map</p>
                    </div>
                  </Link>
                </Button>

                <Button asChild variant="outline" className="w-full justify-start h-auto py-3">
                  <Link to="/checkin">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mr-3">
                      <QrCode className="w-5 h-5 text-success" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Check In</p>
                      <p className="text-xs text-muted-foreground">Scan your QR code</p>
                    </div>
                  </Link>
                </Button>

                {(role === 'admin' || role === 'faculty') && (
                  <Button asChild variant="outline" className="w-full justify-start h-auto py-3">
                    <Link to="/analytics">
                      <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center mr-3">
                        <TrendingUp className="w-5 h-5 text-info" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">View Analytics</p>
                        <p className="text-xs text-muted-foreground">Usage insights</p>
                      </div>
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-display">Recent Bookings</CardTitle>
                <CardDescription>Your latest room reservations</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/bookings">
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => navigate(`/rooms/${booking.room_id}`)}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{booking.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.room.name} • {booking.room.building}
                        </p>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/rooms">Browse available rooms</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
