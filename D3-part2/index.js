
// d3.csv("http://localhost:8080/coronavirus_dataset.csv", function(data){
//     //transformDataForBarChart(data);
//     transformDataForWorldMap(data);
//     //transformDataForTimeSeriesChart(data);
//     //transformDataForRadialTree(data);
// });

var dataFromCsv;
var curBtn = "worldMapBtn";

function loadWorldMap()
{
    var html = `<div class="dynamicChartRenderContainer" style="margin:10px">
      <svg class="worldMap" width="1400" height="700"></svg> 
      <div class="tooltipContainer">
        <div id="tooltipCountry" style="font-weight:bold"></div>
        <div> Confirmed Cases : <span id="confirmedCount"></span></div>
        <div> Recovered Cases : <span id="recoveredCount"></span></div>
        <div> Dead Cases : <span id="deadCount"></span></div>
      </div> 
    </div>`;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "worldMapBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    resetTimeSeriesChart();
    resetBarChart();
    d3.csv("http://localhost:8080/coronavirus_dataset.csv", function(data){
        dataFromCsv = data;
        transformDataForWorldMap(data);
    });
}

function loadBarChartRace()
{
    var html = `
        <div style="display:flex;justify-content:center">
            <svg class="barChartRace dynamicChartRenderContainer" width="800" height="500"></svg>
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "barChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    resetTimeSeriesChart();
    resetBarChart();
    transformDataForBarChart(dataFromCsv);
}

function loadRadialTree()
{
    var html =`
    <div class="RadialTreeContainer dynamicChartRenderContainer">
       <div style="margin:10px">
            Pinch or double tap to zoom and drag to move    
       </div>
       <svg class="radialTree" width="800" height="600"></svg>
    </div>`;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "radialTreeBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    resetTimeSeriesChart();
    resetBarChart();
    transformDataForRadialTree(dataFromCsv);
}

function loadTimeSeriesChart()
{
    var html = `
        <div class="dynamicChartRenderContainer" style="display: flex; flex-direction: column; align-items: center; margin-top:30px">
        <div>
        <label for="cars">Choose Category:</label>
        <select name="cars" id="startYearPie" style="width: 150px" onchange="switchCategory(this.value)">
            <option value="confirmed">Confirmed Cases</option>
            <option value="death">Dead Cases</option>
            <option value="recovered">Recovered</option>
        </select>
        </div>
        <svg class="timeSeries" width = "900" height="500"></svg>
    </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "timeSeriesBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    resetTimeSeriesChart();
    resetBarChart();
    transformDataForTimeSeriesChart(dataFromCsv);
}

loadWorldMap();