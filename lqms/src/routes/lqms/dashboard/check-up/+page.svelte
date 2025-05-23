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

  let modules: ModuleTasks[] = [];

  function statusToColumn(status: number) {
    return status === 0 ? "Waiting" : status === 1 ? "Doing" : "Done";
  }

  onMount(async () => {
    const res = await fetch('/api/tasks');
    modules = await res.json();
  });
</script>

<div class="parent">
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