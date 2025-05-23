<script lang="ts">
  import { onMount } from 'svelte';

  type Task = {
    title: string;
    status: number;
  };

  type ModuleTasks = {
    module: string;
    tasks: Task[];
  };

  type SessionData = {
    date: string;
    efficiency: number;
    motivated: number;
  };

  type User = {
    streak: number;
  };

  let modules: ModuleTasks[] = [];
  let heatmapData: SessionData[] = [];
  let user: User = { streak: 0 };

  function statusToColumn(status: number) {
    return status === 0 ? "Waiting" : status === 1 ? "Doing" : "Done";
  }

  onMount(async () => {
    // Aufgaben laden
    const tasksRes = await fetch('/api/tasks');
    modules = await tasksRes.json();

    // Heatmap-Daten laden
    const heatmapRes = await fetch('/api/heatmap');
    heatmapData = await heatmapRes.json();

    // Streak laden
    const streakRes = await fetch('/api/streak');
    user = await streakRes.json();
  });
</script>

<div class="parent">
  <!-- Linke Seite: Aufgaben -->
  <div class="div1">
    {#each modules as { module, tasks }}
      <div class="module-section">
        <h2>{module}</h2>
        <div class="kanban-column">
          {#each ["Waiting", "Doing", "Done"] as column}
            <div class="kanban-column">
              <h3>{column}</h3>
              {#each tasks.filter(task => statusToColumn(task.status) === column) as task}
                <div class="task">{task.title}</div>
              {/each}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  <!-- Rechte Seite: Heatmap & Streak -->
  <div class="div2">
    <!-- Heatmap -->
    <h2>Heatmap</h2>
    <div class="heatmap">
      {#each heatmapData as { date, efficiency, motivated }}
        <div class="heatmap-entry" title={`Effizienz: ${efficiency}, Motivation: ${motivated}`} style="background-color: rgba(${efficiency * 2.55}, ${motivated * 2.55}, 255, 0.8)">
          {date}
        </div>
      {/each}
    </div>

    <!-- Aktivitätsstreak -->
    <h2>Aktivitätsstreak: {user.streak} Tage</h2>
  </div>
</div>

<style>
  .parent {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .module-section {
    margin-bottom: 1rem;
  }
  .kanban-column {
    margin-bottom: 10px;
  }
  .heatmap {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .heatmap-entry {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: inline-block;
  }
</style>