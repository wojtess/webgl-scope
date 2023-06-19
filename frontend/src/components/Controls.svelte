<script lang="ts">
    import StringSelector from "./StringSelector.svelte";
    import NumberSelector from "./NumberSelector.svelte";
    import {GetCaptureDevices, StartCapture, StopCapture} from "../../wailsjs/go/main/App";

    export let range = [0, 1];
    export let voltdiv = 0;
    export let time = 0;
    export let timediv = 0;

    let posibbleValues = [""];
    

    GetCaptureDevices().then((data) => {
        posibbleValues = data;
    })

    let device = "";

</script>

<div id="container">
    <div id="left">
        Y axis
        <br/>
        <NumberSelector maxValue={30} minValue={0.5} delta={0.5} sufix="V/div" bind:value={voltdiv}/>
        <br/>
        from <NumberSelector maxValue={500} minValue={0} delta={1} sufix="V" bind:value={range[1]}/>
        <br/>
        to <NumberSelector maxValue={0} minValue={-500} delta={1} sufix="V" bind:value={range[0]}/>
    </div>
    <div>
        X axis
        <br/>
        <NumberSelector maxValue={1000} minValue={100} delta={50} sufix="ms/div" bind:value={timediv}/>
        <br/>
        <NumberSelector maxValue={60} minValue={0.2} delta={0.2} sufix="sec" bind:value={time}/>
    </div>
    <div>
        Device:
        <StringSelector posibbleValues={posibbleValues} bind:value={device}/>
        <br/>
        <button on:click={() => {StartCapture(device)}}>start capturing</button>
        <br/>
        <button on:click={() => {StopCapture()}}>stop capturing</button>
    </div>
</div>


<style>

#container {
    display: grid;
    grid-template-columns: auto auto auto;
}

</style>