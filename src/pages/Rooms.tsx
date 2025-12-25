import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Users,
  MapPin,
  Monitor,
  Wifi,
  Projector,
  Search,
  Filter,
  Loader2,
  FlaskConical,
  GraduationCap,
  Presentation,
  DoorOpen,
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
  is_active: boolean;
}

const roomTypeIcons = {
  classroom: <GraduationCap className="w-5 h-5" />,
  lab: <FlaskConical className="w-5 h-5" />,
  seminar_hall: <Presentation className="w-5 h-5" />,
  meeting_room: <DoorOpen className="w-5 h-5" />,
};

const roomTypeLabels = {
  classroom: 'Classroom',
  lab: 'Laboratory',
  seminar_hall: 'Seminar Hall',
  meeting_room: 'Meeting Room',
};

const Rooms = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<string>('all');

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;
        setRooms(data || []);
        setFilteredRooms(data || []);
      } catch (error) {
        console.error('Error fetching rooms:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  useEffect(() => {
    let result = rooms;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.building.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter((room) => room.type === typeFilter);
    }

    // Capacity filter
    if (capacityFilter !== 'all') {
      switch (capacityFilter) {
        case 'small':
          result = result.filter((room) => room.capacity <= 20);
          break;
        case 'medium':
          result = result.filter((room) => room.capacity > 20 && room.capacity <= 50);
          break;
        case 'large':
          result = result.filter((room) => room.capacity > 50);
          break;
      }
    }

    setFilteredRooms(result);
  }, [rooms, searchQuery, typeFilter, capacityFilter]);

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
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-display font-bold">Available Rooms</h1>
          <p className="text-muted-foreground mt-1">
            Browse and book campus spaces for your activities
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search rooms or buildings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Room Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="classroom">Classroom</SelectItem>
                    <SelectItem value="lab">Laboratory</SelectItem>
                    <SelectItem value="seminar_hall">Seminar Hall</SelectItem>
                    <SelectItem value="meeting_room">Meeting Room</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Users className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Capacity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Size</SelectItem>
                    <SelectItem value="small">Small (≤20)</SelectItem>
                    <SelectItem value="medium">Medium (21-50)</SelectItem>
                    <SelectItem value="large">Large (50+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden card-hover group">
                {/* Room Image */}
                <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
                  {room.image_url ? (
                    <img
                      src={room.image_url}
                      alt={room.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-primary/30" />
                    </div>
                  )}
                  <Badge className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground">
                    {roomTypeIcons[room.type]}
                    <span className="ml-1">{roomTypeLabels[room.type]}</span>
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display font-semibold text-lg">{room.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {room.building}, Floor {room.floor}
                      </p>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {room.capacity}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  {room.equipment.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {room.equipment.slice(0, 4).map((eq, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {getEquipmentIcon(eq)}
                          <span className="ml-1">{eq}</span>
                        </Badge>
                      ))}
                      {room.equipment.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{room.equipment.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={() => navigate(`/rooms/${room.id}`)}
                  >
                    View & Book
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No rooms found</h3>
              <p className="text-muted-foreground mt-1">
                Try adjusting your filters or search query
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Rooms;
