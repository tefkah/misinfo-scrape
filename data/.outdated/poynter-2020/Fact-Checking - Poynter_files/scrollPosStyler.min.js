/**
 * Minified by jsDelivr using UglifyJS v3.0.24.
 * Original file: /npm/scrollpos-styler@0.7.0/scrollPosStyler.js
 * 
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
var ScrollPosStyler=function(s,e){"use strict";function t(){n=e.pageYOffset;for(var s=[],t=0;i[t];++t){var a=i[t],l=a.getAttribute(m)||o,r=a.classList.contains(c);r&&n>l?s.push({element:a,addClass:f,removeClass:c}):!r&&n<=l&&s.push({element:a,addClass:c,removeClass:f})}return s}function a(s){for(var e=0;s[e];++e){var t=s[e];t.element.classList.add(t.addClass),t.element.classList.remove(t.removeClass)}l=!1}var n=0,l=!1,o=1,r="sps",i=s.getElementsByClassName(r),c="sps--abv",f="sps--blw",m="data-sps-offset",u={init:function(n){l=!0,n&&(n.spsClass&&(r=n.spsClass,i=s.getElementsByClassName(r)),o=n.scrollOffsetY||o,c=n.classAbove||c,f=n.classBelow||f,m=n.offsetTag||m);var u=t();u.length>0?e.requestAnimationFrame(function(){a(u)}):l=!1}};return s.addEventListener("DOMContentLoaded",function(){e.setTimeout(u.init,1)}),e.addEventListener("scroll",function(){if(!l){var s=t();s.length>0&&(l=!0,e.requestAnimationFrame(function(){a(s)}))}}),u}(document,window);
//# sourceMappingURL=/sm/226ca3accbf7d8441e5a9455ba9b764ad8854363d9939b70e7289fe35f41f97e.map