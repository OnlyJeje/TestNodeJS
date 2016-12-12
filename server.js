var express = require('express');
var app = express();
var path    = require("path");
var fs = require('fs');
var cheerio = require('cheerio');
var http = require('http');
var port = 8080;
var filepath = "";
var test = "";
/*var server = http.createServer(function(req, res) {
	var app = express();
  //res.writeHead(200,{'Content-Type': 'text/plain'});
 // res.end('Hello World\n');
  //console.log("Server is listening on 8080")
  app.use(express.static(__dirname + '/public'));
});*/

app.use(express.static(__dirname + '/snap'));
app.use(express.static(__dirname + '/photoHTML'));

app.get('/', function(req, res){
	res.send('Connecting on Index');
});

app.get('/test', function(req, res){
	res.send('Connecting on Index');
});

app.get('/gallery', function(req, res){
	if(filepath != "")
	res.sendFile(filepath);
else
	res.send("Nothing to show");
})
var server = app.listen(port, function(){
	console.log("Server listening on " + port)
})

var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	socket.on('image', function(img){

		var data = img.image.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');
		fs.writeFile("./snap/" + img.name, buf);
		
		console.log("Read HTMLBase file");
		var file = fs.readFileSync(__dirname + "/html/htmlBase.html",'utf-8')
		var filename = img.name.replace(".png",".html");
		filepath = __dirname + "/photoHTML/" + filename;
		$ = cheerio.load(file);
		
		var imagePath = "../snap/" + img.name;
		test = img.name;
		$('#pictureToDisplay').attr('src',img.name);
		console.log("Write HTML File")
		fs.writeFileSync(filepath, $.html());
		console.log("EMIT NEW PAGE");
		io.sockets.emit('newPage', filepath);
})	
	console.log('Client connected');
})

