var metaForBarChart = {
    "currentGameFormat" : "ODI",
    "availableGameFormat" : ["ODI","TEST"],
    "currentChartType" : "Top Batsmen",
    "availableChartType" : [ "Top Batsmen", "Top Bowler"],
    "startDate" : "1993/05/21",
    "endDate" : "2019/11/11",
    "limit" : "20",
    "availableLimits" : [10, 50, 100],
    "baseURL" : "http://localhost:7777/",
    "odiCricketDatasetURL" : "Men ODI Player Innings Stats.csv",
    "testCricketDatasetURL" : "Men Test Player Innings Stats.csv",
    "odiData" : null,
    "testData" : null,
    "width" : "700",
    "height" : "500",
    "barWidth" : "20",
    "margin" : {
        'top' : 100,
        'left' : 150,
        'right' : 100,
        'bottom' : 100
    }
}

function getCurData(){
    return metaForBarChart["currentGameFormat"] == "ODI" ? metaForBarChart["odiData"] : metaForBarChart["testData"];
}

function renderBarChar(data){
    console.log("rendering.....");
    let key = metaForBarChart["currentChartType"] == "Top Batsmen" ? "total_runs_scored" : "total_wickets_taken";
    const zScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d["value"]["country"]));

    const raiseLimit = metaForBarChart["currentChartType"] == "Top Batsmen" ? 2000 : 100;

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d1 => d1["value"][key]) + raiseLimit])
        .range([0, metaForBarChart["width"]]);

    metaForBarChart['xAxisContainer']
        .transition()
        .duration(1000)
        .call(d3.axisTop(xScale)
            .tickPadding([10])
        );  

    const yScale = d3.scaleBand()
        .domain(data.map(d => d.key))
        .range([0,metaForBarChart["height"]]);

    metaForBarChart['yAxisContainer']
        .call(d3.axisLeft(yScale)
            .tickPadding([10])
        );
    var rects = metaForBarChart["chartContainer"].selectAll(".myrect")
        .data(data, d => d.key);

    rects.exit().remove();

    rects.enter()
        .append("rect")
        .attr('class', 'myrect')
        .merge(rects)
        .attr('x', 5)
        .transition()
        .duration(2000)
        .attr('y', (d)=> yScale(d.key) + 5)
        .attr('height', metaForBarChart["barWidth"] - 5)
        .attr('width', (d) => xScale(d["value"][key]))
        .attr('fill', d => zScale(d["value"]["country"]));

}

function handlerForBarChart(){
    let curData = getCurData();
    curData = curData.filter(row => {
        let startDate = new Date(metaForBarChart["startDate"]);
        let endDate = new Date(metaForBarChart["endDate"]);
        let curDate = new Date(row["Innings Date"]);
        return curDate >= startDate && curDate <= endDate;
    });
    let result 
    if(metaForBarChart["currentChartType"] == "Top Batsmen"){
        result = d3.nest().key(d => d["Innings Player"])
        .rollup(d1 => {

            if(d1[0]["Innings Player"] == "V Kohli"){
                console.log(d1);
            }

            let dates = [];
            let refined = [];
            for(let row of d1){
                if((!dates.includes(row["Innings Date"] + "-" + row["Innings Number"])) && row["Innings Runs Scored"] != ""){
                    refined.push(row);
                    dates.push(row["Innings Date"] + "-" + row["Innings Number"]);
                }
            }

            return {
                "country" : d1[0]["Country"],
                "total_runs_scored" : d3.sum(refined, d2 => parseInt(d2["Innings Runs Scored Num"])),
                "total_balls_faced" : d3.sum(refined, d2 => parseInt(d2["Innings Balls Faced"])),
                "total_matches_played" : refined.length,
                "50_count" : d3.sum(refined, d2 => parseInt(d2["50's"])),
                "100_count" : d3.sum(refined, d2 => parseInt(d2["100's"])),
                "total_4_count" : d3.sum(refined, d2 => parseInt(d2["Innings Boundary Fours"])),
                "total_6_count" : d3.sum(refined, d2 => parseInt(d2["Innings Boundary Sixes"])),
                "not_out_count" : d3.sum(refined, d2 => parseInt(d2["Innings Not Out Flag"])),
            };
        })
        .entries(curData);
        result = result.sort((a,b) => d3.descending(a["value"]["total_runs_scored"],b["value"]["total_runs_scored"]))
    }
    else if(metaForBarChart["currentChartType"] == "Top Bowler"){
        result = d3.nest().key(d => d["Innings Player"])
        .rollup(d1 => {

            if(d1[0]["Innings Player"] == "M Muralitharan"){
                console.log(d1);
            }

            let dates = [];
            let refined = [];
            for(let row of d1){
                if((!dates.includes(row["Innings Date"] + "-" + row["Innings Number"])) && row["Innings Wickets Taken"] != ""){
                    refined.push(row);
                    dates.push(row["Innings Date"] + "-" + row["Innings Number"]);
                }
            }
            return {
                "country" : d1[0]["Country"],
                "total_economy_rate" : d3.sum(refined, d2 => parseInt(d2["Innings Economy Rate"])),
                "total_runs_conceded" : d3.sum(refined, d2 => parseInt(d2["Innings Runs Conceded"])),
                "total_matches_played" : refined.length,
                "total_wickets_taken" : d3.sum(refined, d2 => parseInt(d2["Innings Wickets Taken"])),
                "total_overs_bowled" : d3.sum(refined, d2 => parseInt(d2["Innings Overs Bowled"])),
                "total_4_wickets" : d3.sum(refined, d2 => parseInt(d2["4 Wickets"])),
                "total_5_wickets" : d3.sum(refined, d2 => parseInt(d2["5 Wickets"])),
                "total_10_wickets" : d3.sum(refined, d2 => parseInt(d2["10 Wickets"])),
            };
        })
        .entries(curData);
        result = result.sort((a,b) => d3.descending(a["value"]["total_wickets_taken"],b["value"]["total_wickets_taken"]))
    }
    renderBarChar(result.slice(0,metaForBarChart["limit"]));
}

function loadData(){
    if(metaForBarChart["currentGameFormat"] == "ODI"){
        if(metaForBarChart["odiData"] == null){
            let url = metaForBarChart["baseURL"] + metaForBarChart["odiCricketDatasetURL"];
            d3.csv(url, function(data){
                metaForBarChart["odiData"] = data;
                handlerForBarChart();
            });
        }else{
            handlerForBarChart();
        }
    }else if(metaForBarChart["currentGameFormat"] == "TEST"){
        if(metaForBarChart["testData"] == null){
            let url = metaForBarChart["baseURL"] + metaForBarChart["testCricketDatasetURL"];
            d3.csv(url, function(data){
                metaForBarChart["testData"] = data;
                handlerForBarChart();
            });
        }else{
            handlerForBarChart();
        }
    }
}

function baseChart()
{
    var svg = d3.select(".BarChart");
    metaForBarChart["chartContainer"] = svg.append('g')
        .attr('transform', `translate(${metaForBarChart.margin.left}, ${metaForBarChart.margin.top})`)
        .attr('class', 'holder');
    
    metaForBarChart['xAxisContainer'] = metaForBarChart['chartContainer'].append('g')
                                    
    metaForBarChart['yAxisContainer'] = metaForBarChart['chartContainer'].append('g');


}

function adjustHeight()
{
    let height = metaForBarChart["limit"] * metaForBarChart["barWidth"] + 100;
    d3.select(".BarChart").attr('height', height);
    metaForBarChart["height"] = height - 100;
}

async function loadTestDataAsync()
{
    let url = metaForBarChart["baseURL"] + metaForBarChart["testCricketDatasetURL"];
    d3.csv(url, function(data){
        metaForBarChart["testData"] = data;
    });
}

function init()
{
    baseChart();
    adjustHeight();
    loadData();
    loadTestDataAsync();
}

function onChartTypeChange(instance)
{
    if(metaForBarChart["currentChartType"] != instance.value){
        metaForBarChart["currentChartType"] = instance.value;
    }
    loadData();
}

function onGameFormatChange(instance)
{
    if(metaForBarChart["currentGameFormat"] != instance.value){
        metaForBarChart["currentGameFormat"] = instance.value;
    }
    loadData();
}

function onLimitChange(instance)
{
    if(metaForBarChart["limit"] != instance.value){
        metaForBarChart["limit"] = instance.value;
    }
    adjustHeight();
    loadData();
}

init();

$(document).ready(function(){
    $('#startDate').datepicker({
        minDate: new Date(metaForBarChart["startDate"]),
        defaultDate: new Date(metaForBarChart["startDate"]),
        setDefaultDate: true,
        onSelect: function(time){
          metaForBarChart["startDate"] = time;
        },
        onClose: function(){
            loadData();
        }
      });
    $('#endDate').datepicker({
        defaultDate: new Date(metaForBarChart["endDate"]),
        setDefaultDate: true,
        onSelect: function(time){
            metaForBarChart["endDate"] = time;
        },
        onClose: function(){
            loadData();
        }
    });
    $('select').formSelect();
});