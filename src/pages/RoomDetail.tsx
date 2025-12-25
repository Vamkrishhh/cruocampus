import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { getRoomImage } from '@/utils/roomImages';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Users,
  MapPin,
  ArrowLeft,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Loader2,
  FlaskConical,
  GraduationCap,
  Presentation,
  DoorOpen,
  Wifi,
  Projector,
  Monitor,
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'seminar_hall' | 'meeting_room';
  capacity: number;
  building: string;
  floor: number;
  equipment: string[];
  amenities: string[];
  image_url: string | null;
}

interface TimeSlot {
  time: string;
  label: string;
  available: boolean;
}

const timeSlots: TimeSlot[] = [
  { time: '08:00', label: '8:00 AM', available: true },
  { time: '09:00', label: '9:00 AM', available: true },
  { time: '10:00', label: '10:00 AM', available: true },
  { time: '11:00', label: '11:00 AM', available: true },
  { time: '12:00', label: '12:00 PM', available: true },
  { time: '13:00', label: '1:00 PM', available: true },
  { time: '14:00', label: '2:00 PM', available: true },
  { time: '15:00', label: '3:00 PM', available: true },
  { time: '16:00', label: '4:00 PM', available: true },
  { time: '17:00', label: '5:00 PM', available: true },
  { time: '18:00', label: '6:00 PM', available: true },
  { time: '19:00', label: '7:00 PM', available: true },
  { time: '20:00', label: '8:00 PM', available: true },
];

const roomTypeLabels = {
  classroom: 'Classroom',
  lab: 'Laboratory',
  seminar_hall: 'Seminar Hall',
  meeting_room: 'Meeting Room',
};

const RoomDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Booking form state
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [attendeesCount, setAttendeesCount] = useState('1');

  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setRoom(data);
      } catch (error) {
        console.error('Error fetching room:', error);
        toast({
          title: 'Error',
          description: 'Could not load room details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id, toast]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!id || !selectedDate) return;

      const dateStr = selectedDate.toISOString().split('T')[0];

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('start_time, end_time')
          .eq('room_id', id)
          .eq('date', dateStr)
          .in('status', ['pending', 'confirmed', 'checked_in']);

        if (error) throw error;

        const booked: string[] = [];
        data?.forEach((booking) => {
          const start = parseInt(booking.start_time.split(':')[0]);
          const end = parseInt(booking.end_time.split(':')[0]);
          for (let hour = start; hour < end; hour++) {
            booked.push(`${hour.toString().padStart(2, '0')}:00`);
          }
        });

        setBookedSlots(booked);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchBookedSlots();
  }, [id, selectedDate]);

  const handleBooking = async () => {
    if (!user || !room || !selectedDate || !startTime || !endTime) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (!bookingTitle.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please provide a title for your booking.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { error } = await supabase.from('bookings').insert({
        room_id: room.id,
        user_id: user.id,
        title: bookingTitle.trim(),
        purpose: bookingPurpose.trim() || null,
        date: dateStr,
        start_time: `${startTime}:00`,
        end_time: `${endTime}:00`,
        attendees_count: parseInt(attendeesCount) || 1,
        status: 'confirmed',
      });

      if (error) throw error;

      toast({
        title: 'Booking Confirmed!',
        description: `${room.name} has been booked for ${new Date(dateStr).toLocaleDateString()}.`,
      });

      setIsBookingModalOpen(false);
      setBookingTitle('');
      setBookingPurpose('');
      setStartTime('');
      setEndTime('');
      setAttendeesCount('1');

      // Refresh booked slots
      const { data } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('room_id', room.id)
        .eq('date', dateStr)
        .in('status', ['pending', 'confirmed', 'checked_in']);

      const booked: string[] = [];
      data?.forEach((booking) => {
        const start = parseInt(booking.start_time.split(':')[0]);
        const end = parseInt(booking.end_time.split(':')[0]);
        for (let hour = start; hour < end; hour++) {
          booked.push(`${hour.toString().padStart(2, '0')}:00`);
        }
      });
      setBookedSlots(booked);
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Could not complete the booking.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableEndTimes = () => {
    if (!startTime) return [];
    const startHour = parseInt(startTime);
    return timeSlots.filter((slot) => {
      const slotHour = parseInt(slot.time);
      if (slotHour <= startHour) return false;
      // Check if any slot between start and this time is booked
      for (let h = startHour; h < slotHour; h++) {
        if (bookedSlots.includes(`${h.toString().padStart(2, '0')}:00`)) {
          return false;
        }
      }
      return true;
    });
  };

  const getEquipmentIcon = (equipment: string) => {
    switch (equipment.toLowerCase()) {
      case 'projector':
        return <Projector className="w-4 h-4" />;
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'computer':
      case 'computers':
        return <Monitor className="w-4 h-4" />;
      default:
        return <CheckCircle2 className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!room) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold">Room not found</h3>
            <Button variant="link" onClick={() => navigate('/rooms')}>
              Back to rooms
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/rooms')} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Rooms
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Room Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Header Card */}
            <Card className="overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-primary/20 to-accent/20">
                <img
                  src={getRoomImage(room.name, room.type)}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="mb-2">{roomTypeLabels[room.type]}</Badge>
                    <CardTitle className="text-2xl font-display">{room.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      {room.building}, Floor {room.floor}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    <Users className="w-5 h-5 mr-2" />
                    {room.capacity} seats
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {room.equipment.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Equipment</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.equipment.map((eq, i) => (
                          <Badge key={i} variant="outline" className="gap-1">
                            {getEquipmentIcon(eq)}
                            {eq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {room.amenities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {room.amenities.map((amenity, i) => (
                          <Badge key={i} variant="secondary">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Available Time Slots
                </CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Showing availability for ${selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}`
                    : 'Select a date to see available slots'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {timeSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot.time);
                    return (
                      <div
                        key={slot.time}
                        className={`p-3 rounded-lg text-center text-sm font-medium transition-all ${
                          isBooked
                            ? 'bg-destructive/10 text-destructive border border-destructive/20'
                            : 'bg-success/10 text-success border border-success/20'
                        }`}
                      >
                        {slot.label}
                        <div className="text-xs mt-1 opacity-80">
                          {isBooked ? 'Booked' : 'Available'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-accent" />
                  Select Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground h-12 text-lg"
              onClick={() => setIsBookingModalOpen(true)}
              disabled={!selectedDate}
            >
              Book This Room
            </Button>
          </div>
        </div>

        {/* Booking Modal */}
        <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Book {room.name}</DialogTitle>
              <DialogDescription>
                {selectedDate?.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Booking Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Team Meeting, Study Session"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose (optional)</Label>
                <Textarea
                  id="purpose"
                  placeholder="Brief description of your booking..."
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time *</Label>
                  <Select value={startTime} onValueChange={(v) => { setStartTime(v); setEndTime(''); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots
                        .filter((slot) => !bookedSlots.includes(slot.time))
                        .map((slot) => (
                          <SelectItem key={slot.time} value={slot.time}>
                            {slot.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>End Time *</Label>
                  <Select value={endTime} onValueChange={setEndTime} disabled={!startTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableEndTimes().map((slot) => (
                        <SelectItem key={slot.time} value={slot.time}>
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attendees">Number of Attendees</Label>
                <Input
                  id="attendees"
                  type="number"
                  min="1"
                  max={room.capacity}
                  value={attendeesCount}
                  onChange={(e) => setAttendeesCount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum capacity: {room.capacity} people
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBooking}
                disabled={isSubmitting || !startTime || !endTime || !bookingTitle}
                className="bg-accent hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default RoomDetail;
