document.addEventListener('DOMContentLoaded', function() {
    // The svg
    var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

    // Map and projection
    var path = d3.geoPath();
    var projection = d3.geoNaturalEarth()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
    var path = d3.geoPath()
    .projection(projection);

    // Data and color scale
    var data = d3.map();
    var colorScheme = d3.schemeBlues[6];
    colorScheme.unshift("#eee")
    var colorScale = d3.scaleThreshold()
    .domain([10000, 10001, 100001, 500001, 1000001, 2000001])
    .range(colorScheme);

    // Legend
    var g = svg.append("g")
    .attr("class", "legendThreshold")
    .attr("transform", "translate(20,20)");
    g.append("text")
    .attr("class", "caption")
    .attr("x", 0)
    .attr("y", -6)
    .text("Climate Resilience Participants");
    var labels = ['0-10k', '10k+-100k', '100k+-500k', '500k+-1M', '1M+-2M', '2M+-3M', '> 3M+'];
    var legend = d3.legendColor()
    .labels(function (d) { return labels[d.i]; })
    .shapePadding(4)
    .scale(colorScale);
    svg.select(".legendThreshold")
    .call(legend);

    // Load external data and boot
    d3.queue()
    .defer(d3.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .defer(d3.csv, "data/climate-resilience-participants-by-country.csv", function(d) { data.set(d.name, +d.total); })
    .await(ready);

    function ready(error, topo) {
    if (error) throw error;

        try {
            // Draw the map
        svg.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
            .attr("fill", function (d){
                // Pull data for this country
                // d3 map uses 3 character code and we use 2 so use the name
                d.total = data.get(d.properties.name) || 0;
                // Set the color
                return colorScale(d.total);
            })
            .attr("d", path)
        }
        catch(e) {
            console.log(e.message);
        }
    }
});