<script lang="ts">
  import { onMount } from "svelte";

  let tasks = [];
  let heatmapData = [];
  let heatmapCalendar = [];
  let tasksByModule = {};
  let expanded = {};
  let streak = 0;

  /** Vorladen der Daten aus API-Endpunkten */
  onMount(async () => {
    const taskRes = await fetch("/api/tasks", {credentials: "include"});
    tasks = await taskRes.json();

    tasksByModule = tasks;

    const heatmapRes = await fetch("/api/heatmap", {credentials: "include"});
    heatmapData = await heatmapRes.json();
    heatmapCalendar = generateCalendarData(heatmapData);

    const streakRes = await fetch("/api/streak", {credentials: "include"});
    const streakData = await streakRes.json();
    streak = streakData.streak;
  });

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

  /** Reihenfolge der Wochentage in Kurzform */
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  /** Holen des Status je Modul */
  function getStatusTextModul(status: number): string {
    switch (status) {
      case 0: return 'Wartend';
      case 1: return 'Am Erledigen';
      case 2: return 'Erledigt';
      default: return 'Unbekannt';
    }
  }

  function getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Wartend';
      case 1: return 'Erledigt';
      default: return 'Unbekannt';
    }
  }

  function toggle(modul: string, date: string) {
    const key = modul + '_' + date;
    expanded = { ...expanded, [key]: !expanded[key]};
  }

  async function updateStatus(id: number, field: string, newStatus: number) {
    const res = await fetch('/api/tasks', {
      method: 'PUT',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, field, newStatus })
    });

    if (!res.ok) {
      console.error('Fehler beim Aktualisieren');
      return;
    }

    // Lokales Update
    for (const [modul, dates] of Object.entries(tasksByModule)) {
      for (const [date, items] of Object.entries(dates)) {
        const course = items.find(i => i.id === id);
        if (course) {
          course[field] = newStatus;

          // Überprüfen, ob alle Felder abgehakt sind
          const allFieldsChecked = 
            (course.presentationstatus === 1) &&
            (course.scriptstatus === 1) &&
            (course.notesstatus === 1) &&
            (!course.exercisesheet || course.exercisestatus === 1); 

          if (allFieldsChecked) {
            // Status auf 2 setzen, wenn alle Felder abgehakt sind
            const statusRes = await fetch('/api/tasks/', {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, status: 2 })
            });

            if (!statusRes.ok) {
              console.error('Fehler beim Setzen des Status');
            } else {
              course.status = 1;  // Lokale Statusänderung
            }
          }

          tasksByModule = structuredClone(tasksByModule);
          return;
        }
      }
    }
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
              {#if Object.keys(tasksByModule).length === 0}
                <p>Du hast noch keine Aufgaben…</p>
              {:else}
                {#each Object.entries(tasksByModule) as [modul, dates]}
                  <div class="module-block">
                    <h3 class="module-title">{modul}</h3>

                    {#each Object.entries(dates) as [date, items]}
                      <div class="date-group">
                        <div class="date-header" on:click={() => toggle(modul, date)}>
                          <strong>{formatDate(date)}</strong>
                          <span>{expanded[modul + '_' + date] ? '▾' : '▸'}</span>
                        </div>

                        {#if expanded[modul + '_' + date]}
                          {#each items as item}
                            <div class="course-card">
                              <div class="course-header">
                                <strong>Status:</strong> {getStatusTextModul(item.status)}
                              </div>
                              <div class="task-list">
                                {#each [
                                  {label: 'Präsentation', key: 'presentationstatus', show: true},
                                  {label: 'Skript', key: 'scriptstatus', show: true},
                                  {label: 'Notizen', key: 'notesstatus', show: true},
                                  {label: 'Übungsblatt', key: 'exercisestatus', show: item.exercisesheet === 1}
                                ] as t}
                                  {#if t.show}
                                    <div>
                                      {t.label}: {getStatusText(item[t.key])}
                                      <input
                                        type="checkbox"
                                        checked={item[t.key]}
                                        on:change={(e) => updateStatus(item.id, t.key, e.target.checked ? 1 : 0)}
                                      />
                                    </div>
                                  {/if}
                                {/each}
                              </div>
                            </div>
                          {/each}
                        {/if}
                      </div>
                    {/each}
                  </div>
                {/each}
              {/if}
            </div>
        </article>
      </main>
    </div>

    <div class="div3">
      <h3>Aktivitäten (35 Tage)</h3>
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

.div2, .div3, .div4 {
  padding: 10px 25px;
  border-radius: 15px;
}

.div1 {
  grid-area: div1;
  color: #3c68a3;
  background-color: white;
  padding: 0 25px;
  border-radius: 15px;
  min-width: 400px;
}

.div2 {
  grid-area: div2;
  background-color: white;
  color: #000;
}

.module-block {
  margin-bottom: 30px;
  padding: 15px;
  background: #f5f5f5;
  border-left: 6px solid #3c68a3;
  border-radius: 10px;
}

.module-title {
  font-size: 1.2rem;
  margin-bottom: 10px;
  color: #3c68a3;
}

.course-card {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
}

.course-header {
  font-weight: bold;
  margin-bottom: 8px;
}

.task-list div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
}

.task-list input[type="checkbox"] {
  transform: scale(1.2);
}

.date-group {
  margin-left: 15px;
  margin-bottom: 10px;
}
.date-header {
  font-size: 1rem;
  cursor: pointer;
  background: #e0e0e0;
  padding: 5px 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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