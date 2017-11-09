/**
 * Created by Max on 12/10/2017.
 */
var http = require('http');
var fs = require('fs');

var sql = require('sql.js');
var db = new sql.Database();
var sqlstr = "CREATE TABLE position (user char, lat int, long int, alt int, time datetime, text chat);";
sqlstr += "INSERT INTO position(user,lat,long,alt,time,text) VALUES ('Max', 0, 0, 5, '2017-10-18 00:00:00', 'essaie');";
db.run(sqlstr);


// Chargement du fichier index.html affiché au client
var server = http.createServer(function(req, res) {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
});


// Chargement de socket.io

var io = require('socket.io').listen(server);
// Quand un client se connecte, on le note dans la console


io.sockets.on('connection', function (socket) {
    var date = new Date();
    var time = date.getFullYear()+'-' + (date.getMonth()+1) + '-'+date.getDate();
    var stmt = db.prepare("SELECT * FROM position WHERE time LIKE '"+time+"%';");
    while (stmt.step()){
        var row = stmt.getAsObject();
        console.log(row.user+" : "+row.text);
        var emit = JSON.parse(row);
        socket.emit('message',emit);
    }


    socket.on('message', function (message) {
        mes = JSON.parse(message);
        sqlstr = "INSERT INTO position(user,lat,long,alt,time,text) VALUES ('"+mes.user+"',"+mes.lat+","+mes.long+","+mes.alt+",'"+mes.time+"','"+mes.text+"');";
        console.log(mes.user+","+mes.lat+","+mes.long+","+mes.alt+","+mes.time+","+mes.text);
        db.run(sqlstr);
        socket.broadcast.emit('message',message);
    });
});

server.listen(8080);