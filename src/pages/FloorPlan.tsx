import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, MapPin, Clock, Loader2, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'seminar_hall' | 'meeting_room';
  capacity: number;
  building: string;
  floor: number;
  equipment: string[];
}

interface RoomWithAvailability extends Room {
  isAvailable: boolean;
  nextAvailable?: string;
  currentBooking?: string;
}

const roomTypeColors = {
  classroom: 'bg-info/20 border-info/40 hover:bg-info/30',
  lab: 'bg-accent/20 border-accent/40 hover:bg-accent/30',
  seminar_hall: 'bg-warning/20 border-warning/40 hover:bg-warning/30',
  meeting_room: 'bg-success/20 border-success/40 hover:bg-success/30',
};

const roomTypeLabels = {
  classroom: 'Classroom',
  lab: 'Laboratory',
  seminar_hall: 'Seminar Hall',
  meeting_room: 'Meeting Room',
};

// Simulated floor plan positions (in percentage)
const getFloorPlanPosition = (room: Room, index: number, totalRooms: number) => {
  const row = Math.floor(index / 4);
  const col = index % 4;
  return {
    left: `${15 + col * 20}%`,
    top: `${15 + row * 25}%`,
    width: '16%',
    height: '20%',
  };
};

const FloorPlan = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<RoomWithAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all');
  const [selectedFloor, setSelectedFloor] = useState<string>('all');
  const [zoom, setZoom] = useState(1);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [floors, setFloors] = useState<number[]>([]);

  useEffect(() => {
    const fetchRoomsWithAvailability = async () => {
      setIsLoading(true);
      try {
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (!roomsData) return;

        // Get unique buildings and floors
        const uniqueBuildings = [...new Set(roomsData.map(r => r.building))];
        const uniqueFloors = [...new Set(roomsData.map(r => r.floor))].sort((a, b) => a - b);
        setBuildings(uniqueBuildings);
        setFloors(uniqueFloors);

        // Get current bookings
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentHour = now.getHours();

        const { data: currentBookings } = await supabase
          .from('bookings')
          .select('room_id, title, start_time, end_time')
          .eq('date', today)
          .in('status', ['confirmed', 'checked_in']);

        const roomsWithAvailability: RoomWithAvailability[] = roomsData.map(room => {
          const roomBookings = currentBookings?.filter(b => b.room_id === room.id) || [];
          const currentBooking = roomBookings.find(b => {
            const start = parseInt(b.start_time.split(':')[0]);
            const end = parseInt(b.end_time.split(':')[0]);
            return currentHour >= start && currentHour < end;
          });

          return {
            ...room,
            isAvailable: !currentBooking,
            currentBooking: currentBooking?.title,
            nextAvailable: currentBooking ? currentBooking.end_time : undefined,
          };
        });

        setRooms(roomsWithAvailability);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoomsWithAvailability();

    // Refresh every minute
    const interval = setInterval(fetchRoomsWithAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredRooms = rooms.filter(room => {
    if (selectedBuilding !== 'all' && room.building !== selectedBuilding) return false;
    if (selectedFloor !== 'all' && room.floor !== parseInt(selectedFloor)) return false;
    return true;
  });

  const availableCount = filteredRooms.filter(r => r.isAvailable).length;
  const occupiedCount = filteredRooms.filter(r => !r.isAvailable).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Floor Plan</h1>
            <p className="text-muted-foreground">Interactive campus room map</p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
              <SelectTrigger className="w-[160px]">
                <Building2 className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Building" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map(building => (
                  <SelectItem key={building} value={building}>{building}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedFloor} onValueChange={setSelectedFloor}>
              <SelectTrigger className="w-[140px]">
                <MapPin className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Floor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {floors.map(floor => (
                  <SelectItem key={floor} value={floor.toString()}>Floor {floor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">{availableCount}</p>
              <p className="text-sm text-muted-foreground">Available Now</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{occupiedCount}</p>
              <p className="text-sm text-muted-foreground">Occupied</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{filteredRooms.length}</p>
              <p className="text-sm text-muted-foreground">Total Rooms</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{filteredRooms.reduce((sum, r) => sum + r.capacity, 0)}</p>
              <p className="text-sm text-muted-foreground">Total Capacity</p>
            </CardContent>
          </Card>
        </div>

        {/* Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium">Room Types:</span>
              {Object.entries(roomTypeLabels).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded border-2 ${roomTypeColors[type as keyof typeof roomTypeColors]}`} />
                  <span className="text-sm">{label}</span>
                </div>
              ))}
              <div className="border-l pl-4 ml-2 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-sm">Occupied</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floor Plan View */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Campus Layout</CardTitle>
              <CardDescription>Click on a room to book or view details</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm w-16 text-center">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="icon" onClick={() => setZoom(z => Math.min(2, z + 0.1))}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : (
              <div 
                className="relative bg-muted/30 rounded-xl border-2 border-dashed border-border overflow-auto"
                style={{ 
                  height: '500px',
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top left',
                }}
              >
                {/* Grid background */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(10)].map((_, i) => (
                    <div key={`h-${i}`} className="absolute w-full border-t border-foreground" style={{ top: `${i * 10}%` }} />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <div key={`v-${i}`} className="absolute h-full border-l border-foreground" style={{ left: `${i * 10}%` }} />
                  ))}
                </div>

                {/* Rooms */}
                <TooltipProvider>
                  {filteredRooms.map((room, index) => {
                    const pos = getFloorPlanPosition(room, index, filteredRooms.length);
                    return (
                      <Tooltip key={room.id}>
                        <TooltipTrigger asChild>
                          <div
                            className={`absolute rounded-lg border-2 cursor-pointer transition-all shadow-md flex flex-col items-center justify-center p-2 ${
                              roomTypeColors[room.type]
                            }`}
                            style={pos}
                            onClick={() => navigate(`/rooms/${room.id}`)}
                          >
                            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
                              room.isAvailable ? 'bg-success animate-pulse' : 'bg-destructive'
                            }`} />
                            <Building2 className="w-6 h-6 mb-1 opacity-70" />
                            <p className="text-xs font-semibold text-center truncate w-full">{room.name}</p>
                            <div className="flex items-center gap-1 text-xs opacity-70">
                              <Users className="w-3 h-3" />
                              {room.capacity}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-3">
                          <div className="space-y-2">
                            <p className="font-semibold">{room.name}</p>
                            <p className="text-xs text-muted-foreground">{room.building}, Floor {room.floor}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                <Users className="w-3 h-3 mr-1" />{room.capacity} seats
                              </Badge>
                              <Badge className={room.isAvailable ? 'bg-success' : 'bg-destructive'}>
                                {room.isAvailable ? 'Available' : 'Occupied'}
                              </Badge>
                            </div>
                            {room.currentBooking && (
                              <p className="text-xs">
                                <Clock className="w-3 h-3 inline mr-1" />
                                {room.currentBooking} until {room.nextAvailable}
                              </p>
                            )}
                            <Button size="sm" className="w-full mt-2 bg-accent hover:bg-accent/90">
                              {room.isAvailable ? 'Book Now' : 'View Details'}
                            </Button>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>

                {/* Corridors / Labels */}
                <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
                  <Move className="w-4 h-4 inline mr-1" />
                  Interactive Floor Plan - Click rooms to book
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick List View */}
        <Card>
          <CardHeader>
            <CardTitle>Room List</CardTitle>
            <CardDescription>All rooms with current availability status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRooms.map(room => (
                <div
                  key={room.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/rooms/${room.id}`)}
                >
                  <div className={`w-3 h-3 rounded-full ${room.isAvailable ? 'bg-success' : 'bg-destructive'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{room.name}</p>
                    <p className="text-xs text-muted-foreground">{room.building}, Floor {room.floor}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Users className="w-3 h-3 mr-1" />{room.capacity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FloorPlan;
