function transformDataForCrimeVsCount(data)
{
    var crimeVsCount = [
        {
            "category" : "Total Persons Arrested For Murder",
            "displayName" : "Murder",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Rape",
            "displayName" : "Rape",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Outrage Of Modesty",
            "displayName" : "Molestation",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Robbery",
            "displayName" : "Robbery",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Housebreaking",
            "displayName" : "Housebreaking",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Theft Of Motor Vehicle",
            "displayName" : "Theft of Vehicle",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Snatch Theft",
            "displayName" : "Snatch Theft",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Rioting",
            "displayName" : "Rioting",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Serious Hurt",
            "displayName" : "Serious Hurt",
            "count" : 0
        },
        {
            "category" : "Total Persons Arrested For Cheating & Related",
            "displayName" : "Cheating & Related",
            "count" : 0
        }
    ];

    for(row of data){
        let category = row["level_1"];
        let value = row["value"];
        for(crime of crimeVsCount){
            if(category == crime["category"]){
                crime["count"] = crime["count"] + parseInt(value);
                break;
            }
        }
    }

    let dataset = {
        "children" : crimeVsCount
    };

    console.log(crimeVsCount);
    renderCrimeVsCount(dataset);
}

function renderCrimeVsCount(data)
{
    var diameter = 600;
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    var bubble = d3.pack(data)
        .size([diameter, diameter])
        .padding(20);
    
    var svg = d3.select('.bubbleChart');
    var nodes = d3.hierarchy(data)
        .sum(d => d.count);
    var node = svg.selectAll(".node")
        .data(bubble(nodes).descendants())
        .enter()
        .filter(function(d){
            return  !d.children
        })
        .append("g")
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseLeave)
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    node.append("circle")
    .transition()
    .duration(2000)
    .attr("r", function(d) {
        return d.r;
    })
    .style("fill", function(d,i) {
        return color(i);
    });

    node.append("text")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.displayName;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", function(d){
            return d.r/5;
        })
        .attr("fill", "white");

    node.append("text")
        .attr('y', d => d.r * 0.45)
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.data.count;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", function(d){
            return d.r/5;
        })
        .attr("fill", "white");

    function getCrimePercent(count)
    {
        let total = 0;
        for(crime of data["children"]){
            total = total + crime["count"];
        }
        return count/total * 100;
    }

    function onMouseOver(d,i)
    {

        let radius = d.r;

        d3.select(this).select('circle')
            .transition()
            .duration(200)
            .attr('r', radius + 10);

        d3.select(this).selectAll('text')
            .transition()
            .duration(200)
            .style('font-size', radius/5 + 5);

        let percent = getCrimePercent(d.data.count);
        let content =  `The committed crime ${d.data.displayName} is ${percent} %`;
        document.getElementById("bubbleChatDesc").innerHTML = content;
    }

    function onMouseLeave(d,i)
    {
        let radius = d.r;

        d3.select(this).select('circle')
            .transition()
            .duration(100)
            .attr('r', d.r);

        d3.select(this).selectAll('text')
            .transition()
            .duration(100)
            .style('font-size', radius/5);

        document.getElementById("bubbleChatDesc").innerHTML = "";
    }
}