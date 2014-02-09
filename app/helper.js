var http = require("http");
var cheerio = require("cheerio");
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
					if (verb.indexOf(' ') === -1) {
						var forms = [];
						var $allForms = $(e).find("td").slice(1);
						var index = 0;
						$allForms.each(function(i, elem) {  if ($(elem).text() != '') { forms[index] = $(elem).text(); index++;} });
						callback({infinitive: verb, forms : forms});
					}					
				});
			}
		});
	};

module.exports = {
      parse: parse
};