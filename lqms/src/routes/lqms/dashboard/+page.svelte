<!--Daten aus dem Typscript Programm holen-->
<script lang="ts">
	import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
	export let data: PageData;
	const { user, tip, dailyfact, dailymeme, lectures, labels, durations, profileName, profileMail } = data;
  let heatmapData = [];
  let heatmapCalendar = [];
  let tasks = [];
  let streak = 0;
  let canvasEl;

  onMount(async () => {
    const memeElement = document.getElementById("meme") as HTMLImageElement;
    memeElement.src = dailymeme;

    const taskRes = await fetch("/api/tasks", {credentials: "include"});
    tasks = await taskRes.json();

    const heatmapRes = await fetch("/api/heatmap", {credentials: "include"});
    heatmapData = await heatmapRes.json();
    heatmapCalendar = generateCalendarData(heatmapData);

    const streakRes = await fetch("/api/streak", {credentials: "include"});
    const streakData = await streakRes.json();
    streak = streakData.streak;

    /** all the stuff for the diagram generation*/
    new Chart(canvasEl, {
    type: 'bar',
    data: {
      labels, // 
      datasets: [{
        label: 'Lernzeit in Minuten',
        data: durations, 
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Lernzeit der letzten 5 Tage'
        },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.y} Minuten`
          }
        },
        legend: {
          display: true
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            callback: value => Number.isInteger(value) ? value : ''
          },
          title: {
            display: true,
            text: 'Minuten'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Datum'
          }
        }
      }
    }
  });
  });

  /** Copied from check up tab */
  /** Selektion der Farbe der Heatmap zu je einem Tag */
  function getHeatmapColor(count) {
    if (count === -1) return '#dedede';  // zukünftiger Tag
    if (count === 0) return '#bababa';   // keine Aktivität
    if (count === 1) return '#66e85a';
    if (count === 2) return '#33de23';
    if (count >= 3) return '#18ba09';
  }

  /** Formatieren des Datums */
  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }

  function generateCalendarData(data: { date: string; count: number }[]) {
    const todayString = new Date().toLocaleDateString('sv-SE');
    const today = new Date(todayString);

    // Finde den Start der Anzeige: Immer Montag vor 34 Tagen
    const start = new Date(today);
    start.setDate(start.getDate() - 34);

    const startWeekday = (start.getDay() + 6) % 7; // 0 = Montag
    start.setDate(start.getDate() - startWeekday); // Auf Montag der Woche zurückspringen

    const calendarMap = new Map(data.map(d => [d.date, d.count]));
    const calendar: { date: string; count: number }[][] = [];

    const current = new Date(start);
    for (let i = 0; i < 5 * 7; i++) { // 5 Wochen
      const iso = current.toISOString().split("T")[0];
      const isFuture = current > today;
      const count = isFuture
        ? -1
        : calendarMap.get(iso) ?? 0;

      const weekday = (current.getDay() + 6) % 7; // 0 = Montag

      if (calendar.length === 0 || weekday === 0) {
        calendar.push(Array(7).fill(null));
      }

      calendar[calendar.length - 1][weekday] = { date: iso, count };
      current.setDate(current.getDate() + 1);
    }

    return calendar;
  }

  /** Reihenfolge der Wochentage */
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  /** Holen des Status je Modul */
  function getStatusLabel(status: number): string {
    return ["Waiting", "Doing", "Done"][status] || "Unknown";
  }
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
      background: var(--bg-col);
      display: flex;
      justify-content: center;
    }

    .dashboard {
      display: flex;
      gap: var(--col-gap);
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

    /* copied from check up */
    .div3 {
      padding: 10px 25px;
      border-radius: 15px;
      }
      .heatmap-wrapper {
      display: flex;
      flex-direction: column;
      align-items: start;
      gap: 6px;
      padding-top: 10px;
    }

    .heatmap-header {
      display: flex;
      gap: 4px;
      align-self: center;
    }

    .weekday-label {
      width: 30px;
      text-align: center;
      font-size: 0.8rem;
      color: #642bff;
      font-weight: bold;
    }

    .heatmap-grid {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-self: center;
    }

    .week-row {
      display: flex;
      gap: 4px;
    }

    .heatmap-day {
      width: 30px;
      height: 30px;
      border-radius: 3px;
      background-color: #dddddd;
      transition: background-color 0.3s;
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
        <div class="panel medium beige_bg">
            <h2>Dein täglicher Lerntipp</h2>
            <div>{tip}</div>
        </div>
        <div class="panel medium beige_bg">
          <h2>Deine Sessions in den letzten 5 Tagen</h2>
          <canvas bind:this={canvasEl}></canvas>
        </div>
        <div class="panel beige_bg" style="flex:1">
          <div class="div3">
            <h2>Deine Aktivitäten (35 Tage)</h2>
            <div class="heatmap-wrapper">
              <div class="heatmap-header">
                {#each weekdays as label}
                  <div class="weekday-label">{label}</div>
                {/each}
              </div>

              <!-- Grid für 5 Wochen x 7 Tage -->
              <div class="heatmap-grid">
                {#each heatmapCalendar as week}
                  <div class="week-row">
                    {#each week as day}
                      <div
                        class="heatmap-day"
                        style="background-color: {day ? getHeatmapColor(day.count) : '#dedede'}"
                        title={day ? `${formatDate(day.date)}: ${day.count} Sessions` : ''}
                      ></div>
                    {/each}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
    </div>

    <!-- M -->
    <div class="column">
        <div class="panel beige_bg">
            <h2 >Ein Fakt über den heutigen Tag</h2><br>
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
        <div class="panel tall beige_bg">
          <img src="https://raw.githubusercontent.com/nyrocarion/LQMS/refs/heads/main/temp_images/temp_avatar_placeholder.png"
              alt="Avatar"
              style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px;" />
          <div>
            <div style="text-align:left,font-size: 1.5em; font-weight: bold; margin-bottom: 4px;">{profileName}</div>
            <div style="text-align:left,font-size: 0.95em; margin-bottom: 8px;">{profileMail}</div>
            <div style="text-align:left,font-size: 0.9em;">ID: {user.id}</div>
            <div style="text-align:left,font-size: 1em;"><span style="font-weight: bold; color: orange;">🔥{streak}</span></div>
          </div>
        </div>
        <div class="panel tall beige_bg">
          <h2>Etwas zum Lachen</h2>
          <img style="width:300px;" id="meme" src="" alt="Meme"/>
        </div>
        <div class="panel tall beige_bg">
          <div class="div1">
          <h2>To-Do Übersicht</h2>
          <div class="div2">
            {#if tasks.length === 0}
              <p>Du hast noch keine Aufgaben hinzugefügt.<br>Beginne mit einer neuen Session, um Fortschritte zu sehen.</p>
            {:else}
              {#each Object.entries(groupTasks(tasks)) as [modul, items]}
                <h3>{modul}</h3>
                {#each ['Waiting', 'Doing', 'Done'] as statusLabel}
                  <div>
                    <h4>{statusLabel}</h4>
                    <ul>
                      {#each items.filter(task => getStatusLabel(task.status) === statusLabel) as task}
                        <li>{task.displayname}: {task.type}</li>
                      {/each}
                    </ul>
                  </div>
                {/each}
              {/each}
            {/if}
          </div>
      </div>
        </div>
    </div>
  </section>
</center>
</div>