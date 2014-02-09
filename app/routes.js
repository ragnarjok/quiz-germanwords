var Word = require('./models/word');
var helper = require('./helper');
module.exports = function(app) {
	app.get('/api/word', function(req, res) {
		Word.random(function(err, word){
			console.log (err);
			console.log (word);
			if (err)
				res.send (err);
			// there are possibly 3 forms to check, so:
			var ind = Math.floor((Math.random()*3));
            word.currentForm = ind;  
			word.forms[ind] = "";
			res.json(word);
		} )
    });

	//
	app.post('/api/word', function(req, res){
		Word.findOne({ infinitive: req.body.infinitive }, function(err, word) {
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
		helper.parse("http://de.wikipedia.org/wiki/Liste_starker_Verben_(deutsche_Sprache)", function(data) {
			Word.create({
				infinitive : data.infinitive,
				forms: data.forms
			});
		});		
		res.send();
	});

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
	    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});
};