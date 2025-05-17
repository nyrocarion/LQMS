<h1 style="font-size: 100px;> Dashboard </h1>
<div style="height:100px;width:300px;background-color:red;">  
  <h2> Die genialen Lerntipps </h2>
  <span id="tip"> </span>
</div>
<script>
  import { tip } from './+page.server.js';
  console.log("script after import is working");
  console.log(tip);
  document.getElementById("tip").innerHTML = tip;
</script>
