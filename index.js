var express = require('express');
var http = require('http');
var socketIo = require('socket.io');

var app = express();
var httpServer = http.Server(app);
var ioServer = socketIo(httpServer);
var allSockets = {}, allUsers = {};

app.use(express.static(__dirname + '/public'));

function httpServerConnected(){
	console.log('Http Server started');
}

function ioServerConnected(socket){
	console.log('A new socket connection');

	socket.on('user-joined', userJoined);
	socket.on('disconnect', userLeft);	
	socket.on('msg', messageReceived);	
}

function userJoined(user){
	console.log(user + ' joined.');

	var d = Math.floor(Math.random() * 4);
	if(d === 0){
		d = 'n';
	} else if(d === 1){
		d = 'e';
	} else if(d === 2){
		d = 'w';
	}
	else {
		d = 's';
	}

	allSockets[user] = this;
	allUsers[user] = {
		name: user,
		timeOfEvent: 0,
		x: Math.floor(Math.random() * 90),
		y: Math.floor(Math.random() * 80),
		d: d
	};

	ioServer.emit('user-joined', allUsers);	
}

function userLeft(){
	var user = null;
	var allKeys = Object.keys(allSockets);

	for(i = 0; i < allKeys.length; i++){
		if(allSockets[allKeys[i]] === this){
			user = allKeys[i];
		}
	}

	console.log(user + ' left.');
	delete allSockets[user];
	delete allUsers[user];

    this.broadcast.emit('user-left', user);	
}

function messageReceived(data){
	console.log(data);

	if(allUsers[data.name].timeOfEvent < data.timeOfEvent){
		allUsers[data.name].timeOfEvent = data.timeOfEvent;

		if(data.action === 'laser-attack'){
			ioServer.emit('laser-attack', data);

			setTimeout(function(){
				var laser = data.laser;
				var allKeys = Object.keys(allSockets);

				for(i = 0; i < allKeys.length; i++){
					var user = allUsers[allKeys[i]];

					var kill = false;
					if(data.d === 'n' || data.d === 's'){
						if(user.x < laser.x && 
						   user.x + 10 > laser.x && 
						   user.y > laser.ymin && 
						   user.y < laser.ymax){
							kill = true;
						}
					} else {
						if(user.y < laser.y && 
						   user.y + 20 > laser.y && 
						   user.x > laser.xmin && 
						   user.x < laser.xmax){
							kill = true;
						}
					}
					
					if(kill){
					    ioServer.emit('user-left', allUsers[allKeys[i]]);	
					    delete allSockets[allKeys[i]];
						delete allUsers[allKeys[i]];
					}
				}
			}, 0);
		}
		else if (data.action === 'reposition'){
			allUsers[data.name].x = data.x;
			allUsers[data.name].y = data.y;
			allUsers[data.name].d = data.d;

			ioServer.emit('reposition', data);
		}
	}
}

httpServer.listen(3000, httpServerConnected);
ioServer.on('connection', ioServerConnected);