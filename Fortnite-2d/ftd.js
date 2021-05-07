// https://www.freecodecamp.org/news/express-explained-with-examples-installation-routing-middleware-and-more/
// https://medium.com/@viral_shah/express-middlewares-demystified-f0c2c37ea6a1
// https://www.sohamkamani.com/blog/2018/05/30/understanding-how-expressjs-works/

var port = 8000; 
var express = require('express');
var app = express();

const { Pool } = require('pg')
const pool = new Pool({
    user: 'webdbuser',
    host: 'localhost',
    database: 'webdb',
    password: 'password',
    port: 5432
});

const bodyParser = require('body-parser'); // we used this middleware to parse POST bodies

function isObject(o){ return typeof o === 'object' && o !== null; }
function isNaturalNumber(value) { return /^\d+$/.test(value); }

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// app.use(bodyParser.raw()); // support raw bodies

app.use('/api/register', function (req, res,next) {
	try {
		var m = req.body;
		var username = m.username;
		var password = m.password;
		var skill = m.skill;
		var birthday = m.birthday;

		let sql = 'INSERT INTO ftduser (username, password, skill, birthday, score) VALUES ($1, sha512($2), $3, $4, 0);';
        	pool.query(sql, [username, password, skill, birthday], (err, pgRes) => {
  			if (err){
                res.status(406).json({ error: 'Account already exists!'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
				res.status(400).json({ error: 'Could not register the account'});
			}
		});
	} catch(err) {
        res.status(500).json({ error: 'Internal error'});
	}
});

app.use('/api/update', function (req, res,next) {
	try {
		var m = req.body;
		var username = m.username;
		var password = m.password;
		var skill = m.skill;
		var birthday = m.birthday;

		sql = 'UPDATE ftduser SET password=sha512($2), skill=$3, birthday=$4 WHERE username=$1;';
        	pool.query(sql, [username, password, skill, birthday], (err, pgRes) => {
  			if (err){
				res.status(406).json({ error: 'Database error'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
				res.status(400).json({ error: 'Account was not updated'});
			}
		});
	} catch(err) {
        res.status(500).json({ error: 'Internal error'});
	}
});

app.use('/api/info', function (req, res,next) {
	try {
		var m = req.body;
		var username = m.username;

		let sql = 'SELECT skill, birthday, score FROM ftduser WHERE username=$1;';
        	pool.query(sql, [username], (err, pgRes) => {
  			if (err){
                res.status(406).json({ error: 'Database error'});
			} else if(pgRes.rowCount == 1){
				res.contentType('application/json');
				res.json(JSON.stringify({skill: pgRes.rows[0].skill, birthday: pgRes.rows[0].birthday.toString(), score: pgRes.rows[0].score}));
				next(); 
			} else {
				res.status(404).json({ error: 'Error retrieving infomration about the account'});
			}
		});

		
	} catch(err) {
        res.status(500).json({ error: 'Internal error'});
	}
});

app.use('/api/score', function (req, res,next) {
	try {
		var m = req.body;
		var username = m.username;
		var score = m.score;

		let sql = 'UPDATE ftduser SET score = score + $2 WHERE username=$1;';
        	pool.query(sql, [username, score], (err, pgRes) => {
  			if (err){
                res.status(406).json({ error: 'Database error'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
				res.status(404).json({ error: 'Error retrieving infomration about the account'});
			}
		});

		
	} catch(err) {
        res.status(500).json({ error: 'Internal error'});
	}
});

app.use('/api/delete', function (req, res,next) {
	try {
		var m = req.body;
		var username = m.username;

		let sql = 'DELETE FROM ftduser WHERE username=$1;';
        	pool.query(sql, [username], (err, pgRes) => {
  			if (err){
                res.status(406).json({ error: 'Database error'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
				res.status(404).json({ error: 'Error retrieving information about the account'});
			}
		});

		
	} catch(err) {
        res.status(500).json({ error: 'Internal error'});
	}
});

app.use('/api/leaderboard', function (req, res,next) {
	try {
		let sql = 'SELECT username, score FROM ftduser ORDER BY score DESC;';
        	pool.query(sql, [], (err, pgRes) => {
  			if (err){
                res.status(406).json({ error: 'Database error'});
			} else if(pgRes.rowCount >= 1){
				var users_scores = [];
				for(var i=0; i < pgRes.rowCount; i++){
					users_scores.push({username: pgRes.rows[i].username, score: pgRes.rows[i].score});
				}
				var json_user_scores = {scores: users_scores};
				res.contentType('application/json');
				res.json(JSON.stringify(json_user_scores));
				next(); 
			} else {
				res.status(400).json({ error: 'Error loading leadership table'});
			}
		});

		
	} catch(err) {
    	res.status(500).json({ error: 'Internal error'});
	}
});

app.post('/api/register', function (req, res) {
	res.status(201	); 
	res.json({"message":"got here"}); 
});

app.post('/api/score', function (req, res) {
	res.status(201	); 
	res.json({"message":"got here"}); 
});

app.post('/api/update', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});

// Non authenticated route. Can visit this without credentials
app.post('/api/test', function (req, res) {
	res.status(200);
	res.json({"message":"got here"}); 
});

app.post('/api/info', function (req, res){
	res.status(200);
});

app.post('/api/delete', function (req, res) {
	res.status(200); 
	res.json({"message":"got here"}); 
});

app.post('/api/leaderboard', function (req, res) {
	res.status(200); 
});

/** 
 * This is middleware to restrict access to subroutes of /api/auth/ 
 * To get past this middleware, all requests should be sent with appropriate
 * credentials. Now this is not secure, but this is a first step.
 *
 * Authorization: Basic YXJub2xkOnNwaWRlcm1hbg==
 * Authorization: Basic " + btoa("arnold:spiderman"); in javascript
**/
app.use('/api/auth', function (req, res,next) {
	if (!req.headers.authorization) {
		return res.status(403).json({ error: 'No credentials sent!' });
  	}
	try {
		// var credentialsString = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString();
		var m = /^Basic\s+(.*)$/.exec(req.headers.authorization);

		var user_pass = Buffer.from(m[1], 'base64').toString()
		m = /^(.*):(.*)$/.exec(user_pass); // probably should do better than this

		var username = m[1];
		var password = m[2];

		let sql = 'SELECT * FROM ftduser WHERE username=$1 and password=sha512($2)';
        	pool.query(sql, [username, password], (err, pgRes) => {
  			if (err){
                res.status(406).json({ error: 'Database Error'});
			} else if(pgRes.rowCount == 1){
				next(); 
			} else {
				res.status(403).json({ error: 'Account was not found. Please, check your username and/or password!'});
			}
		});
	} catch(err) {
        res.status(500).json({ error: 'Internal error'});
	}
});



// All routes below /api/auth require credentials 
app.post('/api/auth/login', function (req, res) {
	res.status(200); 
	res.json({"message":"authentication success"}); 
});

app.post('/api/auth/test', function (req, res) {
	res.status(200); 
	res.json({"message":"got to /api/auth/test"}); 
});

app.use('/',express.static('static_content')); 

app.listen(port, function () {
  	console.log('Example app listening on port '+port);
});

