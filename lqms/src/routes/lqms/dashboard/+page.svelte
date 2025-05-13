<h1> Dashboard </h1>
<div style="height=100px;width=300px;background-color="red";>  
  <h2> Die genialen Lerntipps </h2>
  <span id="tip"> </span>
</div>
<script>
  async function getTipFromDB () {
    import { db } from '$lib/server/database';
    const tip = await db.query('SELECT `tipps` FROM `content` WHERE `id`=1;');
    document.getElementById("tip").innerHTML = tip;
  }
getTipFromDB();
</script>
