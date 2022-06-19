/**
 * Process ads with cache busting 'On'
 */
var advanced_ads_layer_cache_busting;
if ( ! advanced_ads_layer_cache_busting ) {
	advanced_ads_layer_cache_busting = {
        doc_loaded: false,
        bufferedAds: [],

        flush: function() {
            var _bufferedAds = this.bufferedAds;
            this.bufferedAds = [];

            for ( var i = 0; i < _bufferedAds.length; i++ ) {
                this._process_item( jQuery( _bufferedAds[i] ) );

            }

        },

        _process_item: function( banner ) {
            var banner_id = banner.attr('id');

            advads_items.conditions[banner_id] = advads_items.conditions[banner_id] || {};

            advads_layer_center_if_not_sticky ( banner )

            if (banner.hasClass('advads-effect') ) {
                advads_layer_gather_effects(banner_id);
            }

            if ( ! banner.hasClass( 'use-fancybox' ) ) {
                advads_layer_gather_background( banner_id );
            }

            advads_layer_gather_auto_close( banner );

            // display onload ad right away
            if (banner.hasClass(advanced_ads_layer_settings.layer_class + '-onload')) {
                advads_items.conditions[banner_id].scrolloffset = true;
                advads_check_item_conditions(banner_id);
            // exit popup (if the user leaves the page) 
            } else if (banner.hasClass(advanced_ads_layer_settings.layer_class + '-exit')) {
                    ouibounce(banner[0], {
                    // the modal will fire any time the page is reloaded, for the same user
                    aggressive: true,
                    // amount of time that firing is surpressed for
                    timer: 0,
                    callback: function() {
                        // reset display to none after Ouibounce
                        banner.css('display', 'none');
                        advads_items.conditions[banner_id].scrolloffset = true;
                        advads_check_item_conditions(banner_id);
                    }
                });
            // display after delay of n seconds
            } else if ( banner.hasClass( advanced_ads_layer_settings.layer_class + '-delay' ) ) {
                var delay = ( parseInt( banner.attr( 'data-advads-layer-delay' ), 10 ) ) || 0;
                setTimeout( function() {
                    advads_items.conditions[banner_id].delay_expired = true;
                    advads_check_item_conditions(banner_id);
                }, delay );
            // ad depends on scrolling
            }  else {
                // calculate scroll length (document height - window height)
                var advads_scrollhalf = (jQuery(document).height() - jQuery(window).height()) / 2;

                var scroll_handler = function ( event ) {
                    if ( jQuery.inArray( banner_id, advads_items.showed ) !== -1 ) {
                        //console.log( 'off scroll event' )
                        jQuery( window ).off( 'scroll', scroll_handler );
                        return;
                    }

                    // display scroll ads right after scrolling stopped
                    if ( banner.hasClass( advanced_ads_layer_settings.layer_class + '-stop' ) ) {
                        advads_items.conditions[banner_id].scrolloffset = true;
                        advads_check_item_conditions( banner_id );
                    }

                    // display ads after half the page was scrolled
                    if ( jQuery( document ).scrollTop() >= advads_scrollhalf) {
                        if ( banner.hasClass( advanced_ads_layer_settings.layer_class + '-half' ) ) {
                            advads_items.conditions[banner_id].scrolloffset = true;
                            advads_check_item_conditions(banner_id);
                        }
                    }

                    // display ads after custom scroll offset
                    if ( banner.hasClass( advanced_ads_layer_settings.layer_class + '-offset' ) ) {
                        var custom_offset = advads_extract_custom_offset_from_class( '#' + banner_id );
                        if ( jQuery( document ).scrollTop() >= custom_offset ) {
                            advads_items.conditions[banner_id].scrolloffset = true;
                            advads_check_item_conditions( banner_id );
                        }
                    }
                }


                jQuery( window ).onEnd( 'scroll', scroll_handler, 100);
            }

        },

        observe: function (event) {
            if ( event.event === 'postscribe_done' && event.ref && event.ad ) {
                var banner = jQuery( event.ref ).children( 'div' );
                if ( ! banner.hasClass( advanced_ads_layer_settings.layer_class + '' ) ) {
                    return;
                }

                if ( advanced_ads_layer_cache_busting.doc_loaded ) {
                    advanced_ads_layer_cache_busting.bufferedAds.push( banner );
                    advanced_ads_layer_cache_busting.flush();
                }
            }
        },
	}
}

// Advanced Ads Pro is enabled
if ( typeof advanced_ads_pro === 'object' && advanced_ads_pro !== null ) {
	// observe cache busting done event
    advanced_ads_pro.postscribeObservers.add( advanced_ads_layer_cache_busting.observe );
}

/**
 * Process ads with cache busting 'Off'
 */
var layers = function() {
    advanced_ads_layer_cache_busting.doc_loaded = true;

    jQuery('.' + advanced_ads_layer_settings.layer_class).each(function () {
        advanced_ads_layer_cache_busting.bufferedAds.push(jQuery(this));
    });

    advanced_ads_layer_cache_busting.flush();
};

if (typeof advads !== 'undefined' && typeof advads.privacy.dispatch_event !== 'undefined') {
    document.addEventListener('advanced_ads_privacy', function (event) {
        if (
            event.detail.previousState === 'unknown'
            && (event.detail.state === 'accepted' || event.detail.state === 'not_needed')
            && window.advanced_ads_layer_settings.placements !== null
        ) {
            window.advanced_ads_layer_settings.placements.forEach(function (value) {
                document.querySelectorAll('script[type="text/plain"][data-tcf="waiting-for-consent"][data-placement="' + value + '"]').forEach(advads.privacy.decode_ad);
            });
        }

        layers();
    });
} else {
    ( window.advanced_ads_ready || jQuery( document ).ready ).call( null, function() {
        layers();
    });
}

/**
 * adjust position for centered layer banner if not added by the sticky plugin
 * @param {string} $ad jQuery object (wrapped set)
 */
function advads_layer_center_if_not_sticky( $ad ) {
	if ($ad.hasClass('is-sticky')) {
		return;
	}
	/*
	var left = ( jQuery( window ).width() - ad.width() ) / 2;
	var top = ( jQuery( window ).height() - ad.height() ) / 2;
	ad.css('left', left);
	ad.css('top', top);
	ad.css('position', 'fixed'); 
	*/

	var width = parseInt($ad.attr('data-width'), 10);
	var height = parseInt($ad.attr('data-height'), 10);


	var is_transform_supported = getSupportedTransform();

	var transform_property = '';
	if (!height) {
		if (is_transform_supported) {
			transform_property += 'translateY(50%) ';
		} else {
			jQuery($ad).css({'top': '0', 'bottom': 'auto'});
		}
	}
	if (!width) {
		if (is_transform_supported) {
			transform_property += 'translateX(-50%) ';
		} else {
			jQuery($ad).css({'left': '0', 'right': 'auto'});
		}

	}
	if (transform_property) {
		set_ad_transform($ad, transform_property);
	}
}

/**
 * gather information about display effects and duration
 * @param {string} id of the ad, without #
 */
function advads_layer_gather_effects(id) {
    var banner = jQuery('#' + id);
    // display effect duration
    advads_items.effect_durations[id] = advads_extract_duration_from_class(banner);
    // load display effects
    if (banner.hasClass('advads-effect-fadein')) {
        advads_items.display_effect_callbacks[id] = 'advads_display_effect_fadein';
    };
    if (banner.hasClass('advads-effect-show')) {
        advads_items.display_effect_callbacks[id] = 'advads_display_effect_show';
    };
    if (banner.hasClass('advads-effect-slide')) {
        advads_items.display_effect_callbacks[id] = 'advads_display_effect_slide';
    };
}

/**
 * gather information about background
 * @param {string} id of the ad, without #
 */
function advads_layer_gather_background(id) {
    var banner = jQuery('#' + id);
    // add display callback to the ads with background
    if (banner.hasClass('advads-has-background') && banner.is(':hidden')) {
        if (!advads_items.display_callbacks[id] != 'undefined') {
            advads_items.display_callbacks[id] = {};
            var length = 0;
        } else {
            var length = advads_items.display_callbacks[id].length;
        }

        advads_items.display_callbacks[id][length] = 'advads_layer_display_background_callback';
    }
}

/**
 * Gather auto close info and schedule auto close.
 *
 * @param {obj} $banner A jQuery object representing the banner wrapper.
 */
function advads_layer_gather_auto_close( $banner ) {
	var delay = parseInt( $banner.data( 'auto-close-delay'), 10 );
	if ( ! delay ) { return; }
	var banner_id = $banner.attr('id');
	advads_items.display_callbacks[ banner_id ] = advads_items.display_callbacks[ banner_id ] || {};
	advads_items.display_callbacks[ banner_id ].auto_close = function( banner_id ) {
		setTimeout( function() {
			advads_layer_close_item( banner_id );
		}, delay );
	}
}

/**
 * check if background can be removed
 *
 * @param {string} id id of the ad, without #
 * @returns {bool} true, if background can be removed
 */
function can_remove_background(item) {
    advads_items.backgrounds[ item ] = false;
    var remove = true;
	jQuery.each( advads_items.backgrounds, function( i, val ) {
		if ( val == true ) {
			//if ( advads_items.conditions.hasOwnProperty(i) && advads_items.conditions[i].scrolloffset == true  ) {
				remove = false;
				//break the loop
				return false;
			//}
		}
	});	
	return remove;
}

/**
 * check item conditions and display the ad if all conditions are true
 *
 * @param {string} id id of the ad, without #
 * @returns {bool} true, if item can be displayed
 */
function advads_check_item_conditions(id) {
    var item = jQuery('#' + id);
    if (item.length == 0) {
        return;
    }

    var display = true;
    jQuery.each(advads_items.conditions[id], function (method, flag) {
        if (flag === false) {
            // display the banner
            display = false;
        }
    });

    if ( display ) {
        advads_items.showed.push(id);
		
		item.trigger( advanced_ads_layer_settings.layer_class + '-trigger' );
		
        if ( item.hasClass('use-fancybox') ) {
            fancybox_display (id);
        } else {
            var ad = jQuery('#' + id);

            var position = jQuery(ad).attr('data-position');
            var width = parseInt( ad.attr( 'data-width' ), 10 );
            var height = parseInt( ad.attr( 'data-height' ), 10 );
            var is_transform_supported = getSupportedTransform();


            switch ( position ) {
                case 'topcenter': 
                    if ( ! width ) {
                        if ( is_transform_supported ) {
                            set_ad_transform(ad, 'translateX(-50%)');
                        } else {
                            jQuery( ad ).css({ 'left':'0', 'right':'auto', 'top':'0', 'bottom':'auto' });                              
                        }
                    }
                    break; 
                case 'centerleft': 
                    if ( ! height ) {
                        if ( is_transform_supported ) {
                            set_ad_transform(ad, 'translateY(50%)');                            
                        } else {
                            jQuery( ad ).css({ 'left':'0', 'right':'auto', 'top':'0', 'bottom':'auto' });                               
                        }
                    }
                    break;  
                case 'center': 
                    var transform_property = '';
                    if ( ! height ) {
                        if ( is_transform_supported ) {
                            transform_property += 'translateY(50%) ';
                        } else {
                            jQuery( ad ).css({ 'top':'0', 'bottom':'auto' });                              
                        }
                    }
                    if ( ! width ) {
                        if ( is_transform_supported ) {
                            transform_property += 'translateX(-50%) ';
                        } else {
                            jQuery( ad ).css({ 'left':'0', 'right':'auto' });                              
                        }

                    }
                    if (transform_property) {
                        set_ad_transform(ad, transform_property);   
                    }
                    break;
                case 'centerright': 
                    if ( ! height ) {
                        if ( is_transform_supported ) {
                            set_ad_transform(ad, 'translateY(50%)');
                        } else {
                            jQuery( ad ).css({ 'left':'0', 'right':'auto', 'top':'0', 'bottom':'auto' });                              
                        }

                    }
                    break; 
                case 'bottomcenter': 
                    if ( ! width ) {
                        if ( is_transform_supported ) {
                            set_ad_transform(ad, 'translateX(-50%)');
                        } else {
                            jQuery( ad ).css({ 'left':'0', 'right':'auto', 'top':'0', 'bottom':'auto' });                              
                        }

                    }
                    break;
            }

            advads_layer_call_display_callbacks( id );

            if (advads_items.display_effect_callbacks[id] == undefined) {
                ad.show();
            } else {
                var callback = window[advads_items.display_effect_callbacks[id]];
                callback(id);
            }         
        }       
    }
}

/**
 * shows the ad using fancybox plugin
 *
 * @param {string} id id of the ad, without #
 */
function fancybox_display(id) {
    var banner = jQuery('#' + id);

    var settings = {
        'speedIn'            : 0,
        'speedOut'           : 0,
        'showCloseButton'    : true,
        'hideOnOverlayClick' : banner.hasClass( 'advads-background-click-close' ),
        'centerOnScroll'      : true,
        //'autoScale' : false,
        //'autoDimensions' : false,
        'margin' : 20,
        'padding' : 10,
        'onClosed': function() {
            if ( typeof advads_items.close_functions[ id ] === 'function' ) {
                advads_items.close_functions[ id ]();
            }
        },        
		// Once the content is displayed.
		'onComplete': function() {
			advads_layer_call_display_callbacks( id );
		},
    }

    if (advads_items.display_effect_callbacks[id] == undefined) {
        settings['transitionIn'] = 'none';
    } else {
        var callback = advads_items.display_effect_callbacks[id];
        switch ( callback ) {
            case 'advads_display_effect_fadein': 
                settings['transitionIn'] = 'fade'; 
                break;
            case 'advads_display_effect_show': 
                settings['transitionIn'] = 'elastic'; 
                break;            
            default: 
                settings['transitionIn'] = 'none';
        }
    }

    if ( ! banner.hasClass('advads-has-background') ) {
        settings['overlayShow'] = false;
    }

    if ( ! banner.hasClass('advads-close') ) {
        settings['showCloseButton'] = false;
    }    
    // extract duration of the transitionIn effect
    var speedIn = advads_extract_duration_from_class(banner);
    settings['speedIn'] = ( speedIn ) ? speedIn : 0;

    var position = jQuery(banner).attr('data-position');
    // css for Fancybox
    var output_css = '#fancybox-close { right: -15px; }';
    output_css += '#fancybox-loading, #fancybox-loading div, #fancybox-overlay, #fancybox-wrap, #fancybox-wrap div {';
    output_css += '-webkit-box-sizing: content-box !important; -moz-box-sizing: content-box !important; box-sizing: content-box !important; }';    

    switch ( position ) {
        case 'topleft': 
            output_css += '#fancybox-wrap { position: fixed; bottom: auto !important; top: 0px !important; right: auto !important; left: 0px !important; }';
            break;  
        case 'topcenter': 
            output_css += '#fancybox-wrap { position: fixed; bottom: auto !important; top: 0px !important; }';
            break; 
        case 'topright': 
            output_css += '#fancybox-wrap { position: fixed; bottom: auto !important; top: 0px !important; right: 0px !important; left: auto !important; }';
            break;
        case 'centerleft': 
            output_css += '#fancybox-wrap { left: 0px !important; right: auto !important; }';
            break;    
        case 'center': 
            break;  
        case 'centerright': 
            output_css += '#fancybox-wrap { right: 0px !important; left: auto !important; }';
            break;    
        case 'bottomleft': 
            output_css += '#fancybox-wrap { position: fixed; bottom: 0px !important; top: auto !important; right: auto !important; left: 0px !important; }';
            break;                                                                                   
        case 'bottomcenter': 
            output_css += '#fancybox-wrap { position: fixed; bottom: 0px !important; top: auto !important; }';
            break;
        case 'bottomright': 
            output_css += '#fancybox-wrap { position: fixed; bottom: 0px !important; top: auto !important; right: 0px !important; left: auto !important; }';
            break;
    }  
        

    jQuery('#' + advanced_ads_layer_settings.layer_class + '-custom-css').html(output_css);

    // show fancybox
    if ( typeof jQuery.fancybox == 'function' ) {
        banner.waitForImages( function() {
            settings['content'] = banner.show();
            jQuery.fancybox( settings );
        });
    }
}

/**
 * Call display callbacks.
 *
 * @param {string} banner_id id of the banner, without #
 */
function advads_layer_call_display_callbacks( banner_id ) {
	// iterate through all callback function and call them
	advads_items.display_callbacks[ banner_id ] = advads_items.display_callbacks[ banner_id ] || {};
	jQuery.each( advads_items.display_callbacks[ banner_id ], function ( key, func ) {
		if ( typeof func === 'string' ) {
			func = window[ func ];
		}
		func( banner_id );
	});
}

/**
 * return a custom offset extracted from a class name
 * @param {str} field
 * @returns {int} offset
 */
function advads_extract_custom_offset_from_class(field) {
    var offset = 0;
    var classes = jQuery(field).attr('class');
    if (classes !== undefined) {
        // create class array
        classes = classes.split(/\s+/);
        jQuery.each(classes, function (key, value) {
            if (value === '')
                return false;
            // get information about the solution from a class
            var pattern = new RegExp(advanced_ads_layer_settings.layer_class + '-offset-', 'gi');
            if (value.match(pattern)) {
                infos = value.split('-');
                offset = parseInt(infos[3])
                return false;
            }
        });
    }

    return offset;
};

/**
 * return a duration extracted from a class name
 * @param {str} field
 * @returns {int} offset
 */
function advads_extract_duration_from_class(field) {
    var duration = 0;
    var classes = field.attr('class');
    if (classes !== undefined) {
        // create class array
        classes = classes.split(/\s+/);
        jQuery.each(classes, function (key, value) {
            if (value === '')
                return false;
            // get information about the solution from a class
            if (value.match(/advads-duration-/gi)) {
                infos = value.split('-');
                duration = parseInt(infos[2])
                return false;
            }
        });
    }

    return duration;
};

/**
 * callback function in case a layer ad is displayed with a background
 * @param {type} ad object
 */
function advads_layer_display_background_callback(id) {
    // display overlay in case it is attached to an ad still not visible
    var banner = jQuery('#' + id);
    // only display background if there is an unvisible ad with a background AND no background visible yet
    if (banner.hasClass('advads-has-background') && banner.is(':hidden')) {
    	//there is background for this ad
    	advads_items.backgrounds[id] = true;
    	if (jQuery('.advads-background').length === 0) {
			var args = {
				"class": "advads-background",
				"style": "position: fixed; bottom: 0; right: 0; display: block; width: 100%; height: 100%; background: #000; z-index: 9998; opacity:.5;",
			}
			if ( banner.hasClass( 'advads-background-click-close' ) ) {
				args.click = function() {
					jQuery( this ).remove();
					advads_layer_close_items();
				}
			}
			jQuery( '<div/>', args ).appendTo( 'body' );
   		}
    }
}

/**
 * callback for display effect fadeIn
 * @param {obj} ad container
 */
function advads_display_effect_fadein(id) {
    var banner = jQuery('#' + id);
    var duration = parseInt(advads_items.effect_durations[id]);
    banner.fadeIn(duration);
}

/**
 * callback for display effect show
 * @param {obj} ad container
 */
function advads_display_effect_show(id) {
    var banner = jQuery('#' + id);
    var duration = parseInt(advads_items.effect_durations[id]);
    banner.show(duration);
}

/**
 * callback for display effect slideDown
 * @link http://api.jquery.com/slideDown/
 * @param {obj} ad container
 */
function advads_display_effect_slide(id) {
    var banner = jQuery('#' + id);
    var duration = parseInt(advads_items.effect_durations[id]);
    banner.slideDown(duration);
}

/**
 * check, if css transform is supported by user's browser
 * 
 * [http://stackoverflow.com/a/12625986]
 */
function getSupportedTransform() {
    var prefixes = 'transform WebkitTransform MozTransform OTransform msTransform'.split(' ');
    var div = document.createElement('div');
    for(var i = 0; i < prefixes.length; i++) {
        if(div && div.style[prefixes[i]] !== undefined) {
            return prefixes[i];
        }
    }
    return false;
}

/**
 * set css transform property for the ad
 * @param {string} jQuery object (wrapped set)
 * @param {string} values of property
 */
function set_ad_transform( ad, transform_properties ) {
    jQuery( ad ).css({
        '-webkit-transform': transform_properties,
        '-moz-transform': transform_properties,
        'transform': transform_properties
    }); 
}

/**
 * Close item (when user clicks on the close button/background or automatically after n sec.).
 *
 * @param {string} item_id Id of the item.
 */
function advads_layer_close_item( item_id ) {
	if ( typeof advads_items.close_functions[ item_id ] === 'function' ) {
		advads_items.close_functions[ item_id ]();
		advads_items.close_functions[ item_id ] = null;

		// Close Fancybox window.
		if ( jQuery.fancybox && typeof jQuery.fancybox.close === 'function' ) {
			jQuery.fancybox.close();
		}
	}
}

/**
 * Close all items.
 */
function advads_layer_close_items() {
	for ( var item_id in advads_items.close_functions ) {
		if ( advads_items.close_functions.hasOwnProperty( item_id ) ) {
			advads_layer_close_item( item_id );
		}
	}
}

//https://github.com/tonai/jquery-onend
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){a.fn.onEnd=function(){var a,b=Array.prototype.slice.call(arguments),c=b.pop(),d=b.pop(),e=function(){var b=Array.prototype.slice.call(arguments);clearTimeout(a),a=setTimeout(function(){d.apply(this,b)}.bind(this),c)};e.guid=d.guid||(d.guid=jQuery.guid++),b.push(e),this.on.apply(this,b)}});

/*!
 * Ouibounce
 * https://github.com/carlsednaoui/ouibounce
 *
 * Copyright (c) 2014 Carl Sednaoui
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php).
 **/
!function(e,n){"function"==typeof define&&define.amd?define(n):"object"==typeof exports?module.exports=n(require,exports,module):e.ouibounce=n()}(this,function(e,n,o){return function(e,n){"use strict";function o(e,n){return"undefined"==typeof e?n:e}function i(e){var n=24*e*60*60*1e3,o=new Date;return o.setTime(o.getTime()+n),"; expires="+o.toUTCString()}function t(){s()||(L.addEventListener("mouseleave",u),L.addEventListener("mouseenter",r),L.addEventListener("keydown",c))}function u(e){e.clientY>k||(D=setTimeout(m,y))}function r(){D&&(clearTimeout(D),D=null)}function c(e){g||e.metaKey&&76===e.keyCode&&(g=!0,D=setTimeout(m,y))}function d(e,n){return a()[e]===n}function a(){for(var e=document.cookie.split("; "),n={},o=e.length-1;o>=0;o--){var i=e[o].split("=");n[i[0]]=i[1]}return n}function s(){return d(T,"true")&&!v}function m(){s()||(e&&(e.style.display="block"),E(),f())}function f(e){var n=e||{};"undefined"!=typeof n.cookieExpire&&(b=i(n.cookieExpire)),n.sitewide===!0&&(w=";path=/"),"undefined"!=typeof n.cookieDomain&&(x=";domain="+n.cookieDomain),"undefined"!=typeof n.cookieName&&(T=n.cookieName),document.cookie=T+"=true"+b+x+w,L.removeEventListener("mouseleave",u),L.removeEventListener("mouseenter",r),L.removeEventListener("keydown",c)}var l=n||{},v=l.aggressive||!1,k=o(l.sensitivity,20),p=o(l.timer,1e3),y=o(l.delay,0),E=l.callback||function(){},b=i(l.cookieExpire)||"",x=l.cookieDomain?";domain="+l.cookieDomain:"",T=l.cookieName?l.cookieName:"viewedOuibounceModal",w=l.sitewide===!0?";path=/":"",D=null,L=document.documentElement;setTimeout(t,p);var g=!1;return{fire:m,disable:f,isDisabled:s}}});

/*! waitForImages jQuery Plugin 2015-06-02 */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):a(jQuery)}(function(a){var b="waitForImages";a.waitForImages={hasImageProperties:["backgroundImage","listStyleImage","borderImage","borderCornerImage","cursor"],hasImageAttributes:["srcset"]},a.expr[":"]["has-src"]=function(b){return a(b).is('img[src][src!=""]')},a.expr[":"].uncached=function(b){return a(b).is(":has-src")?!b.complete:!1},a.fn.waitForImages=function(){var c,d,e,f=0,g=0,h=a.Deferred();if(a.isPlainObject(arguments[0])?(e=arguments[0].waitForAll,d=arguments[0].each,c=arguments[0].finished):1===arguments.length&&"boolean"===a.type(arguments[0])?e=arguments[0]:(c=arguments[0],d=arguments[1],e=arguments[2]),c=c||a.noop,d=d||a.noop,e=!!e,!a.isFunction(c)||!a.isFunction(d))throw new TypeError("An invalid callback was supplied.");return this.each(function(){var i=a(this),j=[],k=a.waitForImages.hasImageProperties||[],l=a.waitForImages.hasImageAttributes||[],m=/url\(\s*(['"]?)(.*?)\1\s*\)/g;e?i.find("*").addBack().each(function(){var b=a(this);b.is("img:has-src")&&j.push({src:b.attr("src"),element:b[0]}),a.each(k,function(a,c){var d,e=b.css(c);if(!e)return!0;for(;d=m.exec(e);)j.push({src:d[2],element:b[0]})}),a.each(l,function(c,d){var e,f=b.attr(d);return f?(e=f.split(","),void a.each(e,function(c,d){d=a.trim(d).split(" ")[0],j.push({src:d,element:b[0]})})):!0})}):i.find("img:has-src").each(function(){j.push({src:this.src,element:this})}),f=j.length,g=0,0===f&&(c.call(i[0]),h.resolveWith(i[0])),a.each(j,function(e,j){var k=new Image,l="load."+b+" error."+b;a(k).one(l,function m(b){var e=[g,f,"load"==b.type];return g++,d.apply(j.element,e),h.notifyWith(j.element,e),a(this).off(l,m),g==f?(c.call(i[0]),h.resolveWith(i[0]),!1):void 0}),k.src=j.src})}),h.promise()}});
