$(document).ready(function(){
	// declare variables
	var socket, currentUser, dx, dy, sounds;

	// assign variables
	currentUser = {};
	dx = 0.5;
	dy = 0.5;
	sounds = {
		background: document.getElementById('background'),
		move: document.getElementById('move'),
		fire: document.getElementById('fire')
	}

	// define functions
	function socketConnected(){
		currentUser.name = window.prompt("Your name please?");
		$('title').html(currentUser.name);

		socket.emit('user-joined', currentUser.name);		
	}

	function userJoined(allUsers){
		currentUser = allUsers[currentUser.name];
		$('#main').empty();

		var allKeys = Object.keys(allUsers);
		for(i = 0; i < allKeys.length; i++){
			var user = allUsers[allKeys[i]];
			
			var tank = $('<div />').html($('#tankTemplate').html()).addClass("tank");
			tank.find('span[purpose=name]').html(user.name).attr('name', user.name);

			tank.css({
				top: user.y + "%",
				left: user.x + "%"
			});

			if(user.d === 'n'){
				tank.addClass('north')
			} else if(user.d === 'e'){
				tank.addClass('east');
			} else if(user.d === 'w'){
				tank.addClass('west');
			} else if(user.d === 's'){
				tank.addClass('south');
			}

			$('#main').append(tank);
		}
	}

	function userLeft(user){
		if(user && user.name){
			$('span[name=' + user.name + ']').prev().attr('src', '/images/ship-dead.png');
			if(user.name === currentUser.name){
				$(document).off("keypress");
			}

			window.setTimeout(function() {
				$('span[name=' + user.name + ']').parent().remove();
				if(user.name === currentUser.name){
					alert("Game over");
				}
			}, 2000);				
		}
	}

	function reposition(user){
		if(user && user.name){
			var tank = $('span[name=' + user.name + ']').parent();
			tank.css({
				top: user.y + "%",
				left: user.x + "%"
			});


			tank.removeClass('north east west south');
			if(user.d === 'n'){
				tank.addClass('north');
			} else if(user.d === 'e'){
				tank.addClass('east');
			} else if(user.d === 'w'){
				tank.addClass('west');
			} else if(user.d === 's'){
				tank.addClass('south');
			}
		}
	}

	function laserAttack(user){
		var $laser = $('<div />').addClass('laser');
		var lt, ll, lw, lh;
		if(user.d === 'n'){
			lt = 0;
			ll = user.x + 4.5;
			lw = 1;
			lh = user.y;
		}
		else if(user.d === 'e'){
			lt = user.y + 9;
			ll = user.x + 10;
			lw = 100 - user.x - 10;
			lh = 2;
		}
		else if(user.d === 'w'){
			lt = user.y + 9;
			ll = 0;
			lw = user.x;
			lh = 2;
		}
		else if(user.d === 's'){
			lt = user.y + 20;
			ll = user.x + 4.5;
			lw = 1;
			lh = 100 - user.y - 20;
		} 
		$laser.css({
			top: lt + '%',
			left: ll + '%',
			height: lh + '%',
			width: lw + '%'
		});
		$laser.appendTo('body');
		window.setTimeout(function() {
			$laser.remove();
		}, 250);
	}

	function playSound(sound){
		sound.play();
		var intr = window.setTimeout(function() {
			sound.pause();
			window.clearTimeout(intr);
		}, 500)
	}

	function handleKey(){
		var deltaX = 0, deltaY = 0;

		currentUser.timeOfEvent = Date.now();
		switch(window.event.which){
			case 32:
				sounds.fire.play();
				currentUser.action = 'laser-attack';
				currentUser.laser = {
					// north - south
					x: currentUser.x + 5,
					ymin: currentUser.d === 'n' ? 0 : currentUser.y + 20,
					ymax:  currentUser.d === 'n'? currentUser.y: 100,
					// east - west
					y: currentUser.y + 10,
					xmin: currentUser.d === 'e'? currentUser.x + 10: 0,
					xmax: currentUser.d === 'e'? 100: currentUser.x
				};
			 	break;
			case 119:
				playSound(sounds.move);
				currentUser.action = 'reposition';
				if(currentUser.d === 'n'){
					deltaY = -dy;
				}
				else if(currentUser.d === 'e'){
					deltaX = dx;
				}
				else if(currentUser.d === 'w'){
					deltaX = -dx;
				}
				else if(currentUser.d === 's'){
					deltaY = dy;
				} 

				if(currentUser.x + deltaX <= 90 && currentUser.x + deltaX >= 0){
					currentUser.x += deltaX;
				}

				if(currentUser.y + deltaY <= 80 && currentUser.y + deltaY >= 0){
					currentUser.y += deltaY;
				}
			 	break;
			case 115:
				playSound(sounds.move);
				currentUser.action = 'reposition';
				if(currentUser.d === 'n'){
					deltaY = -dy;
				}
				else if(currentUser.d === 'e'){
					deltaX = dx;
				}
				else if(currentUser.d === 'w'){
					deltaX = -dx;
				}
				else if(currentUser.d === 's'){
					deltaY = dy;
				} 

				if(currentUser.x - deltaX <= 90 && currentUser.x - deltaX >= 0){
					currentUser.x -= deltaX;
				}

				if(currentUser.y - deltaY <= 80 && currentUser.y - deltaY >= 0){
					currentUser.y -= deltaY;
				}
			 	break;
			case 97:
				playSound(sounds.move);
				currentUser.action = 'reposition';
				if(currentUser.d === 'n'){
					currentUser.d = 'w';
				}
				else if(currentUser.d === 'e'){
					currentUser.d = 'n';
				}
				else if(currentUser.d === 'w'){
					currentUser.d = 's';
				}
				else if(currentUser.d === 's'){
					currentUser.d = 'e';
				} 
				break;
			case 100:
				playSound(sounds.move);
				currentUser.action = 'reposition';
				if(currentUser.d === 'n'){
					currentUser.d = 'e';
				}
				else if(currentUser.d === 'e'){
					currentUser.d = 's';
				}
				else if(currentUser.d === 'w'){
					currentUser.d = 'n';
				}
				else if(currentUser.d === 's'){
					currentUser.d = 'w';
				} 
				break;
			default:
				break;
		}

		socket.emit('msg', currentUser);
		window.event.preventDefault();
	}

	// define Init
	function Init(){
		socket = io();

		socket.on("connect", socketConnected);
		socket.on('user-joined', userJoined);
		socket.on('user-left', userLeft);
		socket.on('reposition', reposition);	
		socket.on('laser-attack', laserAttack);	

		$(document).on("keypress", handleKey);
		sounds.background.volume = 0.1;
		sounds.background.play();
	}

	// Call Init
	Init();
}); 