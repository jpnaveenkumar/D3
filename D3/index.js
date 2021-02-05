var appData = [
    {
        "country" : "China",
        "population" : 1415046
    },
    {
        "country" : "India",
        "population" : 1354052
    },
    {
        "country" : "United States",
        "population" : 326767
    },
    {
        "country" : "Indonesia",
        "population" : 266795
    }
];

const margin = 60;
const width = 1000 - 2 * margin;
const height = 600 - 2 * margin;

const svg = d3.select('svg');
const chart = svg.append('g')
    .attr('transform', `translate(${margin}, ${margin})`);

const yScale = d3.scaleLinear()
.range([400, 0])
.domain([0, d3.max(appData, d => d.population)]);

// const yScale = d3.scaleBand()
//     .range([400, 0])
//     .domain(appData.map((s) => s.country))

chart.append('g')
    .call(d3.axisLeft(yScale));

const xScale = d3.scaleBand()
    .range([0, width])
    .domain(appData.map((s) => s.country))
    .padding(0.2)

// const xScale = d3.scaleLinear()
//     .range([0, width])
//     .domain([0, d3.max(appData, d => d.population)]);

chart.append('g')
    .attr('transform', `translate(0, 400)`)
    .call(d3.axisBottom(xScale));

chart.selectAll()
    .data(appData)
    .enter()
    .append('rect')
    //  .attr('x', (d) => xScale(d.population))
    // .attr('y', (d) => yScale(d.country))
    // .attr('width', (d) => xScale(d.population))
    // .attr('height', yScale.bandwidth())
        .attr('x', (d) => xScale(d.country))
        .attr('y', (d) => yScale(d.population))
        .attr('width', xScale.bandwidth()/2)
        .attr('height', (d) => height - yScale(d.population) - 100)
        .attr("fill", "red")
    
        chart.selectAll()
        .data(appData)
        .enter().append("text")
    .attr('x', (d) => xScale(d.country) + 10)
    .attr('y', (d) => yScale(d.population) - 10)
    .attr('fill', 'black')
    .text(d => d.population)    

    chart.selectAll()
    .data(appData)
    .enter()
    .append('rect')
    //  .attr('x', (d) => xScale(d.population))
    // .attr('y', (d) => yScale(d.country))
    // .attr('width', (d) => xScale(d.population))
    // .attr('height', yScale.bandwidth())
    .attr('x', (d) => xScale(d.country) + (xScale.bandwidth()/2) + 10)
    .attr('y', (d) => yScale(d.population))
    .attr('width', xScale.bandwidth() / 2 )
    .attr('height', (d) => height - yScale(d.population) - 100)
    .attr("fill", "blue")