var Word = require('./models/word');
// helper for parsing words from the wiki page
var helper = require('./helper');
// possible count of forms
var formsCountLimit = 3;
// page in wikipedia
var urlWiki = "http://de.wikipedia.org/wiki/Liste_starker_Verben_(deutsche_Sprache)";

module.exports = function(app) {
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
		Word.findOne({ _id: req.body.infinitive }, function(err, word) {
			if (err)
				res.send (err);
			console.log(req);
			var toCheck = req.body.currentForm;
			if (req.body.userAnswer == word.forms[toCheck]){
				word.score ++;
				word.lastResult = true;
			}  else {
				word.score --;
				word.lastResult = false;
			}
			word.save (function(err, saved){
				res.json (saved);
			})
		});
	});

	app.post('/api/fill_database', function (req, res) {
		helper.parse(urlWiki, function(data) {
			Word.update({ _id : data.infinitive },
				{ $set: { forms: data.forms }},
				{ upsert: true }
			);
		});		
		res.send();
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		
	    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};