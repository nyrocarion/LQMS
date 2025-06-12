<div style="height:100ch" class="app-container">
  <!-- Menu -->
  <header class="nav">
    <ul>
      <li id="sessions"><a href="../dashboard/sessions/">Sessions</a></li>
      <li id="checkup"><a href="./check-up">Check-Up</a></li>
      <li id="dashboard"><a href="../dashboard/">Dashboard</a></li>
      <li id="lectures"><a href="../dashboard/lectures/">Vorlesungen</a></li>
    </ul>
  </header>

    <!-- Timer Block -->
    <div class="timer-block">

      <h1>
        <div>
        LERNSESSION
        </div>
      </h1>

      <div class="timer-blank">
        <div> 
          <span class ="timer-number">{number_padding(hours)}</span>
          <span class="timer-dot">:</span>
          <span class="timer-number">{number_padding(minutes)}</span>
          <span class="timer-dot">:</span>
          <span class="timer-number">{number_padding(seconds)}</span>
        </div>

        <!-- Play/Pause Button-->
        <div class="button-grid">
          <button class="clock" on:click={toggle_timer}>
            {#if isRunning}
              <!-- Pause Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            {:else}
              <!-- Start Icon -->
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            {/if}
          </button>

          <!-- Stop Button-->
          <button class="clock" on:click={session_end}  disabled={isSession == false}>
            <!-- Stop Icon -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z"/>
            </svg>
          </button>

        </div>
      </div>
    </div> 
</div>


<!-- Session Feedback Popup -->
{#if showFeedbackPopup}
  <div class="feedback-modal-overlay">
    <!-- Visible Popup -->
    <div class="feedback-modal-content" on:click|stopPropagation>
      <h2>
        <div class="feedback-heading">
          Session Feedback
        </div>
      </h2>
        <form method="POST">
          <div class="form-group">
            <!-- Efficiency Slider -->
            <label for="efficiency-slider">
              Your Productivity: <span class="value-display">{efficiency}</span>
            </label>
            <!-- Input efficiency-->
            <input
              type="range"
              name="efficiency"
              id="efficiency-slider"
              min="0"
              max="10"
              bind:value={efficiency}
              class="slider"
            />
            <!-- Hidden handover of session length for database saving -->
            <input
              type="hidden"
              name="totalseconds"
              bind:value={totalSeconds}
            />
            <div class="slider-labels">
              <span>Niedrig</span>
              <span>Hoch</span>
            </div>
          </div>
          <div class="form-group">
            <!-- Motivation Slider -->
            <label for="motivation-slider">
              Deine Stimmung: <span class="emoji-display">{getmotivationEmoji(motivation)}</span> (<span class="value-display">{motivation}</span>)
            </label>
            <!-- Input Motivation-->
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
          <div class="form-group">
            <!-- Submit Button-->
            <button type="submit" class="submit-button"> Feedback senden! </button>
          </div>
          </form>
    </div>
  </div>
{/if}

<style>

.timer-blank{
  position: relative;
  top: 75px;
}

.feedback-heading{
  padding-top: 5%;
  padding-bottom: 18%;
}

.timer-dot{
  position: relative;
  top: -55px;
  transform: translateY(100px);
  font-size: 50px;
  padding: 0 0.2em;
}

.timer-number{
  font-size: 200px;
  padding: 0 0.2em;
  font-family: 'Inter', sans-serif;
  font-variant-numeric: tabular-nums;
}

.timer-block {
  display: grid;
  gap: 1rem;
  color: #3c68a3;
  background-color: white;
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
  padding: 0 25px;
  border-radius: 15px;
  height: 600px;
  top: 100px;
}

.button-grid {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 50px;
  margin-top: 40px;
}

.clock {
  max-width: 150px;
  padding: 20px 20px;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  flex: 1;
}

.clock:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.feedback-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.feedback-modal-content {
  background-color: white;
  width: 75%;
  height: 75%;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  max-width: 90%;
  position: relative;
  text-align: left;
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
  margin-left: 100px;
  margin-right: 100px;
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
  accent-color: #007bff;
}

.motivation-slider {
  accent-color: #e83e8c;
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
  font-size: 1.2em;
  vertical-align: -0.15em;
  margin-right: 3px;
}

.submit-button {
  display: block;
  width: 100%;
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 500;
  transition: background-color 0.2s;
  margin-top: 10px;
  text-align: center;
}

.submit-button:hover {
  background-color: #218838;
}

.submit-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

</style>

<script lang="ts">

// Total seconds elapsed in the session.
let totalSeconds = 0;
// Reference to the timer interval.
let clock = 0;
// Indicates if the timer is currently running.
let isRunning = false;
// Indicates if a session is active.
let isSession = false;
// Time Calculation - Hours part of the timer.

$: hours = Math.floor(totalSeconds / 3600);
// Minutes part of the timer.
$: minutes = Math.floor(totalSeconds / 60) % 3600;
// Seconds part of the timer.
$: seconds = totalSeconds % 60;

/**
 * Starts a new session and timer.
 * Resets totalSeconds, sets session and running state, and starts the interval.
 */
function session_start(){
    totalSeconds = 0;
    isSession = true;
    isRunning = true;
    clock = setInterval(() => {totalSeconds +=1}, 1000);
}

/**
 * Resumes the timer for the current session.
 * Sets running state and starts the interval.
 */
function session_resume(){
    isRunning = true;
    clock = setInterval(() => {totalSeconds +=1}, 1000);
}

/**
 * Pauses the timer for the current session.
 * Clears the interval and sets running state to false.
 */
function session_pause(){
  isRunning = false;
  clearInterval(clock);
}

/**
 * Ends the current session.
 * Stops the timer, opens the feedback popup, and resets session state.
 */
function session_end(){
  isRunning = false;
  clearInterval(clock);
  openFeedbackPopup();
  isSession = false;
}

/**
 * Toggles the timer between running and paused states.
 * Starts a new session if none is active.
 */
function toggle_timer() {
  if (isRunning) {
    session_pause();
  } else{
    if(isSession == false) {
      session_start();
    } else {
      session_resume();
    }
  }
}

/**
 * Pads a number with a leading zero if less than 10.
 * @param value - The number to pad.
 * @returns The padded string.
 */
function number_padding(value: number): string {
  if (value < 10){
    return `0${value}`;
  }
  return value.toString();
}
	
// Session Feedback Popup Logic

// Controls visibility of the feedback popup.
let showFeedbackPopup: boolean = false;
// User's self-reported efficiency (0-10).
let efficiency: number = 5; // Default value
// User's self-reported motivation/mood (0-10).
let motivation: number = 5; // Default value

/**
 * Opens the feedback popup and resets values to defaults.
 */
function openFeedbackPopup(): void {
  efficiency = 5;
  motivation = 5;
  showFeedbackPopup = true;
}

/**
 * Returns an emoji representing the user's motivation/mood.
 * @param value - The motivation value (0-10).
 * @returns Emoji string.
 */
const getmotivationEmoji = (value: number): string => {
  if (value <= 3) return '🙁'; // Sad
  if (value <= 7) return '😐'; // Neutral
  return '🙂'; // Happy
};
</script>