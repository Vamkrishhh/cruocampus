import lectureHall from '@/assets/rooms/lecture-hall.jpg';
import computerLab from '@/assets/rooms/computer-lab.jpg';
import seminarRoom from '@/assets/rooms/seminar-room.jpg';
import studyRoom from '@/assets/rooms/study-room.jpg';
import innovationLab from '@/assets/rooms/innovation-lab.jpg';
import conferenceRoom from '@/assets/rooms/conference-room.jpg';

// Map room names to their images
const roomImageMap: Record<string, string> = {
  'Lecture Hall A': lectureHall,
  'Computer Lab 101': computerLab,
  'Seminar Room B': seminarRoom,
  'Study Room 1': studyRoom,
  'Innovation Lab': innovationLab,
  'Conference Room C': conferenceRoom,
};

// Map room types to default images
const typeImageMap: Record<string, string> = {
  classroom: lectureHall,
  lab: computerLab,
  seminar_hall: seminarRoom,
  meeting_room: conferenceRoom,
  sports_facility: innovationLab,
};

export const getRoomImage = (roomName: string, roomType: string): string => {
  // First try to match by name
  if (roomImageMap[roomName]) {
    return roomImageMap[roomName];
  }
  
  // Fall back to type-based image
  return typeImageMap[roomType] || lectureHall;
};

export const roomImages = {
  lectureHall,
  computerLab,
  seminarRoom,
  studyRoom,
  innovationLab,
  conferenceRoom,
};
