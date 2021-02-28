function transformForGenderVsCount(data)
{
    var yearVsCountMale = {};
    var yearVsCountFemale = {};

    for(row of data){
        let year = row['year'];
        let classified1 = row['level_1'];
        let value = row['value'];
        if(classified1.indexOf("Male") != -1){
            if( year in yearVsCountMale){
                yearVsCountMale[year] = yearVsCountMale[year] + parseFloat(value);
            }else{
                yearVsCountMale[year] = parseFloat(value);
            }
        }
        if(classified1.indexOf("Female") != -1){
            if( year in yearVsCountFemale){
                yearVsCountFemale[year] = yearVsCountFemale[year] + parseFloat(value);
            }else{
                yearVsCountFemale[year] = parseFloat(value);
            }
        }
    }
    let yearVsCountMaleAr = [];
    for(key of Object.keys(yearVsCountMale)){
        let obj = {
            "year" : key,
            "count" : yearVsCountMale[key]
        };
        yearVsCountMaleAr.push(obj);
    }
    let yearVsCounFemaleAr = [];
    for(key of Object.keys(yearVsCountFemale)){
        let obj = {
            "year" : key,
            "count" : yearVsCountFemale[key]
        };
        yearVsCounFemaleAr.push(obj);
    }
    console.log(yearVsCountMaleAr);
    console.log(yearVsCounFemaleAr);
    render(yearVsCountMaleAr, yearVsCounFemaleAr);
}

function render(maleData, femaleData)
{
    const width = 700;
    const height = 350;
    const margin = {
        'top' : 100,
        'left' : 100,
        'right' : 100,
        'bottom' : 100
    };
    const svg = d3.select('.GenderCrime');

    const legend = svg.append('foreignObject')
        .attr('x', margin.left)
        .attr('y', 60)
        .attr("width", width)
        .attr("height", 40)
        .html(function(){
            return `
                <div style="display:flex;justify-content:space-evenly">
                    <div style="width:${width-150}px;display:flex;justify-content:center">
                        <p id="genderCrimeDesc"></p>
                    </div>
                    <div style="display:flex;flex-direction:column">
                        <div style="display:flex;align-items:center;">
                            <div style="height:10px;width:10px;background-color:#009688"></div>
                            <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Male Crime </span>
                        </div>
                        <div style="display:flex;align-items:center;">
                            <div style="height:10px;width:10px;background-color:#ab47bc"></div>
                            <span style="margin-left:10px;color:#635F5D;font-weight:bold"> Female Crime  </span>
                        </div> 
                    </div>
                </div>
            `;
        });

    const chartContainer = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`)
        .attr('class', 'holder');
    
    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(maleData.map(obj => obj.year))
        .padding(0.3)

    const yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0,d3.max(maleData, d => d.count) + 1000]);

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
            .tickSize(-height + 20)
            .tickPadding([15])
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

    const malePath = chartContainer.append("path")
        .datum(maleData)
        .attr('transform', `translate(${xScale.bandwidth()/2},0)`)
        .attr("fill", "none")
        .attr("stroke", "#009688")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return xScale(d.year) })
          .y(function(d) { return yScale(d.count) })
        )

    chartContainer.selectAll()
        .data(maleData)
        .enter()
        .append('circle')
        .attr('class', 'maleCircle')
        .on('mouseover', onMouseOverCircle)
        .on('mouseout', onMouseLeaveCircle)
        .attr('cx', (d) => xScale(d.year) + xScale.bandwidth()/2)
        .attr('cy', (d) => yScale(d.count))
        .attr('r', 5)
        .attr('fill','#009688')

    const transitionPath = d3
        .transition()
        .ease(d3.easeSin)
        .duration(2500);

    const malePathLength = malePath.node().getTotalLength();    

    malePath
        .attr("stroke-dashoffset", malePathLength)
        .attr("stroke-dasharray", malePathLength)
        .transition(transitionPath)
        .attr("stroke-dashoffset", 0);

    const femalePath = chartContainer.append("path")
        .datum(femaleData)
        .attr('transform', `translate(${xScale.bandwidth()/2},0)`)
        .attr("fill", "none")
        .attr("stroke", "#ab47bc")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function(d) { return xScale(d.year) })
          .y(function(d) { return yScale(d.count) })
        )

    chartContainer.selectAll()
        .data(femaleData)
        .enter()
        .append('circle')
        .on('mouseover', onMouseOverCircle)
        .on('mouseout', onMouseLeaveCircle)
        .attr('cx', (d) => xScale(d.year) + xScale.bandwidth()/2)
        .attr('cy', (d) => yScale(d.count))
        .attr('r', 5)
        .attr('fill','#ab47bc')
    
    const femalePathLength = femalePath.node().getTotalLength();  

    femalePath
        .attr("stroke-dashoffset", femalePathLength)
        .attr("stroke-dasharray", femalePathLength)
        .transition(transitionPath)
        .attr("stroke-dashoffset", 0);

    function onMouseOverCircle(d, i)
    {
        chartContainer
            .append('text')
            .attr('class', 'circleDesc')
            .attr('x', xScale(d.year) + 10)
            .attr('y', yScale(d.count) - 15)
            .text(d.count)
        
        let content =  `The committed crime in the year ${d.year} is ${d.count}`;
        document.getElementById("genderCrimeDesc").innerHTML = content;
    }

    function onMouseLeaveCircle(d, i)
    {
        d3.select('.circleDesc').remove();
        document.getElementById("genderCrimeDesc").innerHTML = " ";
    }
}