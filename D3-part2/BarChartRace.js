var barChartTimeout;
var barChartCurrentIndex=0;
function transformDataForBarChart(data)
{
    var parsedData = d3.nest().key(d => d["type"]).key(d => d["date"]).key(d=> d["Country.Region"]).rollup((ar)=>{
        return d3.sum(ar, v => parseInt(v["cases"]) < 0 ? 0 : parseInt(v["cases"]));
    }).entries(data);
    console.log(parsedData);
    initBarChart(data, parsedData);
}

function resetBarChart()
{
    clearInterval(barChartTimeout);
    barChartCurrentIndex = 0;
}

function getColourForCountries(data)
{
    var c = d3.nest().key(d=>d["Country.Region"]).entries(data);
    var countries = c.map(c=>c.key);
    var countryVsColour = {};
    colorsSoFar = [];
    for(var country of countries){
        var color;
        while(true){
            color = d3.hsl(Math.random()*360,0.75,0.75);
            if(colorsSoFar.indexOf(color) == -1){
                colorsSoFar.push(color);
                break;
            }
        }
        countryVsColour[country] = color;
    }
    return countryVsColour;
}  

async function initBarChart(data, parsedData) 
{
    var countryVsColour = getColourForCountries(data);
    const width = 600;
    const height = 3500;
    var svg = d3.select(".barChartRace");
    var chartContainer = svg.append("g")
        .attr('transform', `translate(100, 100)`);

    svg.append('text')
        .attr('x', '550')
        .attr('y', '450')
        .attr('class', 'barChartRaceDateLegend')
        .text('')

    svg.append('text')
        .attr('class', 'x-axis-legend')
        .attr('transform', `translate( ${width/2 + 70}, ${50})`)
        .text("Cases Count");    
        
    var dataForChar = parsedData[0]["values"][0]["values"];
    var isAxisRendered = false;
    var xAxis;

    function getHTML(d, height)
    {
        return `
        <div style="background-color:white; display:flex; height:${height}px">
                       <span style="font-size:14px; font-weight:bold; margin-right:7px; color:#635F5D"> ${d.key} </span>
                       <span style="font-size:14px; font-weight:bold; color:#635F5D"> ${d.value} </span>
                    </div>
                `;
    }

    function renderData(data, date)
    {
        data = data.sort((a,b)=> a.value-b.value);
        const xScale = d3.scaleLinear()
            .domain([0,d3.max(data, d=>d.value) + 500])
            .range([0, width]);

        const yScale = d3.scaleBand()
            .domain(data.map(d=>d.key))
            .range([height, 0]);

        if(!isAxisRendered){
            isAxisRendered = true;
            xAxis = chartContainer.append('g')
                .attr('transform','translate(0,-10)');
        }
        xAxis
            .transition()
            .duration(1000)
            .call(d3.axisTop(xScale)
                .tickPadding([10])
            );  

        var rects = chartContainer.selectAll("rect")
            .data(data, d => d.key);

        d3.select('.barChartRaceDateLegend')
            .text(date);

        rects.enter()
            .append('rect')
            .merge(rects)
            .transition()
            .duration(500)
            .attr('x', 10)
            .attr('y', (d)=> yScale(d.key))
            .attr('width', (d) => xScale(d.value))
            .attr('height', yScale.bandwidth()-5)
            .attr('fill', d => countryVsColour[d.key]);

        var texts = chartContainer.selectAll("foreignObject")
            .data(data, d => d.key);

        texts.enter()
            .append('foreignObject')
            .html((d)=>{
                return getHTML(d, yScale.bandwidth());
            })
            .attr('x', (d) => xScale(d.value) + 20)
            .attr('y', (d)=> yScale(d.key))
            .attr('transform', 'translate(0,-13)')
            .attr("width", 200)
            .attr("height", yScale.bandwidth())
            .merge(texts)
            .html((d)=>{
                return getHTML(d, yScale.bandwidth());
            })
            .transition()
            .duration(500)
            .attr('x', (d) => xScale(d.value) + 20)
            .attr('y', (d)=> yScale(d.key) + yScale.bandwidth()/2 + 2)

    }

    var arr = parsedData[0]["values"];

    barChartTimeout = setInterval(() => {
        var item = arr[barChartCurrentIndex];
        barChartCurrentIndex++;
        if(barChartCurrentIndex > arr.length){
            resetBarChart();
            return;
        }
        renderData(item["values"], item["key"]);
    }, 400);
}