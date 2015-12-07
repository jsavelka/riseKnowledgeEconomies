// Declaration of all the global vars
var countries,        // Cannot instantiate before the data are processed
    educationMax  = 0,
    researchMax   = 0,
    internetMax   = 0,
    educationMean = 0,
    researchMean  = 0,
    internetMean  = 0,
    educationYearlyMaxes = {},
    researchYearlyMaxes = {},
    internetYearlyMaxes = {},
    educationYearlyMeans = {},
    researchYearlyMeans = {},
    internetYearlyMeans = {},
    educationCount = 0,
    researchCount = 0,
    internetCount = 0,
    educationYearlyCounts = {},
    researchYearlyCounts = {},
    internetYearlyCounts = {},
    barScaleEdu,      // Cannot instantiate before the data are processed
    barScaleRes,      // Cannot instantiate before the data are processed
    barScaleInet,     // Cannot instantiate before the data are processed
    margin      = {
        top:    10,
        right:  140,
        bottom: 0,
        left:   140
    },
    width       = 1482 - margin.right - margin.left,
    height      = 2377 - margin.top - margin.bottom,
    x           = d3.scale.ordinal().rangeRoundBands([0, width]),
    xAxisTop    = d3.svg.axis()
        .scale(x)
        .orient("top")
        .innerTickSize(0),
    xAxisBottom = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .innerTickSize(0),
    y           = d3.scale.ordinal().rangeRoundBands([0, height], .1),
    yAxis       = d3.svg.axis()
        .scale(y)
        .orient("left")
        .innerTickSize(0)
    yNext       = d3.scale.ordinal().rangeRoundBands([0, height], .1),
    chart       = d3.select("#timeLine")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom),
    years = [
        "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005",
        "2006", "2007", "2008", "2009", "2010", "2011", "2012"
    ],
    currYear    = years[0],
    codeToName  = {},
    tooltip     = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0),
    countryDisp = d3.select("body")
        .append("div")
        .attr("class", "countryDisp")
        .style("opacity", 0),
    inChoropleth = false;
    inTimeLine = false;

// Setup of anything that can be set up before the data are received
x.domain(years);
for (var year = parseInt(years[0]);
        year <= parseInt(years[years.length - 1]); year++) {
    educationYearlyMaxes[year] = 0;
    researchYearlyMaxes[year] = 0;
    internetYearlyMaxes[year] = 0;
    educationYearlyMeans[year] = 0;
    researchYearlyMeans[year] = 0;
    internetYearlyMeans[year] = 0;
    educationYearlyCounts[year] = 0;
    researchYearlyCounts[year] = 0;
    internetYearlyCounts[year] = 0;
}

// Data load block
d3.json("data/countryData.json", function(error, data) {

    if (error) throw error; // Stop here if the data were not read properly

    // Data processing to workable format
    for (var i = 0; i < data.countries.length; i++) {
        var country = data.countries[i];
        for (var year = parseInt(years[0]);
                year <= parseInt(years[years.length - 1]); year++) {
            var countryYear = country[year.toString()];
            countryYear.unavailable = new Set();
            processValue(countryYear, "education", countryYear.unavailable);
            processValue(countryYear, "research", countryYear.unavailable);
            processValue(countryYear, "internet", countryYear.unavailable);
            if (countryYear.education > educationMax) {
                educationMax = countryYear.education };
            if (countryYear.research > researchMax) {
                researchMax = countryYear.research };
            if (countryYear.internet > internetMax) {
                internetMax = countryYear.internet };
            if (countryYear.education > educationYearlyMaxes[year]) {
                educationYearlyMaxes[year] = countryYear.education;
            };
            if (countryYear.research > researchYearlyMaxes[year]) {
                researchYearlyMaxes[year] = countryYear.research;
            };
            if (countryYear.internet > internetYearlyMaxes[year]) {
                internetYearlyMaxes[year] = countryYear.internet;
            };
            if (countryYear.education !== 0) {
                educationMean = educationMean + countryYear.education;
                educationCount++;
                educationYearlyMeans[year] = educationYearlyMeans[year] + countryYear.education;
                educationYearlyCounts[year]++;
            }
            if (countryYear.research !== 0) {
                researchMean = researchMean + countryYear.research;
                researchCount++;
                researchYearlyMeans[year] = researchYearlyMeans[year] + countryYear.research;
                researchYearlyCounts[year]++;
            }
            if (countryYear.internet !== 0) {
                internetMean = internetMean + countryYear.internet;
                internetCount++;
                internetYearlyMeans[year] = internetYearlyMeans[year] + countryYear.internet;
                internetYearlyCounts[year]++;
            }
        }
        codeToName[country.code] = country.name;
    }
    countries = data.countries;
    educationMean = educationMean / educationCount;
    researchMean = researchMean / researchCount;
    internetMean = internetMean / internetCount;
    for (var year = parseInt(years[0]);
            year <= parseInt(years[years.length - 1]); year++) {
        educationYearlyMeans[year] = educationYearlyMeans[year] /
            educationYearlyCounts[year];
        researchYearlyMeans[year] = researchYearlyMeans[year] /
            researchYearlyCounts[year];
        internetYearlyMeans[year] = internetYearlyMeans[year] /
            internetYearlyCounts[year];
    }

    drawVisualization();

    // After loop processing (remaining axes)
    drawAxis(xAxisTop, "tl x axis", margin.left, margin.top);
    drawAxis(xAxisBottom, "tl x axis", margin.left, margin.top + height);
});

// Utility functions
function makeYear(year) {
    // g container for a year (large column)
    var yearContainer = chart
        .append("g")
        .attr("class", "tl country")
        .attr("transform", "translate(" + (margin.left + x(year))
            + "," + margin.top + ")");

    // links from one year to another
    if (year !== years[years.length - 1]) {
        var links = yearContainer.selectAll("line")
            .data(countries)
            .enter()
            .append("line")
            .attr("class", function(d) {
                return "tl " + d.code + " unlocked";
            })
            .attr("x1", function(d) {
                return barScaleRes(d[year].research)
                    + barScaleEdu(d[year].education)
                    + barScaleInet(d[year].internet);
            })
            .attr("y1", function(d) {
                return y(d.name) + y.rangeBand() / 2;
            })
            .attr("x2", function(d) {
                return x.rangeBand() + 2;
            })
            .attr("y2", function(d) {
                return yNext(d.name) + y.rangeBand() / 2;
            })
            .on("mouseover", colorBackgroundRectsAndLinks)
            .on("mouseout", decolorBackgroundRectsAndLinks);
    }

    // g container for a single country
    var bar = yearContainer.selectAll("g")
        .data(countries)
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(0," + y(d.name) + ")"
        })
        .on("mouseover", colorBackgroundRectsAndLinks)
        .on("mouseout", decolorBackgroundRectsAndLinks)
        .on("click", function(d) {
            displayTooltip();
            insertTooltipContent(d, year);
            insertTooltipTemplate(d, year);
            insertTooltipColorFixer(d);
            createSimpleTimeLine(d.name, "x");
        });

    // background rectangle for a single country
    bar.append("rect")
        .attr("width", function(d) {
            return barScaleRes(d[year].research)
                + barScaleEdu(d[year].education)
                + barScaleInet(d[year].internet) + 2;
        })
        .attr("height", y.rangeBand())
        .attr("class", function(d) {
            return "tl " + d.code + " background unlocked";
        });

    // education rectangle for a single country
    bar.append("rect")
        .attr("y", 1)
        .attr("x", 1)
        .attr("width", function(d) {
            return barScaleEdu(d[year].education);
        })
        .attr("height", y.rangeBand() - 2)
        .attr("class", function(d) {
            return "tl " + d.code + " education";
        });

    // research rectangle for a single country
    bar.append("rect")
        .attr("y", 1)
        .attr("x", function(d) {
            return barScaleEdu(d[year].education) + 1;
        })
        .attr("width", function(d) {
            return barScaleRes(d[year].research);
        })
        .attr("height", y.rangeBand() - 2)
        .attr("class", function(d) {
            return "tl " + d.code + " research";
        });

    // internet rectangle for a single country
    bar.append("rect")
        .attr("y", 1)
        .attr("x", function(d) {
            return barScaleRes(d[year].research)
                + barScaleEdu(d[year].education) + 1;
        })
        .attr("width", function(d) {
            return barScaleInet(d[year].internet);
        })
        .attr("height", y.rangeBand() - 2)
        .attr("class", function(d) {
            return "tl " + d.code + " internet";
        });

    return bar
}

function compareCountries(firstCountry, secondCountry) {
    var eduComp  = barScaleEdu(secondCountry[currYear].education)
        - barScaleEdu(firstCountry[currYear].education);
    var resComp  = barScaleRes(secondCountry[currYear].research)
        - barScaleRes(firstCountry[currYear].research);
    var inetComp = barScaleInet(secondCountry[currYear].internet)
        - barScaleInet(firstCountry[currYear].internet);
    var comparison = eduComp + resComp + inetComp;
    if (comparison !== 0) {
        return comparison;
    } else {
        if (firstCountry.name < secondCountry.name) {
            return -1;
        } else {
            return 1;
        }
    }
}

function makeBarScale(max, importance) {
    return d3.scale.linear()
        .range([0, x.rangeBand() * importance])
        .domain([0, max]);
}

function reloadData(scale) {
    countries = countries.sort(compareCountries);
    scale.domain(countries.map(function(d) {
        return d.name;
    }));
}

function drawAxis(axis, classes, x, y) {
    chart.append("g")
        .attr("class", classes)
        .attr("transform", "translate(" + x  + "," + y + ")")
        .call(axis);
}

function processValue(countryYear, value, unavailable) {
    if (isNaN(countryYear[value])) {
        countryYear[value] = 0.0;
        unavailable.add(value);
    } else {
        countryYear[value] = parseFloat(countryYear[value]);
    }
}

function colorBackgroundRectsAndLinks(d) {
            var selectedRects =
                chart.selectAll("rect." + d.code + ".background.unlocked");
            var selectedLinks =
                chart.selectAll("line." + d.code + ".unlocked");
            var leftLabels = chart.select("g.tl.y.axis.left")
                .selectAll(".tick");
            var rightLabels = chart.select("g.tl.y.axis.right")
                .selectAll(".tick");
            selectedLinks
                .style("stroke", "black")
                .style("stroke-width", "3");
            selectedRects
                .style("fill", "black");
            colorLabel(leftLabels, d.code);
            colorLabel(rightLabels, d.code);
            countryDisp.transition()
                .duration(500)
                .style("opacity", .8);
            countryDisp.html(d.name)
                .style("left", "100%")
                .style("top", "100%");
}

function colorLabel(ticks, code) {
    ticks.each(
        function(label) {
            if (codeToName[code] == label) {
                d3.select(this)
                    .selectAll('text')
                    .style("font-weight", "bold")
            }
        });
}

function decolorBackgroundRectsAndLinks(d) {
            var selectedRects =
                chart.selectAll("rect." + d.code + ".background.unlocked");
            var selectedLinks =
                chart.selectAll("line." + d.code + ".unlocked");
            var leftLabels = chart.select("g.tl.y.axis.left")
                .selectAll(".tick");
            var rightLabels = chart.select("g.tl.y.axis.right")
                .selectAll(".tick");
            selectedLinks
                .style("stroke", "#BDBDBD")
                .style("stroke-width", "2");
            selectedRects
                .style("fill", "#BDBDBD");
            decolorLabel(leftLabels, d.code);
            decolorLabel(rightLabels, d.code);
            countryDisp.transition()
                .duration(500)
                .style("opacity", 0);
            countryDisp.transition()
                .delay(450)
                .style("left", "2000px");
}

function decolorLabel(ticks, code) {
    ticks.each(
        function(label) {
            if (codeToName[code] == label) {
                d3.select(this)
                    .selectAll('text')
                    .style("font-weight", "normal")
            }
        });
}

function displayTooltip() {
    tooltip.transition()
        .duration(500)
        .style("opacity", .8);
    if (window.innerWidth > 1050 && window.innerHeight > 630) {
        tooltip
            .style("position", "fixed")
            .style("left", "50%")
            .style("top", "50%");
    } else {
        var doc = document.documentElement;
        var l = (window.pageXOffset ||
                    doc.scrollLeft) - (doc.clientLeft || 0);
        var t = (window.pageYOffset ||
                    doc.scrollTop)  - (doc.clientTop || 0);
        tooltip
            .style("position", "absolute")
            .style("left", (l + 517) + "px")
            .style("top", (t + 305) + "px");
    }
}

function insertTooltipTemplate(d, year) {
    var closeButton = tooltip.append("div")
        .attr("id", "tooltipClose");
    closeButton.append("h1")
        .on("click", function() {
            $("#choropleth").appendTo("#offScreen");
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            tooltip.transition()
                .delay(450)
                .style("position", "fixed")
                .style("left", "2000px");
            inChoropleth = false;
            inTimeLine = false;
        })
        .text("X");
    var menu = tooltip.append("div")
        .attr("id", "tooltipMenu");
    menu.append("span")
        .attr("class", "tooltipButton")
        .text("| main ")
        .on("click", function() {
            inChoropleth = false;
            if (inTimeLine === false) {
                $("#choropleth").appendTo("#offScreen");
                tooltip.html("");
                insertTooltipContent(d, year);
                insertTooltipTemplate(d, year);
                insertTooltipColorFixer(d);
                createSimpleTimeLine(d.name, "x");
                inTimeLine = true;
            }
        });
    menu.append("span")
        .attr("class", "tooltipButton")
        .text("| choropleth |")
        .on("click", function() {
            inTimeLine = false;
            if (inChoropleth === false) {
                tooltip.html("");
                insertTooltipTemplate(d, year);
                insertTooltipColorFixer(d);
			    makeChoropleth(d, year, countries);
                inChoropleth = true;
            }
		});
}

function insertTooltipColorFixer(d) {
    tooltip.append("div")
        .attr("class", "colorFixer void")
        .on("click", createPathDecolorHandler(d));
    tooltip.append("div")
        .attr("class", "colorFixer red")
        .on("click", createPathColorHandler(d, "#e41a1c"));
    tooltip.append("div")
        .attr("class", "colorFixer blue")
        .on("click", createPathColorHandler(d, "#377eb8"));
    tooltip.append("div")
        .attr("class", "colorFixer green")
        .on("click", createPathColorHandler(d, "#4daf4a"));
    tooltip.append("div")
        .attr("class", "colorFixer violet")
        .on("click", createPathColorHandler(d, "#984ea3"));
    tooltip.append("div")
        .attr("class", "colorFixer orange")
        .on("click", createPathColorHandler(d, "#ff7f00"));
}

function insertTooltipContent(d, year) {
    var home = "<h1 align='center'><b>" + d.name + " (" + d.code  + ")" + " in " + year + "</b></h1>" +
        "<h3 class='education'>Government expenditure per student,<br> primary(% of GDP per capita)</h3>" +
        "<p><div>Raw percentage: " + d[year].education.toFixed(1) + "%</div>" +
        "<div>Difference to the best in " + year + ": " + (d[year].education - educationYearlyMaxes[year]).toFixed(1) + "%</div>" +
        "<div>Difference to the mean in " + year + ": " + (d[year].education - educationYearlyMeans[year]).toFixed(1) + "%</div>" +
        "<div>Difference to the all time best: " + (d[year].education - educationMax).toFixed(1) + "%</div>" +
        "<div>Difference to the all time mean: " + (d[year].education - educationMean).toFixed(1) + "%</div></p>" +
        "<h3 class='research'>Research and development expenditure<br>(% of GDP)</h3>" +
        "<p><div>Raw percentage: " + d[year].research.toFixed(1) + "%</div>" +
        "<div>Difference to the best in " + year + ": " + (d[year].research - researchYearlyMaxes[year]).toFixed(1) + "%</div>" +
        "<div>Difference to the mean in " + year + ": " +  (d[year].research - researchYearlyMeans[year]).toFixed(1) + "%</div>" +
        "<div>Difference to the all time best: " + (d[year].research - researchMax).toFixed(1) + "%</div>" +
        "<div>Difference to the all time mean: " + (d[year].research - researchMean).toFixed(1) + "%</div></p>" +
        "<h3 class='internet'>Internet users (%)</h3>" +
        "<p><div>Raw percentage: " + d[year].internet.toFixed(1) + "%</div>" +
        "<div>Difference to the best in " + year + ": " + (d[year].internet - internetYearlyMaxes[year]).toFixed(1) + "%</div>" +
        "<div>Difference to the mean in " + year + ": " + (d[year].internet - internetYearlyMeans[year]).toFixed(1) + "%</div>" +
        "<div>Difference to the all time best: " + (d[year].internet - internetMax).toFixed(1) + "%</div>" +
        "<div>Difference to the all time mean: " + (d[year].internet - internetMean).toFixed(1) + "%</div></p>";
    tooltip.html(home);
}

function createPathColorHandler(d, color) {
    return function() {
        var selectedRects = chart
            .selectAll("rect." + d.code + ".background");
        var selectedLinks =
            chart.selectAll("line." + d.code);
        var leftLabels = chart.select("g.tl.y.axis.left")
            .selectAll(".tick");
        var rightLabels = chart.select("g.tl.y.axis.right")
            .selectAll(".tick");
        selectedLinks
            .style("stroke", color)
            .style("stroke-width", "3")
            .attr("class", "tl line " + d.code + " locked");
        selectedRects
            .style("fill", color)
            .attr("class", "tl rect " + d.code + " background locked");
    }
}

function createPathDecolorHandler(d, color) {
    return function() {
        var selectedRects =
            chart.selectAll("rect." + d.code + ".background.locked");
        var selectedLinks =
            chart.selectAll("line." + d.code + ".locked");
        var leftLabels = chart.select("g.tl.y.axis.left")
            .selectAll(".tick");
        var rightLabels = chart.select("g.tl.y.axis.right")
            .selectAll(".tick");
        selectedLinks
            .style("stroke", "#BDBDBD")
            .style("stroke-width", "2")
            .attr("class", "tl line " + d.code + " unlocked");
        selectedRects
            .style("fill", "#BDBDBD")
            .attr("class", "tl rect " + d.code + " background locked");
    }
}

function drawVisualization() {
    eraseVisualization();
    // Before loop processing (scales, left y axis)
    var educationImportance =
            document.getElementById("educationImportance").value,
        researchImportance  =
            document.getElementById("researchImportance").value,
        internetImportance  =
            document.getElementById("internetImportance").value,
        totalImportance     = parseInt(educationImportance) +
            parseInt(researchImportance) + parseInt(internetImportance);
    if (educationImportance === "0" &&
        researchImportance === "0" &&
        internetImportance === "0") {
        educationImportance = 10;
        researchImportance = 10;
        internetImportance = 10;
        totalImportance = 30;
    }
    barScaleInet = makeBarScale(internetMax, internetImportance / totalImportance);
    barScaleEdu  = makeBarScale(educationMax, educationImportance / totalImportance);
    barScaleRes  = makeBarScale(researchMax, researchImportance / totalImportance);
    reloadData(y);


    // Main loop for drawing the time line graphs
    for (var i = 0; i < years.length; i++) {
        var year = years[i];
        currYear = year;
        reloadData(y);
        if (i === 0) {
            yAxis.orient("left");
            drawAxis(yAxis, "tl y axis left", margin.left, margin.top);
        }
        if (year !== years[years.length - 1]) {
            currYear = years[i + 1];
            reloadData(yNext);
        }
        makeYear(year);
    }

    yAxis.orient("right");
    drawAxis(yAxis, "tl y axis right", margin.left + width, margin.top);
}

function eraseVisualization() {
    chart.selectAll(".y.axis").remove();
    chart.selectAll("rect").remove();
    chart.selectAll("line").remove();
}

function createSimpleTimeLine(countryName, year) {
    var margin = {top: 20,
                  right: 20,
                  bottom: 30,
                  left: 50},
        width  = 620 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%Y").parse;

    var x = d3.time.scale()
            .range([0, width]),
        y = d3.scale.linear()
            .range([height, 0])
            .domain([0, 100]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var internetLine = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.values.internet); });

    var researchLine = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.values.research); });

    var educationLine = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.values.education); });

    var svg = tooltip.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "simpleTimeLine")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var country = {};
    for (var i = 0; i < countries.length; i++) {
        if (countryName === countries[i].name) {
            country = countries[i];
        }
    }
    var data = [];
    for (var year = parseInt(years[0]);
            year <= parseInt(years[years.length - 1]); year++) {
        data.push({"year": year.toString(), "values": country[year]});
    }

    data.forEach(function(d) {
        d.year = parseDate(d.year);
    });

    x.domain(d3.extent(data, function(d) { return d.year; }));

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("%");

    svg.append("path")
        .datum(data)
        .attr("class", "internetLine")
        .attr("d", internetLine);

    svg.append("path")
        .datum(data)
        .attr("class", "educationLine")
        .attr("d", educationLine);

    svg.append("path")
        .datum(data)
        .attr("class", "researchLine")
        .attr("d", researchLine);
}
