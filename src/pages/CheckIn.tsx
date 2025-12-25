import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { QrCode, CheckCircle2, Loader2, Camera } from 'lucide-react';

const CheckIn = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setQrCode(codeFromUrl);
    }
  }, [searchParams]);

  const handleCheckIn = async () => {
    if (!qrCode.trim() || !user) return;
    setIsLoading(true);
    try {
      const { data: booking, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('qr_code', qrCode.trim())
        .eq('user_id', user.id)
        .single();

      if (error || !booking) throw new Error('Invalid QR code or booking not found');

      if (booking.status === 'checked_in') {
        toast({ title: 'Already checked in', variant: 'destructive' });
        return;
      }

      await supabase.from('bookings').update({ status: 'checked_in', checked_in_at: new Date().toISOString() }).eq('id', booking.id);
      await supabase.from('checkins').insert({ booking_id: booking.id, user_id: user.id, action: 'check_in' });

      setCheckedIn(true);
      toast({ title: 'Check-in successful!' });
    } catch (error: any) {
      toast({ title: 'Check-in failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold">QR Check-In</h1>
          <p className="text-muted-foreground mt-1">Validate your room booking</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              {checkedIn ? <CheckCircle2 className="w-10 h-10 text-success" /> : <QrCode className="w-10 h-10 text-accent" />}
            </div>
            <CardTitle>{checkedIn ? 'Checked In!' : 'Enter QR Code'}</CardTitle>
            <CardDescription>{checkedIn ? 'Your booking has been validated' : 'Enter your booking QR code to check in'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!checkedIn && (
              <>
                <Input placeholder="Enter QR code..." value={qrCode} onChange={(e) => setQrCode(e.target.value)} className="text-center text-lg" />
                <Button className="w-full bg-accent hover:bg-accent/90" onClick={handleCheckIn} disabled={isLoading || !qrCode.trim()}>
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Check In
                </Button>
              </>
            )}
            {checkedIn && (
              <Button variant="outline" className="w-full" onClick={() => { setCheckedIn(false); setQrCode(''); }}>
                Check In Another Booking
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CheckIn;
