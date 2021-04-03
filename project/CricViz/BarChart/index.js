var metaForBarChart = {
    "currentGameFormat" : "ODI",
    "availableGameFormat" : ["ODI","TEST"],
    "currentChartType" : "Top Batsmen",
    "availableChartType" : [ "Top Batsmen", "Top Bowler"],
    "startDate" : "1983/05/21",
    "endDate" : "2019/11/11",
    "limit" : "20",
    "availableLimits" : [10, 50, 100],
    "baseURL" : "http://localhost:7777/",
    "odiCricketDatasetURL" : "Men ODI Player Innings Stats filtered.csv",
    "testCricketDatasetURL" : "Men Test Player Innings Stats filtered.csv",
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
    },
    "teamColor" : {
        "Sri Lanka": "#15295e",
        "Pakistan": "#006629",
        "South Africa": "#006651",
        "Australia": "#ffe000",
        "India": "#2255A4",
        "New Zealand": "#000000",
        "England": "#15295e",
        "Bangladesh": "#006A4D",
        "Zimbabwe": "#b40224",
        "West Indies": "#7B0041",
        "Kenya": "#006628",
        "Afghanistan": "#0033ee",
        "Ireland": "#0033ee"
    },
    "isTeamLegendLoaded" : false,
}

String.prototype.capitalize = function(){
    let result = [];
    for(let word of this.split("_")){
        result.push(word.charAt(0).toUpperCase() + word.slice(1))
    }
    return result.join(" ");
}

function getCurData(){
    return metaForBarChart["currentGameFormat"] == "ODI" ? metaForBarChart["odiData"] : metaForBarChart["testData"];
}

function renderBarChar(data){
    let key = metaForBarChart["currentChartType"] == "Top Batsmen" ? "total_runs_scored" : "total_wickets_taken";
    const zScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(data.map(d => d["value"]["country"]));

    console.log(new Set(data.map(d => d["value"]["country"])));

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
        .on('click', onPlayerClick)
        .attr('class', 'myrect')
        .merge(rects)
        .attr('x', 5)
        .transition()
        .duration(2000)
        .attr('y', (d)=> yScale(d.key) + 5)
        .attr('height', metaForBarChart["barWidth"] - 5)
        .attr('width', (d) => xScale(d["value"][key]))
        .attr('fill',d => metaForBarChart["teamColor"][d["value"]["country"]])

    function onPlayerClick(d)
    {
        renderPlayerInfo(d);
    }
    renderPlayerInfo(data[0]);
}

function renderPlayerInfo(d)
{
    let html = '<div id="playerDescription">';
    $("#playerDescriptionContainer #playerDescription").remove();
    let playerName = d['key'];
    let playerDesc = Object.assign({},d['value']);
    let keys = Object.keys(playerDesc);
    playerDesc['player_name'] = playerName;
    keys.splice(0,0, 'player_name');
    keys.forEach((key, index) =>{
        html += `
            <div class="magnifier" style="padding:5px; display:flex; justify-content: space-between; background-color: ${ index % 2 == 0 ? '#dadada' : 'white'}">
                <div style="color:#635F5D">${key.capitalize()}</div>
                <div style="color:#635F5D; font-weight: 600">${playerDesc[key]}</div>
            </div>
        `;
    });
    html += `
    <div class="magnifier" style="padding:5px; display:flex; justify-content: space-between; background-color: ${ keys.length % 2 == 0 ? '#dadada' : 'white'}">
                <div style="color:#635F5D">Team Jersey Colour</div>
                <div style='margin:5px;height:12px; width: 12px; background-color: ${metaForBarChart.teamColor[playerDesc['country']]}'></div>
            </div>
        `;
    html += '</div>';
    $("#playerDescriptionContainer").append(html);
}

function renderTeamsLegend()
{
    let html = '<div style="display:grid; grid-template-columns : auto auto">';
    let teamColors = metaForBarChart['teamColor'];
    for(let team of Object.keys(teamColors)){
        html += `
            <div style="display:grid; grid-template-columns: 100px 50px; justify-content:center">
                <div class="teamName"> ${team} </div>
                <div style='margin:5px;height:12px; width: 12px; background-color: ${teamColors[team]}'></div>
            </div>
        `;
    }
    html += '</div>';
    $("#teamColorLegendContainer").append(html);
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
                if((!dates.includes(row["Innings Date"] + "-" + row["Innings Number"]))){
                    refined.push(row);
                    dates.push(row["Innings Date"] + "-" + row["Innings Number"]);
                }
            }
            refined = d1;

            return {
                "country" : d1[0]["Country"],
                "total_runs_scored" : d3.sum(d1, d2 => parseInt(d2["Innings Runs Scored Num"])),
                "total_balls_faced" : d3.sum(d1, d2 => parseInt(d2["Innings Balls Faced"])),
                "total_matches_played" : d1.length,
                "50_count" : d3.sum(d1, d2 => parseInt(d2["50's"])),
                "100_count" : d3.sum(d1, d2 => parseInt(d2["100's"])),
                "total_4_count" : d3.sum(d1, d2 => parseInt(d2["Innings Boundary Fours"])),
                "total_6_count" : d3.sum(d1, d2 => parseInt(d2["Innings Boundary Sixes"])),
                "not_out_count" : d3.sum(d1, d2 => parseInt(d2["Innings Not Out Flag"])),
            };
        })
        .entries(curData);
        result = result.sort((a,b) => d3.descending(a["value"]["total_runs_scored"],b["value"]["total_runs_scored"]));
        loadLegend("Total Runs Scored", "Player Name");
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
        result = result.sort((a,b) => d3.descending(a["value"]["total_wickets_taken"],b["value"]["total_wickets_taken"]));
        loadLegend("Total Wickets Taken", "Player Name");
    }
    if(!metaForBarChart.isTeamLegendLoaded){
        renderTeamsLegend();
        metaForBarChart.isTeamLegendLoaded = true;
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
                $("#LoadingSection").css('display','none');
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
                $("#LoadingSection").css('display','none');
            });
        }else{
            handlerForBarChart();
        }
    }
}

function loadLegend(xAxis, YAxis)
{
    metaForBarChart["chartContainer"].select('.x-axis-legend').remove();
    metaForBarChart["chartContainer"].select('.y-axis-legend').remove();

    metaForBarChart["chartContainer"].append('text')
        .attr('class', 'x-axis-legend')
        .attr('transform', `translate( ${metaForBarChart['width']/2 - 30}, -45)`)
        .text(xAxis)

        metaForBarChart["chartContainer"].append('text')
        .attr('class', 'y-axis-legend')
        .attr('transform', `rotate(-90)`)
        .attr('x', -metaForBarChart['height']/2 - 30)
        .attr('y', -120)
        .text(YAxis)
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

function loadCSS()
{
    $(".input-field .select-wrapper input").addClass("inputText");
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
    loadCSS();
});