/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Protocol.WFS.v1=OpenLayers.Class(OpenLayers.Protocol,{version:null,srsName:"EPSG:4326",featureType:null,featureNS:null,geometryName:"the_geom",schema:null,featurePrefix:"feature",formatOptions:null,readFormat:null,readOptions:null,initialize:function(e){OpenLayers.Protocol.prototype.initialize.apply(this,[e]),e.format||(this.format=OpenLayers.Format.WFST(OpenLayers.Util.extend({version:this.version,featureType:this.featureType,featureNS:this.featureNS,featurePrefix:this.featurePrefix,geometryName:this.geometryName,srsName:this.srsName,schema:this.schema},this.formatOptions))),!e.geometryName&&parseFloat(this.format.version)>1&&this.setGeometryName(null)},destroy:function(){this.options&&!this.options.format&&this.format.destroy(),this.format=null,OpenLayers.Protocol.prototype.destroy.apply(this)},read:function(e){OpenLayers.Protocol.prototype.read.apply(this,arguments),e=OpenLayers.Util.extend({},e),OpenLayers.Util.applyDefaults(e,this.options||{});var t=new OpenLayers.Protocol.Response({requestType:"read"}),n=OpenLayers.Format.XML.prototype.write.apply(this.format,[this.format.writeNode("wfs:GetFeature",e)]);return t.priv=OpenLayers.Request.POST({url:e.url,callback:this.createCallback(this.handleRead,t,e),params:e.params,headers:e.headers,data:n}),t},setFeatureType:function(e){this.featureType=e,this.format.featureType=e},setGeometryName:function(e){this.geometryName=e,this.format.geometryName=e},handleRead:function(e,t){t=OpenLayers.Util.extend({},t),OpenLayers.Util.applyDefaults(t,this.options);if(t.callback){var n=e.priv;if(n.status>=200&&n.status<300){var r=this.parseResponse(n,t.readOptions);r&&r.success!==!1?(t.readOptions&&t.readOptions.output=="object"?OpenLayers.Util.extend(e,r):e.features=r,e.code=OpenLayers.Protocol.Response.SUCCESS):(e.code=OpenLayers.Protocol.Response.FAILURE,e.error=r)}else e.code=OpenLayers.Protocol.Response.FAILURE;t.callback.call(t.scope,e)}},parseResponse:function(e,t){var n=e.responseXML;if(!n||!n.documentElement)n=e.responseText;if(!n||n.length<=0)return null;var r=this.readFormat!==null?this.readFormat.read(n):this.format.read(n,t);if(!this.featureNS){var i=this.readFormat||this.format;this.featureNS=i.featureNS,i.autoConfig=!1,this.geometryName||this.setGeometryName(i.geometryName)}return r},commit:function(e,t){t=OpenLayers.Util.extend({},t),OpenLayers.Util.applyDefaults(t,this.options);var n=new OpenLayers.Protocol.Response({requestType:"commit",reqFeatures:e});return n.priv=OpenLayers.Request.POST({url:t.url,headers:t.headers,data:this.format.write(e,t),callback:this.createCallback(this.handleCommit,n,t)}),n},handleCommit:function(e,t){if(t.callback){var n=e.priv,r=n.responseXML;if(!r||!r.documentElement)r=n.responseText;var i=this.format.read(r)||{};e.insertIds=i.insertIds||[],i.success?e.code=OpenLayers.Protocol.Response.SUCCESS:(e.code=OpenLayers.Protocol.Response.FAILURE,e.error=i),t.callback.call(t.scope,e)}},filterDelete:function(e,t){t=OpenLayers.Util.extend({},t),OpenLayers.Util.applyDefaults(t,this.options);var n=new OpenLayers.Protocol.Response({requestType:"commit"}),r=this.format.createElementNSPlus("wfs:Transaction",{attributes:{service:"WFS",version:this.version}}),i=this.format.createElementNSPlus("wfs:Delete",{attributes:{typeName:(t.featureNS?this.featurePrefix+":":"")+t.featureType}});t.featureNS&&i.setAttribute("xmlns:"+this.featurePrefix,t.featureNS);var s=this.format.writeNode("ogc:Filter",e);i.appendChild(s),r.appendChild(i);var o=OpenLayers.Format.XML.prototype.write.apply(this.format,[r]);return OpenLayers.Request.POST({url:this.url,callback:t.callback||function(){},data:o})},abort:function(e){e&&e.priv.abort()},CLASS_NAME:"OpenLayers.Protocol.WFS.v1"});