
var MAX_PAYOFF_YEARS = 9;

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

    fillTable(checkHealthcare.is(":checked"),
        checkOffices.is(":checked"),
        checkSchools.is(":checked"));
};

//Initializes the payback bar with a default value
function makePaybackBar(paybackbarID) {
    svg = d3.select(paybackbarID).select("svg");

    leftPoint = svg.attr("bar-left");
    
    var x = d3.scale.linear()
          .domain([0, MAX_PAYOFF_YEARS])
          .range([0, svg.attr("width")]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .tickValues([1,2,3,4,5,6,7,8])
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

};

//Updates the payback bar with the expected payback period given
function updatePaybackBar(paybackPeriod, paybackbarID){
    //console.log("paybackPeriod:", paybackPeriod)

    svg = d3.select(paybackbarID).select("svg");

    if(!isNaN(paybackPeriod)) {
        leftPoint = svg.attr("bar-left");

        var x = d3.scale.linear()
              .domain([0, MAX_PAYOFF_YEARS])
              .range([0, svg.attr("width")]);

        //console.log(leftPoint, paybackPeriod, x(paybackPeriod) )

        svg.select("g.highlight_bar").select("line")
            .attr("x1",leftPoint)
            .attr("y1", svg.attr("height")/3 + 3)
            .attr("x2",x(paybackPeriod)+leftPoint)
            .attr("y2", svg.attr("height")/3 + 3);
        svg.style("visibility", "visible");
    } else {
        svg.style("visibility", "hidden");
    }
};

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

    //console.log(buildingAddress)

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
    var StdEnergyCostsAfter = parseFloat(row["Energy Cost per SqFt After EBCx"])*parseFloat(row["Sq.Ft."]);
    // for paybackbar
    savings = row["Standard Yearly Savings"].replace("$","").replace(",","");
    numer = parseInt( StdRetrofitCosts );
    denom = parseInt(savings);


    costStrStd = "<p>Energy costs before: $"+ energyCostsBefore.format(2) + "<br>" +
                "Energy costs after: $" + StdEnergyCostsAfter.format(2) + "</p>" +
                "<p>Retrofit Costs (one-time): $" + StdRetrofitCosts.format(2) + "</p>" +
                "<h2>Yearly Savings: " + row["Standard Yearly Savings"] + "</h2>";


    StdDetails.select("#energyCostsStandard")
            .html(costStrStd);

    updatePaybackBar(numer/denom, "#paybackBarStandard");


    // ------------------------------------------------------
    //  deep retrofits

    var DeepDetails = d3.select("#buildingDetailsDeep");

    //var DeepRetrofitCosts = parseFloat(row["Deep Retrofit Cost"]);
    var DeepRetrofitCosts = parseFloat(row["Deep Retrofit Cost"].replace("$","").replace(",","").replace(",",""));
    //console.log("DeepRetrofitCosts:", DeepRetrofitCosts);
    // not available for deep:
    // var StdEnergyCostsAfter = parseFloat(row["Energy Cost per SqFt After EBCx"])*parseFloat(row["Sq.Ft."]);
    
    // for paybackbar
    DeepSavings = row["Deep Yearly Savings"].replace("$","").replace(",","");
    numer = parseInt(DeepRetrofitCosts);
    denom = parseInt(DeepSavings);


    if(!isNaN(DeepRetrofitCosts)) {
        costStrDeep = "<p>Retrofit Costs (one-time): $" + DeepRetrofitCosts.format(2) + "</p>" +
                    "<h2>Yearly Savings: " + row["Deep Yearly Savings"] + "</h2>";
    } else {
        costStrDeep = "(not available for this building class)";
    }

    DeepDetails.select("#energyCostsDeep")
            .html(costStrDeep);

    updatePaybackBar(numer/denom, "#paybackBarDeep");

    details.style("visibility", "visible");
    StdDetails.style("visibility", "visible");
    DeepDetails.style("visibility", "visible");

    //console.log(dataset);
};


function fillTable(showHealthcare,showOffice,showSchool) {
    displayList = [];
    if(showHealthcare) displayList.push("Healthcare");
    if(showOffice) displayList.push("Office");
    if(showSchool) displayList.push("School");

    console.log(displayList);
     // created filtered data
    var filteredData = []
    for(var i=0;i<dataset.length;i++) {
        row = dataset[i];
        console.log($.inArray(row["Building Class"],displayList));
        if($.inArray(row["Building Class"],displayList) >= 0) {
            filteredData.push(row);
        }
    }


    // the columns you'd like to display
    var columns = ["Address","Building Class", "Sq.Ft.", "Retrofit Costs", "Yearly Savings"];

    var table = d3.select('#buildingTable');
    table.select("thead").remove();
    table.select("tbody").remove();

    thead = table.append("thead");
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
        .data(filteredData)
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
            });
};



d3.csv('data/DOE_reference_bldgs.csv', function(data) {

    dataset = data;

    fillTable(true,true,true);   
});

makePaybackBar("#paybackBar");
makePaybackBar("#paybackBarStandard");
makePaybackBar("#paybackBarDeep");




