(function ($) {
	$(document).ready(function(){
		blogArchiveFilter.setLocalizedParameters(ajaxData);
		blogArchiveFilter.filterBlogsMethod('.wdm-blog-authors', 'author','change');
		blogArchiveFilter.filterBlogsMethod('.wdm-blog-category', 'category','change');
		blogArchiveFilter.filterBlogsMethod('.blog-tag-multiselect', 'tag','change');
		blogArchiveFilter.filterBlogsMethod('.blog-tag-multiselect', 'tag','select2-removed');
		blogArchiveFilter.filterBlogsMethod('.wdm-search > .search-input', 'search','keyup');
		blogArchiveFilter.filterBlogsMethod('.wdm-search > .search-submit', 'search','click');
		window.page = 2;
		window.loadmore = 'on';
		jQuery('#spinner').css('visibility', 'hidden');
		jQuery(document).on('scroll', function() {
		if (checkVisible('footer.site-footer')) {
		  if (window.loadmore == 'on') {
		      window.loadmore = 'off';
		      jQuery('#spinner').css('visibility', 'visible');
		      	var author = jQuery('.wdm-blog-authors').val();
		          var category = jQuery('.wdm-blog-category').val();
		          var tags = jQuery('.blog-tag-multiselect').val();
		          var search = jQuery('.wdm-search > .search-input').val();
		          if (category==0 && author == -1 && tags == null && search.length == 0) {
		            var content;
		            jQuery.get(ajaxData.blog_link+'?pages=' + window.page, function(data){
		            	content= data;
		            	content = jQuery(content).find('.article.wdm_blog');
		                jQuery('#spinner').css('visibility', 'hidden');
		                if (content.length != 0) {
			            	++window.page;
			                window.loadmore = 'on';
			                jQuery('.row.wdm_blog_row').append(content);
			            } else {
			            	window.loadmore = 'off';
			            }
			        });
		            // jQuery('.wdm-query').append(
		            //   jQuery('<div class="row wdm_blog_row" id="p' + window.page + '">').load('/'+ajaxData.blog_link+'?pages=' + window.page + ' .row .wdm_blog', function() {
		            //     ++window.page;
		            //     window.loadmore = 'on';
		            //     jQuery('#spinner').css('visibility', 'hidden');
		            //   })
		            // );
		          } else {
		            blogArchiveFilter.setLocalizedParameters(ajaxData);
		            var success = blogArchiveFilter.filterPaginatedResults(author, category, tags, window.page, search);
		            if (success == true) {
		              window.page++;
		              window.loadmore = 'on';
		            }
		          }
		  }
		}
		});
		function checkVisible(elm) {
		if(window.innerHeight + jQuery(window).scrollTop() > jQuery(elm).position().top) {
		  return true;
		}
		}

		var getUrlParameter = function (sParam, query_params) {
		    var sPageURL = decodeURIComponent(query_params),
		        sURLVariables = sPageURL.split('&'),
		        sParameterName,
		        i;

		    for (i = 0; i < sURLVariables.length; i++) {
		        sParameterName = sURLVariables[i].split('=');

		        if (sParameterName[0] === sParam) {
		            return sParameterName[1] === undefined ? true : sParameterName[1];
		        }
		    }
		};
		var checkNormalPaginateRequest = function (url, query_param) {
		if (url.substr(-1) != '/') url += '/';
		var current_path = window.location.pathname;
		if (url != current_path || typeof query_param == 'undefined') {
		  return false;
		}
		return true;
		};

		var checkAjaxCallOwn = function (query_param) {
		if (typeof query_param != 'undefined' && query_param == 'wdm_filter_blogs') {
		  return false;
		}
		return true;
		}
/*		jQuery(document).ajaxComplete(function( event, xhr, options ) {
		var query_params = options.url.split('?');
		var page_param = getUrlParameter('pages', query_params[1]);
		var first_check = checkNormalPaginateRequest(query_params[0], page_param);
		var ajx_data = options.data;
		var ajax_action = getUrlParameter('action', ajx_data);
		var second_check = checkAjaxCallOwn(ajax_action);
		if (first_check || second_check) {
		  if (xhr.responseText.indexOf('class="row wdm_blog_row"') == -1) {
		    window.loadmore = 'off';
		  }
		}
		});*/
	});
})(jQuery)
