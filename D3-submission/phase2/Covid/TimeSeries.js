var transformedDataForTimeSeries;
var timeout = false;
var currentIndex = 10;
function transformDataForTimeSeriesChart(data)
{
    timeout = false;
    currentIndex = 10;
    var transformedData = d3.nest()
        .key(d => d["type"])
        .key(d => d["date"])
        .rollup(d =>  d3.sum(d, d1 => parseInt(d1.cases)))
        .entries(data);
    transformedDataForTimeSeries = transformedData;
    console.log(transformedData);
    renderTimeSeriesChart(transformedData[0]["values"]);
}

function resetTimeSeriesChart()
{
    clearInterval(timeout);
    currentIndex = 10;
}

function switchCategory(value)
{
    clearInterval(timeout);
    currentIndex = 10;
    d3.select('.timeSeries g').remove();
    if(value == "confirmed"){
        renderTimeSeriesChart(transformedDataForTimeSeries[0]["values"]);
    }else if(value == "death"){
        renderTimeSeriesChart(transformedDataForTimeSeries[1]["values"]);
    }else if(value == "recovered"){
        renderTimeSeriesChart(transformedDataForTimeSeries[2]["values"]);
    }
}

async function renderTimeSeriesChart(data)
{
    stopRendering = false;
    const width = 700;
    const height = 350;
    const margin = {
        'top' : 50,
        'left' : 100,
        'right' : 100,
        'bottom' : 100
    };

    const svg = d3.select('.timeSeries');
    const chartContainer = svg.append('g')
        .attr('transform', `translate( ${margin.left}, ${margin.top})`);

    const yAxisContainer =  chartContainer.append("g")
                                .attr('class', 'y-axis');
    const xAxisContainer =  chartContainer.append("g")
                        .attr('transform', `translate(0,${height})`)
                        .attr('class', 'x-axis');

    chartContainer.append('text')
        .attr('class', 'x-axis-legend')
        .attr('transform', `translate( ${width/2 - 20}, ${height + 50})`)
        .text("Time period");

    chartContainer.append('text')
        .attr('class', 'y-axis-legend')
        .attr('transform', `rotate(-90)`)
        .attr('x', -height/2 - 30)
        .attr('y', -60)
        .text("Covid Cases Count");

    function updateTimeChart(currentData)
    {
        const xScale = d3.scaleTime()
            .domain(d3.extent(currentData.map(d => new Date(d["key"]))))
            .range([0, width])
            .nice();

        const yScale = d3.scaleLinear()
            .domain(d3.extent(currentData, d => d["value"]))
            .range([height, 0])
            .nice();

        yAxisContainer
            .transition()
            .duration(300)
            .call(
                d3.axisLeft(yScale)
                    .tickPadding([10])
                    .tickSize(-width)
                );

        xAxisContainer
            .transition()
            .duration(300)
            .call(
                d3.axisBottom(xScale)
                    .tickPadding([15])
                    .tickSize(-height)
                    .ticks(5)
                );

        var paths = chartContainer.selectAll('.line')
                .data([currentData],d=> d.key);

        paths
            .enter()
            .append("path")
            .attr('class','line')
            .merge(paths)
            .attr('d', d3.line()
                .x(d => xScale(new Date(d["key"])))
                .y(d => yScale(d["value"]))
            )
            .attr('fill', 'none')
             .attr('stroke', '#7171eff7')
             .attr("stroke-width", 1.5)

        var circles = chartContainer.selectAll('.circle')
                .data(currentData, d=>d.key)

        circles
            .enter()
            .append('circle')
            .attr('class','circle')
            .on('mouseover', onMouseOver)
            .on('mouseout', onMouseLeave)
            .merge(circles)
            .attr('cx', d=> xScale(new Date(d["key"])))
            .attr('cy', d=> yScale(d["value"]))
            .attr('r', 4.5)
            .attr('fill','#6946e2')
        
        function onMouseOver(d)
        {
            const xAxis = parseInt(d3.select(this).attr('cx')) + 30;
            const yAxis = parseInt(d3.select(this).attr('cy'));
            const legend = svg.append('foreignObject')
            .attr('class', 'timeSeriesTooltipContainer')
            .attr('x', xAxis)
            .attr('y', yAxis)
            .attr("width", 150)
            .attr("height", 50)
            .html(function(){
                return `
                    <div class="timeSeriesTooltip">
                        <span style="font-size:13px;color:grey">Date : ${d.key} </span>
                        <span style="font-size:13px;color:grey">Count : ${d.value} </span>
                    </div>
                `;
            });
        }

        function onMouseLeave(d)
        {
            d3.select('.timeSeriesTooltipContainer').remove();
        }
    }

    updateTimeChart(data.slice(0,10));
    timeout = setInterval(() => {
        var subData = data.slice(0, currentIndex);
        currentIndex++;
        if(currentIndex > data.length){
            resetTimeSeriesChart();
            return;
        }
        updateTimeChart(subData);
    }, 400);
}