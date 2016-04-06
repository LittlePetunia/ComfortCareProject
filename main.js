var server = require('./server.js');
var	cluster	= require('cluster');	
var	numCPUs	= require('os').cpus().length;	

if (cluster.isMaster){
	for (var i = 0; i < numCPUs; i++){

		cluster.fork();
	}
}else{

	server(3000, 'mongodb://127.0.0.1/P2', false);
}
