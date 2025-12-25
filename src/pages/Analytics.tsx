import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Calendar,
  Clock,
  Download,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

interface AnalyticsData {
  totalBookings: number;
  totalRooms: number;
  totalUsers: number;
  checkinRate: number;
  bookingsByDay: { day: string; count: number }[];
  bookingsByRoom: { name: string; count: number }[];
  bookingsByHour: { hour: string; count: number }[];
  roomUtilization: { name: string; value: number }[];
  statusBreakdown: { status: string; count: number }[];
}

const COLORS = ['#0d9488', '#0ea5e9', '#8b5cf6', '#f59e0b', '#ef4444', '#22c55e'];

const Analytics = () => {
  const { role } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch all bookings
        const { data: bookings } = await supabase
          .from('bookings')
          .select('*, rooms(name)');

        // Fetch rooms
        const { data: rooms } = await supabase.from('rooms').select('*');

        // Fetch profiles count
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Process bookings by day of week
        const dayMap: Record<string, number> = {
          Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0,
        };
        const roomMap: Record<string, number> = {};
        const hourMap: Record<string, number> = {};
        const statusMap: Record<string, number> = {};
        let checkedIn = 0;

        bookings?.forEach((b: any) => {
          const date = new Date(b.date);
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
          dayMap[dayName] = (dayMap[dayName] || 0) + 1;

          const roomName = b.rooms?.name || 'Unknown';
          roomMap[roomName] = (roomMap[roomName] || 0) + 1;

          const hour = parseInt(b.start_time?.split(':')[0] || '0');
          const hourLabel = `${hour}:00`;
          hourMap[hourLabel] = (hourMap[hourLabel] || 0) + 1;

          statusMap[b.status] = (statusMap[b.status] || 0) + 1;

          if (b.status === 'checked_in' || b.status === 'completed') {
            checkedIn++;
          }
        });

        const totalBookings = bookings?.length || 0;
        const checkinRate = totalBookings > 0 ? Math.round((checkedIn / totalBookings) * 100) : 0;

        // Calculate room utilization (simplified: bookings / 10 as percentage)
        const roomUtilization = rooms?.map((r: any) => ({
          name: r.name,
          value: Math.min(100, (roomMap[r.name] || 0) * 10),
        })) || [];

        setData({
          totalBookings,
          totalRooms: rooms?.length || 0,
          totalUsers: userCount || 0,
          checkinRate,
          bookingsByDay: Object.entries(dayMap).map(([day, count]) => ({ day, count })),
          bookingsByRoom: Object.entries(roomMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6),
          bookingsByHour: Object.entries(hourMap)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour)),
          roomUtilization,
          statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const exportReport = () => {
    if (!data) return;
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalBookings: data.totalBookings,
        totalRooms: data.totalRooms,
        totalUsers: data.totalUsers,
        checkinRate: `${data.checkinRate}%`,
      },
      bookingsByDay: data.bookingsByDay,
      bookingsByRoom: data.bookingsByRoom,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cruo-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (role !== 'admin' && role !== 'faculty') {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Access Restricted</h3>
            <p className="text-muted-foreground">Analytics are available for Faculty and Admin only.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">Campus resource utilization insights</p>
          </div>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-3xl font-display font-bold">{data?.totalBookings}</p>
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
                  <p className="text-sm text-muted-foreground">Active Rooms</p>
                  <p className="text-3xl font-display font-bold">{data?.totalRooms}</p>
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
                  <p className="text-sm text-muted-foreground">Registered Users</p>
                  <p className="text-3xl font-display font-bold">{data?.totalUsers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Check-in Rate</p>
                  <p className="text-3xl font-display font-bold">{data?.checkinRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  {(data?.checkinRate || 0) >= 50 ? (
                    <TrendingUp className="w-6 h-6 text-success" />
                  ) : (
                    <TrendingDown className="w-6 h-6 text-warning" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bookings by Day */}
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Day of Week</CardTitle>
              <CardDescription>Distribution of bookings across the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.bookingsByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(173 80% 40%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bookings by Hour */}
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Booking distribution by time of day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data?.bookingsByHour}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="hsl(173 80% 40%)" strokeWidth={2} dot={{ fill: 'hsl(173 80% 40%)' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Rooms */}
          <Card>
            <CardHeader>
              <CardTitle>Most Booked Rooms</CardTitle>
              <CardDescription>Room popularity ranking</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data?.bookingsByRoom} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(222 47% 20%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Breakdown</CardTitle>
              <CardDescription>Current status of all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data?.statusBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="status"
                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data?.statusBreakdown.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Room Utilization Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Room Utilization Overview</CardTitle>
            <CardDescription>Estimated utilization based on booking frequency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data?.roomUtilization.map((room, i) => (
                <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
                  <div
                    className="w-full h-24 rounded-lg mb-2 flex items-center justify-center text-2xl font-bold text-white"
                    style={{
                      backgroundColor: `hsl(173 80% ${Math.max(20, 60 - room.value / 2)}%)`,
                    }}
                  >
                    {room.value}%
                  </div>
                  <p className="text-sm font-medium truncate">{room.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
