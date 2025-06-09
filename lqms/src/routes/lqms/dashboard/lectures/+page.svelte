<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;

  const days = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

  function groupLectures(lectures) {
    const result = {
      Montag: [],
      Dienstag: [],
      Mittwoch: [],
      Donnerstag: [],
      Freitag: []
    };

    for (const lecture of lectures) {
      const weekdayIndex = new Date(lecture.date).getDay() - 1; // 0 = Montag
      const weekday = days[weekdayIndex];
      if (weekday) {
        result[weekday].push(lecture);
      }
    }

    return result;
  }

  const groupedLectures = groupLectures(data.weekLectures);
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

  <div class="week-layout">
  {#each Object.entries(groupedLectures) as [day, lectures]}
    <div class="day-column">
      <h2>{day}</h2>
      {#if lectures.length === 0}
        <p>Keine Vorlesung</p>
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
  {/each}
  </div>
</div>

<svelte:head>
<style>
  .week-layout {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    padding: 2rem;
    background: #fae4d8;
    min-height: 100vh;
    border-radius: 15px;
  }

  .day-column {
    flex: 1;
    background: #ffece3;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }

  .lecture-card {
    background: #EBC2C6;
    border-radius: 6px;
    padding: 0.75rem;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    text-align: center;
  }

  h3 {
    margin: 0 0 0.25rem 0;
  }
</style>
</svelte:head>

