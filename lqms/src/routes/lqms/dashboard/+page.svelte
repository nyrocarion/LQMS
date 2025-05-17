<!--Daten aus dem Typscript Programm holen-->
<script lang="ts">
  export let user: any; 
  export let tip: string;
</script>

<h1>Dashboard</h1>

<!--Wird nur angezeigt wenn ein User angemeldet ist-->
{#if user}
  <p>Willkommen zurück, {user.name}!</p>
{/if}

<div style="height:100px;width:300px;background-color:red;">  
  <h2>Die genialen Lerntipps</h2>
  <!--beim Laden der Seite automatisch geladen-->
  <span>{tip}</span>
</div>
