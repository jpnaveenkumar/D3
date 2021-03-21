// d3.csv("http://localhost:8081/10_EarthTempAnomalies.csv", function(data){
//     console.log(data);
//     transformDataForDivergingBarChart(data);
//     transformDataForLineChart(data);
//     transformDataDonutChart(data);
//     transformDataForBubbleChart(data);
// });

let dataFromCsv;
let curBtn = "barChartBtn";

function loadDivergingBarChart()
{
    var html = `
        <div class="dynamicChartRenderContainer">
            <div style="display:flex;justify-content:center;margin-bottom:30px;font-weight:bold">
                Month Vs Temperature Anamoly Readings
            </div>
            <div style="display: flex; justify-content: space-evenly;">
                <div>
                    <label for="cars">Choose Hemisphere:</label>
                    <select name="cars" id="hemisphereDropdownBarChart" style="width: 150px" onchange="updateDivergingBarChar()">
                        <option value="Global">Global Hemisphere</option>
                        <option value="Southern">Southern Hemisphere</option>
                        <option value="Northern">Northern Hemisphere</option>
                    </select>
                </div>
                <div>
                    <label for="cars">Choose Year:</label>
                    <select name="cars" id="yearDropdownBarChart" style="width: 150px" onchange="updateDivergingBarChar()">
                    </select>
                </div>
            </div>
            <div style="display: flex; justify-content: center;">
                <svg class="DivergingBarChart" width="900" height="800"></svg>
            </div>
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "barChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    if(!dataFromCsv){
        d3.csv("http://localhost:8080/10_EarthTempAnomalies.csv", function(data){
            dataFromCsv = data;
            transformDataForDivergingBarChart(data);
        });
    }else{
        transformDataForDivergingBarChart(data);
    }
}

function loadLineChart()
{
    var html = `
        <div class="dynamicChartRenderContainer">
            <div style="display:flex;justify-content:center;margin-bottom:30px;font-weight:bold">
                Year Vs Monthly Mean Average Temperature Anamoly Readings
            </div>
            <div style="display: flex; justify-content: center;">
                <label for="cars">Choose Hemisphere:</label>
                <select name="cars" id="hemisphereDropdownLineChart" style="width: 150px" onchange="updateLineChart()">
                    <option value="Global">Global Hemisphere</option>
                    <option value="Southern">Southern Hemisphere</option>
                    <option value="Northern">Northern Hemisphere</option>
                </select>
            </div>
            <div style="display: flex; justify-content: center;">
                <svg class="LineChart" width="900" height="800"></svg>
            </div>                
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "lineChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    transformDataForLineChart(data);
}

function loadBubbleChart()
{
    var html = `
        <div class="dynamicChartRenderContainer">
            <div style="display:flex;justify-content:center;margin-bottom:30px;font-weight:bold">
                Earth Temperature Anamoly By Hemisphere
            </div>
            <div style="display: flex; justify-content: center;">
                <label for="cars">Choose Hemisphere:</label>
                <select name="cars" id="hemisphereDropdownBubbleChart" style="width: 150px" onchange="updateBubbleChart()">
                    <option value="Global">Global Hemisphere</option>
                    <option value="Southern">Southern Hemisphere</option>
                    <option value="Northern">Northern Hemisphere</option>
                </select>
            </div>
            <div style="margin-top: 50px; padding-left: 20px;display: grid; grid-template-columns: auto auto; justify-content: start;" id="BubbleChartContainer">
                <svg class="BubbleChart" width="800" height="800"></svg>
            </div>
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "bubbleChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    transformDataForBubbleChart(data);
}

function loadDonutChart()
{
    var html = `
        <div class="dynamicChartRenderContainer">
            <div style="display:flex;justify-content:center;margin-bottom:30px;font-weight:bold">
                Hemisphere Vs Seasonal Average Temperature Anamoly
            </div>
            <div style="display: flex; justify-content: center;">
                <label for="cars">Choose Season:</label>
                <select name="cars" id="seasonDropdownDonutChart" style="width: 150px" onchange="updateDonutChart()">
                    <option value="summer">Summer season</option>
                    <option value="winter">Winter season</option>
                    <option value="autumn">Autumn season</option>
                    <option value="spring">Spring season</option>
                </select>
            </div>
            <div style="display: flex; justify-content: center;">
                <svg class="DonutChart" width="900" height="800"></svg>
            </div>
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "donutChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    transformDataDonutChart(data);
}

loadDivergingBarChart();