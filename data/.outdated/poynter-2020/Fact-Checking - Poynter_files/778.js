function advanced_ads_sticky_check_position_fixed() {
	var container = document.body;
	if (document.createElement && container && container.appendChild && container.removeChild) {
		var el = document.createElement( 'div' );
		if ( ! el.getBoundingClientRect) {
			return null; }
		el.innerHTML = 'x';
		el.style.cssText = 'position:fixed;top:100px;';
		container.appendChild( el );
		var originalHeight = container.style.height,
				originalScrollTop = container.scrollTop;
		// In IE<=7, the window's upper-left is at 2,2 (pixels) with respect to the true client.
		// surprisely, in IE8, the window's upper-left is at -2, -2 (pixels), but other elements
		// tested is just right, so we need adjust this.
		// https://groups.google.com/forum/?fromgroups#!topic/comp.lang.javascript/zWJaFM5gMIQ
		// https://bugzilla.mozilla.org/show_bug.cgi?id=174397
		var extraTop = parseInt( document.documentElement.getBoundingClientRect().top, 10 );
		extraTop = extraTop > 0 ? extraTop : 0;
		container.style.height = '3000px';
		container.scrollTop = 500;
		var elementTop = parseInt( el.getBoundingClientRect().top, 10 );
		container.style.height = originalHeight;
		var isSupported = (elementTop - extraTop) === 100;
		container.removeChild( el );
		container.scrollTop = originalScrollTop;
		return isSupported;
	}
	return null;
};

// decode sticky ads right after consent is given.
document.addEventListener('advanced_ads_privacy', function (event) {
	if (event.detail.state !== 'accepted' && event.detail.state !== 'not_needed') {
		return;
	}

	window.advanced_ads_sticky_settings.placements.forEach(function (value) {
		document.querySelectorAll('script[type="text/plain"][data-tcf="waiting-for-consent"][data-placement="' + value + '"]').forEach(advads.privacy.decode_ad);
	});
});

jQuery( document ).ready(function($) {
	var resize_timeout = null, $el, previous_width = $( window ).width();


	// Update position when viewport size changes.
	function resize_handler() {
		if ( resize_timeout ) clearTimeout( resize_timeout );
		resize_timeout = setTimeout( function() {
			var new_width = $( window ).width();
			if ( previous_width === new_width ) {
				// Return if the viewport has not actually changed
				// Scroll event triggered this due to the position of the address bar.
				return;
			}
			previous_width  = new_width;

			if ( typeof advanced_ads_sticky_items !== 'undefined' ) {
				$.each( advanced_ads_sticky_items, function( wrapper_id, data ) {
					$el = $( '#' + wrapper_id );
					// Apply initial 'position: absolute' styles if 'position: absolute' was transformed to 'position: fixed'
					// using the 'advads.fix_element' function.
					$el.prop( 'style', data.initial_css );

					// Fix to windows position and/or center vertically again.
					data.modifying_func();
				} );
			}
		}, 1000 );
	}

	if ( 'undefined' === typeof advanced_ads_responsive || ! parseInt( advanced_ads_responsive.reload_on_resize, 10 ) ) {
		// If the "Reload ads on resize" feature of the Responsive add-on is not used.
		jQuery( window ).on( 'resize', resize_handler );
	}

	//Remove 'position: fixed' if not supported, if the feature enabled in the settings.
	if ( typeof advanced_ads_sticky_settings === 'undefined' || ! advanced_ads_sticky_settings.check_position_fixed ) {
		return;
	}

	// story scroll enable value so it isn’t checked multiple times per page view
	var advanced_ads_sticky_position_fixed_supported = '';
	var allowed_offset = $( document.body ).is( '.admin-bar' ) ? $( '#wpadminbar' ).height() : 0;

	/**
	 * Remove all position related inline styles.
	 *
	 * @param {object=} $stickyads Optional jQuery object.
	 */
	function remove_css( $stickyads ) {
		// if position fixed is unsupported
		if ( advanced_ads_sticky_position_fixed_supported === false ) {
			$( window ).off( 'resize', resize_handler );
			$stickyads = $stickyads || jQuery( '.' + advanced_ads_sticky_settings.sticky_class );
			setTimeout( function() {
				$stickyads.each( function( key, value ) {
					var $stickyad = $( value );
					if ( window.advanced_ads_sticky_items[ $stickyad.attr( 'id' ) ].can_convert_to_abs ) {
						$stickyad.css( 'position', 'absolute' );
					} else {
						$stickyad.css( 'position', '' ).css( 'top', '' ).css( 'right', '' ).css( 'bottom', '' ).css( 'left', '' ).css( 'margin-left', '' )
							.css( 'transform', 'none' ).css( '-webkit-transform', 'none' ).css( '-moz-transform', 'none' ).css( '-ms-transform', 'none' );
					}
				});
			} );
		}
	}


	function scroll_handler() {
		clearTimeout( $.data( this, 'scrollTimer' ) );
		// wait 100ms when scrolling before checking
		$.data(this, 'scrollTimer', setTimeout(function() {
			// don’t do anything if scroll position is 0 == top
			// or admin bar has not been scrolled.
			if($( document ).scrollTop() <= allowed_offset ) { return; }
			// check if position fixed is supported; story result in a variable so test runs only once
			if(advanced_ads_sticky_position_fixed_supported == ''){
				advanced_ads_sticky_position_fixed_supported = advanced_ads_sticky_check_position_fixed();
				clearTimeout( $.data( this, 'scrollTimer' ) );
				$( window ).off( 'scroll', scroll_handler );
			}
			// rewrite sticky ads
			remove_css();
		}, 100));
	}

	if ( navigator.userAgent.indexOf( 'Opera Mini' ) > -1 ) {
		//Opera mini does not support 'scroll' event.
		advanced_ads_sticky_position_fixed_supported = false;
		remove_css();
	} else {
		$( window ).scroll( scroll_handler );
	}


	// When cache-busting inserts new item.
	if ( typeof advanced_ads_pro === 'object' && advanced_ads_pro !== null ) {
		advanced_ads_pro.postscribeObservers.add( function (event) {
			if ( event.event === 'postscribe_done' && event.ref && event.ad ) {
				var $stickyad = jQuery( event.ref ).children( '.' + advanced_ads_sticky_settings.sticky_class );
				if ( $stickyad.length ) {
					remove_css( $stickyad );
				}
			}
		} );
	}
});
