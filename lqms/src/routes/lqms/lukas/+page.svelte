<script lang="ts">
let totalSeconds = 0;
let clock = 0;
let isRunning = false;

// Zeitberechnung
$: hours = Math.floor(totalSeconds / 3600);
$: minutes = Math.floor(totalSeconds / 60) % 3600;
$: seconds = totalSeconds % 60;

//Startet den Sessiontimer
function session_start(){
  if(!isRunning){
    isRunning = true;
    clock = setInterval(() => {totalSeconds +=1}, 1000);
  }
}

//Pausiert den Sessiontimer
function session_pause(){
  isRunning = false;
  clearInterval(clock);
}

//Beendet den Sessiontimer
function session_end(){
  isRunning = false;
  clearInterval(clock);
  openFeedbackPopup();
  totalSeconds = 0;
}

// Start/Pause Umschaltfunktion
function toggle_timer() {
  if (isRunning) {
    session_pause();
  } else {
    session_start();
  }
}

function number_padding(value){
  if (value < 10){
    return `0${value}`;
  }
  return value.toString();
}
	
  // --- Session Feedback Popup Logic ---
  let showFeedbackPopup: boolean = false;
  let efficiency: number = 5; // Default value 1-10
  let motivation: number = 5; // Default value 1-10
  
  function openFeedbackPopup(): void {
    // Reset values when opening the popup
    efficiency = 5;
    motivation = 5;
    showFeedbackPopup = true;
  }

  function closeFeedbackPopup(): void {
    showFeedbackPopup = false;
  }

  // Helper function to get an emoji based on the motivation value
  const getmotivationEmoji = (value: number): string => {
    if (value <= 3) return '🙁'; // Sad
    if (value <= 7) return '😐'; // Neutral
    return '🙂'; // Happy
  };
</script>

<!-- Container für Zeit + Buttons -->
<div class="timer-block">
  <h1>
    Sessiondauer: 
    <span class ="timer-number">{number_padding(hours)}</span>
    <span class="timer-dot">:</span>
    <span class="timer-number">{number_padding(minutes)}</span>
    <span class="timer-dot">:</span>
    <span class="timer-number">{number_padding(seconds)}</span>

  </h1>
  <div class="button-grid">
    <button class="clock" on:click={toggle_timer}>
			{#if isRunning}
				<!-- Pause Icon -->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
					<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
				</svg>
			{:else}
				<!-- Play Icon -->
				<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
					<path d="M8 5v14l11-7z"/>
				</svg>
			{/if}
		</button>
    <button class="clock" on:click={session_end}>
      <!-- Stop Icon -->
			<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
				<path d="M6 6h12v12H6z"/>
			</svg>
    </button>
  </div>
</div>


<!-- Session Feedback Popup -->
{#if showFeedbackPopup}
  <div class="feedback-modal-overlay" on:click={closeFeedbackPopup}>
    <div class="feedback-modal-content" on:click|stopPropagation>
      <button class="feedback-close-button" on:click={closeFeedbackPopup}>&times;</button>
      <h2>Session Feedback</h2>

      <!-- Show the form if there's no message or if the message is an error (allowing retry) -->
        <form method="POST">
          <div class="form-group">
            <label for="efficiency-slider">
              Ihre Produktivität: <span class="value-display">{efficiency}</span>
            </label>
            <input
              type="range"
              name="efficiency"
              id="efficiency-slider"
              min="0"
              max="10"
              bind:value={efficiency}
              class="slider"
            />
            <input
              type="hidden"
              name="totalseconds"
              bind:value={totalSeconds}
            />
            {console.log(totalSeconds)}
            <div class="slider-labels">
              <span>Niedrig</span>
              <span>Hoch</span>
            </div>
          </div>

          <div class="form-group">
            <label for="motivation-slider">
              Ihre Stimmung: <span class="emoji-display">{getmotivationEmoji(motivation)}</span> (<span class="value-display">{motivation}</span>)
            </label>
            <input
              type="range"
              name="motivation"
              id="motivation-slider"
              min="0"
              max="10"
              bind:value={motivation}
              class="slider motivation-slider"
            />
            <div class="slider-labels">
              <span>Schlecht</span>
              <span>Gut</span>
            </div>
          </div>
          <button type="submit" class="submit-button" value="Feedback senden!"></button>
        </form>
    </div>
  </div>
{/if}

<style>
  body{
    font-family: Verdana, Geneva, Tahoma, sans-serif
  }

  .timer-dot{
    padding: 0 0.2em;
  }

  .timer-number{
    padding: 0 0.2em;
  }

  .timer-block {
    display: grid;
    gap: 1rem;
    max-width: 300px;
    margin: 0 auto;
    text-align: center;
    padding: 2rem;
    border: 2px solid #007bff;
    border-radius: 10px;
    background-color: #f9f9f9;
  }

  .button-grid {
    display: flex;
    justify-content: space-around;
    gap: 10px;
  }

  .clock {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    flex: 1;
  }

/* Wenn Button nicht geht */
  .clock:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  /* Basic styles for the trigger button (you can adapt this) */
  .cta-button {
    padding: 10px 20px;
    background-color: #007bff; /* Blue color */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.2s;
  }
  .cta-button:hover {
    background-color: #0056b3;
  }

  /* Styles for the Feedback Popup (inspired by common modal patterns) */
  .feedback-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6); /* Slightly darker overlay */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050; /* Ensure it's on top */
  }

  .feedback-modal-content {
    background-color: white;
    padding: 25px 30px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    width: 400px;
    max-width: 90%;
    position: relative;
    text-align: left;
  }

  .feedback-close-button {
    position: absolute;
    top: 12px;
    right: 15px;
    background: none;
    border: none;
    font-size: 1.75em;
    line-height: 1;
    cursor: pointer;
    color: #888;
  }
  .feedback-close-button:hover {
    color: #555;
  }

  .feedback-modal-content h2 {
    margin-top: 0;
    margin-bottom: 20px;
    text-align: center;
    font-size: 1.4em;
    color: #333;
    font-weight: 500;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #555;
    font-size: 0.95em;
  }

  .slider {
    width: 100%;
    cursor: pointer;
    /* Default accent color for sliders (e.g., for efficiency) */
    accent-color: #007bff;
  }
  .motivation-slider {
    /* Specific accent color for the motivation slider */
    accent-color: #e83e8c; /* A pinkish color */
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75em;
    color: #777;
    margin-top: 4px;
  }

  .value-display {
    font-weight: bold;
    color: #333;
  }
  .emoji-display {
    font-size: 1.2em; /* Make emoji slightly larger */
    vertical-align: -0.15em; /* Adjust vertical alignment */
    margin-right: 3px;
  }

  .submit-button {
    display: block;
    width: 100%;
    padding: 10px 15px;
    background-color: #28a745; /* Green color for submit */
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1em;
    font-weight: 500;
    transition: background-color 0.2s;
    margin-top: 10px;
  }
  .submit-button:hover {
    background-color: #218838;
  }
  .submit-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }

  .feedback-message {
    padding: 10px 15px;
    margin-bottom: 15px;
    border-radius: 4px;
    text-align: center;
    font-size: 0.9em;
    font-weight: 500;
  }
  .feedback-message.success {
    background-color: #e6ffed; /* Lighter green */
    color: #1d742d;
    border: 1px solid #b8e6c3;
  }
  .feedback-message.error {
    background-color: #ffeeee; /* Lighter red */
    color: #c01c1c;
    border: 1px solid #f5c0c0;
  }
</style>