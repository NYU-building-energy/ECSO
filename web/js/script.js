
var MAX_PAYOFF_YEARS = 6;

var dataset;

/**
 * Number.prototype.format(n, x)
 * 
 * @param integer n: length of decimal
 * @param integer x: length of sections
 */
Number.prototype.format = function(n, x) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
    return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
};


// Get the contents of a textbox and checkbox, and alert them to the user
function changeBuildingClass() {
    var checkOffices = $("#offices");
    var checkSchools = $("#schools");
    var checkHealthcare = $("#healthcare");
        alert("Offices: " + checkOffices.is(":checked") + "\nSchools: " + checkSchools.is(":checked") + "\ncheckHealthcare: " + checkHealthcare.is(":checked"));
    }

//Initializes the payback bar with a default value
function makePaybackBar(paybackbarID) {
    svg = d3.select(paybackbarID).select("svg");

    leftPoint = svg.attr("bar-left");
    
    var x = d3.scale.linear()
          .domain([0, MAX_PAYOFF_YEARS])
          .range([0, svg.attr("width")]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickValues([1,2,3,4,5,6])
        .orient("bottom");

    var ax = svg.select("g.base_bar")
          .attr("transform", "translate("+leftPoint+"," + (svg.attr("height")/3) + ")")
          .call(xAxis)
        .append("text")
          .attr("y", 30)
          .attr("font-size", 16)
          .attr("dy", ".71em")
          .style("text-anchor", "middle")
          .attr("transform", function(d) { return "translate(" + svg.attr("width")/2 + "," +0+")"; })
          // changed label to reflect filtering
          .text("Payback Period in Years");

    svg.select("g.highlight_bar")
        .append("circle")
        .attr("cx",leftPoint)
        .attr("cy", svg.attr("height")/3 + 3)
        .attr("r",9);

    svg.select("g.highlight_bar")
        .append("line")
        .attr("x1",leftPoint)
        .attr("y1", svg.attr("height")/3 + 3)
        .attr("x2",x(.46)+leftPoint)
        .attr("y2", svg.attr("height")/3 + 3);

}

//Updates the payback bar with the expected payback period given
function updatePaybackBar(paybackPeriod, paybackbarID){
    svg = d3.select(paybackbarID).select("svg");

    leftPoint = svg.attr("bar-left");

    var x = d3.scale.linear()
          .domain([0, MAX_PAYOFF_YEARS])
          .range([0, svg.attr("width")]);

    console.log(leftPoint, paybackPeriod, x(paybackPeriod) )

    svg.select("g.highlight_bar").select("line")
        .attr("x1",leftPoint)
        .attr("y1", svg.attr("height")/3 + 3)
        .attr("x2",x(paybackPeriod)+leftPoint)
        .attr("y2", svg.attr("height")/3 + 3);
}

//Update the building details box displayed in ECSO
function updateBuildingDetails(buildingAddress) {
    
    var row;
    for(var i=0; i<dataset.length;i++) {
        row = dataset[i];
        if(row.Address == buildingAddress) {
            break;
        }
    }
    var details = d3.select("#buildingDetails");

    console.log(buildingAddress)

    // ------------------------------------------------------
    //  EBCx retrofits
    details.select("h2").text(buildingAddress);
    
    var cost = row["Retrofit Costs"].replace("$","").replace(",","");
    var savings = row["Yearly Savings"].replace("$","").replace(",","");
    
    // for paybackbar
    var numer = parseInt( cost );
    var denom = parseInt(savings);

    var energyCostsBefore = parseFloat(row["Energy Cost per SqFt Before EBCx"])*parseFloat(row["Sq.Ft."]);
    var EBCxEnergyCostsAfter = parseFloat(row["Energy Cost per SqFt After EBCx"])*parseFloat(row["Sq.Ft."]);

    costStr = "<p>Energy costs before: $"+ energyCostsBefore.format(2) +"<br>" +
                "Energy costs after: $" + EBCxEnergyCostsAfter.format(2) +"</p>" +
                "<p>Retrofit Costs (one-time): " + row["Retrofit Costs"] + "</p>" +
                "<h2>Yearly Savings: " + row["Yearly Savings"] + "</h2>";


    details.select("#energyCosts")
            .html(costStr);

    updatePaybackBar(numer/denom, "#paybackBar");

    // ------------------------------------------------------
    //  Standard retrofits
    var StdDetails = d3.select("#buildingDetailsStandard");

    var StdRetrofitCosts = parseFloat(row["Standard Retrofit Cost per SqFt"])*parseFloat(row["Sq.Ft."]);
    var StdRetrofitCosts2 = row["Standard Retrofit Cost"];
    var StdEnergyCostsAfter = parseFloat(row["Energy Cost per SqFt After EBCx"])*parseFloat(row["Sq.Ft."]);
    // for paybackbar
    savings = row["Standard Yearly Savings"].replace("$","").replace(",","");
    numer = parseInt( StdRetrofitCosts );
    denom = parseInt(savings);


    costStrStd = "<p>Energy costs before: $"+ energyCostsBefore.format(2) + "<br>" +
                "Energy costs after: $" + EBCxEnergyCostsAfter.format(2) + "(" + StdRetrofitCosts2 + ")</p>" +
                "<p>Retrofit Costs (one-time): $" + StdRetrofitCosts.format(2) + "</p>" +
                "<h2>Yearly Savings: " + row["Standard Yearly Savings"] + "</h2>";


    StdDetails.select("#energyCostsStandard")
            .html(costStrStd);

    updatePaybackBar(numer/denom, "#paybackBarStandard");

    //console.log(dataset);
}



d3.csv('data/DOE_reference_bldgs.csv', function(data) {

    dataset = data;

    // created filtered data
    // var filteredData;


    // the columns you'd like to display
    var columns = ["Address","Building Class", "Sq.Ft.", "Retrofit Costs", "Yearly Savings"];

    var table = d3.select('body').select('#buildingTable'),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(column) { return column; });

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data(function(row) {
            return columns.map(function(column) {
                // console.log('Column: ',column,"Row: ",row[column]);
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
        .on('click', function(d){
                updateBuildingDetails(d.value);
            })
            .html(function(d) { 
                if(d.column == 'Address') {
                    return "<a href='#' >" +d.value+"</a>";
                }
                else
                    return d.value; 
            })
            ;
});

makePaybackBar("#paybackBar");
makePaybackBar("#paybackBarStandard");




