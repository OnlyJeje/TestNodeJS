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
				if(!fs.existsSync('./snap')){
			fs.mkdirSync('./snap')
		}
		fs.writeFile("./snap/" + img.name, buf);
		
		console.log("Read HTMLBase file");
		/* Read HTML File*/
		var file = fs.readFileSync(__dirname + "/html/htmlBase.html",'utf-8')
		var filename = img.name.replace(".png",".html");
		filepath = __dirname + "/photoHTML/" + filename;

		/*Load file to use DOM*/
		$ = cheerio.load(file);
		var imagePath = "../snap/" + img.name;
		test = img.name;
		$('#pictureToDisplay').attr('src',img.name);
		console.log("Write HTML File")

		/*Write file and send it to client*/
		if(!fs.existsSync('./photoHTML')){
			fs.mkdirSync('./photoHTML')
		}
		fs.writeFileSync(filepath, $.html());

		console.log("EMIT NEW PAGE");
		io.sockets.emit('newPage', filepath);
})	
	socket.on('free', function(){
		deleteFolderRecursive(__dirname + '/snap');
		deleteFolderRecursive(__dirname + '/photoHTML');
		console.log("CLEAN");
	})
	console.log('Client connected');
})

deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};