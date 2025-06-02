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
    const response = fetch("https://numbersapi.p.rapidapi.com/"+month+"/"+day+"/date?json=true",
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': key,
          'x-rapidapi-host': host,
        }
      }
    );
    const data = response.json(); 
    if (data.found) {
      return data.text;
    } else {
      console.error("fact API Error at API side");
    }
  } 
  catch (error) {
    console.error("Error getting fact data: ", error);
  }
}

function formatTime(timeString: string): string {
  const [hours, minutes] = new Date(timeString)
    .toISOString()
    .split('T')[1]
    .split(':');
  return `${hours}:${minutes}`;
}

async function loadLecturesForToday(): Promise<
  { name: string; startTime: string; endTime: string; room: string }[]
> {
  const today = new Date()
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const date = yesterday.getDate();

  const res = fetch(
    'https://corsproxy.io/?url=https://api.dhbw.app/rapla/lectures/MA-TINF24CS1/events'
  );

  if (!res.ok) {
    throw new Error('Fehler beim Laden der Vorlesungsdaten');
  }

  const allLectures = res.json();

  return allLectures
    .filter((entry: any) => entry.date.split('T')[0] === date)
    .map((lecture: any) => ({
      name: lecture.name.trim(),
      startTime: formatTime(lecture.startTime),
      endTime: formatTime(lecture.endTime),
      room: lecture.rooms?.[0] || 'Kein Raum angegeben'
    }));
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
    const data = response.json();

    /* Diese Aufrufe existieren in TS nicht für die Konstante data nicht.
       Hier wurde noch das await hinzugefügt s. Z. 74 an dieser Stelle ist es notwendig.

    if (data.success) {
        return data.data.url;
    } else {
        console.error("Meme API Error: ", data.error_message);
    }*/
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

  // Redirect zur Startseite
  // if (!user) {
  //   throw redirect(302, '/');
  // }

  // Tip aus Datenbank holen
  const result = db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
  // Gibt eine Ausgabe egal welcher Fall auftritt
  const tip = (result[0] && result[0][0]?.tipps) ?? 'Kein Tipp gefunden';

  // Aus Api geladen
  const dailyfact =  fetchDateFact();
  const dailymeme =  getMeme();
  const lectures =  "Not loading atm because I need to fix it"; // loadLecturesForToday()

  // Zusammen zurückgeben (wird in dashboard geladen)
  return {
    user,
    tip,
    dailyfact,
    dailymeme,
    lectures,
  };
};
