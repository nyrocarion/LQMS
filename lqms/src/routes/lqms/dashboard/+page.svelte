<!--Daten aus dem Typscript Programm holen-->
<script lang="ts">
	import type { PageData } from './$types';
  import { onMount } from 'svelte';
	export let data: PageData;
	const { user, tip, dailyfact, dailymeme } = data;
  console.log(dailyfact);
  console.log(dailymeme);
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
      max-width: 100%;  /* Das Bild nimmt maximal 100% der Breite des Containers ein */
      max-height: 100%; /* Das Bild nimmt maximal 100% der Höhe des Containers ein */
      object-fit: contain;  /* Das Bild wird im Container skaliert, behält aber sein Seitenverhältnis */
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
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: #655a55;
    }

      .row{
      display:flex;
      gap:var(--row-gap);
      flex:1;           /* darf volle Höhe der Spalte belegen */
      min-height:0;     /* lässt die Kinder bestimmen, wie hoch sie sein wollen */
      }

      /* halbe Breite pro Kasten */
      .halfpanel{
      flex:1;
      display:flex;
      align-items:center;
      justify-content:center;
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
  </style>
</svelte:head>

<h1 style="font-size:100px;">Dashboard</h1>
<!--Wird nur angezeigt wenn ein User angemeldet ist-->
{#if user}
  <p>Willkommen zurück, {user.name}!</p>
{/if}
<section class="dashboard">
  <!-- L -->
  <div class="column">
    <div class="panel medium beige_bg">Lernverhalten / Konzentrationskurve</div>
    <div class="panel medium beige_bg">Arbeitszeiten Diagramm</div>
    <div class="panel medium beige_bg">
      <h2>Tipps+Tricks API</h2><br>
      <span>{tip}</span>
    </div>
    <div class="panel beige_bg" style="flex:1">Heat Map</div>
  </div>

  <!-- M -->
  <div class="column">
    <div class="panel tall beige_bg" style="flex:1">VL Plan</div>
    <div class="row">
      <div class="halfpanel panel beige_bg">
        <h2>Numbers API</h2><br>
        <span>{dailyfact}</span>
      </div>
      <div class="halfpanel panel beige_bg">heutige Vorlesungen</div>
    </div>
    <div class="panel beige_bg" style="flex:1">
      <img id="meme" src="" alt="Meme"/>
    </div>
  </div>

  <!-- R -->
  <div class="column">
    <div class="panel medium beige_bg">Profil Area</div>
    <div class="panel beige_bg">Start Timer Knopf</div>
    <div class="panel tall beige_bg">To Do Liste</div>
    <div class="panel tall beige_bg">Progress Chart</div>
  </div>
</section>
