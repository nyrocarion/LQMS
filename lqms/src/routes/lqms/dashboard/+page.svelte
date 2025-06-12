<!--Daten aus dem Typscript Programm holen-->
<script lang="ts">
	import type { PageData } from './$types';
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { goto } from '$app/navigation';
  // data that is created on server side
	export let data: PageData;
	const { user, tip, dailyfact, dailymeme, lectures, labels, durations, profileName, profileMail } = data;
  let heatmapData = [];
  let heatmapCalendar = [];
  let rawTasks = [];
  let streak = 0;
  let canvasEl;
  let pendingItems = []
  // executed when page is loaded
  onMount(async () => {
    const memeElement = document.getElementById("meme") as HTMLImageElement;
    memeElement.src = dailymeme;

    const taskRes = await fetch("/api/tasks", {credentials: "include"});
    rawTasks = await taskRes.json();

    const tasksToDo = [];

    for (const [subject, entries] of Object.entries(rawTasks)) {
      for (const [date, tasks] of Object.entries(entries)) {
        for (const task of tasks) {
          if (task.status === 0 || task.status === 1) {
            const cleanedDate = date.split("-").slice(-3).join("-");
            tasksToDo.push({
              date: cleanedDate,
              name: task.displayname
            });
          }
        }
      }
    }

    pendingItems = tasksToDo;

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
        backgroundColor: 'rgba(71, 148, 150, 1)',
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

  /** Konstruieren der Kalenderdaten */
  export function generateCalendarData(heatmapData: { date: string; count: number }[]) {
    const today = new Date();
    const weekStart = 0; // 0 = Sonntag

    // Wochentag relativ zum gewünschten Wochenstart (z. B. 1 bei Mo, 0 bei So)
    const todayIndex = today.getDay();
    const daysSinceWeekStart = (todayIndex - weekStart + 7) % 7;

    // Sonntag (oder anderer Wochentag) der aktuellen Woche
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - daysSinceWeekStart);

    // Startpunkt: 4 Wochen vor dem aktuellen Wochenstart
    const startDate = new Date(startOfCurrentWeek);
    startDate.setDate(startOfCurrentWeek.getDate() - 7 * 4);

    const dataMap = new Map<string, number>();
    for (const d of heatmapData) {
      dataMap.set(d.date, d.count);
    }

    const calendarData: {
      date: Date;
      count: number;
      isToday: boolean;
      isFuture: boolean;
    }[][] = [];

    today.setDate(today.getDate() - 1)

    for (let week = 0; week < 5; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + week * 7 + day);

        const iso = currentDate.toISOString().split("T")[0];
        const count = dataMap.get(iso) ?? 0;

        const isToday = iso === today.toISOString().split("T")[0];
        
        const isFuture = currentDate > today;

        weekData.push({
          date: currentDate,
          count,
          isToday,
          isFuture
        });
      }

      calendarData.push(weekData);
    }

    return calendarData;
  }

  /** Reihenfolge der Wochentage */
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  /** Holen des Status je Modul */
  function getStatusLabel(status: number): string {
    return ["Waiting", "Doing", "Done"][status] || "Unknown";
  }

  // Function that is used by logout button
  function logout() {
    // redirect to landing page
    goto('/');
    // remove cookie
    // TODO: use API to logout
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
      width: 1600px;
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
      flex:1;
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

    /*copied from landing page*/
    .cta {
    padding: 10px 20px;
    background-color: #d65ba9;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    margin-bottom: 20px;
    }
  </style>
</svelte:head>

<div style="width:100%" class="parent app-container">
  <center>
    <header class="nav">
      <ul>
        <li id="sessions"><a href="./dashboard/sessions/">Sessions</a></li>
        <li id="checkup"><a href="./dashboard/check-up">Check-Up</a></li>
        <li id="dashboard"><a href="./dashboard/">Dashboard</a></li>
        <li id="lectures"><a href="./dashboard/lectures/">Vorlesungen</a></li>
      </ul>
    </header>
    <div class="dashboard">
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
                          style="background-color: {day.isFuture ? '#dedede' : getHeatmapColor(day.count)}"
                          title={day ? `${formatDate(addDays(day.date, 1))}: ${day.count} Sessions` : ''}
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
            <div style="display: flex; align-items: flex-start;">
              <img src="https://raw.githubusercontent.com/nyrocarion/LQMS/refs/heads/main/temp_images/temp_avatar_placeholder.png"
                  alt="Avatar"
                  style="width: 80px; height: 80px; border-radius: 50%; margin-right: 20px;" />
              <div>
                <div style="text-align:left;font-size: 1.5em; font-weight: bold; margin-bottom: 4px;">{profileName}</div>
                <div style="text-align:left;font-size: 0.95em; margin-bottom: 8px;">{profileMail}</div>
                <div style="text-align:left"><button class="cta" on:click={logout}>Logout</button></div>
                <div style="text-align:left;font-size: 2em;"><span style="font-weight: bold;">🔥{streak}</span></div>
              </div>
            </div>
          </div>
          <div class="panel tall beige_bg">
            <h2>Etwas zum Lachen</h2>
            <img style="width:300px;" id="meme" src="" alt="Meme"/>
          </div>
          <div style="flex: 1" class="panel tall beige_bg">
            <div class="div1">
            <h2>To-Do Übersicht</h2>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              {#each pendingItems as item}
                <div style="border: 1px solid #ccc; border-radius: 10px; padding: 12px; background: #ec7b6a;">
                  <div style="font-weight: bold; font-size: 1.2em;">{item.name}</div>
                  <div>vom: {item.date}</div>
                </div>
              {/each}
              {#if pendingItems.length === 0}
                <div style="color: #666;">Alle Aufgaben sind erledigt 🎉</div>
              {/if}
            </div>
          </div>
          </div>
      </div>
    </div>
  </center>
</div>