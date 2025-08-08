const functions = require('firebase-functions');

const { apiRoute } = require('./apiRoute');
const { googleRoute } = require('./googleRoute');
const { googleCalendar } = require('./googleCalendar');
const { googleTasks } = require('./googleTasks');
const { googleTasklists } = require('./googleTasklists');

exports.apiRoute = apiRoute;
exports.googleRoute = googleRoute;
exports.googleCalendar = googleCalendar;
exports.googleTasks = googleTasks;
exports.googleTasklists = googleTasklists;
