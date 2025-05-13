//Session
let seconds = 0;
let clock = 0;
let isRunning = false;

function session_start(){
  if(!isRunning){
    isRunning = true;
    clock = setInterval(() => {seconds +=1}, 1000);
  }
}

function session_pause(){
  isRunning = false;
  clearInterval(clock);
}

function session_end(){
  isRunning = false;
  clearInterval(clock);
  seconds = 0;
}