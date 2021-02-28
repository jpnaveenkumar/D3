d3.csv("http://localhost:8080/10_EarthTempAnomalies.csv", function(data){
    console.log(data);
    transformDataForDivergingBarChart(data);
    transformDataForLineChart(data);
    //transformDataForWorldMap(data);
    //transformDataForTimeSeriesChart(data);
    //transformDataForRadialTree(data);
});