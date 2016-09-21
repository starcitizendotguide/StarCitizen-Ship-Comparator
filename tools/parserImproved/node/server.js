var express = require("express");
var parser = require("body-parser");
var app = express();

app.use(parser.urlencoded({extended : true, limit: '50mb'}));

app.post('/transform', function(request, response) {
    response.setHeader('Content-Type', 'application/json');
    response.send(eval('(' + request.body.data + ')'));
    response.end();
});

app.listen(8001);
