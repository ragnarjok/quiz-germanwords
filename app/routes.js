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