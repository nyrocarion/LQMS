<script lang="ts">
  import { onMount } from "svelte";

  let tasks = [];
  let heatmapData = [];
  let heatmapCalendar = [];
  let streak = 0;

  /** Vorladen der Daten aus API-Endpunkten */
  onMount(async () => {
    const taskRes = await fetch("/api/tasks", {credentials: "include"});
    tasks = await taskRes.json();

    const heatmapRes = await fetch("/api/heatmap", {credentials: "include"});
    if (!heatmapRes.ok) {
      console.error("Fehler beim Laden der Heatmap:", await heatmapRes.json());
      return;
    }
    heatmapData = await heatmapRes.json();
    heatmapCalendar = generateCalendarData(heatmapData);

    const streakRes = await fetch("/api/streak", {credentials: "include"});
    const streakData = await streakRes.json();
    streak = streakData.streak;
  });

  /** Selektion der Farbe der Heatmap zu je einem Tag */
  function getHeatmapColor(count: number) {
    if (count >= 2) return "#006400";
    if (count === 1) return "#32CD32";
    return "#2f2f2f";
  }

  /** Formatieren des Datums */
  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }

  function generateCalendarData(data: { date: string; count: number }[]) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(today);
    start.setDate(today.getDate() - 29);

    const calendarMap = new Map(data.map(d => [d.date, d.count]));
    const calendar: { date: string; count: number }[][] = [];

    for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
      const iso = d.toISOString().split("T")[0];
      const count = calendarMap.get(iso) || 0;
      const weekday = (d.getDay() + 6) % 7; // Montag = 0

      // Neue Woche beginnen, wenn Montag
      if (calendar.length === 0 || weekday === 0) {
        calendar.push(Array(7).fill(null));
      }

      // In die richtige Position innerhalb der Woche schreiben
      calendar[calendar.length - 1][weekday] = { date: iso, count };
    }

    // Sicherstellen, dass die Matrix genau 5 Wochen umfasst
    return calendar.slice(0, 5);
  }

  /** Reihenfolge der Wochentage in deutscher Kurzform */
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  /** Holen des Status je Modul */
  function getStatusLabel(status: number): string {
    return ["Waiting", "Doing", "Done"][status] || "Unknown";
  }
</script>

<div class="parent app-container">
  <header class="nav">
    <ul>
      <li id="sessions"><a href="../dashboard/sessions/">Sessions</a></li>
      <li id="checkup"><a href="./check-up">Check-Up</a></li>
      <li id="dashboard"><a href="../dashboard/">Dashboard</a></li>
      <li id="lectures"><a href="../dashboard/lectures/">Vorlesungen</a></li>
    </ul>
  </header>

  <div class="content-wrapper">
    <div class="div1">
      <main>
        <article>
          <h2>Check-Up</h2>
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
        </article>
      </main>
    </div>

    <div class="div3">
      <h3>Aktivitäten (30 Tage)</h3>
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
                  style="background-color: {day ? getHeatmapColor(day.count) : '#1e1e1e'}"
                  title={day ? `${formatDate(day.date)}: ${day.count} Sessions` : ''}
                ></div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="div4">
      <h3>Streak</h3>
      <div class="streak-display">
        <span class="flame"><strong>{streak}</strong> 🔥</span>Tage in Folge aktiv
      </div>
    </div>
  </div>
</div>

<style>
.parent {
  display: flex;
  flex-direction: column;
}

.content-wrapper {
  display: grid;
  grid-template-areas:
    "div1 div3"
    "div1 div4";
  grid-template-columns: 4fr 3fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.div1 { grid-area: div1; }
.div2 { grid-area: div2; }
.div3 { grid-area: div3; }
.div4 { grid-area: div4; }

.nav {
  margin-bottom: 50px;
}

.nav ul {
  list-style: none;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.nav ul li a {
  display: inline-block;
  margin: 0 5px;
  font-weight: 600;
  color: white;
  text-decoration: none;
}

#sessions  { background-color: #479496; }
#checkup   { background-color: #3c68a3; }
#dashboard { background-color: #b96c96; }
#lectures  { background-color: #ec7b6a; }

#sessions, #checkup, #dashboard, #lectures {
  padding: 15px 55px; /* Top - Right - Bottom - Left */
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

.div2, .div3, .div4 {
  padding: 10px 25px;
  border-radius: 15px;
}

.div1 {
  grid-area: div1;
  color: #3c68a3;
  background-color: white;
  font-weight: bold;
  padding: 0 25px;
  border-radius: 15px;
}

.div2 {
  grid-area: div2;
  background-color: white;
  color: #000;
}

.div3 {
  grid-area: div3;
  background-color: white;
}

.div4 {
  grid-area: div4;
  background-color: white;
  padding-bottom: 25px;
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
  margin-left: 26px; /* Abstand zur linken Flamme */
}

.weekday-label {
  width: 20px;
  text-align: center;
  font-size: 0.75rem;
  color: #999;
}

.heatmap-grid {
  display: flex;
  flex-direction: row;
  gap: 4px;
}

.week-column {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.heatmap-day {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  background-color: #2f2f2f;
  transition: background-color 0.3s;
}

.streak-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  text-align: center;
}

.flame {
  font-size: 4rem;
  padding-bottom: 10px;
  display: inline;
  vertical-align: middle;
}
</style>