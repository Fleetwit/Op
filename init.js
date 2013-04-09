var mysql				= require('mysql');
var mongodb 			= require('mongodb');
var _ 					= require('underscore');
var datastore 			= require('./datastore').datastore;

var debug_mode		= true;



function main() {
	var scope = this;
	
	console.log("Connecting to MongoDB...");
	this.mongo = new datastore({
		database:		"fleetwit"
	});
	this.mongo.init(function() {
		console.log("MongoDB: Connected.");
		console.log("Connecting to MySQL...");
		scope.mysql = mysql.createConnection({
			host     : 'localhost',
			user     : 'root',
			password : '',
			database : 'fleetwit'
		});
		scope.mysql.connect(function(err) {
			console.log("MySQL: Connected.");
			scope.initOp();
		});
	});
	
}
main.prototype.initOp = function() {
	this.__convertRaceData();
}

main.prototype.__convertRaceData = function() {
	this.mongo.open("datastore", function(collection) {
		collection.find().toArray(function(err, docs) {
			
			for (i=0;i<docs.length;i++) {
				console.dir(docs[i]);
				if (docs[i].race == undefined) {
					continue;
				}
				var buffer = [];
				for (j=0;j<docs[i].race.length;j++) {
					for (k=0;k<docs[i].race[j].levels.length;k++) {
						buffer.push(_.extend({
							race:	docs[i].race[j].race
						}, docs[i].race[j].levels[k]));
					}
				}
				console.dir(buffer);
				collection.update({
					_id:	docs[i]._id
				}, {
					race: buffer
				}, function() {
					
				});
			}
		});
	});
}
/*
main.prototype.__convertRaceData = function() {
	this.mongo.open("datastore", function(collection) {
		collection.find().toArray(function(err, docs) {
			
			for (i=0;i<docs.length;i++) {
				console.dir(docs[i]);
				if (docs[i].race == undefined) {
					continue;
				}
				var buffer = [];
				for (j in docs[i].race) {
					var subbuffer = [];
					for (k in docs[i].race[j]) {
						
						buffer.push(_.extend({
							race:	j,
							level:	k,
							
						}, docs[i].race[j][k]));
					}
					
				}
				
				collection.update({
					_id:	docs[i]._id
				}, {
					race: buffer
				}, function() {
					
				});
			}
		});
	});
}*/

new main();

// Crash Management
if (!debug_mode) {
	process.on('uncaughtException', function(err) {
		console.log("uncaughtException",err);
	});
}


