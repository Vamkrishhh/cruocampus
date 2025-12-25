import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Building2, QrCode, XCircle, Loader2, Eye, LogOut } from 'lucide-react';

interface Booking {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  qr_code: string | null;
  rooms: { name: string; building: string };
}

const MyBookings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);

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

  const checkOut = async (id: string) => {
    try {
      await supabase.from('bookings').update({ 
        status: 'completed', 
        checked_out_at: new Date().toISOString() 
      }).eq('id', id);
      await supabase.from('checkins').insert({ 
        booking_id: id, 
        user_id: user!.id, 
        action: 'check_out' 
      });
      setBookings(bookings.map(b => b.id === id ? { ...b, status: 'completed' } : b));
      toast({ title: 'Checked out successfully' });
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const showQrCode = (code: string | null) => {
    if (code) {
      setSelectedQrCode(code);
      setQrDialogOpen(true);
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
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(booking.status)}
                    {booking.qr_code && ['pending', 'confirmed'].includes(booking.status) && (
                      <Button size="sm" variant="outline" onClick={() => showQrCode(booking.qr_code)}>
                        <Eye className="w-4 h-4 mr-1" />QR
                      </Button>
                    )}
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
                    {booking.status === 'checked_in' && (
                      <Button size="sm" variant="outline" onClick={() => checkOut(booking.id)}>
                        <LogOut className="w-4 h-4 mr-1" />Check Out
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center"><Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" /><p>No bookings yet</p><Button asChild variant="link" className="mt-2"><Link to="/rooms">Browse rooms</Link></Button></CardContent></Card>
        )}
      </div>

      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Booking QR Code</DialogTitle>
            <DialogDescription>Show this code at check-in or use it in the Check-In page</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-48 h-48 bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-accent">
              <QrCode className="w-24 h-24 text-accent" />
            </div>
            <code className="px-4 py-2 bg-muted rounded-lg text-lg font-mono font-semibold">{selectedQrCode}</code>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(selectedQrCode || ''); toast({ title: 'Copied!' }); }}>
              Copy Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyBookings;
