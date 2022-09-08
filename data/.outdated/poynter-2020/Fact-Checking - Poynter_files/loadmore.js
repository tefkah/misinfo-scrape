jQuery(function($){ // use jQuery code inside this to avoid "$ is not defined" error
	//blog posts static page
	$('.poynter_loadmore').click(function(){
 
		var button = $(this),
		    data = {
			'action': 'loadmore',
			'query': loadmore_params.posts, // that's how we get params from wp_localize_script() function
			'page' : loadmore_params.current_page
		};
 
		$.ajax({ // you can also use $.post here
			url : loadmore_params.ajaxurl, // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
				button.text('Loading...'); // change the button text, you can also add a preloader image
			},
			success : function( data ){
				if( data ) { 
					button.text( 'More Articles' ).prev().after(data); // insert new posts (Needs to be 'after' not 'before'!!!)
					loadmore_params.current_page++;
 
					//if ( loadmore_params.current_page == loadmore_params.max_page ) 
						//button.remove(); // if last page, remove the button
 
					// you can also fire the "post-load" event here if you use a plugin that requires it
					// $( document.body ).trigger( 'post-load' );
				} else {
					button.remove(); // if no data, remove the button as well
				}
			}
		});
	});

	
	$('.loadmore').click(function(){
		//custom query on front-page.php
		var button = $(this),
		    data = {
			'action': 'loadmore',
			'query': posts_myajax,
			'page' : current_page_myajax
		};
 
		$.ajax({
			url : '/wp-admin/admin-ajax.php', // AJAX handler
			data : data,
			type : 'POST',
			beforeSend : function ( xhr ) {
				button.text('Loading...'); // change the button text
				//console.log(this.url);
				//console.log(this.data);
			},
			success : function( data ){
				if( data ) { 
					button.text( 'More Articles' ).prev().after(data); // insert new posts
					current_page_myajax++;
 
					if ( current_page_myajax == max_page_myajax )
						button.remove(); // if last page, remove the button
				} else {
					button.remove(); // if no data, remove the button as well
				}
			}
		});
	});	
	
});