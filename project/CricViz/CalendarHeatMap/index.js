var metaForCalendarChart = {
    "currentGameFormat" : "ODI",
    "availableGameFormat" : ["ODI","TEST"],
    "currentChartType" : "Top Batsmen",
    "availableChartType" : [ "Top Batsmen", "Top Bowler"],
    "startYear" : "2012",
    "endYear" : "2019",
    "limit" : "20",
    "availableLimits" : [10, 50, 100],
    "baseURL" : "http://localhost:7777/",
    "odiCricketDatasetURL" : "Men ODI Team Match Results.csv",
    "testCricketDatasetURL" : "Men Test Team Match Results.csv",
    "odiPlayerDatasetURL" : "Men ODI Player Innings Stats filtered.csv",
    "testPlayerDatasetURL" : "Men Test Player Innings Stats filtered.csv",
    "odiData" : null,
    "testData" : null,
    "odiPlayerData" : null,
    "testPlayerData" : null,
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

function openModal(matches)
{
    if(matches.length == 0)
        return;
    document.body.style.overflow = "hidden";
    var html = `
        <div onclick="closeModal(event)" id="Modal" class="overlay">
            <div class="myModal"> 
                <div style="font-weight:600">
                    Match Date : ${matches[0]["values"][0]["Match Date"]}
                </div>
        `;

    for(let i = 0; i < matches.length; i++){
        html += ` 
            <div style="margin-top:50px">
                Match ${i+1}
            <div>
        `;
        let currentMatch = matches[i]["values"];
        let matchName = matches[i]["key"];
        let winner;
        let ground ;
        let result;
        if(currentMatch.length == 2){
            winner = currentMatch[0]["Result"] == "Won" ? currentMatch[0] : currentMatch[1];
            ground = winner["Ground"];
            result = winner["Country"] + " won by " + winner["Margin"];
        }else{
            ground = currentMatch[0]["Ground"];
            result = currentMatch[0]["Country"] + currentMatch[0]["Result"] + " by " + currentMatch[0]["Margin"];
        }

        html += `
            <table>
                <thead>
                    <tr>
                        <th>Match</th>
                        <th>Ground</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${matchName}</td>
                        <td>${ground}</td>
                        <td>${result}</td>
                    </tr>
                </tbody>
            </table>
        `;

        if(matches[i].hasOwnProperty("achievers")){
            html += `
                <div style="display:flex;justify-content:center;margin-top:20px">
                    <div style="width: 80%">
             `;
            html += `
                <table>
                <thead>
                    <tr>
                        <th>Player</th>
                        <th>Country</th>
                        <th>Records</th>
                    </tr>
                </thead>
                <tbody>
            `;
            for(let achiever of matches[i]["achievers"]){
                let playerName = achiever["Innings Player"];
                let country = achiever["Country"];
                let achievement = "";
                if(achiever["50's"] == "1.0" || achiever["100's"] == "1.0"){
                    achievement = ` ${achiever["Innings Runs Scored"]} runs`;
                }else if(achiever["5 Wickets"] == "1.0" || achiever["10 Wickets"] == "1.0"){
                    achievement = ` ${achiever["Innings Wickets Taken"]} wickets`;
                }   
                html += `
                    <tr>
                        <td>${playerName}</td>
                        <td>${country}</td>
                        <td>${achievement}</td>
                    </tr>
                `;
            }
            html += `
                        </tbody>
                    </table>
                </div>
            </div>
            `;
        }
    }
            
    html += `</div>
        </div>
    `;
    $("body").append(html);
    console.log(matches);
}

function closeModal(event){
    if(event.target.id == "Modal"){
        $("#Modal").remove();
        document.body.style.overflow = "";
    }
}

function loadData(){
    if(metaForCalendarChart["currentGameFormat"] == "ODI"){
        if(metaForCalendarChart["odiData"] == null){
            let url = metaForCalendarChart["baseURL"] + metaForCalendarChart["odiCricketDatasetURL"];
            d3.csv(url).then((data)=>{
                metaForCalendarChart["odiData"] = data;
                handlerForCalendarChart();
                $("#LoadingSection").css('display','none');
            }).catch((err)=>{

            });
        }else{
            handlerForCalendarChart();
        }
    }else if(metaForCalendarChart["currentGameFormat"] == "TEST"){
        if(metaForCalendarChart["testData"] == null){
            let url = metaForCalendarChart["baseURL"] + metaForCalendarChart["testCricketDatasetURL"];
            d3.csv(url).then((data)=>{
                metaForCalendarChart["testData"] = data;
                handlerForCalendarChart();
                $("#LoadingSection").css('display','none');
            }).catch((err)=>{

            });
        }else{
            handlerForCalendarChart();
        }
    }
}

function getCurData(){
    return metaForCalendarChart["currentGameFormat"] == "ODI" ? metaForCalendarChart["odiData"] : metaForCalendarChart["testData"];
}

function getCurPlayerData(){
    return metaForCalendarChart["currentGameFormat"] == "ODI" ? metaForCalendarChart["odiPlayerData"] : metaForCalendarChart["testPlayerData"];
}

function handlerForCalendarChart()
{
    let curData = getCurData();
    let existingDates = [];
    curData.forEach(d => {
        existingDates.push(d["Match Date"]);
    });
    let currentDate = new Date(metaForCalendarChart["startYear"]);
    let endingDate = new Date(metaForCalendarChart["endYear"]);
    endingDate.setFullYear(endingDate.getFullYear()+1);
    while(currentDate <= endingDate){
        let dateString = currentDate.toISOString().substring(0,10).replaceAll("-","/");
        if(existingDates.includes(dateString) == false){
            let obj = {
                "Match Date" : dateString,
                "Match Year" : dateString.substring(0,4),
                "isDummy" : true
            };
            curData.push(obj);
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }
    let data = d3.nest().key(d => d["Match Year"]).entries(curData).sort((a,b) => d3.descending(parseInt(a["key"]), parseInt(b["key"])));
    data = data.filter(entry => {
        return parseInt(entry["key"]) >= metaForCalendarChart["startYear"] &&
        parseInt(entry["key"]) <= metaForCalendarChart["endYear"];
    });
    renderChart(data);
}

function renderChart(data)
{
    let curData = getCurData();  
    let dateVsMatchEntry = d3.nest().key(d => d["Match Date"]).entries(curData);
    let dateVsMatchDict = {};
    let min = 100;
    let max = -1;
    for(let entry of dateVsMatchEntry){
        let value = entry["values"].filter(obj => {
            if(obj.hasOwnProperty("isDummy")){
                return false;
            }
            return true;
        });
        let len = Math.ceil(value.length/2);
        dateVsMatchDict[entry["key"]] = {
            "value" : len,
            "entries" : value
        };
        if(len < min)
            min = len;
        if(len > max)
            max = len;
    }
    const colorFn = d3.scaleSequential(d3.interpolateBuGn).domain([
        Math.floor(min-2),
        Math.ceil(max)
      ]);
    const cellSize = 15
    const yearHeight = cellSize * 7 + 25
    const formatDay = d => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()]
    const countDay = d => d.getUTCDay()
    const timeweek = d3.utcSunday;

    let svgHeight = (metaForCalendarChart["endYear"] - metaForCalendarChart["startYear"] + 1) * yearHeight;
    svgHeight = svgHeight > 0 ? svgHeight : 0;
    d3.select(".CalendarHeatMap")
      .attr("height", svgHeight);

    const svg = d3.select(".CalendarHeatMap")
        .append('g')
        .attr('class', 'heatMapContainer');
    const year = svg.selectAll('g')
        .data(data)
        .join('g')
        .attr('transform', (d, i) => `translate(50, ${yearHeight * i + cellSize * 1.5})`)

    year.append('text')
        .attr('class', 'yearLegend')
        .attr('x', -40)
        .attr('y', -30)
        .attr("text-anchor", "end")
        .attr('font-size', 16)
        .attr('font-weight', 550)
        .attr('transform', 'rotate(270)')
        .text(d => d.key);

    year.append('g')
        .selectAll('rect')
        .data(d => d.values)
        .join('rect')
        .on('mouseover',function(d){
            let x = timeweek.count(d3.utcYear(new Date(d["Match Date"])), new Date(d["Match Date"])) * cellSize + 10;
            let y = countDay( new Date(d["Match Date"])) * cellSize + 0.5;
            d3.select(d3.select(this)._groups[0][0].parentElement)
                .append("foreignObject")
                .attr('class', 'tooltip')
                .attr('x',x - 35)
                .attr('y',y - 30)
                .attr('height', 25)
                .attr('width', 100)
                .html(
                    `
                        <div class="toolTipContainer">
                            ${d["Match Date"]}
                        </div>
                    `
                );
        })
        .on('mouseout',function(d){
            d3.select('.tooltip').remove();
        })
        .on('click',(d)=>{
            let matches = dateVsMatchDict[d["Match Date"]]["entries"];
            let currentPlayersData = getCurPlayerData()
            let achievers = currentPlayersData[d["Match Date"]];
            let groupedByMatch = d3.nest()
                .key(d => d["Match"])
                .entries(matches);
            if(achievers){
                for(let achiever of achievers){
                    for(let group of groupedByMatch){
                        let playerCountry = achiever["Country"].toLowerCase();
                        let countryVsCountry = group["key"].toLowerCase();
                        if(countryVsCountry.includes(playerCountry)){
                            if(group.hasOwnProperty("achievers")){
                                group["achievers"].push(achiever);
                            }else{
                                group["achievers"] = [achiever];
                            }
                        }
                    }
                }
            }
            console.log(achievers);
            console.log(groupedByMatch);
            openModal(groupedByMatch);
        })
        .attr("width", cellSize - 1.5)
        .attr("height", cellSize - 1.5)
        .attr("x", (d, i) => {
            return timeweek.count(d3.utcYear(new Date(d["Match Date"])), new Date(d["Match Date"])) * cellSize + 10
        })
        .attr("y", d => {
            return countDay( new Date(d["Match Date"])) * cellSize + 0.5;
        })
        .attr("fill",d => {
            return colorFn(dateVsMatchDict[d["Match Date"]]["value"]);
        })
}

async function loadTestDataAsync()
{
    let testCricketDatasetUrl = metaForCalendarChart["baseURL"] + metaForCalendarChart["testCricketDatasetURL"];
    let testPlayerDatasetUrl = metaForCalendarChart["baseURL"] + metaForCalendarChart["testPlayerDatasetURL"];
    let odiPlayerDatasetUrl = metaForCalendarChart["baseURL"] + metaForCalendarChart["odiPlayerDatasetURL"];
    
    d3.csv(testCricketDatasetUrl).then((data)=>{
        metaForCalendarChart["testData"] = data;
    });

    d3.csv(testPlayerDatasetUrl).then((data)=>{
        metaForCalendarChart["testPlayerData"] = data;
        metaForCalendarChart["testPlayerData"] = metaForCalendarChart["testPlayerData"].filter(d => {
            if(d["50's"] == "1.0" || d["100's"] == "1.0" || d["5 Wickets"] == "1.0" || d["10 Wickets"] == "1.0"){
                return true;
            }
            return false;
        });
        metaForCalendarChart["testPlayerData"] = d3.nest().key(d => d["Innings Date"]).entries(metaForCalendarChart["testPlayerData"]);
        let obj = {};
        for(let entry of metaForCalendarChart["testPlayerData"]){
            obj[entry["key"]] = entry["values"];
        }
        metaForCalendarChart["testPlayerData"] = obj;
    });

    d3.csv(odiPlayerDatasetUrl).then((data)=>{
        metaForCalendarChart["odiPlayerData"] = data;
        metaForCalendarChart["odiPlayerData"] = metaForCalendarChart["odiPlayerData"].filter(d => {
            if(d["50's"] == "1.0" || d["100's"] == "1.0" || d["5 Wickets"] == "1.0" || d["10 Wickets"] == "1.0"){
                return true;
            }
            return false;
        });
        metaForCalendarChart["odiPlayerData"] = d3.nest().key(d => d["Innings Date"]).entries(metaForCalendarChart["odiPlayerData"]);
        let obj = {};
        for(let entry of metaForCalendarChart["odiPlayerData"]){
            obj[entry["key"]] = entry["values"];
        }
        metaForCalendarChart["odiPlayerData"] = obj;
    });
}

function init()
{
    loadData();
    loadTestDataAsync();
}

function generateYear()
{
    let html = "";
    if(metaForCalendarChart['currentGameFormat'] == "ODI"){
        for(let year = 1971; year < 2020; year++){
            html += `<option value="${year}">${year}</option>`;
        }
    }else if(metaForCalendarChart['currentGameFormat'] == "TEST"){
        for(let year = 1885; year < 2020; year++){
            html += `<option value="${year}">${year}</option>`;
        }
    }
    return html;
}

function reRender(){
    d3.select(".heatMapContainer").remove();
    handlerForCalendarChart();
}

function onStartYearChange()
{
    metaForCalendarChart["startYear"] = $("#startYearDropDown").val();
    setTimeout(() => {
        reRender();
    },200);
}

function onEndYearChange()
{
    metaForCalendarChart["endYear"] = $("#endYearDropDown").val();
    setTimeout(() => {
        reRender();
    },200);
}

function onGameFormatChange(instance)
{
    if(metaForCalendarChart["currentGameFormat"] != instance.value){
        metaForCalendarChart["currentGameFormat"] = instance.value;
        handleYearDropDown();
        setTimeout(() => {
            reRender();
        },200);
    }
}

function handleYearDropDown()
{
    if(document.getElementById("startYearDropDown").parentElement.getElementsByClassName("dropdown-content")[0]){
        document.getElementById("startYearDropDown").parentElement.getElementsByClassName("dropdown-content")[0].remove();
    }
    if(document.getElementById("endYearDropDown").parentElement.getElementsByClassName("dropdown-content")[0]){
        document.getElementById("endYearDropDown").parentElement.getElementsByClassName("dropdown-content")[0].remove();
    }
    $("#startYearDropDown").empty();
    $("#endYearDropDown").empty();
    $("#startYearDropDown").append(generateYear());
    $("#endYearDropDown").append(generateYear());
    if(metaForCalendarChart["currentGameFormat"] == "ODI"){
        metaForCalendarChart["startYear"] = parseInt(metaForCalendarChart["startYear"]) < 1971 ? "2012" : metaForCalendarChart["startYear"];
        metaForCalendarChart["endYear"] = parseInt(metaForCalendarChart["endYear"]) < 1971 ? "2019" : metaForCalendarChart["endYear"];
    }
    $("#startYearDropDown").val(metaForCalendarChart["startYear"]);
    $("#endYearDropDown").val(metaForCalendarChart["endYear"]);
    $('select').formSelect();
}

$(document).ready(function(){
    handleYearDropDown();
    $('select').formSelect();
});

init();