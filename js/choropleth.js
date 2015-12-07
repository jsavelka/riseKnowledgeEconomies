 var gCountry;
 var gYear;
 var gCountries;

function makeChoropleth(country, year, countries) {
	
	gCountry = country;
	gYear = year;
	gCountries = countries;
	
	$( "#map" ).empty()
	
	var yearData = new Array(), colorData = [], 
	max = 0, diff,
	countryClass = "." + country.code;

	
	//	Make array for the specified year.
	//	Also find the maximum value, for dynamic scale specification
	for(i = 0; i < countries.length; i++) {
		var total = round(countries[i][year].research + 
					countries[i][year].education + countries[i][year].internet);
		yearData[countries[i].code] = countries[i][year];
				
		if(total > max) {
			max = total;
		}
	}

	diff = round(max/7);
	
	// Add fillkey to each array element
	
	for (c in yearData) {
		var total = yearData[c].research + yearData[c].education + yearData[c].internet;
		if( total < diff ) { colorData[c] = {'fillKey': 1 }; }
		else if( total < diff * 2 ) { colorData[c] = {'fillKey': 2 }; }
		else if( total < diff * 3 ) { colorData[c] = {'fillKey': 3 }; }
		else if( total < diff * 4 ) { colorData[c] = {'fillKey': 4 }; }
		else if( total < diff * 5 ) { colorData[c] = {'fillKey': 5 }; }
		else if( total < diff * 6 ) { colorData[c] = {'fillKey': 6 }; }
		else if( total < max ) { colorData[c] = {'fillKey': 7 }; }
	}
	
	var map = new Datamap({
		element: document.getElementById('map'),
		fills: {
			1:'#eff3ff',
			2:'#c6dbef',
			3:'#9ecae1',
			4:'#6baed6',
			5:'#4292c6',
			6:'#2171b5',
			7:'#084594',
			defaultFill: '#d3d3d3'
		},
		data: colorData,
		geographyConfig: {
			popupTemplate: function(geo) {
				return '<div class="hoverinfo"><b>' + geo.properties.name +
					" Spending: " + "</b><br />Internet: " + round(yearData[geo.id].internet) + 
					"<br />Education: " + round(yearData[geo.id].education) + 
					"<br />Research: " + round(yearData[geo.id].research);
			}
		}
	});
	
	$(countryClass).css({"stroke": "yellow"})
	$("#choroSlider").simpleSlider("setValue", year);
	document.getElementById("year").innerHTML = year;
}

$("#choroSlider").bind("slider:changed", function (event, data) {
	makeChoropleth(gCountry, data.value, gCountries);
});



function round(num) { return Math.round(num*10)/10; }