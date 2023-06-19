<script lang="ts">

    import { createEventDispatcher } from 'svelte';
    import { beforeUpdate, afterUpdate } from 'svelte';

    const dispatch = createEventDispatcher();

    export let posibbleValues: Array<String>
    export let index: number = 0;
    export let value: String = ""


    function left() {
        if(index > 0) {
            index--
            value = posibbleValues[index]
        }
        dispatch('update', {
            "value": value
        })
    }

    function right() {
        if(index + 1 < posibbleValues.length) {
            index++
            value = posibbleValues[index]
        }
        dispatch('update', {
            "value": value
        })
    }

    value = posibbleValues[index]
    dispatch('update', {
        "value": value
    })
    afterUpdate(() => {
        value = posibbleValues[index]
        dispatch('update', {
            "value": value
        })
    })

</script>

<div id="container">
    <button on:click={left}>
        &lt;
    </button>
    <p>
        {value}
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