
var recordCount = dc.numberDisplay('#record_count')
var meanSalary = dc.numberDisplay('#mean_salary')
var medianSalary = dc.numberDisplay('#median_salary')
var seniorityChart = dc.rowChart('#seniority')
var employerChart = dc.rowChart('#employer')
var salaryChart = dc.barChart('#salary')
var bonusChart = dc.rowChart('#bonus')
var digitalStrategyChart = dc.rowChart('#digitalstrategy')
var technicalSEOChart = dc.rowChart('#technicalseo')
var contentChart = dc.rowChart('#content')
var linkbuildingChart = dc.rowChart('#linkbuilding')
var citybarChart = dc.rowChart('#citybar')
var mapChart = dc.geoChoroplethChart("#map");

d3.csv("https://s3.amazonaws.com/com.eanalytica.www/files/filtered.csv")
    .row(function(d) {
        d.salary = +d.salary
        d.bonus = +d.bonus
        d.digitalstrategy = +d.digitalstrategy
        d.technicalseo = +d.technicalseo
        d.content = +d.content
        d.linkbuilding = +d.linkbuilding
        return(d)
    })
    .get(function(error, rows) {

        var colorScale = d3.scale.ordinal().range(['#299ac6','#3569b1','#8f8f8f','#f5a805','#ec6776']);

        function median(ary) {
            if (ary.length == 0)
            {return null;}
            var mid = Math.floor(ary.length / 2);
            //assume array is already sorted
            if ((ary.length % 2) == 1)  // length is odd
            { return ary[mid]; }
            else {
                return (ary[mid - 1] + ary[mid]) / 2;
            }
        }

        var xfilter = crossfilter(rows)
        var all = xfilter.groupAll().reduce(
            function(p,v) {
                p.count = p.count + 1;
                p.salaryTotal = p.salaryTotal + v.salary
                p.meanSalary = p.count ? (p.salaryTotal/p.count) : 0
                p.salaries.push(v.salary)
                p.salaries.sort()
                p.medianSalary = median(p.salaries)
                return p
            },
            function(p,v) {
                p.count = p.count - 1;
                p.salaryTotal = p.salaryTotal - v.salary
                p.meanSalary = p.count ? (p.salaryTotal/p.count) : 0
                pos = p.salaries.indexOf(v.salary)
                p.salaries.splice(pos,1)
                p.medianSalary = median(p.salaries)
                return p
            },
            function(p,v) {
                return ({count: 0,
                         salaryTotal: 0,
                         meanSalary: 0,
                         salaries: [],
                         medianSalary: 0
                        })
            }
        )


        recordCount.group(all)
            .formatNumber(d3.format(".0f"))
            .valueAccessor( function(d) { return d.count; } )

        meanSalary.group(all)
            .formatNumber(d3.format(",.0f"))
            .valueAccessor( function(d) { return d.meanSalary})

        medianSalary.group(all)
            .formatNumber(d3.format(",.0f"))
            .valueAccessor( function(d) { return d.medianSalary})

        var seniorityDimension = xfilter.dimension(function(d) {
            if (d.seniority) {return d.seniority}
            else { return "Unknown" }
        })
        var seniorityGroup = seniorityDimension.group()
        seniorityChart.width(400)
            .height(300)
            .group(seniorityGroup)
            .dimension(seniorityDimension)
            .elasticX(true)
            .colors(colorScale)
            .ordering(function(d) {
                if (d.key==="Business Owner") { return 1 }
                else if (d.key==="Director/Head of Department") { return 2 }
                else if (d.key==="Manager") { return 3 }
                else if (d.key==="Junior") { return 4 }
                else { return 5 }
            })

        var employerDimension = xfilter.dimension(function(d) {
            if (d.employer == "") { console.log(d); return "Unknown"}
            else {return d.employer }
        })
        var employerGroup = employerDimension.group()
        employerChart.width(400)
            .height(200)
            .group(employerGroup)
            .dimension(employerDimension)
            .elasticX(true)
            .colors(colorScale)

        var salaryDimension = xfilter.dimension(function(d) {
            return (Math.floor(d.salary/5000)*5000)
        })
        var salaryGroup = salaryDimension.group()

        salaryChart.width(700)
            .height(400)
            .dimension(salaryDimension)
            .group(salaryGroup)
            .elasticY(true)
            .xUnits(function(){return 50})
            .x(d3.scale.linear().domain([0, 200000]))
            .colors(colorScale)
            .colorAccessor(function(d) { return '#3d4798' })

        var bonusDimension = xfilter.dimension(function(d) {
            d.bonus = +d.bonus
            if (d.bonus==0) { return "No Bonus"}
            else if (d.bonus < 1000) {return "< £1,000"}
            else if (d.bonus < 2000) {return "< £2,000"}
            else if (d.bonus < 5000) {return "< £5,000"}
            else if (d.bonus < 10000) {return "< £10,000"}
            else if (d.bonus >= 10000) {return  "> £10,000"}
            else { return "Unknown"}
        })
        var bonusGroup = bonusDimension.group()
        bonusChart.width(300)
            .height(400)
            .dimension(bonusDimension)
            .group(bonusGroup)
            .elasticX(true)
            .colors(colorScale)
            .ordering(function(d) {
                if (d.key==="No Bonus") { return 1 }
                else if (d.key==="< £1,000") { return 2 }
                else if (d.key==="< £2,000") { return 3 }
                else if (d.key==="< £5,000") { return 4 }
                else if (d.key==="< £10,000") { return 5 }
                else if (d.key==="> £10,000") { return 6 }
                else { return 7 }
            })

        var digitalStrategyDimension = xfilter.dimension(function(d) {
            return d.digitalstrategy
        })
        var digitalStrategyGroup = digitalStrategyDimension.group()
        digitalStrategyChart.width(300)
            .height(400)
            .dimension(digitalStrategyDimension)
            .group(digitalStrategyGroup)
            .elasticX(true)
            .colors(colorScale)

        var technicalSEODimension = xfilter.dimension(function(d) {
            return d.technicalseo
        })
        var technicalSEOGroup = technicalSEODimension.group()
        technicalSEOChart.width(300)
            .height(400)
            .dimension(technicalSEODimension)
            .group(technicalSEOGroup)
            .elasticX(true)
            .colors(colorScale)

        var contentDimension = xfilter.dimension(function(d) {
            return d.content
        })
        var contentGroup = contentDimension.group()
        contentChart.width(300)
            .height(400)
            .dimension(contentDimension)
            .group(contentGroup)
            .elasticX(true)
            .colors(colorScale)

        var linkbuildingDimension = xfilter.dimension(function(d) {
            return d.linkbuilding
        })
        var linkbuildingGroup = linkbuildingDimension.group()
        linkbuildingChart.width(300)
            .height(400)
            .dimension(linkbuildingDimension)
            .group(linkbuildingGroup)
            .elasticX(true)
            .colors(colorScale)

        var cityDimension = xfilter.dimension(function(d) {
            if (d.city==="london") { return "London" }
            else if (d.city==="brighton") { return "Brighton" }
            else if (d.city==="manchester") { return "Manchester" }
            else if (d.city==="exeter") { return "Exeter" }
            else if (d.city==="chelmsford") { return "Chelmsford" }
            else if (d.city==="leeds") { return "Leeds" }
            else if (d.city==="norwich") { return "Norwich" }
            else if (d.city==="southampton") { return "Southampton" }
            else if (d.city==="cambridge") { return "Cambridge" }
            else if (d.city==="chester") { return "Chester"}
            else if (d.city==="nottingham") { return "Nottingham" }
            else if (d.city==="reading") { return "Reading" }
            else if (d.city==="leicester") { return "Leicester" }
            else if (d.city==="peterborough") { return "Peterborough" }
            else if (d.city==="bristol") { return "Bristol" }
            else if (d.city==="london ") { return "London" }
            else if (d.city==="oxford") { return "Oxford" }
            else { return "Other" }
        })
        var cityGroup = cityDimension.group()
        citybarChart.width(400)
            .height(400)
            .dimension(cityDimension)
            .group(cityGroup)
            .elasticX(true)
            .colors(colorScale)

        regionDimension = xfilter.dimension(function(d) { return d.Region })
        regionGroup = regionDimension.group()

        var uk_projection = d3.geo.conicEqualArea()
            .scale(2981.0661468412723)
            .center([-2.5457543829543283,53.994971302636806]) //projection center
            .parallels([49.882340426026076,60.8605946741218]) //parallels for conic projection
            .rotate([2.5457543829543283]) //rotation for conic projection
            .translate([99.00566099607727,372.54760489722884]) //translate to center the map in view


        d3.json("https://s3.amazonaws.com/com.eanalytica.www/files/European_Electoral_Regions_December_2016_Ultra__Generalised_Clipped_Boundaries_in_Great_Britain.geojson", function (geojson) {
            mapChart.width(500)
                .height(600)
                .dimension(regionDimension)
                .group(regionGroup)
                .projection(uk_projection)
                .colors(d3.scale.quantize().range(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"]))
                .colorDomain([0, 77])
                .overlayGeoJson(geojson.features, "region", function (d) {
                    return d.properties.eer16nm;
                })
                .title(function (d) {
                    return d.key + ": " + d.value;
                });
            d3.selectAll('#loading').remove();
            d3.selectAll('.container').style("display","block")
            dc.renderAll();
        });

    });
