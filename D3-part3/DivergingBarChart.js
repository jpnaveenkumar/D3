var metaForBarChart = {};
function transformDataForDivergingBarChart(data)
{
    
    let html="";
    for(let i=1880; i<2021; i++){
        html+=`<option value="${i}">${i}</option>`;
    }
    $("#yearDropdownBarChart").append(html);
    renderDivergingBarChartInterceptor(data);
}

function updateDivergingBarChar()
{
    let year = $("#yearDropdownBarChart").val();
    let hemis = $("#hemisphereDropdownBarChart").val();
    handlerForDivergingBarChart(year, hemis);
}

function handlerForDivergingBarChart(year, hemis)
{
    data = metaForBarChart['data'];
    let curState;
    for(let i=0; i< data.length; i++){
        if(data[i]["Hemisphere"] == hemis && data[i]["Year"] == year){
            curState = data[i];
            break;
        }
    } 
    const keys = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let dataForChart = [];
    for(var key of keys){
        dataForChart.push({
            key,'value': curState[key]
        })
    }
    renderDivergingBarChart(dataForChart);
}

function renderDivergingBarChart(state)
{
    const extent = d3.extent(state, d => parseFloat(d.value));
    const xScale = d3.scaleLinear()
        .range([0, metaForBarChart['width']])
        .domain([
            parseFloat(extent[0]) > 0 ? "-0.01" : extent[0], 
            parseFloat(extent[1]) < 0 ? "0.01" : extent[1]
        ]);

    const yScale = d3.scaleBand()
        .range([metaForBarChart['height'],0])
        .domain(state.map(d => d.key))
        .padding(0.2);

    metaForBarChart['xAxisContainer']
        .call(d3.axisTop(xScale));

    metaForBarChart['yAxisContainer']
        .attr('transform',`translate(${xScale(0)},0)`)
        .call(
            d3.axisLeft(yScale)
                .tickSize(0)
                .tickPadding(5))
        .call(
            d=> d.selectAll('.tick text')
                .attr('class', 'boldTick')
        )
        .call(
            d => d.selectAll('.tick text')
            .filter((i,j) => 
                {
                    return state[j].value < 0;
                })
            .attr('x', 6)
            .attr('text-anchor', 'start')
        )
        .call(
            d => d.selectAll('.tick text')
            .filter((i,j) => 
                {
                    return state[j].value > 0;
                })
            .attr('x', -6)
            .attr('text-anchor', 'end')
        )

    
    var rects = metaForBarChart['chartContainer'].selectAll("rect")
                .data(state, d => d.key);
    rects.enter()
        .append('rect')
        .merge(rects)
        .attr('x', d => xScale(Math.min(d.value,0)))
        .attr('y', d => yScale(d.key))
        .transition()
        .duration(500)
        .attr('width',d => Math.abs(xScale(d.value) - xScale(0)))
        .attr('height', yScale.bandwidth())
        .attr('fill', d => parseFloat(d.value) > 0 ? '#377eb8' : '#e41a1c');

    var texts = metaForBarChart['chartContainer'].selectAll('.anamolyVal')
                .data(state, d => d.key);
    
    texts.enter()
        .append('text')
        .attr('class', 'anamolyVal')
        .merge(texts)
        .attr('x', d => d.value < 0 ? xScale(d.value) -30 : xScale(d.value) + 7)
        .attr('y', d => yScale(d.key) + yScale.bandwidth()/1.5)
        .text(d=> d.value);
}

function renderDivergingBarChartInterceptor(data)
{
    metaForBarChart['width'] = 600;
    metaForBarChart['height'] = 350;
    const margin = {
        'top' : 100,
        'left' : 100,
        'right' : 100,
        'bottom' : 100
    };
    var svg = d3.select(".DivergingBarChart");
    metaForBarChart['chartContainer'] = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('class', 'holder');

     metaForBarChart['chartContainer'].append('text')
        .attr('class', 'x-axis-legend')
        .attr('transform', `translate( ${metaForBarChart['width']/2 - 10}, ${-35})`)
        .text("Anamoly Readings");
    
    metaForBarChart['xAxisContainer'] = metaForBarChart['chartContainer'].append('g');

    metaForBarChart['yAxisContainer'] = metaForBarChart['chartContainer'].append('g');

    metaForBarChart['data'] = data;

    handlerForDivergingBarChart("1947","Global");
    $("#yearDropdownBarChart").val("1947");
}