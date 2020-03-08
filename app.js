var http=require('http');
var express=require('express');
var bodyparser=require('body-parser');
var MongoClient=require('mongodb').MongoClient;
var urlencoded=bodyparser.urlencoded({extended:true});

var port = process.env.PORT || 3000;

var app=express();
app.set('view engine', 'ejs');
app.set("views",__dirname);

var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));

var routes = require('./routes');
app.use('/', routes);

app.listen(port);