<script lang="ts">
  import { onMount } from 'svelte';

  let tasks = [];
  let heatmapData = [];
  let streak = 0;

  /** Vorladen der Daten aus API-Endpunkten */
  onMount(async () => {
    const taskRes = await fetch('/api/tasks');
    tasks = await taskRes.json();

    const heatmapRes = await fetch('/api/heatmap');
    heatmapData = await heatmapRes.json();

    const streakRes = await fetch('/api/streak');
    const streakData = await streakRes.json();
    streak = streakData.streak;
  });

  /** Selektion der Farbe der Heatmap zu je einem Tag */
  function getHeatmapColor(count: number) {
    if (count >= 2) return '#006400';
    if (count === 1) return '#32CD32';
    return '#2f2f2f';
  }

  /** Formatieren des Datums */
  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }

  /** Gruppieren eines Moduls */
  function groupTasks(tasks) {
    return tasks.reduce((acc, task) => {
      const modul = task.module || 'Unbekannt';
      if (!acc[modul]) acc[modul] = [];
      acc[modul].push(task);
      return acc;
    }, {});
  }

  /** Holen des Status je Modul */
  function getStatusLabel(status: number): string {
    return ['Waiting', 'Doing', 'Done'][status] || 'Unknown';
  }
</script>

<div class="parent app-container">
  <div class="div1">
    <header class="nav">
    <ul>
      <li id="sessions"><a href="../sessions/+page.svelte">Sessions</a></li>
      <li id="checkup"><a href="./+page.svelte">Check-Up</a></li>
      <li id="dashboard"><a href="../+page.svelte">Dashboard</a></li>
      <li id="lectures"><a href="../lectures/+page.svelte">Vorlesungen</a></li>
    </ul>
  </header>
    <main>
      <article>
        <h2 class="bold">Check-Up</h2>
        <div class="div2">
          {#if tasks.length === 0}
            <p>Du hast noch keine Aufgaben hinzugefügt. <br>Beginne mit einer neuen Session, um Fortschritte zu sehen.</p>
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
    <div class="heatmap">
      {#each heatmapData as { date, count }}
        <div class="heatmap-day" style="background-color: {getHeatmapColor(count)}" title={`${formatDate(date)}: ${count} Sessions`}></div>
      {/each}
    </div>
  </div>

  <div class="div4">
    <h3>Streak</h3>
    <div class="streak-display">
      <span class="flame">🔥</span> {streak} Tage in Folge aktiv
    </div>
  </div>
</div>

<style>
main {
  background-color: white;
  padding: 10px 25px 10px 25px; /* Top - Right - Bottom - Left */
  border-radius: 15px;
  max-width: 500px;
}

.parent {
  display: grid;
  grid-template-areas:
    "nav nav"
    "div1 div1"
    "div2 div3"
    "div2 div4";
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto 1fr auto;
  gap: 15px 0;
}

.nav {
  grid-area: nav;
  padding: 1rem;
}

.div1 { grid-area: div1; }
.div2 { grid-area: div2; }
.div3 { grid-area: div3; }
.div4 { grid-area: div4; }

.heatmap {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.heatmap-day {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  transition: background-color 0.3s;
}

.streak-display {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.flame {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.nav {
  grid-area: nav;
}

#sessions, #checkup, #dashboard, #lectures {
  padding: 15px 55px 15px 55px; /* Top - Right - Bottom - Left */
  border-bottom-left-radius: 15px;
  border-bottom-right-radius: 15px;
}

#sessions {
  background-color: #479496;
}

#checkup {
  background-color: #3C68A3;
}

#dashboard {
  background-color: #B96C96;
}

#lectures {
  background-color: #EC7B6A;
}
</style>