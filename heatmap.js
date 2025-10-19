// This draws the heatmap of phoneme similarities
function drawHeatmap() {
    const title = document.getElementById("heatmap-tooltip");
    
    // Remove the loading message
    document.getElementById("heatmap").innerHTML = "";

    const heatmapData = phonemes.flatMap(x=>phonemes.map(y=>({
        'x': x,
        'y': y,
        'value': comparePhonemes(vectors[x],vectors[y])
    })));

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", 900)
        .attr("height", 650);

    const x = d3.scaleBand().domain(phonemes).range([0, 850]).padding(0.05);
    const y = d3.scaleBand().domain(phonemes).range([0, 600]).padding(0.05);

    const color = d3.scaleSequential()
        .domain([0, d3.max(heatmapData, d => d.value)])
        .interpolator(d3.interpolateViridis);

    const g = svg.append("g").attr("transform", "translate(30,20)");

    let updateTitle = function(event, data) {
        // This writes a line like "i (ea as in beat) and ɑ (a as in calm) have a similarity of 0.8125" above the graph
       title.textContent = `${data.x} (${IPADescription[data.x]}) and ${data.y} (${IPADescription[data.y]}) have a similarity of ${formatNumber(data.value)}`;
    }

    g.selectAll("rect")
        .data(heatmapData, d => `${d.x}:${d.y}`)
        .join("rect")
        .attr("x", d => x(d.x))
        .attr("y", d => y(d.y))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .attr("fill", d => color(d.value))
        .on("mousemove", updateTitle);

    // x axis
    g.append("g").style("font-size", "12pt").attr("transform", `translate(0,${y.range()[1]})`).call(d3.axisBottom(x));
    
    // y axis
    g.append("g").style("font-size", "12pt").call(d3.axisLeft(y));
}