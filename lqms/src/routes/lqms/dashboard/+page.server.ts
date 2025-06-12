import type { PageServerLoad } from './$types';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';

/**
 * Fetches a historical fact for today's date from the NumbersAPI via RapidAPI.
 * @returns {Promise<string>} The fact text or an error message.
 */
async function fetchDateFact() {
  var today = new Date();
  var day = String(today.getDate()).padStart(2, '0');
  var month = String(today.getMonth() + 1).padStart(2, '0'); 
  try {
    const key = process.env.RAPID_API_KEY;
    const host = process.env.RAPID_API_HOST;
    const response = await fetch("https://numbersapi.p.rapidapi.com/"+month+"/"+day+"/date?json=true",
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': host,
        }
      }
    );
    const data = await response.json(); 
    if (data.found) {
      return data.text;
    } else {
      console.error("fact API Error at API side");
      return "API side error";
    }
  } 
  catch (error) {
    console.error("Error getting fact data: ", error);
    return "Internal error gettign fact";
  }
}

/**
 * Formats a time string to "HH:MM".
 * @param {string} timeString - The time string to format.
 * @returns {string} The formatted time.
 */
function formatTime(timeString: string): string {
  const [hours, minutes] = new Date(timeString)
    .toISOString()
    .split('T')[1]
    .split(':');
  return `${hours}:${minutes}`;
}

/**
 * Adds a specified number of hours to a Date object.
 * @param {Date} date - The date to modify.
 * @param {number} hours - The number of hours to add.
 * @returns {Date} The updated date.
 */
function addHours(date, hours) {
  const hoursToAdd = hours * 60 * 60 * 1000;
  date.setTime(date.getTime() + hoursToAdd);
  return date;
}

/**
 * Loads today's lectures for the group MA-TINF24CS1 from the DHBW API.
 * Adjusts times to local time (UTC+2).
 * @returns {Promise<Array<{ name: string; startTime: string; endTime: string; room: string }>>}
 */
async function loadLecturesForToday(): Promise<
  { name: string; startTime: string; endTime: string; room: string }[]
> {
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]; // 'yyyy-nn-dd'

  const res = await fetch(
    'https://api.dhbw.app/rapla/lectures/MA-TINF24CS1/events',
    { method: 'GET' }
  );

  if (!res.ok) {
    throw new Error('Fehler beim Laden der Vorlesungsdaten');
  }

  const allLectures = await res.json();

  return allLectures
    .filter((lecture: any) => {
      const startDate = new Date(lecture.startTime);
      const adjustedDate = addHours(startDate, 2).toISOString().split('T')[0];
      return adjustedDate === todayStr;
    })
    .map((lecture: any) => {
      const start = addHours(new Date(lecture.startTime), 2);
      const end = addHours(new Date(lecture.endTime), 2);

      return {
        name: lecture.name.trim(),
        startTime: formatTime(start.toISOString()),
        endTime: formatTime(end.toISOString()),
        room: lecture.rooms?.[0] || 'Kein Raum angegeben',
      };
    });
}

/**
 * Fetches a meme image URL from the Imgflip API using provided credentials.
 * @returns {Promise<string | undefined>} The meme image URL or undefined on error.
 */
async function getMeme() {
  try {
    const user = process.env.IMGFLIP_USER;
    const pw = process.env.IMGFLIP_PW;
    const response = await fetch("https://api.imgflip.com/caption_image", {
      method: "POST",
      headers: {
      "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
          template_id: "61579",
          text0: "One Does not simply",
          text1: "complete a learning session",
          username: user,
          password: pw,
    })
    });
    const data = await response.json();

    if (data.success) {
      return data.data.url;
    } else {
      console.error('Meme API Error:', data.error?.message ?? data.error);
    }
  } 
  catch (error) {
    console.error("Error getting the meme:", error);
  };
};

/**
 * The main load function for the dashboard page.
 * Loads user data, a random tip, daily fact, meme, lectures, and activity statistics.
 * @param {Object} param0 - The context object containing cookies.
 * @returns {Promise<Object>} The data to be used in the dashboard page.
 */
export const load: PageServerLoad = async ({ cookies }) => {
  
  // User authentication
  const token = cookies.get('authToken');
  const user = token && verifyJWT(token);

  if (!user) {
    return {
      user: null,
      error: 'Nicht authentifiziert',
    };
  }

  // Get a random tip from the database (IDs 1-11)
  const id = Math.floor(Math.random() * 11) + 1;
  const result = await db.query('SELECT `tipps` FROM `content` WHERE `id` = ?', [id]);
  // Always returns a value, fallback if not found
  const tip = (result[0] && result[0][0]?.tipps) ?? 'Kein Tipp gefunden';

  const userId = user.id;

  // Get profile data (name and email) from the database
  const profileRes = await db.query('SELECT `name`,`email` FROM `user` WHERE `id` = ?', [userId]);
  const profileName = profileRes[0][0]?.name;
  const profileMail = profileRes[0][0]?.email;

  // Get activity data (learning sessions) from the database for the last 5 days
  const rawData = await db.query(`
    SELECT 
      DATE(date + INTERVAL 2 HOUR) as session_date,
      SUM(time) as total_duration
    FROM session
    WHERE completedby = ?
      AND DATE(date + INTERVAL 2 HOUR) >= CURDATE() - INTERVAL 4 DAY
    GROUP BY session_date
    ORDER BY session_date
  `, [userId]);
  // List of the last 5 days for the chart legend
  const rows = rawData[0];

  // Generate date labels for the last 5 days (format: 'YYYY-MM-DD')
  const today = new Date();
  const labels = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('sv-SE'));  // 'YYYY-MM-DD'
  }

  // Map from session_date (string 'YYYY-MM-DD') to total_duration (seconds)
  const map = Object.fromEntries(
    rows.map(d => [
      new Date(d.session_date).toLocaleDateString('sv-SE'),
      Number(d.total_duration)
    ])
  );

  // Convert durations to minutes (rounded up, 0 if less than 1 minute)
  const durations = labels.map(date => {
    const seconds = map[date] || 0;
    return seconds < 60 ? 0 : Math.ceil(seconds / 60);
  });

  // Load external API data
  const dailyfact =  await fetchDateFact();
  const dailymeme =  await getMeme();
  const lectures =  await loadLecturesForToday();

  // Return all data for the dashboard page
  return {
    user,
    tip,
    dailyfact,
    dailymeme,
    lectures,
    labels,
    durations,
    profileName,
    profileMail,
  };
};