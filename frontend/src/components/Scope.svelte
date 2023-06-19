<script lang="ts">

    import StringSelector from "./StringSelector.svelte";
    import { onMount } from 'svelte';
    import { Color, Renderer, Vec2, Line, Font, FontEntry } from "./../renderer";
    import { GetData } from "../../wailsjs/go/main/App";
    import { afterUpdate } from "svelte";
    
    export let range: Array<number>;
    export let voltdiv;
    export let time;
    export let timediv;

    var renderer: Renderer

    let line = new Line(new Array(), new Color(1,0,1,1));
    let font = new Font([]);

    let horizontalLines = []
    let verticalLines = []
    
    afterUpdate(() => {
        font.clearEntires();
        {
            let size = Math.abs(range[0] - range[1]) / voltdiv;
            if(size >= 1 && size != Infinity) {
                horizontalLines = new Array()
                let delta = 900/size;
                for (let i = 0; i <= size;i++) {
                    horizontalLines.push(new Line([new Vec2(0, i * delta + 50), new Vec2(1000, i * delta + 50)], new Color(0,0,0,0)));
                    font.put(new FontEntry(range[0] + i*voltdiv + "v", new Vec2(2, i*delta + 50), 1.6));
                }
                for (let line of horizontalLines) {
                    renderer.initialize(line);  
                }
            }
        }
        {
            verticalLines = []
            let size = time / (timediv / 1000);
            if(size >= 1 && size != Infinity) {
                let delta = 900/size;
                for (let i = 0; i <= size;i++) {
                    font.put(new FontEntry((timediv * i) + "ms", new Vec2(i * delta + 50, 0), 1.2));
                    let line = new Line([new Vec2(i * delta + 50, 0), new Vec2(i * delta + 50, 1000)], new Color(0,0,0,0));
                    renderer.initialize(line);
                    verticalLines.push(line)
                }
            }
        }
        font.update();
    })

    setInterval(() => {
        GetData().then((data) => {
            let array = new Array();
            let delta = 1000/data.length
            let i = 0;
            for (let d of data) {
                array.push(new Vec2(i * delta, d));
                i++;
            }
            line.points = array;
        })
    }, 100);

    function render() {

        renderer.preRender();
        
        renderer.draw(line);
        renderer.draw(font);

        for (let line of horizontalLines) {
            renderer.draw(line);
        }

        for (let line of verticalLines) {
            renderer.draw(line);
        }

        requestAnimationFrame(render);
    }

    onMount(async () => {

        let canvas = <HTMLCanvasElement> document.getElementById("webgl");
        
        renderer = new Renderer(canvas, new Vec2(1000, 1000));
        
        renderer.initialize(line)
        renderer.initialize(font)

        for (let line of horizontalLines) {
            renderer.initialize(line);
        }

        requestAnimationFrame(render);
    })
</script>

<canvas id="webgl">

</canvas>

<style>
    canvas {
        width: 100%;
    }
</style>