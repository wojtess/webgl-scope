<script lang="ts">
  import Controls from "./components/Controls.svelte";
  import Scope from "./components/Scope.svelte";

  let range: Array<number> = [0,1]
  let voltdiv = 0;
  let time;
  let timediv;

</script>
webgl test:
<div id="rootContainer">
  <div>
    <Scope range={range} voltdiv={voltdiv} time={time} timediv={timediv}/>
  </div>
  <div>
    right
  </div>
</div>
<div>
  <Controls bind:range={range} bind:voltdiv={voltdiv} bind:time={time} bind:timediv={timediv}/>
</div>

<style>

#rootContainer {
  display: grid;
  grid-template-columns: auto auto auto;
}

</style>
