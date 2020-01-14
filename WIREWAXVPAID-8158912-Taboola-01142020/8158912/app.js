/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

// Start app
var app = express();

app.configure(function () {
    app.set('views', __dirname);
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, '/')));
    app.use(express.errorHandler());
});

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

var port = '80';

if(parseInt(port) === NaN) {
    port = 80;
}
var server = app.listen(port);

exports = module.exports = app;

// Routes 
app.get('/', function(req, res){
    res.sendfile('index.html');
});

app.get('/offline', function(req, res){
    res.sendfile('offline.html');
});