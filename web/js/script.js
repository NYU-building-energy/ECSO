

var dataset;


// d3.csv('data/DOE_reference_bldgs.csv', function(error,data) {
// 	if (error) {
// 	  console.log(error);
// 	} 
// 	else {
// 	  console.log(data);
// 	  dataset = data;

// 	  var dataTable = d3.select('body').select('#buildingTable');

// 	  var tr = dataTable.select('tbody').selectAll('tr')
// 		.data(dataset)
// 		.enter()
// 		.append('tr');
// 	  }

// 	 var td = tr.selectAll("td")
// 	    .data(function(row) {
// 	        return headers.map(function(d) { console.log(row.properties)
// 	            return {column: d, value: row.properties[d]};
// 	        });
// 	    })
// 	    .enter()
// 	    .append("td")
// 	    .text(function (d) {
// 	        return d.value;
//     });
// })

d3.csv('data/DOE_reference_bldgs.csv', function(data) {
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
                return {column: column, value: row[column]};
            });
        })
        .enter()
        .append("td")
            .text(function(d) { return d.value; });
});


