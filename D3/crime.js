
d3.csv("http://localhost:8080/persons-arrested-for-selected-major-offences-by-age-group.csv", function(data){
    transformDataForYearVsCount(data);
    transformDataForCrimeVsCount(data);
    transformForGenderVsCount(data);
    transformDataForAgegroupVsCrimeCount(data);
});