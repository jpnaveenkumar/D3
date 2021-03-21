var metaForDonutChart = {};

function transformDataDonutChart(rawData)
{
    metaForDonutChart['data'] = d3.nest().key(d => d["Hemisphere"]).rollup(
        d1 => {
          return {
                "autumn" : d3.mean(d1, d2 => d2["SON"]),
                "summer" : d3.mean(d1, d2 => d2["JJA"]),
                "spring" : d3.mean(d1, d2 => d2["MAM"]),
                "winter" : d3.mean(d1, d2 => d2["DJF"])
            }
        }
    ).entries(rawData);
    renderDonutChartInterceptor();
}

function renderDonutChartInterceptor()
{
    metaForBarChart['width'] = 600;
    metaForBarChart['height'] = 350;
    metaForBarChart['margin'] = {
        'top' : 250,
        'left' : 250,
        'right' : 100,
        'bottom' : 100
    };
    var svg = d3.select(".DonutChart");
    metaForDonutChart["chartContainer"] = svg.append("g")
            .attr("transform", `translate(${metaForBarChart['margin'].left},${metaForBarChart['margin'].top})`);

    metaForDonutChart["chartContainer"].append("circle")
        .attr('class', 'innerCircleLegend')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 80)
        .attr('fill', 'none');
    
    metaForDonutChart["chartContainer"].append('foreignObject')
        .attr('x',-40)
        .attr('y', -40)
        .attr('width', 90)
        .attr('height', 90)
        .html(function(){
            return  `
                <div class="innerCircleLegendText">
                    Hemisphere Vs Average Temperature Anomaly of a Season
                </div>
            `;
        });

    svg.append('foreignObject')
        .attr('x', 400)
        .attr('y', 100)
        .attr("width", 350)
        .attr("height", 100)
        .html(function(){
            return `
                <div style="display:flex;justify-content:space-evenly">
                    <div style="width:${100}px;display:flex;justify-content:center">
                        <p id="genderCrimeDesc"></p>
                    </div>
                    <div style="display:flex;flex-direction:column">
                        <div style="display:flex;align-items:center;">
                            <div style="height:10px;width:10px;background-color:#1f77b4"></div>
                            <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Global Hemisphere </span>
                        </div>
                        <div style="display:flex;align-items:center;">
                            <div style="height:10px;width:10px;background-color:#ff7f0e"></div>
                            <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Northern Hemisphere </span>
                        </div> 
                        <div style="display:flex;align-items:center;">
                            <div style="height:10px;width:10px;background-color:#2ca02c"></div>
                            <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Southern Hemisphere </span>
                        </div> 
                    </div>
                </div>
            `;
        });
    handlerForDonutChart("summer");
}

function updateDonutChart()
{
    let season = $("#seasonDropdownDonutChart").val();
    handlerForDonutChart(season);
}

function handlerForDonutChart(season)
{
    let curData = {};
    for(let instance of metaForDonutChart["data"]){
        curData[instance["key"]] = instance["value"][season];
    }
    renderDonutChart(curData);
}

function renderDonutChart(curData)
{
    let data = d3.entries(curData);
    let pie = d3.pie().value(d => d.value);
    let pieWithData = pie(data);

    let domainVsColorStroke = {
        "Global Hemisphere" : "#1f77b4",
        "Northern Hemisphere" : "#ff7f0e",
        "Southern Hemisphere" : "#2ca02c"
    };

    let colorStrokeVsFillColor = {
        "#1f77b4" : "#1f77b454",
        "#ff7f0e" : "#ff7f0e54",
        "#2ca02c" : "#2ca02c54"
    };

    let color = d3.scaleOrdinal()
        .domain(["Global Hemisphere",
        "Southern Hemisphere",
        "Northern Hemisphere"])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

    let arcProducer = d3.arc()
        .innerRadius(100)
        .outerRadius(200);

    let donutChart = metaForDonutChart["chartContainer"].selectAll(".donutPath")
        .data(pieWithData);

    donutChart.exit().remove();

    donutChart.enter()
        .append("path")
        .attr("class","donutPath")
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseLeave)
        .merge(donutChart)
        .attr('d', arcProducer)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "3px")
        .style("opacity", 1);

    let chartText = metaForDonutChart["chartContainer"].selectAll(".donuttext")
        .data(pieWithData);

    chartText.enter()
        .append("text")
        .attr("class","donuttext")
        .merge(chartText)
        .text(function(d){ return d.data.value.toString().substring(0,5)})
        .attr("transform", function(d) { return "translate(" + (arcProducer.centroid(d)) + ")";  })
        .style("text-anchor", "middle")
        .attr("fill", "white")
        .style("stroke-width", "1px")
        .style("font-size", 17)

    function onMouseOver(d, i)
    {
        d3.select(this)
            .transition()
            .duration(500)
            .ease(d3.easeBounce) 
            .attr('d',d3.arc()
            .innerRadius(100)
            .outerRadius(210));

        let domain = d.data.key + " Hemisphere";
        let stroke = domainVsColorStroke[domain];
        let fill = colorStrokeVsFillColor[stroke];

        d3.select('.innerCircleLegend')
            .style('stroke', stroke)
            .style('fill', fill)
        document.getElementsByClassName('innerCircleLegendText')[0].innerHTML = domain;
    }

    function onMouseLeave(d, i)
    {
        d3.select(this)
        .transition()
        .duration(500)
        .ease(d3.easeBounce)
        .attr('d',d3.arc()
        .innerRadius(100)
        .outerRadius(200));

        d3.select('.innerCircleLegend')
            .style('stroke', "#ff0000")
            .style('fill', "#ff000080")
        document.getElementsByClassName('innerCircleLegendText')[0].innerHTML = "Hemisphere Vs Average Temperature Anomaly of a Season";
    }
    
}

