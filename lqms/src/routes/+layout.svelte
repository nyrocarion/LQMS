<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

{@render children()}

/* die Datei wird für die gesamte Anwendung genutzt */
/* +page.svelte ist für die spezifischen Seiten */