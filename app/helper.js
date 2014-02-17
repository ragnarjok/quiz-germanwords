var http = require("http");
var cheerio = require("cheerio");
var reAdditionalInfo = /aber:|ebenso|aber schwach|ungew.|veralt.|landsch./i;
var reSquareBraces = /\[|\]/g;

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function download(url, callback) {
	http.get(url, function(res) {
		var data = "";
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on("end", function() {
			callback(data);
		});
	}).on("error", function() {
		callback(null);
	});
};

function parse (url, callback){
	download(url, function(data) {
		if (data) {
			var $ = cheerio.load(data);
			$("tr").each(function(i, e) {
				var verb = $(e).find("td>b").text();
				if (verb.indexOf(' ') === -1 && !isNumber(verb)) {
					var forms = [];
					var $allForms = $(e).find("td").slice(1);
					var index = 0;
					$allForms.each(function(i, elem) {
					    var textValue = $(elem).text();
					    // there are only 3 forms possible
						if (index < 3 && textValue != '' &&  !reAdditionalInfo.test(textValue)) 
						{ 
							textValue = textValue.replace(reSquareBraces, ' ');
							forms[index] = textValue; 
							index++;
						} 
					});
					console.log(verb);
					callback({infinitive: verb, forms : forms});
				}					
			});
		}
	});
};

module.exports = {
	parse: parse
};