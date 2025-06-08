<!--Daten aus dem Typscript Programm holen-->
<script lang="ts">
	import type { PageData } from './$types';
  import { onMount } from 'svelte';
	export let data: PageData;
	const { user, tip, dailyfact, dailymeme, lectures } = data;
  onMount(() => {
    const memeElement = document.getElementById("meme") as HTMLImageElement;
    memeElement.src = dailymeme;
  })
</script>

<svelte:head>
  <style>
    :root {
      --col-gap: 1rem;
      --row-gap: 1rem;
      --bg-col: #fae4d8;
      --panel-col: #ffece3;
      --beige: #ffc8b2;
      --lightred: #ff9e8c;
      font-family: "Inter", sans-serif;
    }

    body {
      margin: 0;
      background: var(--bg-col);
      display: flex;
      justify-content: center;
      padding: 2rem;
    }

    .dashboard {
      display: flex;
      gap: var(--col-gap);
      width: 100%;
      max-width: 1920px;
      background: #ffb49c;
      padding: var(--col-gap);
      border-radius: 12px;
    }

    .dashboard img {
      max-width: 100%;  
      max-height: 100%; /
      object-fit: contain;  
    }

    .column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--row-gap);
      align-items:stretch;
      background-color: var(--panel-col);
      border-radius: 8px;
      padding: var(--col-gap);
    }

    .panel {
      background: var(--panel-col);
      border-radius: 8px;
      padding: 5%;
      font-weight: 600;
      color: #655a55;
    }

      .row{
      display:flex;
      gap:var(--row-gap);
      flex:1;           
      min-height:0;    
      }

    /* individual sizes */
    .tall {
      min-height: 180px;
    }
    .medium {
      min-height: 120px;
    }
    /* Placeholder colors */
    .beige_bg {
      background: var(--beige);
    }
    .lightred_bg {
      background: var(--lightred);
    }

    .lecture-card {
      border: 1px solid #ccc;
      padding: 1em;
      margin-bottom: 1em;
      border-radius: 6px;
      background: #EBC2C6;
    }

    .lecture-container {
      display: flex;
      flex-direction: column; /* Untereinander */
      gap: 1rem; /* Abstand zwischen den Cards */
      margin-top: 1rem;
    }

    h2 {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0 0 0.5em 0;
    color: #333;
   } 
  </style>
</svelte:head>

<div class="app-container">
  <center>
  <header class="nav">
    <ul>
      <li id="sessions"><a href="./dashboard/sessions/">Sessions</a></li>
      <li id="checkup"><a href="./dashboard/check-up">Check-Up</a></li>
      <li id="dashboard"><a href="./dashboard/">Dashboard</a></li>
      <li id="lectures"><a href="./dashboard/lectures/">Vorlesungen</a></li>
    </ul>
  </header>
  <section class="dashboard">
    <!-- L -->
    <div class="column">
        <div class="panel medium beige_bg">Lernverhalten / Konzentrationskurve
        <h2>Etwas zum Lachen</h2>
            <img style="height:100px;" id="meme" src="" alt="Meme"/></div>
        <div class="panel medium beige_bg">Arbeitszeiten Diagramm</div>
        <div class="panel medium beige_bg">
            <h2>Dein täglicher Lerntipp</h2>
            <div>{tip}</div>
        </div>
        <div class="panel beige_bg" style="flex:1">Heat Map</div>
    </div>

    <!-- M -->
    <div class="column">
        <div class="panel beige_bg">
            <h2 >Ein Fakt üher den heutigen Tag</h2><br>
            <span>{dailyfact}</span>
        </div>
        <div class="panel beige_bg lecture-container">
          <h2>Deine heutigen Vorlesungen</h2>
          {#if lectures.length === 0}
            <p>Keine Vorlesungen heute.</p>
          {:else}
            {#each lectures as lecture}
              <div class="lecture-card">
                <h3>{lecture.name}</h3>
                <p><strong>Raum:</strong> {lecture.room}</p>
                <p><strong>Uhrzeit:</strong> {lecture.startTime} – {lecture.endTime}</p>
              </div>
            {/each}
          {/if}
      </div>
    </div>

    <!-- R -->
    <div class="column">
        <div class="panel medium beige_bg">
          <h3>Profile</h3>
          <img style="width:50px;" src="https://raw.githubusercontent.com/nyrocarion/LQMS/refs/heads/main/temp_images/temp_avatar_placeholder.png" alt="Avatar 2" />
          <b>Username</b><br>
        </div>
        <div class="panel tall beige_bg">To Do Liste</div>
        <div class="panel tall beige_bg">Progress Chart</div>
    </div>
  </section>
</center>
</div>