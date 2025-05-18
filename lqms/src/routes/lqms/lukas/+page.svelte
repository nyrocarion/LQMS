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

// import Modal,{getModal} from './Modal.svelte'
// 	let name = 'world';
	
// 	let selection
	
// 	// Callback function provided to the `open` function, it receives the value given to the `close` function call, or `undefined` if the Modal was closed with escape or clicking the X, etc.
// 	function setSelection(res){
// 		selection=res
// 	}
	
  // --- Session Feedback Popup Logic ---
  let showFeedbackPopup: boolean = false;
  let productiveness: number = 5; // Default value 1-10
  let mood: number = 5; // Default value 1-10
  let feedbackPopupMessage: string | null = null; // For success/error messages after submission

  function openFeedbackPopup(): void {
    // Reset values when opening the popup
    productiveness = 5;
    mood = 5;
    feedbackPopupMessage = null; // Clear any previous messages
    showFeedbackPopup = true;
  }

  function closeFeedbackPopup(): void {
    showFeedbackPopup = false;
    // Optionally, you might want to clear feedbackPopupMessage here too,
    // or let it persist until the next open if it was an error.
  }

  async function handleSubmitFeedback(): Promise<void> {
    const feedbackData = {
      productiveness,
      mood,
      // You could add other relevant data here, like a user ID or session ID
      // if they are available in this component's scope.
    };

    console.log("Submitting session feedback:", feedbackData);
    feedbackPopupMessage = "Sende Feedback..."; // Show a loading message

    // --- Replace this with your actual API call to your backend ---
    try {
      // Example:
      // const response = await fetch('/api/your-feedback-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Feedback konnte nicht gesendet werden.');
      // }
      // const result = await response.json();
      // console.log('Feedback submission successful:', result);

      // Simulate a successful API call for now
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
      feedbackPopupMessage = "Feedback erfolgreich gesendet!";

      // Close the popup after a short delay so the user can see the success message
      setTimeout(() => {
        closeFeedbackPopup();
      }, 2000);

    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      feedbackPopupMessage = `Fehler: ${error.message || 'Unbekannter Fehler beim Senden.'}`;
      // Do not close the popup on error, so the user can see the message and try again or correct something.
    }
    // --- End of API call section ---
  }

  // Helper function to get an emoji based on the mood value
  const getMoodEmoji = (value: number): string => {
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

<style>
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
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; /* Common sans-serif font */
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
    /* Default accent color for sliders (e.g., for productiveness) */
    accent-color: #007bff;
  }
  .mood-slider {
    /* Specific accent color for the mood slider */
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

<!-- This is where your main page content would go. -->
<!-- For demonstration, I'm adding a button to trigger the feedback popup. -->
<div style="padding: 20px; text-align: center;">
  <h2>Ihre Lernsitzung</h2>
  <p>Hier sind Ihre Lerninhalte...</p>
  <button
    class="cta-button"
    on:click={openFeedbackPopup}
  >
    Lernsitzung Beenden & Feedback Geben
  </button>
</div>

<!-- Session Feedback Popup -->
{#if showFeedbackPopup}
  <div class="feedback-modal-overlay" on:click={closeFeedbackPopup}>
    <div class="feedback-modal-content" on:click|stopPropagation>
      <button class="feedback-close-button" on:click={closeFeedbackPopup}>&times;</button>
      <h2>Session Feedback</h2>

      {#if feedbackPopupMessage}
        <!-- Display success or error messages -->
        <p class="feedback-message {feedbackPopupMessage.startsWith('Fehler') ? 'error' : 'success'}">
          {feedbackPopupMessage}
        </p>
      {/if}

      <!-- Show the form if there's no message or if the message is an error (allowing retry) -->
      {#if !feedbackPopupMessage || feedbackPopupMessage.startsWith('Fehler')}
        <form on:submit|preventDefault={handleSubmitFeedback}>
          <div class="form-group">
            <label for="productiveness-slider">
              Ihre Produktivität: <span class="value-display">{productiveness}</span>
            </label>
            <input
              type="range"
              id="productiveness-slider"
              min="1"
              max="10"
              bind:value={productiveness}
              class="slider"
            />
            <div class="slider-labels">
              <span>Niedrig</span>
              <span>Hoch</span>
            </div>
          </div>

          <div class="form-group">
            <label for="mood-slider">
              Ihre Stimmung: <span class="emoji-display">{getMoodEmoji(mood)}</span> (<span class="value-display">{mood}</span>)
            </label>
            <input
              type="range"
              id="mood-slider"
              min="1"
              max="10"
              bind:value={mood}
              class="slider mood-slider"
            />
            <div class="slider-labels">
              <span>Schlecht</span>
              <span>Gut</span>
            </div>
          </div>

          <button type="submit" class="submit-button" disabled={feedbackPopupMessage === "Sende Feedback..."}>
            {feedbackPopupMessage === "Sende Feedback..." ? "Sende..." : "Feedback Senden"}
          </button>
        </form>
      {/if}
    </div>
  </div>
{/if}
