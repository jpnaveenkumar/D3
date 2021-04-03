metaForAreaChart = {};
d3.csv("http://localhost:9999/country.csv", function(data){
    console.log(data);
    transformDataForChart(data);
});

function transformDataForChart(rawData){
    rawData = rawData.filter(d => d["year"] != "2021");
    let data = d3.nest().key(d => d["CTYNAME"]).entries(rawData);
    metaForAreaChart['data'] = {}
    data.forEach(c => {
        metaForAreaChart['data'][c.key] = c.values;
    });
    console.log(metaForAreaChart);
    metaForAreaChart["countries"] = new Set();
    rawData.forEach(d => metaForAreaChart["countries"].add(d['CTYNAME']));
    let html = '';
    for(let country of metaForAreaChart["countries"]){
        html += `<option value="${country}" ${ country == "India" ? "selected" : ""}>${country}</option>`;
    }
    $("#countryDropDown").append(html);
    init();
}

function init()
{
    metaForAreaChart['width'] = 600;
    metaForAreaChart['height'] = 350;
    const margin = {
        'top' : 80,
        'left' : 100,
        'right' : 100,
        'bottom' : 100
    };
    var svg = d3.select(".AreaChart")
        .attr("width",metaForAreaChart['width'] + 100)
        .attr("height",metaForAreaChart['height'] + 200);

    metaForAreaChart['chartContainer'] = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    metaForAreaChart['xAxisContainer'] = metaForAreaChart['chartContainer'].append('g')
                                    
    metaForAreaChart['yAxisContainer'] = metaForAreaChart['chartContainer'].append('g');

    metaForAreaChart['chartContainer'].append('text')
        .attr('class', 'x-axis-legend')
        .attr('transform', `translate( ${(metaForAreaChart['width']-100)/2 - 20}, ${metaForAreaChart['height'] + 50})`)
        .text("Year")

    metaForAreaChart['chartContainer'].append('text')
        .attr('class', 'y-axis-legend')
        .attr('transform', `rotate(-90)`)
        .attr('x', -metaForAreaChart['height']/2 - 80)
        .attr('y', -65)
        .text("US Dollars in Million")

    metaForAreaChart['chartContainer'].append('foreignObject')
        .attr('x', metaForAreaChart['width'] - 300)
        .attr('y', -50)
        .attr("width", 200)
        .attr("height", 50)
        .html(function(){
            return `
            <div style="display:flex;justify-content:space-evenly">
                <div style="display:flex;flex-direction:column">
                    <div style="display:flex;align-items:center;">
                        <div style="height:10px;width:10px;background-color:#F20000"></div>
                        <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Import Trade</span>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <div style="height:10px;width:10px;background-color:#0000F2"></div>
                        <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Export Trade</span>
                    </div> 
                </div>
            </div>
            `;
        });

    handlerForAreaChart("India")
}

function switchCountry(country)
{
    handlerForAreaChart(country);
}

function handlerForAreaChart(country)
{
    let targetData = metaForAreaChart['data'][country];
    render({
        'key' : country,
        'values' : targetData
    });
}

function render(data)
{
    loadYAxis(data['values']);
    loadXAxis(data['values']);
    loadAreaChart(data['values'], data['key']);
}

function loadXAxis(data)
{
    metaForAreaChart['xScale'] = d3.scaleTime()
        .range([0, metaForAreaChart['width'] - 100])
        .domain(d3.extent(data, d => new Date(d['year']))).nice();
    
    metaForAreaChart['xAxisContainer']
        .attr('class', 'x-axis-area-chart')
        .attr('transform',`translate(0,${metaForAreaChart['yScale'](0)})`)
        .call(
            d3.axisBottom(metaForAreaChart['xScale'])
            .tickSize(-metaForAreaChart["height"])
            .tickPadding([10])
        );

}

function loadYAxis(data)
{
    let importRange = d3.extent(data, d => parseFloat(d['IYR']));
    let exportRange = d3.extent(data, d => parseFloat(d['EYR']));
    metaForAreaChart['yScale'] = d3.scaleLinear()
        .range([metaForAreaChart['height'],0])
        .domain([Math.min(importRange[0], exportRange[0], 0), Math.max(importRange[1], exportRange[1])]).nice();

    metaForAreaChart['yAxisContainer']
        .attr('class', 'y-axis-area-chart')
        .attr('transform',`translate(-1,0)`)
        .call(
            d3.axisLeft(metaForAreaChart['yScale'])
            .tickSize(-metaForAreaChart["width"] + 100)
            .tickPadding([10])
        );
}

function loadAreaChart(data, country)
{
    const importColor = "#F20000"; //red
    const exportColor = "#0000F2"; //blue
    console.log(country);
    let zScale = d3.scaleOrdinal()
        .range(d3.schemeCategory20)
        .domain(Array.from(metaForAreaChart['countries']));

    let initialArea = d3.area()
        .x(d => metaForAreaChart['xScale'](new Date(d['year'])))
        .y0(d => metaForAreaChart['yScale'](d['IYR']))
        .y1(d => metaForAreaChart['yScale'](d['IYR']));

    let finalArea = d3.area()
        .x(d => metaForAreaChart['xScale'](new Date(d['year'])))
        .y0(d => metaForAreaChart['yScale'](d['IYR']))
        .y1(d => metaForAreaChart['yScale'](d['EYR']));

    let paths = metaForAreaChart['chartContainer'].selectAll('.area')
        .data([data], d => d['year']);

    paths.enter()
        .append("path")
        .attr('class','area')
        .attr('fill', "#b3d9b38c")
        .merge(paths)
        .attr('d', initialArea)
        .transition()
        .duration(2000)
        .attr('d', finalArea)
    
    let exportLine = d3.line()
        .x(d => metaForAreaChart['xScale'](new Date(d['year'])))
        .y(d => metaForAreaChart['yScale'](d['EYR']));

    let importLine = d3.line()
        .x(d => metaForAreaChart['xScale'](new Date(d['year'])))
        .y(d => metaForAreaChart['yScale'](d['IYR']));

    let lines = metaForAreaChart['chartContainer'].selectAll('.line1')
        .data([data], d => d['year']);

    lines.enter()
        .append("path")
        .attr('class', 'line1')
        .merge(lines)
        .attr('d', importLine)
        .attr("stroke", importColor)
        .attr("stroke-width", 1.5)
        .transition()
        .ease(d3.easeSin)
        .duration(2000)
        .attr('d', exportLine)
        .attr('fill','none')
        .attr("stroke", exportColor)
        .attr("stroke-width", 1);
    
    lines = metaForAreaChart['chartContainer'].selectAll('.line2')
        .data([data], d => d['year']);

    lines.enter()
        .append("path")
        .attr('class', 'line2')
        .merge(lines)
        .attr('d', exportLine)
        .attr("stroke", exportColor)
        .attr("stroke-width", 1.5)
        .transition()
        .ease(d3.easeSin)
        .duration(2000)
        .attr('d', importLine)
        .attr('fill','none')
        .attr("stroke", importColor)
        .attr("stroke-width", 1.5);
    
}