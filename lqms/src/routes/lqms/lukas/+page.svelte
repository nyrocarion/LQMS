<script lang="ts">

import { db } from '$lib/server/database';


let totalSeconds = 0;
let clock = 0;
let isRunning = false;

// Zeitberechnung
  $: hours = Math.floor(totalSeconds / 3600);
  $: minutes = Math.floor((totalSeconds % 3600) / 60);
  $: seconds = totalSeconds % 60;

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

<!-- Container für Zeit + Buttons -->
<div class="timer-block">
  <h1>Sessiondauer: {seconds} Sekunden</h1>
  <div class="button-grid">
    <button class="clock" on:click={session_start} disabled={isRunning}>Start</button>
    <button class="clock" on:click={session_pause} disabled={!isRunning}>Pause</button>
    <button class="clock" on:click={session_end}>Stop</button>
  </div>
</div>

<style>
  .timer-block {
    display: grid;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
    text-align: center;
    padding: 2rem;
    border: 2px solid #007bff;
    border-radius: 10px;
    background-color: #f9f9f9;
  }

  .button-grid {
    display: flex;
    justify-content: space-around;
    gap: 10px;
  }

  .clock {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    flex: 1;
  }

/* Wenn Button nicht geht */
  .clock:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>