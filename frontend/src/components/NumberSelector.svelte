<script lang="ts">

    export let maxValue: number;
    export let minValue: number;
    export let delta: number;
    export let value: number = minValue;

    export let sufix: String = ""
    export let prefix: String = ""

    function left() {
        if(value - delta >= minValue) {
            value = +value - delta;
        }
    }

    function right() {
        if(value + delta <= maxValue) {
            value = +value + delta;
        }
    }

    const wheel = (node) => {
        const handler = e => {
			e.preventDefault();
            value = +value - e.deltaY / 10;
		};

        node.addEventListener('wheel', handler);

        return {
			destroy() {
				node.removeEventListener('wheel', handler, { passive: false });
			}
		};
    }
    
</script>

<div id="container">
    <button on:click={left}>
        &lt;
    </button>   
    <p use:wheel>
        {prefix}<input bind:value={value}>{sufix}
    </p>
    <button on:click={right}>
        &gt;
    </button>
</div>
<style>
    p {
        display: inline;
        -webkit-user-select: auto; /* Safari */
        user-select: auto; /* Standard syntax */
    }
    #container {
        display: inline;
        -webkit-user-select: none; /* Safari */
        user-select: none; /* Standard syntax */
    }
</style>