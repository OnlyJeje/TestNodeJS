var express = require('express');
var app = express();
var path    = require("path");
var fs = require('fs');
var cheerio = require('cheerio');
var http = require('http');


var server = http.createServer(function(req, res) {
	var app = express();
  res.writeHead(200,{'Content-Type': 'text/plain'});
  res.end('Hello World\n');
  console.log("Server is listening on 8080")
  app.use(express.static(__dirname + '/public'));
  //app.listen(8080);
});


var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	socket.on('image', function(img){

		var data = img.image.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');
		fs.writeFile("./snap/" + img.name, buf);
		
		console.log("Read HTMLBase file");
		var file = fs.readFileSync(__dirname + "/html/htmlBase.html",'utf-8')
		var filename = img.name.replace(".png",".html");
		var filepath = __dirname + "/photoHTML/" + filename;
		$ = cheerio.load(file);
		
		var imagePath = "../snap/" + img.name;
		$('#pictureToDisplay').attr('src',imagePath);
		console.log("Write HTML File")
		fs.writeFile(filepath, $.html());
})	
	console.log('Client connected');
})

server.listen(8080);