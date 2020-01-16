const dailyHitsChart = dc.barChart('#hits-chart');
const userAgentsChart = dc.rowChart('#useragents-chart');
const statusCodeChart = dc.rowChart('#statuscode-chart')
const contentTable = new dc.dataTable('#content-table');

var containerWidth = +d3.select('.narrow').style('width').slice(0, -2)
var chartWidth = containerWidth - 50

d3.csv("/logs/logs.csv").then(function(data) {
    const dateFormatSpecifier = '%Y-%m-%d';
    const dateFormat = d3.timeFormat(dateFormatSpecifier);
    const dateFormatParser = d3.timeParse(dateFormatSpecifier);

    data.forEach(function(d) {
        d.date = dateFormatParser(d.date)
    })

    var xfilter = crossfilter(data);
    var all = xfilter.groupAll();
    var dailyDimension = xfilter.dimension(function(d) {return d.date});
    var dailyGroup = dailyDimension.group().reduceCount();
    var userAgentDimension = xfilter.dimension(function(d) {return d.parsed_ua});
    var userAgentGroup = userAgentDimension.group()
    var statusCodeDimension = xfilter.dimension(function(d) {return d.status});
    var statusCodeGroup = statusCodeDimension.group()
    var contentDimension = xfilter.dimension(function(d) {return d.url})
    var contentGroup = contentDimension.group()

    function remove_empty_bins(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    return d.value != 0;
                });
            },
            top:function(k) {
                return source_group.top(k).filter(function(d) {
                    return d.value != 0;
                })
            }
        };
    }

    nContentGroup = remove_empty_bins(contentGroup)

    dailyHitsChart
        .width(chartWidth)
        .height(180)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(dailyDimension)
        .group(dailyGroup)
        .elasticY(true)
        .centerBar(true)
        .x(d3.scaleTime([d3.min(data, function(d){return d.date}), d3.max(data, function(d){return d.date})]))

    userAgentsChart
        .width(chartWidth)
        .height(360)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .elasticX(true)
        .dimension(userAgentDimension)
        .group(userAgentGroup)
        .rowsCap(15)

    statusCodeChart
        .width(chartWidth)
        .height(360)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .elasticX(true)
        .dimension(statusCodeDimension)
        .group(statusCodeGroup)

    contentTable
        .dimension(nContentGroup)
        .columns([function (d) { return '<a href="'+d.key+'">'+d.key+'</a>' },
                  function (d) { return d.value}
                 ])
        .sortBy(function (d) { return d.value })
        .order(d3.descending)

    dc.renderAll();

})
