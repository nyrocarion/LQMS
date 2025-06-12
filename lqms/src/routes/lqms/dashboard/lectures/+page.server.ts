import type { PageServerLoad } from './$types';

/**
 * Adds a specified number of hours to a date string and returns the resulting Date object.
 * @param dateStr - The date string to which hours will be added.
 * @param hours - The number of hours to add.
 * @returns The new Date object with the added hours.
 */
function addHours(dateStr: string, hours: number): Date {
  const date = new Date(dateStr);
  date.setHours(date.getHours() + hours);
  return date;
}

/**
 * Formats a Date object to a string in "HH:mm" format.
 * @param date - The Date object to format.
 * @returns The formatted time string.
 */
function formatTime(date: Date): string {
  return date.toISOString().split('T')[1].slice(0, 5); // "HH:mm"
}

/**
 * Loads the lectures for the current week from the DHBW API.
 * Filters and formats the lectures to include only those within the current week (Monday to Friday).
 * @returns An object containing the week's lectures.
 */
export const load: PageServerLoad = async () => {
  // Fetch all lectures for the group MA-TINF24CS1
  const res = await fetch('https://api.dhbw.app/rapla/lectures/MA-TINF24CS1/events');
  const allLectures = await res.json();

  // Get the current date and calculate the start (Monday) and end (Friday) of the week
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // monday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 4); // friday

  // Map and filter lectures to only include those within the current week
  const weekLectures = allLectures
    .map((entry: any) => {
      const start = addHours(entry.startTime, 2);
      const end = addHours(entry.endTime, 2);
      return {
        name: entry.name.trim(),
        startTime: formatTime(start),
        endTime: formatTime(end),
        room: entry.rooms?.[0] || 'Kein Raum angegeben',
        date: start.toISOString().split('T')[0],
      };
    })
    .filter((lecture) => {
      const date = new Date(lecture.date);
      return date >= startOfWeek && date <= endOfWeek;
    });

  return {
    weekLectures,
  };
};