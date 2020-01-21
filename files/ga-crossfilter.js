// Copyright 2012 Google Inc. All Rights Reserved.

/* Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Sample program traverses the Managemt API hierarchy to
 * retrieve the first profile id. This profile id is then used to query the
 * Core Reporting API to retrieve the top 25 organic
 * Note: auth_util.js is required for this to run.
 * @author api.nickm@gmail.com (Nick Mihailovski)
 */

/**
 * Executes a query to the Management API to retrieve all the users accounts.
 * Once complete, handleAccounts is executed. Note: A user must have gone
 * through the Google APIs authorization routine and the Google Anaytics
 * client library must be loaded before this function is called.
 */
function makeApiCall() {
  outputToPage('Querying Accounts.');
  gapi.client.analytics.management.accounts.list().execute(handleAccounts);
}


/**
 * Handles the API response for querying the accounts collection. This checks
 * to see if any error occurs as well as checks to make sure the user has
 * accounts. It then retrieve the ID of the first account and then executes
 * queryWebProeprties.
 * @param {Object} response The response object with data from the
 *     accounts collection.
 */
function handleAccounts(response) {
  if (!response.code) {
    if (response && response.items && response.items.length) {
      $.each(response.items, function(index, value) {
          $('ul#accountList').append('<li><a href="#" class="account" data-accountid=\"'+value.id+'\">'+value.name+'</a></li>');
          });
      $('div.authbuttons').remove()  
    } else {
      updatePage('No accounts found for this user.')
    }
  } else {
    updatePage('There was an error querying accounts: ' + response.message);
  }
}

/**
 * Executes a query to the Management API to retrieve all the users
 * webproperties for the provided accountId. Once complete,
 * handleWebproperties is executed.
 * @param {String} accountId The ID of the account from which to retrieve
 *     webproperties.
 */
function queryWebproperties(accountId) {
  updatePage('Querying Webproperties.');
  gapi.client.analytics.management.webproperties.list({
      'accountId': accountId
  }).execute(handleWebproperties);
}


/**
 * Handles the API response for querying the webproperties collection. This
 * checks to see if any error occurs as well as checks to make sure the user
 * has webproperties. It then retrieve the ID of both the account and the
 * first webproperty, then executes queryProfiles.
 * @param {Object} response The response object with data from the
 *     webproperties collection.
 */
function handleWebproperties(response) {
  if (!response.code) {
    if (response && response.items && response.items.length) {  
      var firstAccountId = response.items[0].accountId;
      var firstWebpropertyId = response.items[0].id;
      queryProfiles(firstAccountId, firstWebpropertyId);
    } else {
      updatePage('No webproperties found for this user.')
    }
  } else {
    updatePage('There was an error querying webproperties: ' +
        response.message);
  }
}


/**
 * Executes a query to the Management API to retrieve all the users
 * profiles for the provided accountId and webPropertyId. Once complete,
 * handleProfiles is executed.
 * @param {String} accountId The ID of the account from which to retrieve
 *     profiles.
 * @param {String} webpropertyId The ID of the webproperty from which to
 *     retrieve profiles.
 */
function queryProfiles(accountId, webpropertyId) {
  updatePage('Querying Profiles.');
  gapi.client.analytics.management.profiles.list({
    'accountId': accountId,
    'webPropertyId': webpropertyId
  }).execute(handleProfiles);
}


/**
 * Handles the API response for querying the profiles collection. This
 * checks to see if any error occurs as well as checks to make sure the user
 * has profiles. It then retrieve the ID of the first profile and
 * finally executes queryCoreReportingApi.
 * @param {Object} response The response object with data from the
 *     profiles collection.
 */
function handleProfiles(response) {
  if (!response.code) {
    if (response && response.items && response.items.length) {
      $('ul#profileList').empty()
      $.each(response.items, function(index, value) {
          $('ul#profileList').append('<li><a href="#" class="profile" data-profileid=\"'+value.id+'\">'+value.name+'</a></li>');
          });
    } else {
      updatePage('No profiles found for this user.')
    }
  } else {
    updatePage('There was an error querying profiles: ' + response.message);
  }
}


/**
 * Execute a query to the Core Reporting API to retrieve the top 25
 * organic search terms by visits for the profile specified by profileId.
 * Once complete, handleCoreReportingResults is executed.
 * @param {String} profileId The profileId specifying which profile to query.
 */
function queryCoreReportingApi(profileId) {
  updatePage('Querying Core Reporting API.');
  gapi.client.analytics.data.ga.get({
    'ids': 'ga:' + profileId,
    'start-date': lastNDays(30),
    'end-date': lastNDays(0),
    'metrics': 'ga:visits',
    'dimensions': 'ga:visitCount,ga:source,ga:medium,ga:browser,ga:deviceCategory',
    'max-results': 10000
  }).execute(handleCoreReportingResults);
}


/**
 * Handles the API reponse for querying the Core Reporting API. This first
 * checks if any errors occured and prints the error messages to the screen.
 * If sucessful, the profile name, headers, result table are printed for the
 * user.
 * @param {Object} response The reponse returned from the Core Reporting API.
 */
function handleCoreReportingResults(response) {
  if (!response.code) {
    if (response.rows && response.rows.length) {
      updatePage("Data collected. Plotting...")  
      var xfilterlist = [];  
      var profileName = response.profileInfo.profileName;

      // Put cells in table.
      for (var i = 0, row; row = response.rows[i]; ++i) {
        xfilterlist.push({visitCount: +row[0],
                            source:row[1],
                            medium:row[2],
                            browser:row[3],
                            device:row[4],
                            visits: +row[5]})
      }

        var xfilter = crossfilter(xfilterlist)
        visitcount = xfilter.groupAll().reduceSum(function(d) {
            return d.visits
        });
        //can only be 'desktop', 'mobile' or 'tablet'
        deviceDimension = xfilter.dimension(function(d) {
            return d.device
        });
        deviceGroup = deviceDimension.group().reduceSum(function(d) {
            return d.visits
        });

        
        //there can be many, many browsers
        browserDimension = xfilter.dimension(function(d) {
            return d.browser
        });
        browserGroup = browserDimension.group().reduceSum(function(d) {
            return d.visits
        });
        //so find the 10 most popular and put them in a list
        b = browserGroup.top(10)
        topbrowsers = []
        for (var i = 0; i < b.length; i++) {
            topbrowsers.push(b[i].key)
        }
        //then dispose of the browser dimenion
        browserDimension.dispose()
        //and recreate it with only the top 10 and other
        browserDimension = xfilter.dimension(function(d) {
            if (topbrowsers.indexOf(d.browser) !== -1) {
                return d.browser
            }
            else {
                return "other"
            }
        });
        browserGroup = browserDimension.group().reduceSum(function(d) {
            return d.visits
        });

        mediumDimension = xfilter.dimension(function(d) {
            return d.medium
        });
        mediumGroup = mediumDimension.group().reduceSum(function(d) {
            return d.visits
        });
        m = mediumGroup.top(10)
        topmedia = []
        for (var i = 0; i < m.length; i++) {
            topmedia.push(m[i].key)
        }
        mediumDimension.dispose()
        mediumDimension = xfilter.dimension(function(d) {
            if (topmedia.indexOf(d.medium) !== -1) {
                return d.medium
            }
            else {
                return "other"
            }
        });
        mediumGroup = mediumDimension.group().reduceSum(function(d) {
            return d.visits
        });

        sourceDimension = xfilter.dimension(function(d) {
            return d.source
        });
        sourceGroup = sourceDimension.group().reduceSum(function(d) {
            return d.visits
        });
        s = sourceGroup.top(10)
        topsource = []
        for (var i = 0; i < s.length; i++) {
            topsource.push(s[i].key)
        }
        sourceDimension.dispose()
        sourceDimension = xfilter.dimension(function(d) {
            if (topsource.indexOf(d.source) !== -1) {
                return d.source
            }
            else {
                return "other"
            }
        });
        sourceGroup = sourceDimension.group().reduceSum(function(d) {
            return d.visits
        });

        visitCountDimension = xfilter.dimension(function(d) {
            if (d.visitCount < 21) {
                return d.visitCount
            }
            else {
                return 21
            }
        });
        visitCountGroup = visitCountDimension.group().reduceSum(function(d) {
            return d.visits
        });

        deviceChart = dc.rowChart('#devicechart')
        deviceChart.width(200)
              .height(130)
              .margins({top: 0, left: 10, right: 10, bottom: 20})
              .group(deviceGroup)
              .dimension(deviceDimension)
              .elasticX(true)
              .xAxis().ticks(4)
        $('#devicechartreset').click(function() {
              deviceChart.filterAll()
              dc.redrawAll()
              return false
          });

        mediumChart = dc.rowChart('#mediumchart')
        mediumChart.width(200)
              .height(400)
              .margins({top: 0, left: 10, right: 10, bottom: 20})
              .group(mediumGroup)
              .dimension(mediumDimension)
              .elasticX(true)
              .xAxis().ticks(4)
        $('#mediumchartreset').click(function() {
              mediumChart.filterAll()
              dc.redrawAll()
              return false
          });

        sourceChart = dc.rowChart('#sourcechart')
        sourceChart.width(200)
              .height(400)
              .margins({top: 0, left: 10, right: 10, bottom: 20})
              .group(sourceGroup)
              .dimension(sourceDimension)
              .elasticX(true)
              .xAxis().ticks(4)
        $('#sourcechartreset').click(function() {
              sourceChart.filterAll()
              dc.redrawAll()
              return false
          });

        
        browserChart = dc.rowChart('#browserchart')
        browserChart.width(200)
              .height(400)
              .margins({top: 0, left: 10, right: 10, bottom: 20})
              .group(browserGroup)
              .dimension(browserDimension)
              .elasticX(true)
              .xAxis().ticks(4)

        $('#browserchartreset').click(function() {
              browserChart.filterAll()
              dc.redrawAll()
              return false
          });

        
        visitCountChart = dc.barChart('#visitcountchart')
        visitCountChart.width(300)
          .height(150)
          .dimension(visitCountDimension)
          .group(visitCountGroup)
          .margins({top: 0, left: 35, right: 10, bottom: 20})
          .elasticY(true)
          .centerBar(true)
          .gap(1)
          .x(d3.scale.linear().domain([0, 22]))

        visitCountChart.xAxis().tickFormat(function (v) {
            if (v === 21) {
                return ">20"
            }
            else {
                return v
            };
        });
        visitCountChart.xAxis().ticks(4)
        $('#visitcountchartreset').click(function() {
              visitCountChart.filterAll()
              dc.redrawAll()
              return false
          });

        c = dc.dataCount("#data-count")
          c.dimension(xfilter).group(visitcount);
        
        dc.renderAll()
        $('#charts').show()
        $('div.chooser').slideUp()
        $('span.dropdown-toggle').show()
        outputToPage("")
        
    } else {
      outputToPage('No results found.');
    }
  } else {
    updatePage('There was an error querying core reporting API: ' +
        response.message);
  }
}


/**
 * Utility method to update the output section of the HTML page. Used
 * to output messages to the user. This overwrites any existing content
 * in the output area.
 * @param {String} output The HTML string to output.
 */
function outputToPage(output) {
  document.getElementById('output').innerHTML = output;
}


/**
 * Utility method to update the output section of the HTML page. Used
 * to output messages to the user. This appends content to any existing
 * content in the output area.
 * @param {String} output The HTML string to output.
 */
function updatePage(output) {
  document.getElementById('output').innerHTML += '<br>' + output;
}


/**
 * Utility method to return the lastNdays from today in the format yyyy-MM-dd.
 * @param {Number} n The number of days in the past from tpday that we should
 *     return a date. Value of 0 returns today.
 */
function lastNDays(n) {
  var today = new Date();
  var before = new Date();
  before.setDate(today.getDate() - n);

  var year = before.getFullYear();

  var month = before.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  var day = before.getDate();
  if (day < 10) {
    day = '0' + day;
  }

  return [year, month, day].join('-');
}

$('ul#accountList').on("click", "a.account", function() {
    queryWebproperties($(this).data('accountid'));
    return false
    });

$('ul#profileList').on("click", "a.profile", function() {
    $('div#output').empty()
    queryCoreReportingApi($(this).data('profileid'));
    return false
    });

$('span.dropdown-toggle').click(function() {
    $('span.dropdown-toggle').hide()
    $('div.chooser').slideDown()
});
