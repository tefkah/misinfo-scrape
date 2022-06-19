jQuery(window).load(function(){
	if(jQuery(window).width() < 769){
		if(jQuery('.wdm-sidebar').length > 0){
			var enjoyhint_instance = new EnjoyHint({
			});
			var enjoyhint_script_steps = [
				{
				'click .wdm-sidebar' : navigationText.text+'<div><img src="'+ajax_object.dir_path+'swipe_big.gif"></div>',
				"skipButton" : {className: "elumine-exit-tour", text: navigationText.closeTutorial},
				}
			];
			enjoyhint_instance.set(enjoyhint_script_steps);
			if(ajax_object.loggedIn){
				enjoyhint_instance.run();
			}
			else{
				if(localStorage.getItem('ld_visit') != 'true'){
					enjoyhint_instance.run();
				}
			}


			jQuery(document).on('click', '.elumine-exit-tour', function(){
				jQuery.post(
					ajax_object.ajax_url,
					{
						'action': 'get_tour_params',
					},
					function(res){
						console.log(res);
					}
				);
				localStorage.setItem('ld_visit', 'true');
			})

			swipeSidebar();
			function swipeSidebar(){
				document.addEventListener('touchstart', handleTouchStart, false);
				document.addEventListener('touchmove', handleTouchMove, false);

				var xDown = null;
				var yDown = null;

				function getTouches(evt) {
				return evt.touches ||             // browser API
						evt.originalEvent.touches; // jQuery
				}

				function handleTouchStart(evt) {
					xDown = getTouches(evt)[0].clientX;
					yDown = getTouches(evt)[0].clientY;
				};

				function handleTouchMove(evt) {
				if ( ! xDown || ! yDown ) {
					return;
				}

				var xUp = evt.touches[0].clientX;
				var yUp = evt.touches[0].clientY;

				var xDiff = xDown - xUp;
				var yDiff = yDown - yUp;

				if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {/*most significant*/
					if ( xDiff > 0 ) {
					} else {
						jQuery('.enjoyhint_close_btn').trigger('click');
					}
				} else {
					if ( yDiff > 0 ) {
						/* up swipe */
					} else {
						/* down swipe */
					}
				}
				/* reset values */
				xDown = null;
				yDown = null;
				};

			}
		}



	}
});
