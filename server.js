'use strict';
const https = require('https');
const qs = require('querystring');
const moment = require('moment');

function postUpdates(features) {
    let query = qs.stringify({
        features: JSON.stringify(features),
        f: 'json'
    });
    let options = {
        hostname: 'services.arcgis.com',
        path: '/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/updateFeatures',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(query)
        }
    };
    let body = '';
    let req = https.request(options, (res) => {
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => console.log(body));
    });
    req.write(query);
    req.end();
}

function updateFeatures (features) {
    features.forEach(function(feature) {
        feature.attributes.AssignedDate = moment();
        feature.attributes.DueDate = getDueDate(5, 2);
        feature.attributes.Status = 1;
    }, this);
    postUpdates(features);
}
function getDueDate (dayOfWeek, weeks) {
    // if we haven't yet passed the day of the week that I need:
    if (moment().isoWeekday() <= dayOfWeek) { 
    // then just give me this week's instance of that day
    return moment().isoWeekday(dayOfWeek);
    } else {
    // otherwise, give me next week's instance of that day
    return moment().add(weeks, 'weeks').isoWeekday(dayOfWeek);
    }    
}

function getEntries() {
    let options = {
        hostname: 'services.arcgis.com',
        path: '/v400IkDOw1ad7Yad/arcgis/rest/services/Due_Diligence/FeatureServer/0/query?f=json&where=Status=1&outFields=*&returnGeometry=false&orderByFields=CreationDate%20Asc',
        method: 'GET'
    };
    https.get(options, function (response) {
        let body = '';
        response.on('data', (chunk) => { 
            body += chunk;
        });
        response.on('end', () => {
            let features = JSON.parse(body).features;
            updateFeatures(features);
        });
    });
}
getEntries();