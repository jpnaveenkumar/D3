function transformDataForBarChart(data)
{
    var parsedData = d3.nest().key(d => d["type"]).key(d => d["date"]).key(d=> d["Country.Region"]).rollup((ar)=>{
        return d3.sum(ar, v => parseInt(v["cases"]) < 0 ? 0 : parseInt(v["cases"]));
    }).entries(data);
    console.log(parsedData);
    initBarChart(data, parsedData);
}

function getColourForCountries(data)
{
    var c = d3.nest().key(d=>d["Country.Region"]).entries(data);
    var countries = c.map(c=>c.key);
    var countryVsColour = {};
    for(var country of countries){
        countryVsColour[country] = d3.hsl(Math.random()*360,0.75,0.75);
    }
    return countryVsColour;
}  

async function initBarChart(data, parsedData) 
{
    var countryVsColour = getColourForCountries(data);
    const width = 600;
    const height = 2500;
    var svg = d3.select(".barChartRace");
    var chartContainer = svg.append("g")
        .attr('transform', `translate(100, 100)`);
    var dataForChar = parsedData[0]["values"][0]["values"];
    var isAxisRendered = false;
    var xAxis;
    function renderData(data)
    {
        data = data.sort((a,b)=> a.value-b.value);
        //data = data.slice(data.length-10,data.length);
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

        // chartContainer
        //     .transition()
        //     .duration(1000)
        //     .call(d3.axisLeft(yScale));


        var rects = chartContainer.selectAll("rect")
            .data(data, d => d.key);

        //rects.exit().remove();

        rects.enter()
            .append('rect')
            .merge(rects)
            .transition()
            .duration(1000)
            .attr('x', 10)
            .attr('y', (d)=> yScale(d.key))
            .attr('width', (d) => xScale(d.value))
            .attr('height', yScale.bandwidth()-5)
            .attr('fill', d => countryVsColour[d.key]);

        // var texts = chartContainer.selectAll("text")
        //     .data(data, d => d.key);

        // texts.enter()
        //     .append('text')
        //     .attr('x', (d) => xScale(d.value) + 20)
        //     .attr('y', (d)=> yScale(d.key))
        //     .style('font-size', 14)
        //     .merge(texts)
        //     .transition()
        //     .duration(1000)
        //     .attr('x', (d) => xScale(d.value) + 20)
        //     .attr('y', (d)=> yScale(d.key) + yScale.bandwidth()/2 + 2)
        //     .attr('fill', 'black')
        //     .attr('text-anchor','start')
        //     .text(d=> d.key + " " + d.value);

        var texts = chartContainer.selectAll("foreignObject")
            .data(data, d => d.key);

        texts.enter()
            .append('foreignObject')
            .html((d)=>{
                return `
                    <div style="background-color:white;">
                       <span style="font-size:14px"> ${d.key} </span>
                    </div>
                `;
            })
            .attr('x', (d) => xScale(d.value) + 20)
            .attr('y', (d)=> yScale(d.key))
            .attr('transform', 'translate(0,-13)')
            .attr("width", 100)
            .attr("height", yScale.bandwidth())
            .merge(texts)
            .transition()
            .duration(1000)
            .attr('x', (d) => xScale(d.value) + 20)
            .attr('y', (d)=> yScale(d.key) + yScale.bandwidth()/2 + 2)

        //texts.exit().remove();
    }

    renderData(dataForChar);
    var arr = parsedData[0]["values"];
    for(var item of arr){
        await new Promise(resolve => setTimeout(() => resolve(),1000));
        renderData(item["values"]);
    }
}