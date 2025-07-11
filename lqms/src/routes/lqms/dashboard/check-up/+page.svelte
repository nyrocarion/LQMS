<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from 'svelte/transition';

  // List of all tasks fetched from the API
  let tasks = [];
  // Raw heatmap data from the API
  let heatmapData = [];
  // Processed heatmap data for calendar display
  let heatmapCalendar = [];
  // Tasks grouped by module and date
  let tasksByModule = {};
  // Tracks which modules/dates are expanded in the UI
  let expanded = {};
  // Current activity streak (days in a row)
  let streak = 0;

  /**
   * Loads data from API endpoints on component mount.
   * Fetches tasks, heatmap data, and streak.
   */
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

  /**
   * Returns the color for a heatmap cell based on activity count.
   * @param {number} count - Number of activities for the day.
   * @returns {string} - Hex color code.
   */
  function getHeatmapColor(count) {
    if (count === -1) return '#dedede';  // future day
    if (count === 0) return '#bababa';   // no activity
    if (count === 1) return '#66e85a';
    if (count === 2) return '#33de23';
    if (count >= 3) return '#18ba09';
  }

  /**
   * Formats a date string as "D.M".
   * @param {string} date - ISO date string.
   * @returns {string} - Formatted date.
   */
  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }

  /**
   * Generates a 5-week calendar grid for the heatmap.
   * @param {Array<{date: string, count: number}>} heatmapData - Array of activity data.
   * @returns {Array<Array<{date: Date, count: number, isToday: boolean, isFuture: boolean}>>}
   */
  export function generateCalendarData(heatmapData: { date: string; count: number }[]) {
    const today = new Date();
    const weekStart = 0; // 0 = Sonntag

    // Weekday relative to weekstart (e.g. 1 - Mo, 0 - So)
    const todayIndex = today.getDay();
    const daysSinceWeekStart = (todayIndex - weekStart + 7) % 7;

    // Sunday or current weekday
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - daysSinceWeekStart);

    // Beginning: 4 weeks before the current weekstart
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

  // Order of weekdays for the heatmap header
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  /**
   * Returns the status text for a module.
   * @param {number} status - Status code (0, 1, 2).
   * @returns {string} - Status as string.
   */
  function getStatusTextModul(status: number): string {
    switch (status) {
      case 0: return 'Wartend';
      case 1: return 'Am Erledigen';
      case 2: return 'Erledigt';
      default: return 'Unbekannt';
    }
  }

  /**
   * Returns the status text for a task.
   * @param {number} status - Status code (0, 1).
   * @returns {string} - Status as string.
   */
  function getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Wartend';
      case 1: return 'Erledigt';
      default: return 'Unbekannt';
    }
  }

  /**
   * Toggles the expanded/collapsed state for a module and date.
   * @param {string} modul - Module name.
   * @param {string} date - Date string.
   */
  function toggle(modul: string, date: string) {
    const key = modul + '_' + date;
    expanded = { ...expanded, [key]: !expanded[key]};
  }

  /**
   * Updates the status of a task and its parent module.
   * Sends a PUT request to the API and updates local state.
   * @param {number} id - Task ID.
   * @param {string} field - Field to update.
   * @param {number} newStatus - New status value.
   */
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
          // Update lokal anwenden
          course[field] = newStatus;

          // Neue Status-Berechnung:
          const statusFields = [
            course.presentationstatus,
            course.scriptstatus,
            course.notesstatus
          ];

          // exercisesheet ist optional
          if (course.exercisesheet === 1) {
            statusFields.push(course.exercisestatus);
          }

          const allDone = statusFields.every(s => s === 1);
          const noneDone = statusFields.every(s => s === 0);

          const newModuleStatus = allDone ? 2 : noneDone ? 0 : 1;

          // Nur wenn sich der Status ändert, API call + update
          if (course.status !== newModuleStatus) {
            const statusRes = await fetch('/api/tasks/', {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, field: 'status', newStatus: newModuleStatus })
            });

            if (!statusRes.ok) {
              console.error('Fehler beim Setzen des Modul-Status');
            } else {
              course.status = newModuleStatus;
            }
          }

          // Gezwungener Re-render
          tasksByModule = structuredClone(tasksByModule);
          return;
        }
      }
    }
  }

  /**
   * Adds a number of days to a date.
   * @param {Date} date - The base date.
   * @param {number} days - Number of days to add.
   * @returns {Date} - New date.
   */
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };
</script>

<div style="min-height:100ch" class="parent app-container">
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
                          <div class="date-content" in:slide={{ duration: 300 }} out:slide={{ duration: 300 }}>
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
                          </div>
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
                  style="background-color: {day.isFuture ? '#dedede' : getHeatmapColor(day.count)}"
                  title={day ? `${formatDate(addDays(day.date, 1))}: ${day.count} Sessions` : ''}
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
body {
  height: 100%;
}

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
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  font-weight: bold;
  cursor: pointer;
  background-color: #cccccc;
  padding: 5px 10px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-content {
  padding: 10px;
  background-color: #f9f9f9;
  margin-top: 10px;
  border-radius: 5px;
}

.div3 {
  grid-area: div3;
  max-height: 300px;
  background-color: white;
}

.div4 {
  grid-area: div4;
  max-height: 230px;
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