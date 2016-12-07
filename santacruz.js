//Toggle color and boundary variables
var changeColor = false;
var showBoundary = true;
var firstLoad = true;
var current_value_dropdown = "housing_unit";
var toolTipLabel;
var tracts;
// Loading Up the Data
var legendText;
var county;
var properties_year;
var current_json_file = 0;
var current_data = [];
var valuesMap = {};
var current_data_year;
var year = "2010";
var sign = "";
var label_color = "#2756a3";
var json_files = ['sc_housingUnit.json','sc_tenure_total.json','sc_median_contract_rent.json',
                  'sc_median_value.json','sc_median_income.json'];

var tooltip_json_files = ['sc_tenure_onwer.json','sc_tenure_renter.json'];

var fieldtest = ['ten','eleven','twelve','thirteen','fourteen'];
var counter = 0;

//add for legend scale color reference
var hos = colorbrewer.Oranges[8];
var tnr = colorbrewer.Greens[9]; 
var rnt = colorbrewer.Reds[9];
var val = colorbrewer.Blues[9];
var ict = colorbrewer.Purples[9];

var hosText = ["0-10", "10-50", "50-100", "100-500","500-1000","1000-2000","2000-5000","5000+"];
var tnrText = ["0-10", "10-100", "100-200", "200-300", "300-400", "400-600", "600-800", "800-1000","1000+"];
var rntText = ["$0-$600", "$600-$700", "$700-$900", "$900-$1200", "$1200-$1400", "$1400-$1600", "$1600-$1800", "$1800-$2K", "2K+"];
var valText = ["0-$200K", "$200K-$300K", "$300K-$400K", "$400K-$500K", "$500K-$600K", "$600K-$700K", "$700K-$800K", "800K-$900K", "$900K+"];
var ictText = ["0-$30K", "30K-$40K", "$40K-$50K", "$50K-$60K", "$60K-$70K", "$70-$80K", "$80K-$90K", "$90K-$100K", "$100K+"];

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

// Green color scheme - Tenure
var green_color = d3.scale.threshold()
  .domain([10, 100, 200, 300, 400, 600, 800, 1000])
  .range(['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c','#00441b']);

// Purple color scheme - Median Income
var purple_color = d3.scale.threshold()
  .domain([30000, 40000, 50000, 60000, 70000, 80000, 90000, 100000])
  .range(['#fcfbfd','#efedf5','#dadaeb','#bcbddc','#9e9ac8','#807dba','#6a51a3','#54278f','#3f007d']);

// Red color scheme - Contract Rent
var red_color = d3.scale.threshold()
  .domain([0, 600, 700, 900, 1200, 1400, 1600, 1800, 2000])
  .range(['#000000','#fff5f0','#fee0d2','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#a50f15','#67000d']);

// Yellow color scheme - Median Value
var yellow_color = d3.scale.threshold()
  .domain([200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000])
  .range(["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"]);

var color = orange_color;

var g;
//an SVG to appen

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
    cssLegend = "hoslegend";
    select_colors=orange_color;  
    ShowLegendHRVIT(1,0,0,0);
    AppendLegend(orange_color,hos,hosText,"hoslegend",1);
  } 
  else {
    g.selectAll("*")
       .remove();
  }
  
  //***Uncomment or Comment to see bug**//  
  g = svg.append("g")
       .attr("class", "key");
  //************************************//


  //***OLD LEGEND***
  // g = svg.append("g")
  //   .attr("class", "key")
  //   .attr("transform", "translate(440,40)");

  // g.selectAll("rect")
  //   .data(color.range().map(function(d, i) {

  //     return {
  //       x0: i ? x(color.domain()[i - 1]) : x.range()[0],
  //       x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
  //       z: d
  //     };
  // }))
  // .enter().append("rect")
  //   .attr("fill-opacity", 0)
  //   .transition().duration(1000)
  //   .attr("fill-opacity", 1)
  //   .attr("height", 8)
  //   .attr("x", function(d) { return d.x0; })
  //   .attr("width", function(d) { console.log(d.x1-d.x0);  if(Math.abs(d.x1-d.x0) > 480) return d.hope; else return Math.abs(d.x1-d.x0); })
  //   .style("fill", function(d) { return d.z; });
  //   g.call(xAxis).append("text")
  //   .attr("class", "caption")
  //   .attr("y", -6)
  //   .text(legendText);


  // Loads the json files to render map
  d3.json(json_files[current_json_file], function(error, sc){
    this.county = sc;

    if (error) throw error;
    this.tracts = topojson.feature(sc, sc.objects.sctracts);
    var tooltip;  
    // Clip tracts to land.
    svg.append("defs").append("clipPath")
        .attr("id", "clip-land")
      .append("path")
        .datum(topojson.feature(sc, sc.objects.sctracts))
        .attr("d", path);
    // Individual tracts for tool tip.
    
    // Group tracts by color for faster rendering.
      svg.append("g")
        .attr("class", "tract")
        .attr("clip-path", "url(#clip-land)")
      .selectAll("path")
        .data(d3.nest()
          .key(function(d) {
            if (jsonArrayCounter == 10) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.ten]=color(d.properties.ten);
              } else {
                this.valuesMap[d.properties.ten]=color(d.properties.ten / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.ten;
              return d.properties.ten; 
            } else if (jsonArrayCounter == 11) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.eleven]=color(d.properties.eleven);
              } else {
                this.valuesMap[d.properties.eleven]=color(d.properties.eleven / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.eleven;
              return d.properties.eleven; 
            } else if (jsonArrayCounter == 12) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.twelve]=color(d.properties.twelve);
              } else {
                this.valuesMap[d.properties.twelve]=color(d.properties.twelve / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.twelve;
              return d.properties.twelve; 
            } else if (jsonArrayCounter == 13) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.thirteen]=color(d.properties.thirteen);
              } else {
                this.valuesMap[d.properties.thirteen]=color(d.properties.thirteen / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.thirteen;
              return d.properties.thirteen; 
            } else if (jsonArrayCounter == 14) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.fourteen]=color(d.properties.fourteen);
              } else {
                this.valuesMap[d.properties.fourteen]=color(d.properties.fourteen / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.fourteen;
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
      svg.append("path")
        .datum(topojson.mesh(sc, sc.objects.sctracts, function(a, b) { return a !== b; }))
        .attr("class", "county-border")
        .attr("d", path);
    
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

function AppendLegend(cScale, brewSet, textArray,cssClass,opacity){
    var legendHeight=600;

    svg.selectAll(".legend")
        .data(cScale.domain(),function(d){return d;})
        .enter()
        .append("g")
        .attr("class", cssClass)
        .attr("opacity",opacity)
        .attr("transform", "translate(-580,40)")
        .append("rect")//55*i
        //sets the location and width of each colored rectangles and adds the iteratively
        .attr("x", 600)
        .attr("y", function(d,i){return height-175-(55*i)})
        .attr("width", 15)
        .attr("height", 55)
        .attr("fill", function(d, i){ return brewSet[i];})
        .style("stroke", "rgba(105, 105, 105, 0.86)")
        .style("stroke-width", "2px")
        .style("opacity",1)
    //further appending will append it inside rect. Starting again appending to g.
    svg.selectAll("g."+cssClass)
        .append("text")
        .attr("class", cssClass)
        .attr("x", function(d){ return 600+25})
        .attr("y", function(d,i){return height-140-(55*i)})
        .attr("width", 200)
        .attr("height", 15)
        .style("opacity",opacity)
        .style("fill", "black")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 10)
        .text(function(d, i) { return (textArray[i]);});
    //Legend Text
    svg.select("g."+cssClass)
        .append("text")
        .attr("class", cssClass)
        .attr("id","legendText")
        .attr("x", 585)
        .attr("y", height-90)
        .attr("width", 200)
        .attr("height", 15)
        .attr("align","center")
        .style("opacity",opacity)
        .style("fill", "black")
        .style("font-weight", "bold")
        .style("font-family", "sans-serif")
        .style("font-size", 12)
        .text(function(){
            switch(cssClass){
                case "hoslegend":
                    return "Housing Unit Total per Mile";
                    break;
                case "rntlegend":
                    return "Median Contract Rent ($USD)";
                    break;
                case "tnrlegend":
                    return "Tenure Total per Mile";
                case "vallegend":
                    return "Median House Value ($USD)";
                    break;
                case "ictlegend":
                    return "Median Household Income ($USD)";
                    break;
            }
        })
}

function ShowLegendHRVIT(hu,rt,vl,ic,tn){
    d3.selectAll(".hoslegend")
        .transition(1000)
        .style("opacity",hu);
    d3.selectAll(".rntlegend")
        .transition(1000)
        .style("opacity",rt);
    d3.selectAll(".vallegend")
        .transition(1000)
        .style("opacity",vl);
    d3.selectAll(".ictlegend")
        .transition(1000)
        .style("opacity",ic);
    d3.selectAll(".tnrlegend")
        .transition(1000)
        .style("opacity",tn);
}

//Gets the legend started. Hidden
AppendLegend(orange_color,hos,hosText,"hoslegend",0);
AppendLegend(green_color,tnr,tnrText,"tnrlegend",0);
AppendLegend(purple_color,rnt,rntText,"rntlegend",0);
AppendLegend(red_color,val,valText,"vallegend",0);
AppendLegend(yellow_color,ict,ictText,"ictlegend",0);

function getToolTipLabel(d) {

  var year_data;

  if (this.year=="2010"){
    year_data = d.values[0].properties.ten;
  }

  else if (this.year=="2011"){
    year_data = d.values[0].properties.eleven;
  }

  else if (this.year=="2012"){
    year_data = d.values[0].properties.twelve;
  }

 else if (this.year=="2013"){
    year_data = d.values[0].properties.thirteen;
  }
  else if (this.year=="2014"){
    year_data = d.values[0].properties.fourteen;
  }


  var finalLabel = "<strong><div style='text-align:center;'>" +  
                 legendText
              + "</div></strong></br>"
              //
              + "<table><tr><th>Year</th><th>Total</th></tr>"
              + "<tr>" + "<tr><th>"
              +this.year
              +"</th><th><font color ='" + label_color + "'>" + sign 
              + year_data;

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
    sign = "";
    label_color= "#2756a3";
    ShowLegendHRVIT(1,0,0,0,0);
    refresh();
  } else if (this.value == "median_contract_rent") {
    current_json_file = 2;
    color = red_color;
    legendText = "Median Rent (USD)";
    sign = "$";
    label_color = "#006837";
    ShowLegendHRVIT(0,1,0,0,0);
    refresh();       
  } else if (this.value == "median_value") {
    current_json_file = 3;
    color = yellow_color;
    legendText = "Median Value (USD)";
    sign = "$";
    label_color = "#006837";
    ShowLegendHRVIT(0,0,1,0,0);
    refresh();            
  } else if (this.value == "median_income") {
    current_json_file = 4;
    color = purple_color;
    legendText = "Median Income (USD)";
    sign = "$";
    label_color = "#006837";
    ShowLegendHRVIT(0,0,0,1,0);
    refresh();       
  } else if (this.value == "tenure") {
    current_json_file = 1;
    color = green_color;
    legendText = "Tenure";
    sign = "";
    label_color = "#2756a3";
    ShowLegendHRVIT(0,0,0,0,1);
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

function first_Load(){
    
}
	
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

    var sc = this.county;
    // Group tracts by color for faster rendering.
    var obj = 
      svg.append("g")
        .attr("class", "tract")
        .attr("clip-path", "url(#clip-land)");

      obj.selectAll("path")
        .data(d3.nest()
          .key(function(d) {
            if (jsonArrayCounter == 10) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.ten]=color(d.properties.ten);
              } else {
                this.valuesMap[d.properties.ten]=color(d.properties.ten / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.ten;
              return d.properties.ten; 
            } else if (jsonArrayCounter == 11) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.eleven]=color(d.properties.eleven);
              } else {
                this.valuesMap[d.properties.eleven]=color(d.properties.eleven / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.eleven;
              return d.properties.eleven; 
            } else if (jsonArrayCounter == 12) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.twelve]=color(d.properties.twelve);
              } else {
                this.valuesMap[d.properties.twelve]=color(d.properties.twelve / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.twelve;
              return d.properties.twelve; 
            } else if (jsonArrayCounter == 13) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.thirteen]=color(d.properties.thirteen);
              } else {
                this.valuesMap[d.properties.thirteen]=color(d.properties.thirteen / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.thirteen;
              return d.properties.thirteen; 
            } else if (jsonArrayCounter == 14) {
              if (current_json_file == 2 || current_json_file == 3 || current_json_file == 4){
                this.valuesMap[d.properties.fourteen]=color(d.properties.fourteen);
              } else {
                this.valuesMap[d.properties.fourteen]=color(d.properties.fourteen / d.properties.area * 2.58999e6);
              }
              this.current_data_year=d.properties.fourteen;
              return d.properties.fourteen; 
            }  
          })
          .entries(tracts.features.filter(function(d) {
            return d.properties.area; 
          }))             
        )
      .enter().append("path")
        .attr("fill-opacity", 0)
        .transition().duration(3000)
        .attr("fill-opacity", 1)
        .style("fill", function(d) { return valuesMap[d.key]; })
        .attr("d", function(d) { return path({type: "FeatureCollection", features: d.values}); })
        ;

      obj
        .selectAll("path")
        .data(d3.nest()
          .key(function(d) {
            if (jsonArrayCounter == 10) {
              return d.properties.ten; 
            } else if (jsonArrayCounter == 11) {
              return d.properties.eleven; 
            } else if (jsonArrayCounter == 12) {
              return d.properties.twelve; 
            } else if (jsonArrayCounter == 13) {
              return d.properties.thirteen; 
            } else if (jsonArrayCounter == 14) {
              return d.properties.fourteen; 
            } 
          })
          .entries(tracts.features.filter(function(d) {
            return d.properties.area; 
          }))             
        )
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
      if(showBoundary){
      svg.append("path")
        .datum(topojson.mesh(sc, sc.objects.sctracts, function(a, b) { return a !== b; }))
        .attr("class", "county-border")
        .attr("d", path);
    }
};
