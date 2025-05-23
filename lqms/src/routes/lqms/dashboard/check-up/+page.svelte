<script lang="ts">
  import { onMount } from 'svelte';

  type SessionData = {
    date: string;
    efficiency: number;
    motivated: number;
  };

  let heatmapData: SessionData[] = [];

  onMount(async () => {
    // Heatmap-Daten laden
    const heatmapRes = await fetch('/api/heatmap');
    heatmapData = await heatmapRes.json();
  });

  // Hilfsfunktion, um die Farbe basierend auf den Effizienz- und Motivationswerten zu berechnen
  function getHeatmapColor(efficiency: number, motivated: number) {
    const effColor = Math.min(efficiency * 2.55, 255); // Skaliert den Wert von 0-100 auf 0-255
    const motColor = Math.min(motivated * 2.55, 255); // Skaliert den Wert von 0-100 auf 0-255
    return `rgb(${effColor}, ${motColor}, 150)`;
  }

  // Hilfsfunktion, um das Datum in eine menschenlesbare Form zu bringen
  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  }
</script>

<div class="heatmap-container">
  {#each heatmapData as { date, efficiency, motivated }, index}
    <div 
      class="heatmap-day" 
      style="background-color: {getHeatmapColor(efficiency, motivated)}" 
      title={`Effizienz: ${efficiency}, Motivation: ${motivated}\nDatum: ${formatDate(date)}`}>
      {formatDate(date)}
    </div>
  {/each}
</div>

<style>
  .heatmap-container {
    display: grid;
    grid-template-columns: repeat(7, 1fr); /* 7 Tage pro Reihe */
    grid-template-rows: repeat(5, 1fr); /* 5 Reihen für 30 Tage */
    gap: 10px;
    max-width: 100%;
    justify-content: center;
    align-items: center;
  }

  .heatmap-day {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 10px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, opacity 0.2s;
  }

  .heatmap-day:hover {
    transform: scale(1.2);
    opacity: 0.8;
  }

  /* Zusätzliche Tooltip-Stile */
  .heatmap-day[title]:hover::after {
    content: attr(title);
    position: absolute;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 5px;
    border-radius: 4px;
    top: -50px;
    font-size: 12px;
    white-space: nowrap;
  }
</style>