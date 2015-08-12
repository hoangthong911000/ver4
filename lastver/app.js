var express = require('express'),
	http = require('http');
var path = require('path');
var app = express();
//moi them 1

var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    //BSON = require('mongodb').pure().BSON,
    assert = require('assert');
var db = new Db('qlbh', new Server('localhost', 27017));

//moi 2
var session = require('client-sessions');
app.use(session({
  cookieName: 'session',
  secret: 'random_string_goes_here',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());
//var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/qlbh');
//app.use(express.bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.set('port',process.env.PORT||3000);
app.set('view engine','jade');
app.use('views',express.static(__dirname +'/views'));
app.get('/index',function(req,res,next){
	var Fiber = require('fibers');
	Fiber(function(){
		var Server = require("mongo-sync").Server;
		var server = new Server('127.0.0.1');
		var result = server.db("qlbh").getCollection("sanpham").find().toArray();
		server.close();
		res.render('index',{ yt: result });
		//res.render('index');
	}).run();
});
//
var Admin = function(req, res, next){
    if (req.session && req.session.user && req.session.user.phanquyen == 1) {
        next();
    }
    else {
        res.redirect('/admin');
    }
}

var userlogin = function(req, res, next){
    if (req.session && req.session.user) {
        next();
    }
    else {
        res.redirect('/login');
    }
}
//
app.get('/logout', function(req, res) {
  req.session.reset();
  res.redirect('/login');
});
app.get('/login',function(req,res){
	if (req.session && req.session.user) {
		res.redirect('/admin');
	}
	else{
		res.render('login');
	}	
});
app.get('/admin',userlogin,function(req,res){
	res.render('admin');
});
app.post('/login',function(req,res){
	var udd = req.body.UID;
	var pwd = req.body.PWD;
	var sp;
	db.open(function(err, db) {
		var collection = db.collection('user');
		collection.findOne({usename: udd , pass: pwd }, function(err, doc) {
  			//dieu kien
  			sp = doc;
  			//res.render('cmn',{edit: sp});
			if(sp != null ){
				req.session.user = sp;
				res.redirect('/admin');
			}
			else{
				res.redirect('/login');
			}
		});
	});
});
app.get('/admin/sanpham/add',Admin,function(req,res){
	res.render('addpro');
});
app.get('/admin/sanpham/edit/:id',Admin,function(req,res){
	var id = req.params.id;
	db.open(function(err, db) {
		var sp;
		var collection = db.collection('sanpham');
		collection.findOne({_id: new ObjectID(id) }, function(err, doc) {
  			sp = doc;
  			res.render('editpro',{ edit: sp });
		});
	});
});
app.post('/admin/sanpham/edit',function(req,res){
	var id = req.body.idma;
	var ten = req.body.tensp;
	var gia1 = req.body.gia;
	var gt = req.body.FullName;
	db.open(function(err, db) {
		var collection = db.collection('sanpham');
		collection.update({_id: new ObjectID(id)}, {$set:{ tensp: ten, mieuta: gt, gia: gia1 }});
	});
	res.redirect('/admin/sanpham');
});
app.get('/admin/user/add',Admin,function(req,res){
	res.render('adduser');
});
app.get('/admin/user/edit/:id',Admin,function(req,res){
	var id = req.params.id;
	db.open(function(err, db) {
		var sp;
		var collection = db.collection('user');
		collection.findOne({_id: new ObjectID(id) }, function(err, doc) {
  			sp = doc;
  			res.render('edituser',{ edit: sp });
		});
	});
});
app.post('/admin/user/edit',function(req,res){
	var id = req.body.idma;
	var ten = req.body.usname;
	var pass1 = req.body.pass;
	var pq = req.body.pq
	db.open(function(err, db) {
		var collection = db.collection('user');
		collection.update({_id: new ObjectID(id)}, {$set:{ usename: ten, pass: pass1, phanquyen: pq }});
	});
	res.redirect('/admin/user');	
});
app.post('/admin/sanpham/add',function(req,res){
	var id = 11;
	var ten =req.body.tensp;
	var gia1 = req.body.gia;
	var gioithieu = req.body.FullName;

	db.open(function(err, db) {
		var collection = db.collection('sanpham');
	// Insert a single document
		collection.insert({masp: id ,tensp: ten, mieuta: gioithieu, gia: gia1 });

	// Wait for a second before finishing up, to ensure we have written the item to disk
	});
	res.redirect('/admin/sanpham');
});
app.post('/admin/user/add',function(req,res){
	var id = 11;
	var ten =req.body.usename;
	var pass1 = req.body.pass;
	var pass2 = req.body.pass1;
	if(pass1!= pass2)
	{
		res.redirect('/admin/user/add');
	}
	else
	{
		db.open(function(err, db) {
		var collection = db.collection('user');
	// Insert a single document
		collection.insert({mauser: id ,usename: ten, pass: pass1, phanquyen: 0 });

	// Wait for a second before finishing up, to ensure we have written the item to disk
	});
	res.redirect('/admin/user');
	}
});
app.post('/admin/user/:id',function(req,res){
	var id = req.params.id;
	db.open(function(err, db) {
		var collection = db.collection('user');
      	collection.remove({_id: new ObjectID(id) });
	});
	res.redirect('/admin/user');
});
app.post('/admin/sanpham/:id',function(req,res){
	var id = req.params.id;
	db.open(function(err, db) {
		var collection = db.collection('sanpham');
      	collection.remove({_id: new ObjectID(id) });
	});
	res.redirect('/admin/sanpham');
});
app.get('/admin/sanpham',Admin,function(req,res){
	var Fiber = require('fibers');
	Fiber(function(){
		var Server = require("mongo-sync").Server;
		var server = new Server('127.0.0.1');
		var result = server.db("qlbh").getCollection("sanpham").find().toArray();
		server.close();
		res.render('qlsanpham',{ yt: result });
	}).run();
});
app.get('/admin/user',Admin,function(req,res){
	var Fiber = require('fibers');
	Fiber(function(){
		var Server = require("mongo-sync").Server;
		var server = new Server('127.0.0.1');
		var result = server.db("qlbh").getCollection("user").find().toArray();
		server.close();
		res.render('qluser',{ us: result });
	}).run();
});
http.createServer(app).listen(app.get('port'),function(){
	console.log('Start successfully');
});