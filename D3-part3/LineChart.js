var metaForLineChart = {};

function transformDataForLineChart(rawData)
{
    console.log(data);
    renderLineChartInterceptor(rawData);
}

function renderLineChartInterceptor(rawData)
{
    metaForLineChart['width'] = 600;
    metaForLineChart['height'] = 350;
    const margin = {
        'top' : 100,
        'left' : 100,
        'right' : 100,
        'bottom' : 100
    };
    var svg = d3.select(".LineChart");
    metaForLineChart['chartContainer'] = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)
    .attr('class', 'holder');

    metaForLineChart['xAxisContainer'] = metaForLineChart['chartContainer'].append('g')
                                    
    metaForLineChart['yAxisContainer'] = metaForLineChart['chartContainer'].append('g');

    metaForLineChart['data'] = rawData;

    metaForLineChart['chartContainer'].append('text')
        .attr('class', 'x-axis-legend')
        .attr('transform', `translate( ${metaForLineChart['width']/2 - 20}, ${metaForLineChart['height'] + 70})`)
        .text("Year")

    metaForLineChart['chartContainer'].append('text')
        .attr('class', 'y-axis-legend')
        .attr('transform', `rotate(-90)`)
        .attr('x', -metaForLineChart['height']/2 - 80)
        .attr('y', -40)
        .text("Monthly Mean Average")

    handlerForLineChart("Global");
}

function updateLineChart()
{
    let hemis = $("#hemisphereDropdownLineChart").val();
    handlerForLineChart(hemis);
}

function handlerForLineChart(hemis)
{
    let data = metaForLineChart['data'];
    let state = [];
    for(var i=0; i< data.length; i++){
        if(data[i]['Hemisphere'] == hemis){
            state.push({
                "year" : data[i]["Year"],
                "value" : data[i]["J-D"]
            });
        }
    }
    let pathColorVsHemis = {
        "Global" : "#009688",
        "Southern" : "#377eb8",
        "Northern" : "#e41a1ca8"
    };
    let pointColorVsHemis = {
        "Global" : "#008000b8",
        "Southern" : "#0000ff9c",
        "Northern" : "#ff0000cc"
    };
    renderLineChart(state, pathColorVsHemis[hemis], pointColorVsHemis[hemis]);
}

function renderLineChart(dataForChart, pathColor, pointColor)
{
    const xScale = d3.scaleBand()
        .range([0, metaForLineChart['width']])
        .domain(dataForChart.map(d => parseInt(d['year'])))
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .range([metaForLineChart['height'],0])
        .domain(d3.extent(dataForChart, d => parseFloat(d['value'])));
    
    metaForLineChart['xAxisContainer']
    .attr('class', 'x-axis-line-chart')
    .attr('transform',`translate(0,${yScale(0)})`)
    .call(
        d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(
                (d,i)=> {
                    return !(i%10);
                }
            )
    )).call(
        d => d.selectAll('.tick text')
                .attr('y', 140)
    )
    metaForLineChart['yAxisContainer'].call(
        d3.axisLeft(yScale)
    );

    var paths = metaForLineChart['chartContainer'].selectAll('.line')
        .data([dataForChart], d => {
          return  d.year;
        });

    var pathMeta = paths.enter()
        .append('path')
        .attr('class','line')
        .merge(paths)
        .attr('d', d3.line()
          .x(d => { 
              console.log(xScale(d['year']));
              return xScale(parseInt(d['year']));
            })
          .y(function(d){ 
              return yScale(parseFloat(d['value']));
            })
        )
        .attr('transform', `translate(${xScale.bandwidth()/2},0)`)
        .attr("fill", "none")
        .attr("stroke", pathColor)
        .attr("stroke-width", 1.5);

    var transitionPath = d3.transition()
                        .ease(d3.easeSin)
                        .duration(2500);
    
    const pathLength = pathMeta.node().getTotalLength();

    pathMeta.attr("stroke-dashoffset", pathLength)
    .attr("stroke-dasharray", pathLength)
    .transition(transitionPath)
    .attr("stroke-dashoffset", 0);

    var circles = metaForLineChart['chartContainer'].selectAll('.circle')
            .data(dataForChart, d=>d.year);
    
    circles.enter()
        .append('circle')
        .attr('class', 'circle')
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseLeave)
        .merge(circles)
        .attr('cx',d => xScale(parseInt(d['year'])) + xScale.bandwidth()/2)
        .attr('cy',d => yScale(parseFloat(d['value'])))
        .attr('r',3)
        .attr('fill',pointColor);

    function onMouseOver(d)
    {
        const xAxis = parseInt(d3.select(this).attr('cx')) + 30;
        const yAxis = parseInt(d3.select(this).attr('cy'));
        const legend = metaForLineChart['chartContainer'].append('foreignObject')
        .attr('class', 'timeSeriesTooltipContainer')
        .attr('x', xAxis)
        .attr('y', yAxis)
        .attr("width", 150)
        .attr("height", 50)
        .html(function(){
            return `
                <div class="timeSeriesTooltip">
                    <span style="font-size:13px;color:grey">Year : ${d.year} </span>
                    <span style="font-size:13px;color:grey">anamoly value : ${d.value} </span>
                </div>
            `;
        });
    }

    function onMouseLeave(d)
    {
        d3.select('.timeSeriesTooltipContainer').remove();
    }
    
}