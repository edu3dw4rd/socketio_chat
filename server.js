var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

users = [];
connections = [];

server.listen(process.env.PORT || 3001);
console.log('Listening on port 3001');

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data){
		// if(!socket.username){
		// 	console.log('hmm');
		// 	return;
		// }
		if(users){
			users.splice(users.indexOf(socket.username), 1);
			updateUsernames();

			connections.splice(connections.indexOf(socket), 1);
			console.log('Disconnected: %s sockets disconnected', connections.length);	
		}

		// users.splice(users.indexOf(socket.username), 1);
		// updateUsernames();

		// connections.splice(connections.indexOf(socket), 1);
		// console.log('Disconnected: %s sockets disconnected', connections.length);	
	})
	
	// Send Message
	socket.on('send message', function(data){
		console.log(data);
		// io.sockets.emit('new message', {msg: data, user: socket.username});
		socket.broadcast.emit('new message', {msg: data, user: socket.username});
	})

	// New User
	// socket.on('new user', function(data, callback){
	// 	console.log(callback);
	// 	callback(data);
	// 	socket.username = data;
	// 	users.push(socket.username);

	// 	updateUsernames();
	// })
	socket.on('new user', function(data, callback){
		console.log(callback);
		callback(data);
		socket.username = data;
		users.push(socket.username);

		updateUsernames();
	})

	function updateUsernames(){
		console.log(users.length);
		io.sockets.emit('get users', {users: users, cur_user: socket.username, numUsers: users.length});
	}

	// Listen to typing event
	socket.on('typing', function(data){
		socket.broadcast.emit('typing', {username: data});
		// io.sockets.emit('typing', data);
	})

	socket.on('stop typing', function(){
		console.log('Stop Typing');
		socket.broadcast.emit('stop typing', {username:socket.username});
	})
})