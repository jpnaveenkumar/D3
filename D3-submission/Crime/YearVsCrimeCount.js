// function renderYearVsCrimeCount(data) {
//     render(data);
// }

function transformDataForYearVsCount(data)
{
    var yearVsCount = {};
    for(row of data){
        let year = row['year'];
        let classified1 = row['level_1'];
        let value = row['value'];
        if(classified1.indexOf("Total") != -1){
            if( year in yearVsCount){
                yearVsCount[year] = yearVsCount[year] + parseFloat(value);
            }else{
                yearVsCount[year] = parseFloat(value);
            }
        }
    }
    let yearVsCountAr = [];
    for(key of Object.keys(yearVsCount)){
        let obj = {
            "year" : key,
            "count" : yearVsCount[key]
        };
        yearVsCountAr.push(obj);
    }
    console.log(yearVsCountAr);
    renderYearVsCrimeCount(yearVsCountAr);
}

function renderYearVsCrimeCount(data)
{   
    const width = 700;
    const height = 350;
    const margin = {
        'top' : 70,
        'left' : 100,
        'right' : 100,
        'bottom' : 100
    };
    const svg = d3.select('.YearCrime');
    const chartContainer = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('class', 'holder');

    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(data.map(obj => obj.year))
        .padding(0.3)

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0,d3.max(data, d => d.count) + 100]);

    chartContainer.append('g')
        .attr('class', 'y-axis')
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickPadding([10])
        );

    d3.select('.y-axis .domain').remove();

    chartContainer.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale)
            .tickPadding([10])
        );

    chartContainer.append('text')
        .attr('class', 'x-axis-legend')
        .attr('transform', `translate( ${width/2 - 20}, ${height + 50})`)
        .text("Year")

    chartContainer.append('text')
        .attr('class', 'y-axis-legend')
        .attr('transform', `rotate(-90)`)
        .attr('x', -height/2 - 30)
        .attr('y', -60)
        .text("Crime count")

    chartContainer.selectAll()
        .data(data)
        .enter()
        .append('rect')
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseLeave)
        .attr('x', (d) => xScale(d.year))
        .attr('y', (d) => yScale(d.count))
        .attr('fill', '#3f51b5')
        .attr('width', xScale.bandwidth())
        .transition()
        .duration(2000)
        .delay((d,i)=>{
            return 100*i;
        })
        .attr('height', (d) => height - yScale(d.count))
        
    function onMouseOver(d, i)
    {
        d3.select(this).attr('fill', '#7986cb')
        chartContainer
            .append("text")
            .attr('class', 'value')
            .attr('x', xScale(d.year) + 10)
            .attr('y', yScale(d.count) - 10)
            .text(d.count)

        chartContainer
            .append("text")
            .attr('class', 'desc')
            .attr('x', 150)
            .attr('y', -30)
            .text(`Criminal Cases count in the year ${d.year} is ${d.count}`)
    }

    function onMouseLeave(d, i)
    {
        d3.select(this).attr('fill', '#3f51b5')
        chartContainer.selectAll('.value')
            .remove()
        chartContainer.selectAll('.desc')
        .remove()
    }
}