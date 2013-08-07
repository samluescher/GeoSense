/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.ProxyHost="",OpenLayers.Request={DEFAULT_CONFIG:{method:"GET",url:window.location.href,async:!0,user:undefined,password:undefined,params:null,proxy:OpenLayers.ProxyHost,headers:{},data:null,callback:function(){},success:null,failure:null,scope:null},URL_SPLIT_REGEX:/([^:]*:)\/\/([^:]*:?[^@]*@)?([^:\/\?]*):?([^\/\?]*)/,events:new OpenLayers.Events(this),makeSameOrigin:function(e,t){var n=e.indexOf("http")!==0,r=!n&&e.match(this.URL_SPLIT_REGEX);if(r){var i=window.location;n=r[1]==i.protocol&&r[3]==i.hostname;var s=r[4],o=i.port;if(s!=80&&s!=""||o!="80"&&o!="")n=n&&s==o}return n||(t?typeof t=="function"?e=t(e):e=t+encodeURIComponent(e):OpenLayers.Console.warn(OpenLayers.i18n("proxyNeeded"),{url:e})),e},issue:function(e){var t=OpenLayers.Util.extend(this.DEFAULT_CONFIG,{proxy:OpenLayers.ProxyHost});e=OpenLayers.Util.applyDefaults(e,t);var n=!1,r;for(r in e.headers)e.headers.hasOwnProperty(r)&&r.toLowerCase()==="x-requested-with"&&(n=!0);n===!1&&(e.headers["X-Requested-With"]="XMLHttpRequest");var i=new OpenLayers.Request.XMLHttpRequest,s=OpenLayers.Util.urlAppend(e.url,OpenLayers.Util.getParameterString(e.params||{}));s=OpenLayers.Request.makeSameOrigin(s,e.proxy),i.open(e.method,s,e.async,e.user,e.password);for(var o in e.headers)i.setRequestHeader(o,e.headers[o]);var u=this.events,a=this;return i.onreadystatechange=function(){if(i.readyState==OpenLayers.Request.XMLHttpRequest.DONE){var t=u.triggerEvent("complete",{request:i,config:e,requestUrl:s});t!==!1&&a.runCallbacks({request:i,config:e,requestUrl:s})}},e.async===!1?i.send(e.data):window.setTimeout(function(){i.readyState!==0&&i.send(e.data)},0),i},runCallbacks:function(e){var t=e.request,n=e.config,r=n.scope?OpenLayers.Function.bind(n.callback,n.scope):n.callback,i;n.success&&(i=n.scope?OpenLayers.Function.bind(n.success,n.scope):n.success);var s;n.failure&&(s=n.scope?OpenLayers.Function.bind(n.failure,n.scope):n.failure),OpenLayers.Util.createUrlObject(n.url).protocol=="file:"&&t.responseText&&(t.status=200),r(t);if(!t.status||t.status>=200&&t.status<300)this.events.triggerEvent("success",e),i&&i(t);t.status&&(t.status<200||t.status>=300)&&(this.events.triggerEvent("failure",e),s&&s(t))},GET:function(e){return e=OpenLayers.Util.extend(e,{method:"GET"}),OpenLayers.Request.issue(e)},POST:function(e){return e=OpenLayers.Util.extend(e,{method:"POST"}),e.headers=e.headers?e.headers:{},"CONTENT-TYPE"in OpenLayers.Util.upperCaseObject(e.headers)||(e.headers["Content-Type"]="application/xml"),OpenLayers.Request.issue(e)},PUT:function(e){return e=OpenLayers.Util.extend(e,{method:"PUT"}),e.headers=e.headers?e.headers:{},"CONTENT-TYPE"in OpenLayers.Util.upperCaseObject(e.headers)||(e.headers["Content-Type"]="application/xml"),OpenLayers.Request.issue(e)},DELETE:function(e){return e=OpenLayers.Util.extend(e,{method:"DELETE"}),OpenLayers.Request.issue(e)},HEAD:function(e){return e=OpenLayers.Util.extend(e,{method:"HEAD"}),OpenLayers.Request.issue(e)},OPTIONS:function(e){return e=OpenLayers.Util.extend(e,{method:"OPTIONS"}),OpenLayers.Request.issue(e)}};