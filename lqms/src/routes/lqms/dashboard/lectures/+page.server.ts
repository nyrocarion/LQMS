import type { PageServerLoad } from './$types';

function addHours(dateStr: string, hours: number): Date {
  const date = new Date(dateStr);
  date.setHours(date.getHours() + hours);
  return date;
}

function formatTime(date: Date): string {
  return date.toISOString().split('T')[1].slice(0, 5); // "HH:mm"
}

export const load: PageServerLoad = async () => {
  const res = await fetch('https://api.dhbw.app/rapla/lectures/MA-TINF24CS1/events');
  const allLectures = await res.json();

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // monday
  startOfWeek.setHours(0, 0, 0, 0); // earliest possible time

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // friday
  endOfWeek.setHours(23, 59, 59, 999); // last possible time

  const weekLectures = allLectures
    .map((entry: any) => {
      const start = addHours(entry.startTime, 2);
      const end = addHours(entry.endTime, 2);
      return {
        name: entry.name.trim(),
        startTime: formatTime(start),
        endTime: formatTime(end),
        room: entry.rooms?.[0] || 'Kein Raum angegeben',
        startDate: start, 
      };
    })
    .filter((lecture) => {
      return lecture.startDate >= startOfWeek && lecture.startDate <= endOfWeek;
    });

  return {
    weekLectures,
  };
};