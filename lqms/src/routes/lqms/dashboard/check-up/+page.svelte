<script lang="ts">
  import { onMount } from 'svelte';

  let tasks = [];
  let heatmapData = [];
  let streak = 0;

  onMount(async () => {
    const taskRes = await fetch('/api/tasks');
    tasks = await taskRes.json();

    const heatmapRes = await fetch('/api/heatmap');
    heatmapData = await heatmapRes.json();

    const streakRes = await fetch('/api/streak');
    const streakData = await streakRes.json();
    streak = streakData.streak;
  });

  function getHeatmapColor(count: number) {
    if (count >= 2) return '#006400';
    if (count === 1) return '#32CD32';
    return '#2f2f2f';
  }

  function formatDate(date: string) {
    const d = new Date(date);
    return `${d.getDate()}.${d.getMonth() + 1}`;
  }
</script>

<div class="parent">
  <div class="div1">
    <nav>
      <h2>Dashboard</h2>
    </nav>
  </div>

  <div class="div2">
    {#if tasks.length === 0}
      <p>Du hast noch keine Aufgaben hinzugefügt. Beginne mit einer neuen Session, um Fortschritte zu sehen.</p>
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

  <div class="div3">
    <h3>Aktivitäten (30 Tage)</h3>
    <div class="heatmap">
      {#each heatmapData as { date, count }}
        <div class="heatmap-day" style="background-color: {getHeatmapColor(count)}" title={`{formatDate(date)}: ${count} Sessions`}></div>
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
  .parent {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-column-gap: 15px;
    grid-row-gap: 0px;
  }
  .div1 { grid-area: 1 / 1 / 2 / 3; }
  .div2 { grid-area: 2 / 1 / 4 / 2; overflow-y: auto; padding: 1rem; }
  .div3 { grid-area: 2 / 2 / 3 / 3; padding: 1rem; }
  .div4 { grid-area: 3 / 2 / 4 / 3; padding: 1rem; }

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
</style>

<script lang="ts">
  function groupTasks(tasks) {
    return tasks.reduce((acc, task) => {
      const modul = task.module || 'Unbekannt';
      if (!acc[modul]) acc[modul] = [];
      acc[modul].push(task);
      return acc;
    }, {});
  }

  function getStatusLabel(status: number): string {
    return ['Waiting', 'Doing', 'Done'][status] || 'Unknown';
  }
</script>