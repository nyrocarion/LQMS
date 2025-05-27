<script lang="ts">
	import '../app.css';

	let { children } = $props();

	//die Datei wird für die gesamte Anwendung genutzt
	//+page.svelte ist für die spezifischen Seiten
</script>

{@render children()}