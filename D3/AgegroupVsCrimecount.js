var transformedCrimeDataForPieChart;
var svgContainerForPieChart;
function transformDataForAgegroupVsCrimeCount(data)
{
    var fiteredData = data.filter( d => d["level_1"].indexOf("Total") != -1 );
    var crimeCountByAge = d3.nest()
                            .key((d)=>d.year)
                            .key((d)=>d.level_2)
                            .rollup(d=>d3.sum(d, d1=>parseInt(d1.value)))
                            .entries(fiteredData);
    console.log(crimeCountByAge);
    transformedCrimeDataForPieChart = crimeCountByAge;
    var dataForPie = getAgeGroupDataBetweenRange(2011,2011,crimeCountByAge);
    renderAgegroupVsCrimeCount(dataForPie);
}

function getAgeGroupDataBetweenRange(startYear, endYear, data)
{
    var startYear = parseInt(startYear);
    var endYear = parseInt(endYear)
    if(startYear > endYear){
        alert('start year should be less than end year');
        return -1;
    }
    var result = {
        "Above 21 Years Old": 0,
        "21 Years Old And Below": 0,
        "Youths (7 To 19 Years Old)":0
    };
    for(var datum of data){
        var curYear = parseInt(datum["key"]);
        if(curYear >= startYear && curYear <= endYear){
            var values = datum["values"];
            for(var value of values){
                result[value["key"]] = result[value["key"]] + value["value"];
            }
        }
    }
    console.log(result);
    return result;
}

function updatePieChart()
{
    var startYear = document.getElementById("startYearPie").value;
    var endYear = document.getElementById("endYearPie").value;
    var dataForPie = d3.entries(getAgeGroupDataBetweenRange(startYear,endYear,transformedCrimeDataForPieChart));
    var pie = d3.pie()
                .value(d => d.value);
    var pieWithData = pie(dataForPie);
    renderAgegroupVsCrimeCountBaseChart(pieWithData);
}

function renderAgegroupVsCrimeCount(data)
{
    const margin = {
        'top' : 250,
        'left' : 250,
        'right' : 100,
        'bottom' : 100
    };

    var dataForPie = d3.entries(data);
    
    var svg = d3.select(".ageGroupCrime");
    svgContainerForPieChart = svg.append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

    const innerCircleLegend = svgContainerForPieChart.append("circle")
        .attr('class','innerCircleLegend')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 80)
        .attr('fill', 'none');

    svgContainerForPieChart.append('foreignObject')
        .attr('x',-40)
        .attr('y', -40)
        .attr('width', 80)
        .attr('height', 80)
        .html(function(){
            return  `
                <div class="innerCircleLegendText">
                    Age Group Vs Crime Count
                </div>
            `;
        });

    const legend = svg.append('foreignObject')
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
                        <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Above 21 Years Old </span>
                    </div>
                    <div style="display:flex;align-items:center;">
                        <div style="height:10px;width:10px;background-color:#ff7f0e"></div>
                        <span style="margin-left:10px;color:#635F5D;font-weight:bold"> 21 Years Old And Below  </span>
                    </div> 
                    <div style="display:flex;align-items:center;">
                        <div style="height:10px;width:10px;background-color:#2ca02c"></div>
                        <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Youths (7 To 19 Years Old) </span>
                    </div> 
                </div>
            </div>
        `;
    });

    var pie = d3.pie()
                .value(d => d.value);
    var pieWithData = pie(dataForPie);
    renderAgegroupVsCrimeCountBaseChart(pieWithData);
}

function renderAgegroupVsCrimeCountBaseChart(pieWithData)
{

    var domainVsColorStroke = {
        "Above 21 Years Old" : "#1f77b4",
        "21 Years Old And Below" : "#ff7f0e",
        "Youths (7 To 19 Years Old)" : "#2ca02c"
    };

    var colorStrokeVsFillColor = {
        "#1f77b4" : "#1f77b454",
        "#ff7f0e" : "#ff7f0e54",
        "#2ca02c" : "#2ca02c54"
    };

    var color = d3.scaleOrdinal()
        .domain(["Above 21 Years Old",
        "21 Years Old And Below",
        "Youths (7 To 19 Years Old)"])
        .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);
    
    var arcProducer = d3.arc()
        .innerRadius(100)
        .outerRadius(200);
    
    var pieChart = svgContainerForPieChart.selectAll("path")
        .data(pieWithData);

    pieChart.exit().remove();
    
    pieChart.enter()
        .append("path")
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseLeave)
        .merge(pieChart)
        .transition()
        .duration(2000)
        .attr('d', arcProducer)
        .attr('fill', function(d){ return(color(d.data.key)) })
        .attr("stroke", "white")
        .style("stroke-width", "3px")
        .style("opacity", 1)

    pieChart = svgContainerForPieChart.selectAll("text")
        .data(pieWithData);

    pieChart.exit().remove();

    pieChart.enter()
        .append("text")
        .merge(pieChart)
        .text(function(d){ return d.data.value + " crimes"})
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

        let domain = d.data.key;
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
        document.getElementsByClassName('innerCircleLegendText')[0].innerHTML = "Age Group Vs Crime Count";
    }
}