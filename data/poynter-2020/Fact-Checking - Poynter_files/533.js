/**
 * plain js functions for displaying ads by size
 *
 **/

// basic variables
var advanced_ads_resizetimeout = 1000; // time to wait until resized window width is saved, in millisec
var advanced_ads_cookieexpires = 30; // days until the cookie expires
var advanced_ads_browser_width = advanced_ads_get_browser_width();

// save browserWidth in a cookie if not set or not equal to current saved width
if ( window.advads !== undefined && ! advads.get_cookie( 'advanced_ads_browser_width' ) ||
        advads.get_cookie('advanced_ads_browser_width') !== advanced_ads_browser_width ) {

    advanced_ads_save_width( advanced_ads_browser_width );

}

// save new browser width, when window resizes
if (window.addEventListener) {    // most non-IE browsers and IE9
   window.addEventListener("resize", advanced_ads_resize_window, false);
} else if (window.attachEvent) {  // Internet Explorer 5 or above
   window.attachEvent("onresize", advanced_ads_resize_window);
}

function advanced_ads_resize_window () {
	advads_resize_delay(function(){
		var previous_width = advanced_ads_browser_width;
		advanced_ads_browser_width = advanced_ads_get_browser_width();
		if ( previous_width === advanced_ads_browser_width ) {
			// Return if the viewport has not actually changed
			// Scroll events were triggering this on iOS due to the position of the address bar.
			return;
		}

		advanced_ads_save_width( advanced_ads_browser_width );

		var advanced_ads_responsive = window.advanced_ads_responsive || {}
		if ( window.jQuery && parseInt( advanced_ads_responsive.reload_on_resize, 10 ) ) {
			jQuery( document ).triggerHandler( 'advanced-ads-resize-window' );
		}
	}, advanced_ads_resizetimeout);
}    

// save width in cookie
function advanced_ads_save_width ( width ) {
    if( window.advads !== undefined ){
	    advads.set_cookie( 'advanced_ads_browser_width', width, advanced_ads_cookieexpires );
    }
}

// create a listener calling only once after resize
// http://stackoverflow.com/questions/2854407/javascript-jquery-window-resize-how-to-fire-after-the-resize-is-completed
var advads_resize_delay = (function(){
    var timer = 0;
    return function (callback, ms) {
	clearTimeout(timer);
	timer = setTimeout(callback, ms);
    };
})();

/**
 * get the width of the browser
 */
function advanced_ads_get_browser_width() {
    if ( window.jQuery ){    
        return jQuery(window).width();
    } else {
        var browserWidth = 0;
        if( typeof( window.innerWidth ) == 'number' ) {
            //Non-IE
            browserWidth = window.innerWidth;
        } else if( document.documentElement && document.documentElement.clientWidth ) {
            //IE 6+ in 'standards compliant mode'
            browserWidth = document.documentElement.clientWidth;
        } else if( document.body && document.body.clientWidth ) {
            //IE 4 compatible
            browserWidth = document.body.clientWidth;
        }
        return browserWidth;
    }
}