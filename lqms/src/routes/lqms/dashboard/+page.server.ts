import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyJWT } from '$lib/server/jwt';
import { db } from '$lib/server/database';

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
    console.log(data);
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

function formatTime(timeString: string): string {
  const [hours, minutes] = new Date(timeString)
    .toISOString()
    .split('T')[1]
    .split(':');
  return `${hours}:${minutes}`;
}

function addHours(date, hours) {
  const hoursToAdd = hours * 60 * 60 * 1000;
  date.setTime(date.getTime() + hoursToAdd);
  return date;
}

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
          template_id: "114585149",
          text0: "Ich wenn die Meme API langsam lädt",
          text1: "",
          username: user,
          password: pw,
    })
    });
    const data = await response.json();

    if (data.success) {
        return data.data.url;
    } else {
        console.error("Meme API Error: ", data.error_message);
    }
  } 
  catch (error) {
      console.error("Error getting the meme:", error);
  };
};

// nur eine load Funktion erlaubt pro Datei :(
export const load: PageServerLoad = async ({ cookies }) => {
  // User Kram
  const token = cookies.get('authToken');
  const user = token && verifyJWT(token);

  // get tip from db
  // random value between 0 and 1, transform it so we get range(1,11)
  const id = Math.floor(Math.random() * 11) + 1;
  const result = db.query('SELECT `tipps` FROM `content` WHERE `id` = ?', [id]);
  // Gibt eine Ausgabe egal welcher Fall auftritt
  console.log(result);
  const tip = (result[0] && result[0][0]?.tipps) ?? 'Kein Tipp gefunden';

  // loaded from external api
  const dailyfact =  await fetchDateFact();
  const dailymeme =  await getMeme();
  const lectures =  await loadLecturesForToday();

  // Zusammen zurückgeben (wird in dashboard geladen)
  return {
    user,
    tip,
    dailyfact,
    dailymeme,
    lectures,
  };
};
