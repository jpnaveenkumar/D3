
// d3.csv("http://localhost:8080/persons-arrested-for-selected-major-offences-by-age-group.csv", function(data){
//     transformDataForYearVsCount(data);
//     transformDataForCrimeVsCount(data);
//     transformForGenderVsCount(data);
//     transformDataForAgegroupVsCrimeCount(data);
// });

var dataFromCsv;
var curBtn = "barChartBtn";

function loadBarChart()
{
    var html = `
        <div class="dynamicChartRenderContainer" style="display:flex;justify-content:center;">
            <svg class="YearCrime" width="960" height="500"></svg>  
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "barChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    if(!dataFromCsv){
        d3.csv("http://localhost:8080/persons-arrested-for-selected-major-offences-by-age-group.csv", function(data){
            dataFromCsv = data;
            transformDataForYearVsCount(data);
        });
    }else{
        transformDataForYearVsCount(dataFromCsv);
    }
}

function loadLineChart()
{
    var html = `
        <div class="dynamicChartRenderContainer" style="display:flex;justify-content:center;">
            <svg class="GenderCrime" width="960" height="500"></svg>  
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "lineChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    transformForGenderVsCount(dataFromCsv);
}

function loadBubbleChart()
{
    var html = `
        <div class="dynamicChartRenderContainer" style="display: flex;align-items: center;justify-content:center;flex-direction:column">
            <div style="height:30px; display:flex; justify-content:center">
                <p style="" id="bubbleChatDesc"></p>
            </div>
            <svg class="bubbleChart" width="700" height="700"></svg>
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "bubbleChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    transformDataForCrimeVsCount(dataFromCsv);
}

function loadDonutChart()
{
    var html = `
        <div class="dynamicChartRenderContainer" style="display: flex; flex-direction: column; justify-content:center;align-items:center;margin-top:30px">
            <div>
            <label for="cars">Choose Start Year:</label>
            <select name="cars" id="startYearPie" style="width: 150px" onchange="updatePieChart()">
                <option value="2011">2011</option>
                <option value="2012">2012</option>
                <option value="2013">2013</option>
                <option value="2014">2014</option>
                <option value="2015">2015</option>
                <option value="2016">2016</option>
                <option value="2017">2017</option>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
            </select>
            <label style="margin-left: 30px;" for="cars">Choose End Year:</label>
            <select name="cars" id="endYearPie" style="width: 150px" onchange="updatePieChart()">
                <option value="2011">2011</option>
                <option value="2012">2012</option>
                <option value="2013">2013</option>
                <option value="2014">2014</option>
                <option value="2015">2015</option>
                <option value="2016">2016</option>
                <option value="2017">2017</option>
                <option value="2018">2018</option>
                <option value="2019">2019</option>
            </select>
            </div>
            <svg class="ageGroupCrime" width="800" height="500"></svg>
        </div>
    `;
    $('.'+curBtn).removeClass('active-btn');
    curBtn = "donutChartBtn";
    $('.'+curBtn).addClass('active-btn');
    $('.dynamicChartRenderContainer').remove();
    $('#DynamicChartRenderer').append(html);
    transformDataForAgegroupVsCrimeCount(dataFromCsv);
}

loadBarChart()