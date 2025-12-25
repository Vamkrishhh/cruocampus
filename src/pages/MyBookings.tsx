import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Building2, QrCode, XCircle, Loader2 } from 'lucide-react';

interface Booking {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  qr_code: string;
  rooms: { name: string; building: string };
}

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*, rooms(name, building)')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  const cancelBooking = async (id: string) => {
    try {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
      toast({ title: 'Booking cancelled' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: 'status-available',
      checked_in: 'bg-info/10 text-info',
      completed: 'bg-muted text-muted-foreground',
      cancelled: 'status-occupied',
      no_show: 'status-occupied',
      pending: 'status-pending',
    };
    return <Badge className={styles[status] || 'bg-muted'}>{status.replace('_', ' ')}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-display font-bold">My Bookings</h1>
          <Button asChild><Link to="/rooms">Book New Room</Link></Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map(booking => (
              <Card key={booking.id} className="card-hover">
                <CardContent className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{booking.title}</h3>
                    <p className="text-muted-foreground">{booking.rooms?.name} • {booking.rooms?.building}</p>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{booking.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{booking.start_time} - {booking.end_time}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(booking.status)}
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <>
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/checkin?code=${booking.qr_code}`}><QrCode className="w-4 h-4 mr-1" />Check In</Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => cancelBooking(booking.id)}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p>No bookings yet</p></CardContent></Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBookings;
