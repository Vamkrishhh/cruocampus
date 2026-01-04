import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getRoomImage } from '@/utils/roomImages';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Building2,
  Users,
  MapPin,
  Loader2,
  Grid3X3,
  List,
  LayoutGrid,
} from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachWeekOfInterval, getDay } from 'date-fns';

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  building: string;
  floor: number;
}

interface Booking {
  id: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  status: string;
  user_id: string;
  rooms?: Room;
}

const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = i + 8;
  return {
    time: `${hour.toString().padStart(2, '0')}:00`,
    label: format(new Date(2000, 0, 1, hour), 'h a'),
  };
});

const Schedule = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch rooms
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (roomsData) setRooms(roomsData);

        // Calculate date range based on view
        let startDate: Date, endDate: Date;
        if (view === 'day') {
          startDate = currentDate;
          endDate = currentDate;
        } else if (view === 'week') {
          startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
          endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
        } else {
          startDate = startOfMonth(currentDate);
          endDate = endOfMonth(currentDate);
        }

        // Fetch bookings
        const { data: bookingsData } = await supabase
          .from('bookings')
          .select('*, rooms(*)')
          .gte('date', format(startDate, 'yyyy-MM-dd'))
          .lte('date', format(endDate, 'yyyy-MM-dd'))
          .in('status', ['pending', 'confirmed', 'checked_in']);

        if (bookingsData) setBookings(bookingsData);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentDate, view]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (view === 'day') {
      setCurrentDate(prev => direction === 'next' ? addDays(prev, 1) : addDays(prev, -1));
    } else if (view === 'week') {
      setCurrentDate(prev => direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    }
  };

  const getDateRangeLabel = () => {
    if (view === 'day') {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    } else if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'MMMM yyyy');
    }
  };

  const getBookingsForSlot = (date: Date, time: string, roomId?: string) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return bookings.filter(b => {
      if (b.date !== dateStr) return false;
      if (roomId && b.room_id !== roomId) return false;
      if (selectedRoom !== 'all' && b.room_id !== selectedRoom) return false;
      const bookingStart = parseInt(b.start_time.split(':')[0]);
      const bookingEnd = parseInt(b.end_time.split(':')[0]);
      const slotHour = parseInt(time.split(':')[0]);
      return slotHour >= bookingStart && slotHour < bookingEnd;
    });
  };

  const filteredRooms = selectedRoom === 'all' ? rooms : rooms.filter(r => r.id === selectedRoom);

  const weekDays = view === 'week' 
    ? eachDayOfInterval({
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
      })
    : [];

  const monthWeeks = view === 'month'
    ? eachWeekOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
      }, { weekStartsOn: 1 })
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Schedule</h1>
            <p className="text-muted-foreground">View and manage room availability</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={selectedRoom} onValueChange={setSelectedRoom}>
              <SelectTrigger className="w-[180px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
              Today
            </Button>
          </div>
        </div>

        {/* Navigation & View Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="min-w-[240px] text-center">
                  <h2 className="text-lg font-semibold">{getDateRangeLabel()}</h2>
                </div>
                <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Tabs value={view} onValueChange={(v) => setView(v as 'day' | 'week' | 'month')}>
                <TabsList>
                  <TabsTrigger value="day" className="gap-1">
                    <List className="w-4 h-4" /> Day
                  </TabsTrigger>
                  <TabsTrigger value="week" className="gap-1">
                    <Grid3X3 className="w-4 h-4" /> Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="gap-1">
                    <LayoutGrid className="w-4 h-4" /> Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <>
            {/* Day View */}
            {view === 'day' && (
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Header */}
                    <div className="grid grid-cols-[100px_1fr] border-b">
                      <div className="p-3 bg-muted/50 font-medium text-sm">Time</div>
                      <div className="grid" style={{ gridTemplateColumns: `repeat(${filteredRooms.length}, 1fr)` }}>
                        {filteredRooms.map(room => (
                          <div key={room.id} className="p-3 bg-muted/50 border-l text-center">
                            <p className="font-medium text-sm">{room.name}</p>
                            <p className="text-xs text-muted-foreground">{room.building}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Time slots */}
                    {timeSlots.map(slot => (
                      <div key={slot.time} className="grid grid-cols-[100px_1fr] border-b">
                        <div className="p-3 text-sm text-muted-foreground border-r bg-muted/30">
                          {slot.label}
                        </div>
                        <div className="grid" style={{ gridTemplateColumns: `repeat(${filteredRooms.length}, 1fr)` }}>
                          {filteredRooms.map(room => {
                            const slotBookings = getBookingsForSlot(currentDate, slot.time, room.id);
                            return (
                              <div
                                key={room.id}
                                className={`p-2 border-l min-h-[60px] cursor-pointer hover:bg-muted/50 transition-colors ${
                                  slotBookings.length > 0 ? 'bg-accent/10' : ''
                                }`}
                                onClick={() => slotBookings.length === 0 && navigate(`/rooms/${room.id}`)}
                              >
                                {slotBookings.map(booking => (
                                  <Badge key={booking.id} className="w-full justify-start text-xs truncate bg-accent text-accent-foreground">
                                    {booking.title}
                                  </Badge>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Week View */}
            {view === 'week' && (
              <Card>
                <CardContent className="p-0 overflow-x-auto">
                  <div className="min-w-[900px]">
                    {/* Header */}
                    <div className="grid grid-cols-[100px_repeat(7,1fr)] border-b">
                      <div className="p-3 bg-muted/50"></div>
                      {weekDays.map(day => (
                        <div
                          key={day.toISOString()}
                          className={`p-3 text-center border-l ${
                            isSameDay(day, new Date()) ? 'bg-accent/10' : 'bg-muted/50'
                          }`}
                        >
                          <p className="text-xs text-muted-foreground">{format(day, 'EEE')}</p>
                          <p className={`text-lg font-semibold ${isSameDay(day, new Date()) ? 'text-accent' : ''}`}>
                            {format(day, 'd')}
                          </p>
                        </div>
                      ))}
                    </div>
                    {/* Time slots */}
                    {timeSlots.map(slot => (
                      <div key={slot.time} className="grid grid-cols-[100px_repeat(7,1fr)] border-b">
                        <div className="p-2 text-xs text-muted-foreground border-r bg-muted/30 flex items-start">
                          {slot.label}
                        </div>
                        {weekDays.map(day => {
                          const dayBookings = getBookingsForSlot(day, slot.time);
                          return (
                            <div
                              key={day.toISOString()}
                              className={`p-1 border-l min-h-[50px] cursor-pointer hover:bg-muted/50 transition-colors ${
                                dayBookings.length > 0 ? 'bg-accent/5' : ''
                              }`}
                              onClick={() => {
                                setView('day');
                                setCurrentDate(day);
                              }}
                            >
                              {dayBookings.slice(0, 2).map(booking => (
                                <div
                                  key={booking.id}
                                  className="text-xs p-1 mb-1 rounded bg-accent/20 text-accent-foreground truncate"
                                  title={`${booking.title} - ${booking.rooms?.name}`}
                                >
                                  {booking.rooms?.name}
                                </div>
                              ))}
                              {dayBookings.length > 2 && (
                                <span className="text-xs text-muted-foreground">+{dayBookings.length - 2} more</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Month View */}
            {view === 'month' && (
              <Card>
                <CardContent className="p-4">
                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                        {day}
                      </div>
                    ))}
                  </div>
                  {/* Weeks */}
                  {monthWeeks.map((weekStart, weekIndex) => {
                    const weekDays = eachDayOfInterval({
                      start: weekStart,
                      end: addDays(weekStart, 6),
                    });
                    return (
                      <div key={weekIndex} className="grid grid-cols-7 gap-1 mb-1">
                        {weekDays.map(day => {
                          const dayBookings = bookings.filter(b => b.date === format(day, 'yyyy-MM-dd'));
                          const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');
                          return (
                            <div
                              key={day.toISOString()}
                              className={`min-h-[100px] p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                                !isCurrentMonth ? 'opacity-40' : ''
                              } ${isSameDay(day, new Date()) ? 'border-accent bg-accent/5' : 'border-border'}`}
                              onClick={() => {
                                setView('day');
                                setCurrentDate(day);
                              }}
                            >
                              <p className={`text-sm font-medium mb-1 ${isSameDay(day, new Date()) ? 'text-accent' : ''}`}>
                                {format(day, 'd')}
                              </p>
                              <div className="space-y-1">
                                {dayBookings.slice(0, 3).map(booking => (
                                  <div
                                    key={booking.id}
                                    className="text-xs p-1 rounded bg-accent/20 truncate"
                                    title={booking.title}
                                  >
                                    {booking.rooms?.name}
                                  </div>
                                ))}
                                {dayBookings.length > 3 && (
                                  <span className="text-xs text-muted-foreground">+{dayBookings.length - 3}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Schedule;
