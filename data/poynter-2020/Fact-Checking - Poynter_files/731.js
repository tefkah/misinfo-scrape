!function(){var e;"object"==typeof advanced_ads_pro_visitor_conditions&&(i.prototype.exists=function(){return void 0!==this.data},i.prototype.save=function(e){this.data=e,get_unix_time_in_seconds=function(){return Math.round((new Date).getTime()/1e3)};var i=this.expires-get_unix_time_in_seconds();i<=0&&(i=24*this.exdays*60*60,this.expires=get_unix_time_in_seconds()+i),advads.set_cookie_sec(this.name,JSON.stringify({expires:this.expires,data:this.data}),i)},advanced_ads_pro_visitor_conditions.cookie_storage=i,(e=new i(advanced_ads_pro_visitor_conditions.referrer_cookie_name,advanced_ads_pro_visitor_conditions.referrer_exdays)).exists()||""===document.referrer||e.save(document.referrer),(e=new i(advanced_ads_pro_visitor_conditions.page_impr_cookie_name,advanced_ads_pro_visitor_conditions.page_impr_exdays)).exists()?e.save(parseInt(e.data,10)+1||1):e.save(1));function i(e,i){this.name=e,this.exdays=i,this.data=void 0,this.expires=0;var t=advads.get_cookie(e);if(t){try{var s=JSON.parse(t)}catch(e){return void(this.data=t)}"object"==typeof s?(this.data=s.data,this.expires=parseInt(s.expires,10)):this.data=t}else this.data=t}}();