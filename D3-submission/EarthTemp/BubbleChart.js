var metaForBubbleChart = {};
function transformDataForBubbleChart(rawData)
{
    console.log(rawData);
    metaForBubbleChart["data"] = d3.nest().key(d => d["Hemisphere"]).entries(rawData);
    renderBubbleChartInterceptor();
}

function renderBubbleChartInterceptor()
{
    metaForBubbleChart['chartContainer'] = d3.select(".BubbleChart");
    metaForBubbleChart['diameter'] = 700;
    metaForBubbleChart['color'] = d3.scaleOrdinal(d3.schemeCategory20);
    handlerForBubbleChart("Global");
}

function updateBubbleChart()
{
    var hemisphere = $("#hemisphereDropdownBubbleChart").val();
    d3.selectAll(".BubbleChart g").remove();
    d3.selectAll(".BubbleChart text").remove();
    handlerForBubbleChart(hemisphere);
}

function getNormalizedValue(curValue, data)
{
    let curdata = data;
    let extend = d3.extent(curdata, d => parseFloat(d["J-D"]));
    let r = (parseFloat(curValue) - parseFloat(extend[0])) / (parseFloat(extend[1]) - parseFloat(extend[0]));
    return parseInt((r * 10) + 1);
}

function handlerForBubbleChart(hemisphere)
{
    let curdata;
    for(var row of metaForBubbleChart['data']){
        if(row["key"] ==  hemisphere){
            for(var cur of row["values"]){
                cur["dest"] = getNormalizedValue(cur["J-D"], row["values"]);
            }
            curdata = row["values"];
            break;
        }
    }
    let dataset = {
        "children" : curdata
    };
    renderBubbleChart(dataset);
}

function renderBubbleChart(data)
{
    let bubble = d3.pack(data)
        .size([metaForBubbleChart['diameter'], metaForBubbleChart['diameter']])
        .padding(20);

    let nodes = d3.hierarchy(data)
        .sum(d => d["dest"]);
    
    let node = metaForBubbleChart['chartContainer'].selectAll('.bubbles')
        .data(bubble(nodes).descendants())
        .enter()
        .append("g")
        .on('mouseover', onMouseOver)
        .on('mouseout', onMouseLeave)
        .attr("class", "bubbles")
        .attr("transform", function(d) {
            return `translate(${d.x},${d.y})`;
        });

    node.append("circle")
            .transition()
            .duration(2000)
            .style("fill", function(d,i) {
                var color = metaForBubbleChart['color'](i);
                if(i != 0 && color == "#1f77b4")
                    color = "#1f45b4";
                return  color;
            })
            .attr("r", function(d) {
                return d.r;
            });

    setTimeout(function(){
        node.append("text")
            .attr('y', d => d.r * 0.3)
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Year;
            })
            .attr("font-family", "sans-serif")
            .transition()
            .duration(500)
            .attr("font-size", function(d){
                return d.r/1.8;
            })
            .attr("fill", "white");
    }, 1000);
    
    function onMouseOver(d, i)
    {
        if(i == 0)
            return;
        var html = "<div class='BubbleChartLegend' style='display:grid; grid-template-columns: auto auto auto; grid-gap: 20px; justify-content: space-evenly; align-content:center;'>";
        var keys = Object.keys(d.data);
        keys.pop("dest");
        for(let key of keys){
            html+= "<div>";
                html+= `<span style='font-weight:bold'>${key} </span> <span>: ${d.data[key]}</span>`;
            html+= "</div>";
        }
        html+= "</div>";
        $("#BubbleChartContainer").append(html);
    }

    function onMouseLeave(d, i)
    {
        if(i == 0)
            return;
        $(".BubbleChartLegend").remove();
    }
}