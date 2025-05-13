<script lang="ts">
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { verifyJWT } from '$lib/server/jwt';

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get('authToken');
  const user = token && verifyJWT(token);

  //if (!user) {
  //  throw redirect(302, '/'); // zurück zur Startseite
  //}

  return {
    user
  };

  //Tab - Notizen

  //Tab - Checkup

  //Tab - Dashboard

  //Tab - VL-Plan

  //Tab Benutzerverwaltung (Admin only)

};

//Session
let seconds = 0;
let clock = 0;
let isRunning = false;

function session_start(){
  if(!isRunning){
    isRunning = true;
    clock = setInterval(() => {seconds +=1}, 1000);
  }
}

function session_pause(){
  isRunning = false;
  clearInterval(clock);
}

function session_end(){
  isRunning = false;
  clearInterval(clock);
  seconds = 0;
}
</script>

<p>Zeit: {seconds} Sekunden</p>

<button on:click={session_start} disabled={isRunning}>Start</button>
<button on:click={session_pause} disabled={!isRunning}>Pause</button>
<button on:click={session_end}>Stop</button>
