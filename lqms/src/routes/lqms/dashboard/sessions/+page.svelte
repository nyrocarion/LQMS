<!-- Timer Block -->
<div class="app-container">
  <header class="nav">
    <ul>
      <li id="sessions"><a href="../dashboard/sessions/">Sessions</a></li>
      <li id="checkup"><a href="./check-up">Check-Up</a></li>
      <li id="dashboard"><a href="../dashboard/">Dashboard</a></li>
      <li id="lectures"><a href="../dashboard/lectures/">Vorlesungen</a></li>
    </ul>
  </header>

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
    <div class="feedback-modal-content" on:click|stopPropagation>
      <h1>
        <div>
          Session Feedback
        </div>
      </h1>
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
          <button type="submit" class="submit-button"> Feedback senden! </button>
        </form>
    </div>
  </div>
{/if}

<style>
.timer-blank{
  position: relative;
  top: 75px;
}

.timer-dot{
  font-size: 50px;
  padding: 0 0.2em;
  position: relative;
  bottom: 55;
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

/* Wenn Button nicht gehen soll */
.clock:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

/* Styles für das Feedback Popup */
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
  /*padding: 25px 30px;*/
  /*padding: 200px 200px;*/
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  /*width: 1px;*/
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
  font-size: 1.2em; /* Um Emoji größer zu machen */
  vertical-align: -0.15em; /* Vertikale Verschiebung */
  margin-right: 3px;
}

.submit-button {
  display: block;
  width: 100%-200px;
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
  margin-left: 100px;
  margin-right: 100px;
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
let totalSeconds = 0;
let clock = 0;
let isRunning = false;
let isSession = false;

// Zeitberechnung
$: hours = Math.floor(totalSeconds / 3600);
$: minutes = Math.floor(totalSeconds / 60) % 3600;
$: seconds = totalSeconds % 60;

//Startet den Sessiontimer
function session_start(){
    totalSeconds = 0;
    isSession = true
    isRunning = true;
    clock = setInterval(() => {totalSeconds +=1}, 1000);
}

function session_resume(){
    isRunning = true;
    clock = setInterval(() => {totalSeconds +=1}, 1000);
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
  isSession = false;
}

// Start/Pause Umschaltfunktion
function toggle_timer() {
  if (isRunning) {
    session_pause();
  } else{
    if(isSession == false) {
      session_start()
    } else {
      session_resume();
    }
  }
}

function number_padding(value){
  if (value < 10){
    return `0${value}`;
  }
  return value.toString();
}
	
//Session Feedback Popup Logik
let showFeedbackPopup: boolean = false;
let efficiency: number = 5; //Default Wert
let motivation: number = 5; //Default Wert
  
function openFeedbackPopup(): void {
  //Beim Öfnnen der Popups wird der Wert auf den Default Wert zurückgesetzt
  efficiency = 5;
  motivation = 5;
  showFeedbackPopup = true;
}

function closeFeedbackPopup(): void {
  showFeedbackPopup = false;
}

// Funktion
const getmotivationEmoji = (value: number): string => {
  if (value <= 3) return '🙁'; // Traurig
  if (value <= 7) return '😐'; // Neutral
  return '🙂'; // Fröhlich
};
</script>