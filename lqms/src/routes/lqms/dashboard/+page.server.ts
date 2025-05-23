import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyJWT } from '../../../lib/server/jwt';
import { db } from '../../../lib/server/database';

async function fetchDateFact() {
  var today = new Date();
  var day = String(today.getDate()).padStart(2, '0');
  var month = String(today.getMonth() + 1).padStart(2, '0'); 
  try {
    const response = await fetch("https://numbersapi.p.rapidapi.com/"+month+"/"+day+"/date?json=true",
      {
        method: 'GET',
        headers: {
          'x-rapidapi-key': 'b829319507msh5e68efc7f9de9e3p18add8jsn6c2dcebab1be',
          'x-rapidapi-host': 'numbersapi.p.rapidapi.com'
        }
      }
    );
    const data = await response.json(); 
    console.log(data);
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

async function getMeme() {
  try {
    const response = await fetch("https://api.imgflip.com/caption_image", {
      method: "POST",
      headers: {
      "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
          template_id: "114585149",
          text0: "Ich wenn die Meme API langsam lädt",
          text1: "",
          username: "webappproject",
          password: "webappproject",
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

  // Redirect zur Startseite
  // if (!user) {
  //   throw redirect(302, '/');
  // }

  // Tip aus Datenbank holen
  const result = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
  // Gibt eine Ausgabe egal welcher Fall auftritt
  const tip = (result[0] && result[0][0]?.tipps) ?? 'Kein Tipp gefunden';

  // Aus Api geladen
  const dailyfact = await fetchDateFact();
  const dailymeme = await getMeme();

  // Zusammen zurückgeben (wird in dashboard geladen)
  return {
    user,
    tip,
    dailyfact,
    dailymeme,
  };
};
