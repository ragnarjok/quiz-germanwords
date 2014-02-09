angular.module('wordController', [])

	// inject the Word service factory into our controller
	.controller('mainController', function($scope, $http, Word) {
		$scope.word = {};

		// GET =====================================================================
		// when landing on the page, get one word 
		Word.get()
			.success(function(data) {
				$scope.word = data;
			});

		// CREATE ==================================================================
		// when submitting the add form, send the text to the node API
		$scope.submitWord = function() {

			// validate the formData to make sure that something is there
			// if form is empty, nothing will happen
			if (!$.isEmptyObject($scope.word.userAnswer)) {

				// call the create function from our service (returns a promise object)
				Word.submit($scope.word)

					.success(function(data) {
						$scope.word = data; 
					});
			}
		};

		$scope.fillDatabase =  function () {
			Word.fulfill()
			.success (function(data){ 

			});

		};		
	});