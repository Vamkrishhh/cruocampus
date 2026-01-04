import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Clock, Building2, Users, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { format, addMinutes } from 'date-fns';

interface AvailableSlot {
  room: {
    id: string;
    name: string;
    building: string;
    capacity: number;
    type: string;
  };
  startTime: string;
  endTime: string;
}

const QuickBookWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [bookingTitle, setBookingTitle] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const today = format(now, 'yyyy-MM-dd');
      const currentHour = now.getHours();
      const nextHour = currentHour + 1;

      // Fetch all active rooms
      const { data: rooms } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('name');

      // Fetch today's bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('room_id, start_time, end_time')
        .eq('date', today)
        .in('status', ['pending', 'confirmed', 'checked_in']);

      if (!rooms) return;

      const slots: AvailableSlot[] = [];

      // Find available slots for the next 2 hours
      rooms.forEach(room => {
        const roomBookings = bookings?.filter(b => b.room_id === room.id) || [];
        
        // Check next hour slot
        const nextSlotStart = `${nextHour.toString().padStart(2, '0')}:00`;
        const nextSlotEnd = `${(nextHour + 1).toString().padStart(2, '0')}:00`;
        
        const isNextHourBooked = roomBookings.some(b => {
          const bookingStart = parseInt(b.start_time.split(':')[0]);
          const bookingEnd = parseInt(b.end_time.split(':')[0]);
          return nextHour >= bookingStart && nextHour < bookingEnd;
        });

        if (!isNextHourBooked && nextHour < 21) {
          slots.push({
            room: {
              id: room.id,
              name: room.name,
              building: room.building,
              capacity: room.capacity,
              type: room.type,
            },
            startTime: nextSlotStart,
            endTime: nextSlotEnd,
          });
        }
      });

      // Limit to first 6 slots
      setAvailableSlots(slots.slice(0, 6));
    } catch (error) {
      console.error('Error fetching available slots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickBook = async () => {
    if (!selectedSlot || !user || !bookingTitle.trim()) return;
    
    setIsBooking(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const qrCode = `CRUO-${selectedSlot.room.id.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;

      const { error } = await supabase.from('bookings').insert({
        room_id: selectedSlot.room.id,
        user_id: user.id,
        title: bookingTitle.trim(),
        date: today,
        start_time: `${selectedSlot.startTime}:00`,
        end_time: `${selectedSlot.endTime}:00`,
        status: 'confirmed',
        qr_code: qrCode,
      });

      if (error) throw error;

      toast({
        title: 'Booking Confirmed!',
        description: `${selectedSlot.room.name} booked for ${selectedSlot.startTime} - ${selectedSlot.endTime}`,
      });

      setDialogOpen(false);
      setSelectedSlot(null);
      setBookingTitle('');
      fetchAvailableSlots();
    } catch (error: any) {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Could not complete the booking',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const openQuickBook = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setBookingTitle('Quick Booking');
    setDialogOpen(true);
  };

  const formatTimeLabel = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return format(new Date(2000, 0, 1, hour), 'h:mm a');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-accent" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-accent/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg">Quick Book</CardTitle>
              <CardDescription className="text-xs">Available rooms for the next hour</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {availableSlots.length > 0 ? (
            availableSlots.slice(0, 4).map((slot, index) => (
              <div
                key={`${slot.room.id}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{slot.room.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatTimeLabel(slot.startTime)} - {formatTimeLabel(slot.endTime)}
                    <span className="text-muted-foreground/50">•</span>
                    <Users className="w-3 h-3" />
                    {slot.room.capacity}
                  </div>
                </div>
                <Button
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground h-8"
                  onClick={() => openQuickBook(slot)}
                >
                  Book
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No slots available for the next hour
            </div>
          )}
          
          {availableSlots.length > 4 && (
            <Button
              variant="ghost"
              className="w-full text-xs"
              onClick={() => navigate('/rooms')}
            >
              View {availableSlots.length - 4} more available rooms
            </Button>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Quick Book
            </DialogTitle>
            <DialogDescription>
              Book {selectedSlot?.room.name} for {selectedSlot && formatTimeLabel(selectedSlot.startTime)} - {selectedSlot && formatTimeLabel(selectedSlot.endTime)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Building2 className="w-5 h-5 text-accent" />
              <div>
                <p className="font-medium">{selectedSlot?.room.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSlot?.room.building}</p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                <Users className="w-3 h-3 mr-1" />
                {selectedSlot?.room.capacity}
              </Badge>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Booking Title</label>
              <Input
                placeholder="e.g., Quick Study Session"
                value={bookingTitle}
                onChange={(e) => setBookingTitle(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleQuickBook}
              disabled={isBooking || !bookingTitle.trim()}
              className="bg-accent hover:bg-accent/90"
            >
              {isBooking ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Confirm Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickBookWidget;
