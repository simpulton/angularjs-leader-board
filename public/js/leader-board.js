var app = angular.module('app', []);

app.directive('contestant', function(socket) {
	var linker = function(scope, element, attrs) {
		element.hide().fadeIn();
	};

	var controller = function($scope) {
			// Incoming
			socket.on('onContestantUpdated', function(data) {
				// Update if the same contestant
				if(data.id == $scope.contestant.id) {
					$scope.contestant.display_name = data.display_name;
					$scope.contestant.lane = Number(data.lane);
					$scope.contestant.score = Number(data.score);
				}
			});

			// Outgoing
			$scope.incrementLane = function(contestant) {
				contestant.lane++;
				$scope.updateContestant(contestant);
			};

			$scope.decrementLane = function(contestant) {
				contestant.lane--;
				$scope.updateContestant(contestant);
			};
			
			$scope.incrementScore = function(contestant) {
				contestant.score++;
				$scope.updateContestant(contestant);
			};

			$scope.decrementScore = function(contestant) {
				contestant.score--;
				$scope.updateContestant(contestant);
			};

			$scope.updateContestant = function(contestant) {
				socket.emit('updateContestant', contestant);
			};

			$scope.deleteContestant = function(id) {
				$scope.ondelete({
					id: id
				});
			};
		};

		return {
			restrict: 'A',
			link: linker,
			controller: controller,
			scope: {
				contestant: '=',
				ondelete: '&'
			}
		};
	});

app.directive('remotecontestant', function(socket) {
	var linker = function(scope, element, attrs) {
		scope.$watch('remotecontestant', function(){
			if(typeof scope.remotecontestant !== 'undefined') {
				element.hide().fadeIn();
			}
		})
	};

	var controller = function($scope) {
		$scope.shouldShow = function() {
			var show = typeof $scope.remotecontestant !== 'undefined'
			return show;
		}	

		// Incoming
		socket.on('onContestantUpdated', function(data) {
			// Update if the same contestant
			if(data.id == $scope.remotecontestant.id) {
				$scope.remotecontestant.display_name = data.display_name;
				$scope.remotecontestant.score = Number(data.score);
			}
		});

		// Outgoing
		$scope.incrementScore = function(amount) {
			$scope.remotecontestant.score += Number(amount);
			$scope.updateContestant($scope.remotecontestant);
		};

		$scope.updateContestant = function(contestant) {
			socket.emit('updateContestant', contestant);
		};
	};

	return {
		restrict: 'A',
		link: linker,
		controller: controller,
		scope: {
			remotecontestant: '=',
		}
	};
});

app.factory('socket', function($rootScope) {
	var socket = io.connect();
	return {
		on: function(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if(callback) {
						callback.apply(socket, args);
					}
				});
			});
		}
	};
});

app.controller('RemoteCtrl', function($scope, socket) {
	$scope.contestant;
	$scope.contestants = [];

	socket.emit('listContestants');

	// Incoming
	socket.on('onContestantsListed', function(data) {
		$scope.contestants.push.apply($scope.contestants, data);
	});

	socket.on('onContestantCreated', function(data) {
		$scope.contestants.push(data);
	});

	socket.on('onContestantDeleted', function(data) {
		$scope.handleDeleteContestant(data.id);
	});

	$scope.selectContestant = function(id) {
		angular.forEach($scope.contestants, function(c) {
			if(c.id === id) {
				$scope.contestant = c;
			}
		});
	};

	$scope.handleDeleteContestant = function(id) {
		var oldContestants = $scope.contestants,
		newContestants = [];

		angular.forEach(oldContestants, function(contestant) {
			if(contestant.id !== id) {
				newContestants.push(contestant);
			}
		});

		$scope.contestants = newContestants;
	};
});

app.controller('MainCtrl', function($scope, socket) {
	$scope.contestants = [];
	$scope.rightContestants = [];
	$scope.leftContestants = [];

	socket.emit('listContestants');

	// Incoming
	socket.on('onContestantsListed', function(data) {
		$scope.contestants.push.apply($scope.contestants, data);
		updateColumns();
	});

	socket.on('onContestantCreated', function(data) {
		$scope.contestants.push(data);
		updateColumns();
	});

	socket.on('onContestantDeleted', function(data) {
		$scope.handleDeleteContestant(data.id);
		updateColumns();
	});

	var updateColumns = function() {
		$scope.rightContestants = $scope.contestants.slice(0,10);
		$scope.leftContestants = $scope.contestants.slice(10,20);	
	}

	$scope.shouldShowTwoColumns = function() {
		return $scope.contestants.length > 10;
	}

	// TODO: Refactor
	var _resetFormValidation = function() {
		$("input:first").focus();
		var $dirtyInputs = $("#ldrbd").find(".new input.ng-dirty")
		.removeClass("ng-dirty")
		.addClass("ng-pristine");
	};

	// Outgoing
	$scope.createContestant = function(display_name) {
		var contestant = {
			id: new Date().getTime(),
			lane: $scope.contestants.length + 1, // Next available lane
			display_name: display_name,
			score: 0
		};

		$scope.contestants.push(contestant);
		socket.emit('createContestant', contestant);

		_resetFormValidation();
	};

	$scope.deleteContestant = function(id) {
		$scope.handleDeleteContestant(id);

		socket.emit('deleteContestant', {id: id});
	};

	$scope.handleDeleteContestant = function(id) {
		var oldContestants = $scope.contestants,
		newContestants = [];

		angular.forEach(oldContestants, function(contestant) {
			if(contestant.id !== id) {
				newContestants.push(contestant);
			}
		});

		$scope.contestants = newContestants;
	}
});

// misc form validation stuff
$(function(){
	setTimeout(function(){
		// wait till angular is done populating the list

		// focus the first field
		$("input:first").focus();

		var $requiredInputs = $("#ldrbd").find("input[required]:not('.ng-dirty')");
		$requiredInputs.on("blur", function(){
			$(this)
			.removeClass("ng-pristine")
			.addClass("ng-dirty")
			.attr({
				placeholder: "Required"
			});

		});
	}, 100);
});