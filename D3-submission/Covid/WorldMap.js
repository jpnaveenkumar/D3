function transformDataForWorldMap(data)
{
    var transformedData = d3.nest().key(d => d["Country.Region"]).key(d => d["type"]).rollup((data)=>{
        return {
        "lat" : data[0]["Lat"],
        "long" : data[0]["Long"],
        "count" : d3.sum(data, d => parseInt(d["cases"]))
        }
    }).entries(data)
    renderMap(transformedData);
}

function renderMap(data)
{
    var countryVsAggCount = {};
    var countryVsCategoryCount = {};
    for(var row of data){
        const country = row["key"];
        const categoryCount = row["values"];
        const confirmedCount = categoryCount[0]["value"]["count"];
        const deathCount = categoryCount[1]["value"]["count"];
        const recoveredCount = categoryCount[2]["value"]["count"];
        const aggCount = confirmedCount + deathCount + recoveredCount;
        countryVsAggCount[country] = {
            "count" : aggCount,
            "lat" : categoryCount[0]["value"]["lat"],
            "long" : categoryCount[0]["value"]["long"]
        };
        countryVsCategoryCount[country] = {
            "confirmed" : confirmedCount,
            "death" : deathCount,
            "recovered" : recoveredCount,
        };
    }

    d3.json('https://unpkg.com/world-atlas@2.0.2/countries-50m.json',function(topoJson){
        const projection = d3.geoEquirectangular();
        projection.scale(240,240);
        projection.translate([700,350]);
        const pathGenerator = d3.geoPath().projection(projection);
        const countries = topojson.feature(topoJson, topoJson.objects.countries);
        var svg = d3.select('.worldMap');

        svg.append('path')
            .attr('d',pathGenerator({type:'Sphere'}))
            .attr('class','sphere')

        svg.selectAll('path')
            .data(countries.features)
            .enter()
            .append('path')
            .attr('d',d => pathGenerator(d))
            .attr('class','country');

        const countryVsAggCountEntry = d3.entries(countryVsAggCount);
        
        var radiusScale = d3.scaleSqrt()
                            .domain(d3.extent(countryVsAggCountEntry, (covid) => covid["value"]["count"]))
                            .range([2,15]);

        svg.selectAll("circle")
            .data(countryVsAggCountEntry)
            .enter()
                .append('circle')
                .attr('class','circle')
                .attr("cx", d => projection([+d["value"]["long"], +d["value"]["lat"]])[0])
                .attr("cy", d => projection([+d["value"]["long"], +d["value"]["lat"]])[1])
                .attr("r", d => radiusScale(d["value"]["count"]))
                .attr("fill", "red")
                .on('mouseover',(d)=>{
                    const country = d.key;
                    const metaData = countryVsCategoryCount[country];
                    const xAxis = d3.event.pageX - 65;
                    const yAxis = d3.event.pageY - 100;
                    console.log(xAxis);
                    console.log(yAxis);
                    document.getElementById("tooltipCountry").innerHTML = country;
                    document.getElementById("confirmedCount").innerHTML = metaData["confirmed"];
                    document.getElementById("recoveredCount").innerHTML = metaData["recovered"]
                    document.getElementById("deadCount").innerHTML = metaData["death"]
                    
                    d3.select('.tooltipContainer')
                        .style('left', xAxis + "px")
                        .style('top', (yAxis) + "px" )
                        .transition()
                        .duration(500)
                        .style('opacity', 1);
                })
                .on('mouseout',(d)=>{
                    d3.select('.tooltipContainer')
                        .transition()
                        .duration(500)
                        .style('opacity', 0);
                });        
        // var tooltip = svg.append('foreignObject')
        // .attr('class','tooltip')
        // .attr('width', 150)
        // .attr('height', 60)
        // .style('position','absolute')
        // .style('opacity', 0)
        // .html(function(){
        //     return `
        //         <div class="tooltipContainer">
        //             <div id="tooltipCountry" style="font-weight:bold"></div>
        //             <div> Confirmed Cases : <span id="confirmedCount"></span></div>
        //             <div> Recovered Cases : <span id="recoveredCount"></span></div>
        //             <div> Dead Cases : <span id="deadCount"></span></div>
        //         </div>
        //     `;
        // });
    });
}