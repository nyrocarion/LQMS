<p>Zeit: {seconds} Sekunden</p>

<button on:click={session_start} disabled={isRunning}>Start</button>
<button on:click={session_pause} disabled={!isRunning}>Pause</button>
<button on:click={session_end}>Stop</button>
