function transformDataForRadialTree(data)
{
    var transformedData = d3.nest()
            .key(d => d["Country.Region"])
            .key(d => d["type"])
            .rollup(d => d3.sum(d, d1 => d1["cases"]))
            .entries(data);

    transformedData = transformedData.map((level1) => {
        return {
            'key' : level1['key'],
            'values' : level1['values'].map((level2) => {
                return {
                    'key' : level2['key'],
                    'values' : [ {
                        'key' : level2['value']
                    }]
                };
            })
        };
    });

    var hierarchyData = {
        "key" : "Earth",
        "values" : transformedData
    };

    console.log(hierarchyData);
    renderRadialTree(hierarchyData);
}

function renderRadialTree(data1)
{

    //d3.json('http://localhost:8080/data.json', function(data){
        var svg = d3.select('.radialTree');

        var g = svg.append('g');

        var zoom = d3.zoom();

        svg.call(zoom.on('zoom', () => {
            g.attr('transform', d3.event.transform);
          }));
        svg.call(zoom.transform, d3.zoomIdentity.translate(200,10).scale(0.3,2));

        const treeLayout = d3.tree()
                            .size([5000,800])
        const root = d3.hierarchy(data1, d => d.values);
        const links = treeLayout(root).links();
        const pathGenerator = d3.linkHorizontal()                        
                    .x(d=>d.y)
                    .y(d=>d.x);

        g.selectAll('path')
            .data(links)
            .enter()
            .append('path')
            .attr('d', pathGenerator);

        g.selectAll('text')
            .data(root.descendants())
            .enter()
            .append('text')
            .attr('transform', 'translate(10,3)')
            .attr('x', d => d.y)
            .attr('y', d => d.x)
            .text(d => d.data.key)
            .attr('font-size',d =>  d.children ? 2.5 - d.depth + 'em' : '0.7em');

        g.selectAll('circle')
            .data(root.descendants())
            .enter()
            .append('circle')
            .attr('cx', d => d.y)
            .attr('cy', d => d.x)
            .attr('r', 3)
            .attr('fill', 'red')

    //});
}