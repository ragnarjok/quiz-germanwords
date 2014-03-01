var Word = require('./models/word');
// helper for parsing words from the wiki page
var helper = require('./helper');
// possible count of forms
var formsCountLimit = 3;
// page in wikipedia
var urlWiki = "http://de.wikipedia.org/wiki/Liste_starker_Verben_(deutsche_Sprache)";

module.exports = function(app) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
	// gets random word
	app.get('/api/word', function(req, res) {
		Word.random(function(err, word){
			console.log (err);
			console.log (word);
			if (err) {
				res.send (err);
			}
			var ind = Math.floor((Math.random() * formsCountLimit));
			word.currentForm = ind;  
			word.forms[ind] = "";

			res.json(word);
		} )
	});

	// checks whether user gave correct answer or not
	app.post('/api/word', function(req, res){
		Word.findOne({ _id: req.body._id }, function(err, word) {
			if (err)
				res.send (err);

			var indexToCheck = req.body.currentForm;

			if (req.body.userAnswer == word.forms[indexToCheck]){
				word.score ++;
				word.lastResult = true;
			}  else {
				word.score --;
				word.lastResult = false;
			}
			word.save (function(err, saved){
				if (err)
				{
					res.send (err);
				}
				var json = saved.toObject();
				json.classes = [];
				if (json.lastResult)
				{
					json.classes[indexToCheck] = {result: "has-success"};
				}
				else 
				{
					var tmp = json.forms[indexToCheck];
					json.forms[indexToCheck] = req.body.userAnswer;
					json.classes[indexToCheck] = {result: "has-error", tip: tmp};
				}
				res.json (json);
			})
		});
	});

	app.post('/api/fill_database', function (req, res) {
		helper.parse(urlWiki, function(data) {
			Word.update({ _id : data.infinitive },
				{ $set: { forms: data.forms }},
				{ upsert: true },
				function (err, data) {

				}
			);
		});		
		res.send();
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}