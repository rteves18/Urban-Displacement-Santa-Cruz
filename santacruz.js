//Toggle color and boundary variables
var changeColor = false;
var showBoundary = true;
var firstLoad = true;
var current_value_dropdown = "housing_unit";
var toolTipLabel;
// Loading Up the Data
var legendText;
var properties_year;
var current_json_file = 0;
var year = "2010";
var json_files = ['sc_housingUnit.json','sc_tenure_total.json','sc_median_contract_rent.json',
                  'sc_median_value.json','sc_median_income.json'];
var fieldtest = ['ten','eleven','twelve','thirteen','fourteen'];
var counter = 0;

var jsonArrayCounter = 10;
var running = false;
var timer;

var width = 2500,
  height = 700;
var formatNumber = d3.format(",d");
var projection = d3.geo.albers()
  .scale(85000)
  .rotate([96])
  .translate([29850, 2050]);

var path = d3.geo.path()
  .projection(projection);

// Orange color scheme - Housing Unit
var orange_color = d3.scale.threshold()
  .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
  .range(['#fff5eb','#fee6ce','#fdd0a2','#fdae6b','#fd8d3c','#f16913','#d94801','#a63603','#7f2704']);

// // Blue color scheme - Median Year MIUBT
// var blue_color = d3.scale.threshold()
//   .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
//   .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]);

// Green color scheme - Tenure
var green_color = d3.scale.threshold()
  .domain([10, 100, 200, 300, 400, 600, 800, 1000])
  .range(['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b']);

// Purple color scheme - Median Income
var purple_color = d3.scale.threshold()
  .domain([500, 1000, 2500, 50000, 100000, 130000, 150000, 200000])
  .range(['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d']);

// Red color scheme - Contract Rent
var red_color = d3.scale.threshold()
  .domain([1, 10, 50, 100, 500, 1000, 2000, 5000])
  .range(['#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']);

// Yellow color scheme - Median Value
var yellow_color = d3.scale.threshold()
  .domain([1000, 5000, 25000, 50000, 100000, 250000, 500000, 900000])
  .range(['#ffffe5','#fff7bc','#fee391','#fec44f','#fe9929','#ec7014','#cc4c02','#993404','#662506']);

var color = orange_color;

var g;

//d3.select("input.color").on("click", toggleColor);
d3.select("input.boundary").on("click", toggleBoundary);

//Toggle color range between Red and Blue
/*function toggleColor() {

  changeColor = !changeColor;

  if(changeColor){  
    color = blue_color;
  }
  else {
    color = orange_color;
  }
  
  refresh(); //refresh map  
  
}*/

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
    
  if (firstLoad) {
    legendText = "Housing Unit";
    firstLoad = false;
  } else {
    g.selectAll("*")
       .remove();
  }
    
  g = svg.append("g")
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
    .text(legendText);

  // Loads the json files to render map
  d3.json(json_files[current_json_file], function(error, sc){
    
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
            if (jsonArrayCounter == 10) {
              valuesMap[d.properties.ten]=color(d.properties.ten / d.properties.area * 2.58999e6);
              return d.properties.ten; 
            } else if (jsonArrayCounter == 11) {
              valuesMap[d.properties.eleven]=color(d.properties.eleven / d.properties.area * 2.58999e6);
              return d.properties.eleven; 
            } else if (jsonArrayCounter == 12) {
              valuesMap[d.properties.twelve]=color(d.properties.twelve / d.properties.area * 2.58999e6);
              return d.properties.twelve; 
            } else if (jsonArrayCounter == 13) {
              valuesMap[d.properties.thirteen]=color(d.properties.thirteen / d.properties.area * 2.58999e6);
              return d.properties.thirteen; 
            } else if (jsonArrayCounter == 14) {
              valuesMap[d.properties.fourteen]=color(d.properties.fourteen / d.properties.area * 2.58999e6);
              return d.properties.fourteen; 
            } 
          })
          .entries(tracts.features.filter(function(d) {
            return d.properties.area; 
          }))             
        )
      .enter().append("path")
        .style("fill", function(d) { return valuesMap[d.key]; })
        .attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); })
        .on("mouseover", function(d){
            toolTipLabel = getToolTipLabel(d);
            var totalPopulationInGroup = 0;
            tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
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
    
    this.jsonArrayCounter++;
    if (jsonArrayCounter > 14) {
        jsonArrayCounter=10;
    }
    if (jsonArrayCounter == 10) {
        this.year = "2010";
    } else if (jsonArrayCounter == 11) {
        this.year = "2011";
    } else if (jsonArrayCounter == 12) {
        this.year = "2012";
    } else if (jsonArrayCounter == 13) {
        this.year = "2013";
    } else if (jsonArrayCounter == 14) {
        this.year = "2014";
    }
    refresh();

}

function getToolTipLabel(d) {

    var finalLabel = "<strong><div style='text-align:center;'>" +  "County" + "</div></strong><strong><div style='text-align:center;'>" +  "Tract"
                + "</div></strong>"
                + "<table><tr><th>Year</th><th>Value</th><th>Income</th></tr>"
                + "<tr>" + "<tr><th>"+this.year+"</th><th><font color ='#b30000'>" + d.values[0].properties.thirteen
                + "</font></th><th><font color='#006837'>$"+ d.values[0].properties.ten;
    var values = "<br/>" + d.values[0].properties.ten + "<br/>" + d.values[0].properties.eleven  + "<br/>" + d.values[0].properties.twelve + "<br/>" + d.values[0].properties.thirteen + "<br/>" + d.values[0].properties.fourteen;
   /*if (this.current_value_dropdown == "housing_unit") {
      return "housing_unit<br/>" +"key: "+ d.key + "<br/>values: " + values;
   } else if (this.current_value_dropdown == "median_contract_rent") {
      return "median_contract_rent<br/>" +"key: "+ d.key + "<br/>values: "+values;    
   } else if (this.current_value_dropdown == "median_value") {
      return "median_value<br/>" +"key: "+ d.key +"<br/>values: "+ values;      
   } else if (this.current_value_dropdown == "median_year_miubt") {
      return "median_year_miubt<br/>" +"key: "+ d.key +"<br/>values: "+ values;     
   } else if (this.current_value_dropdown == "median_income") {
      return "median_income<br/>" +"key: "+ d.key +"<br/>values: " + values;    
   } else if (this.current_value_dropdown == "tenure") {
      return "tenure<br/>" +"key: "+ d.key +"<br/>values: "+ values;      
   } else {
       alert("Error: option data unavailable: " + this.current_value_dropdown);
   } */   
    return finalLabel;
}

d3.select(self.frameElement).style("height", height + "px");

/*===========================Drop Down Menu===========================*/
document.getElementById("myList").onchange = function() {
  jsonArrayCounter=10;
  current_value_dropdown=this.value;
  if (this.value == "housing_unit") {
    current_json_file = 0;
    color = orange_color;
    legendText = "Housing Unit";
    refresh();
  } else if (this.value == "median_contract_rent") {
    current_json_file = 2;
    color = red_color;
    legendText = "Median Contract Rent (USD)";
    refresh();       
  } else if (this.value == "median_value") {
    current_json_file = 3;
    color = yellow_color;
    legendText = "Median Value (USD)";
    refresh();            
  } else if (this.value == "median_income") {
    current_json_file = 4;
    color = purple_color;
    legendText = "Median Income (USD)";
    refresh();       
  } else if (this.value == "tenure") {
    current_json_file = 1;
    color = green_color;
    legendText = "Tenure (Years)";
    refresh();       
  } else {
    alert("Error: option data unavailable");
  }
};


$("button").on("click", function() {
		
    var duration = 3000,
        maxstep = 2014,
        minstep = 2010;
    
    if (running == true) {

        $("button").html("Play");
        running = false;
        clearInterval(timer);

    } 
    /*
    else if (running == true && $("#slider").val() == maxstep) {
         running = true;
         $("button").html("Play1");


    } 
    */
    else if (running == false) {

        $("button").html("Pause");

        sliderValue = $("#slider").val();

        timer = setInterval( function(){
                if (sliderValue < maxstep){
                    sliderValue++;
                    $("#slider").val(sliderValue);
                    $('#range').html(sliderValue);
                }
                $("#slider").val(sliderValue);
                update();

        }, duration);
        running = true;


    }

});
	
$("#slider").on("change", function(){
    update();
    $("#range").html($("#slider").val());
    clearInterval(timer);
    $("button").html("Play");
});
	
update = function() {

    this.jsonArrayCounter++;
    if (jsonArrayCounter == 14) {
        $("button").html("Play");    
        clearInterval(timer);
        running = false;
    } else if (jsonArrayCounter > 14) {
        jsonArrayCounter=10;        
    }
    

    switch ($("#slider").val()) {
        case "2010":
            this.year = "2010";
            break;
        case "2011":
            this.year = "2011";
            break;
        case "2012":
            this.year = "2012";
            break;
        case "2013":
            this.year = "2013";
            break;
        case "2014":
            this.year = "2014";
            break;
    }

    refresh();
};
