angular.module('wordService', [])

	// super simple service
	// each function returns a promise object 
	.factory('Word', function($http) {
		return {
			get : function() {
				return $http.get('/api/word');
			},

			submit : function(wordData) {
				console.log('word');
				console.log(wordData);
				return $http.post('/api/word', wordData);
			},
			
			fulfill: function(){
				return $http.post('/api/fill_database');
			}
		}
	});