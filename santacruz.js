//Toggle color and boundary variables
var changeColor = false;
var showBoundary = true;

// Loading Up the Data
var current_data = [];
var housing_unit = ['sc_housingunit09.json', 'sc_housingunit10.json', 'sc_housingunit11.json', 
                 'sc_housingunit12.json', 'sc_housingunit13.json', 'sc_housingunit14.json'];

var tenure = ['sc_tenure09.json', 'sc_tenure10.json', 'sc_tenure11.json', 
              'sc_tenure12.json', 'sc_tenure13.json', 'sc_tenure14.json'];

var median_contract_rent = ['sc_MedianContractRent09.json', 'sc_MedianContractRent10.json',
                            'sc_MedianContractRent11.json', 'sc_MedianContractRent12.json', 'sc_MedianContractRent13.json', 'sc_MedianContractRent14.json'];

var median_year_miubt = ['sc_MedianYearMIUBT09.json', 'sc_MedianYearMIUBT10.json', 'sc_MedianYearMIUBT11.json',
                         'sc_MedianYearMIUBT12.json', 'sc_MedianYearMIUBT13.json', 'sc_MedianYearMIUBT14.json'];

var median_value = ['sc_MedianValue09.json', 'sc_MedianValue10.json', 'sc_MedianValue11.json', 'sc_MedianValue12.json', 'sc_MedianValue13.json', 'sc_MedianValue14.json'];

var median_income = ['sc_MedianIncome09.json', 'sc_MedianIncome10.json', 'sc_MedianIncome11.json',
                    'sc_MedianIncome12.json', 'sc_MedianIncome13.json', 'sc_MedianIncome14.json']

var median_value = ['sc_MedianValue09.json', 'sc_MedianValue10.json', 'sc_MedianValue11.json', 
                   'sc_MedianValue12.json', 'sc_MedianValue13.json', 'sc_MedianValue14.json']


var jsonArrayCounter = 0;

var width = 2500,
  height = 700;
var formatNumber = d3.format(",d");
var projection = d3.geo.albers()
  .scale(70000)
  .rotate([96])
  .translate([24600, 1700]);

var path = d3.geo.path()
  .projection(projection);

// Orange color scheme
var color = d3.scale.threshold()
  .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
  .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);

// Blue color scheme
var blue_color = d3.scale.threshold()
  .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
  .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]);

d3.select("input.color").on("click", toggleColor);
d3.select("input.boundary").on("click", toggleBoundary);

//Toggle color range between Red and Blue
function toggleColor() {

  changeColor = !changeColor;

  if(changeColor){  
    color = d3.scale.threshold()
    .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
    .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]);
  }
  else {
    color = d3.scale.threshold()
    .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
    .range(["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]); 
  }
  
  refresh(); //refresh map  
  
}

//Toggle showBoundary boolean true or false
function toggleBoundary(){
  showBoundary = !showBoundary;
  refresh(); //refresh map
}

// A position encoding for the key only.
var x = d3.scale.linear()
  .domain([0, 5000])
  .range([0, 480]);
var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickSize(13)
  .tickValues(color.domain())
  .tickFormat(function(d) { return d >= 100 ? formatNumber(d) : null; });
var svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

refresh(); //refresh map

//Refresh Geomap function    
function refresh() {
  var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(440,40)");

  g.selectAll("rect")
    .data(color.range().map(function(d, i) {
      return {
        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
        z: d
      };
  }))
  .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return d.x0; })
    .attr("width", function(d) { return d.x1 - d.x0; })
    .style("fill", function(d) { return d.z; });
  g.call(xAxis).append("text")
    .attr("class", "caption")
    .attr("y", -6)
    .text("Population per square mile");

  d3.json(housing_unit[jsonArrayCounter], function(error, sc){
    console.log(sc);
    if (error) throw error;
    var tracts = topojson.feature(sc, sc.objects.sctracts);
    var tooltip;  
    // Clip tracts to land.
    svg.append("defs").append("clipPath")
        .attr("id", "clip-land")
      .append("path")
        .datum(topojson.feature(sc, sc.objects.sctracts))
        .attr("d", path);

    // Individual tracts for tool tip.
    // Group tracts by color for faster rendering.
      var valuesMap = {};
      svg.append("g")
        .attr("class", "tract")
        .attr("clip-path", "url(#clip-land)")
      .selectAll("path")
        .data(d3.nest()
          .key(function(d) {
            valuesMap[d.properties.population]=color(d.properties.population / d.properties.area * 2.58999e6);
            return d.properties.population; 
          })
          .entries(tracts.features.filter(function(d) {
            return d.properties.area; 
          }))             
        )
      .enter().append("path")
        .style("fill", function(d) { return valuesMap[d.key]; })
        .attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); })
        .on("mouseover", function(d){
            var totalPopulationInGroup = 0;
            var toolTipLabel = '<br/> Population: '+ d.key;
            tooltip = d3.select("body")
                .append("div")
                .style("position", "absolute")
                .style("z-index", "10")
                .style("visibility", "hidden")
                .html(toolTipLabel);   
            return tooltip.style("visibility", "visible");
        })
        .on("mousemove", function(d){
            return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
        })
        .on("mouseout", function(d){
            return tooltip.style("visibility", "hidden")
        });

    // Draw county borders.
    //Toggle show boundary
    if(showBoundary){
      svg.append("path")
        .datum(topojson.mesh(sc, sc.objects.sctracts, function(a, b) { return a !== b; }))
        .attr("class", "county-border")
        .attr("d", path);
    }
  });
}

// ** Update data section (Called from the onclick)
function updateData() {
    
    jsonArrayCounter++;
    if (jsonArrayCounter >= housing_unit.length) {
        jsonArrayCounter=0;
    }
    refresh();

}

d3.select(self.frameElement).style("height", height + "px");

document.getElementById("myList").onchange = function() {
   if (this.value == "housing_unit") {
      current_data = housing_unit;
      updateData();
   } else if (this.value == "median_contract_rent") {
      current_data = median_contract_rent;
      updateData();       
   } else if (this.value == "median_value") {
      current_data = median_value;
      updateData();       
   } else if (this.value == "median_income") {
      current_data = median_income;
      updateData();       
   } else {
       alert("Error: option data unavailable");
   }
};