var express = require('express');
var app = express();
var path    = require("path");
var fs = require('fs');
var cheerio = require('cheerio');
var http = require('http');
var port = 8080;
var filepath = "";
var test = "";
var currentHTMLPath = __dirname + '/photoHTML/';
var currentImagePath = __dirname + '/snap/';
var currentDate = new Date();
var urlgetPicture = "http://nodejstestserver-testprojectnodejs.44fs.preview.openshiftapps.com/api/getPicture?filename=";
var bodyParser = require('body-parser');

/*var server = http.createServer(function(req, res) {
	var app = express();
  //res.writeHead(200,{'Content-Type': 'text/plain'});
 // res.end('Hello World\n');
  //console.log("Server is listening on 8080")
  app.use(express.static(__dirname + '/public'));
});*/

//app.use(express.static(__dirname + '/snap/'));

	app.use(express.static('public'));
	app.use(express.static(__dirname + '/photoHTML'));
	app.use(express.static(__dirname + '/snap'));
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));


app.get('/', function(req, res){
	res.send('Connecting on Index');
});

app.get('/api/test', function(req, res){
	res.send('Connecting on Index');
});

app.get('/api/getPicture', function(req, res){
	var filename = req.query.filename;
	console.log(filename);
	var filepath = currentImagePath + filename.replace('.html', '.png');
	console.log(filepath);
	if(filepath != "")
		res.sendFile(filepath);
	else
		res.send("Nothing to show");
})

app.get('/api/gallery', function(req, res){
	var filename = req.query.filename;
	console.log(filename);
	var filepath = currentHTMLPath + filename;
	if(filepath != "")
		res.sendFile(filepath);
	else
		res.send("Nothing to show");
})

/*app.post('api/gallery', function(req, res){
	var filename = req.body.filename + '.html';
	var filepath = currentHTMLPath + filename

	console.log("delta");
	res.sendFile(filepath);
})*/

var server = app.listen(port, function(){
		currentDate = new Date();

	console.log("Server listening on " + port +" "+currentDate.getHours() + ":"  
                + currentDate.getMinutes() + ":" 
                + currentDate.getSeconds())
})


var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	socket.on('image', function(img){
		var data = img.image.replace(/^data:image\/\w+;base64,/, "");
		var buf = new Buffer(data, 'base64');
		
		if(!fs.existsSync('./snap')){
			fs.mkdirSync('./snap')
			console.log("SNAP FOLDER CREATED")
		}

		fs.writeFile("./snap/" + img.name, buf);

			currentDate = new Date();

		console.log("Read HTMLBase file"+" "+currentDate.getHours() + ":"  
                + currentDate.getMinutes() + ":" 
                + currentDate.getSeconds());

		/* Read HTML File*/
		var file = fs.readFileSync(__dirname + "/public/html/htmlBase.html",'utf-8')
		var filename = img.name.replace(".png",".html");
		filepath = __dirname + "/photoHTML/" + filename;
		var imagePath = __dirname + "/snap/" + filename.replace('.html','.png')
		
		/*Load file to use DOM*/
		$ = cheerio.load(file);
		//var imagePath = __dirname + "/../snap/" + img.name;
		test = img.name;
		console.log(img.name);

		$('#pictureToDisplay').attr('src', urlgetPicture + img.name);
		console.log("Write HTML File"+" "+currentDate.getHours() + ":"  
                + currentDate.getMinutes() + ":" 
                + currentDate.getSeconds())

		/*Write file and send it to client*/
		if(!fs.existsSync('./photoHTML')){
			fs.mkdirSync('./photoHTML')
			console.log("PHOTOHTML CREATED")
		}
		app.use(express.static(__dirname + '/photoHTML'));
		app.use(express.static(__dirname + '/snap'));
		fs.writeFileSync(filepath, $.html());
		console.log("New Page with filepath = " + filepath);
		io.sockets.emit('newPage', filepath);
})

	socket.on('free', function(){
		deleteFolderRecursive(__dirname + '/snap');
		deleteFolderRecursive(__dirname + '/photoHTML');
		console.log("CLEAN");
	})

	socket.on('getPicture', function(filename){
		filepath = __dirname + "/photoHTML/" + filename
	})



	currentDate = new Date();
	console.log('Client connected'+" "+currentDate.getHours() + ":"  
                + currentDate.getMinutes() + ":" 
                + currentDate.getSeconds());
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