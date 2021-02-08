
d3.csv("http://localhost:8080/coronavirus_dataset.csv", function(data){
    transformDataForBarChart(data);
    transformDataForWorldMap(data);
});