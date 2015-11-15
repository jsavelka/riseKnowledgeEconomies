(function(){
    // Declaration of all the global vars
    var countries,        // Cannot instantiate before the data are processed
        educationMax = 0,
        researchMax  = 0,
        internetMax  = 0,
        barScaleEdu,      // Cannot instantiate before the data are processed
        barScaleRes,      // Cannot instantiate before the data are processed
        barScaleInet,     // Cannot instantiate before the data are processed
        margin      = {
            top:    20,
            right:  200,
            bottom: 20,
            left:   145
        },
        width       = 2175 - margin.right - margin.left,
        height      = 2837 - margin.top - margin.bottom,
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
        curr_year   = years[0];

    // Setup of anything that can be set up before the data are received
    x.domain(years);

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
            }
        }
        countries = data.countries;

        // Before loop processing (scales, left y axis)
        barScaleInet = makeBarScale(internetMax);
        barScaleEdu  = makeBarScale(educationMax);
        barScaleRes  = makeBarScale(researchMax);
        reloadData(y);
        drawAxis(yAxis, "tl y axis", margin.left, margin.top);

        // Main loop for drawing the time line graphs
        for (var i = 0; i < years.length; i++) {
            var year = years[i];
            curr_year = year;
            reloadData(y);
            if (year !== years[years.length - 1]) {
                curr_year = years[i + 1];
                reloadData(yNext);
            }
            makeYear(year);
        }

        // After loop processing (remaining axes)
        yAxis.orient("right");
        drawAxis(yAxis, "tl y axis", margin.left + width, margin.top);
        drawAxis(xAxisTop, "tl x axis", margin.left, margin.top);
        drawAxis(xAxisBottom, "tl x axis", margin.left, margin.top + height);
    });

    // Utility functions
    function makeYear(year) {
        // g container for a year (large column)
        var yearContainer = chart
            .append("g")
            .attr("transform", "translate(" + (margin.left + x(year))
                + "," + margin.top + ")");

        // links from one year to another
        if (year !== years[years.length - 1]) {
            var links = yearContainer.selectAll("line")
                .data(countries)
                .enter()
                .append("line")
                .attr("class", function(d) {
                    return "tl " + d.code;
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
                });
        }

        // g container for a single country
        var bar = yearContainer.selectAll("g")
            .data(countries)
            .enter()
            .append("g")
            .attr("transform", function(d) {
                return "translate(0," + y(d.name) + ")"
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
                return "tl " + d.code + " background";
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
        var eduComp  = barScaleEdu(secondCountry[curr_year].education)
            - barScaleEdu(firstCountry[curr_year].education);
        var resComp  = barScaleRes(secondCountry[curr_year].research)
            - barScaleRes(firstCountry[curr_year].research);
        var inetComp = barScaleInet(secondCountry[curr_year].internet)
            - barScaleInet(firstCountry[curr_year].internet);
        return eduComp + resComp + inetComp;
    }

    function makeBarScale(max) {
        return d3.scale.linear()
            .range([0, x.rangeBand() / 3])
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
})();
