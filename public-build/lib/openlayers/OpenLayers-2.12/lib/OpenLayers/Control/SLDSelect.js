/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Control.SLDSelect=OpenLayers.Class(OpenLayers.Control,{clearOnDeactivate:!1,layers:null,callbacks:null,selectionSymbolizer:{Polygon:{fillColor:"#FF0000",stroke:!1},Line:{strokeColor:"#FF0000",strokeWidth:2},Point:{graphicName:"square",fillColor:"#FF0000",pointRadius:5}},layerOptions:null,handlerOptions:null,sketchStyle:null,wfsCache:{},layerCache:{},initialize:function(e,t){OpenLayers.Control.prototype.initialize.apply(this,[t]),this.callbacks=OpenLayers.Util.extend({done:this.select,click:this.select},this.callbacks),this.handlerOptions=this.handlerOptions||{},this.layerOptions=OpenLayers.Util.applyDefaults(this.layerOptions,{displayInLayerSwitcher:!1,tileOptions:{maxGetUrlLength:2048}}),this.sketchStyle&&(this.handlerOptions.layerOptions=OpenLayers.Util.applyDefaults(this.handlerOptions.layerOptions,{styleMap:new OpenLayers.StyleMap({"default":this.sketchStyle})})),this.handler=new e(this,this.callbacks,this.handlerOptions)},destroy:function(){for(var e in this.layerCache)delete this.layerCache[e];for(var e in this.wfsCache)delete this.wfsCache[e];OpenLayers.Control.prototype.destroy.apply(this,arguments)},coupleLayerVisiblity:function(e){this.setVisibility(e.object.getVisibility())},createSelectionLayer:function(e){var t;return this.layerCache[e.id]?t=this.layerCache[e.id]:(t=new OpenLayers.Layer.WMS(e.name,e.url,e.params,OpenLayers.Util.applyDefaults(this.layerOptions,e.getOptions())),this.layerCache[e.id]=t,this.layerOptions.displayInLayerSwitcher===!1&&e.events.on({visibilitychanged:this.coupleLayerVisiblity,scope:t}),this.map.addLayer(t)),t},createSLD:function(e,t,n){var r={version:"1.0.0",namedLayers:{}},i=[e.params.LAYERS].join(",").split(",");for(var s=0,o=i.length;s<o;s++){var u=i[s];r.namedLayers[u]={name:u,userStyles:[]};var a=this.selectionSymbolizer,f=n[s];f.type.indexOf("Polygon")>=0?a={Polygon:this.selectionSymbolizer.Polygon}:f.type.indexOf("LineString")>=0?a={Line:this.selectionSymbolizer.Line}:f.type.indexOf("Point")>=0&&(a={Point:this.selectionSymbolizer.Point});var l=t[s];r.namedLayers[u].userStyles.push({name:"default",rules:[new OpenLayers.Rule({symbolizer:a,filter:l,maxScaleDenominator:e.options.minScale})]})}return(new OpenLayers.Format.SLD({srsName:this.map.getProjection()})).write(r)},parseDescribeLayer:function(e){var t=new OpenLayers.Format.WMSDescribeLayer,n=e.responseXML;if(!n||!n.documentElement)n=e.responseText;var r=t.read(n),i=[],s=null;for(var o=0,u=r.length;o<u;o++)r[o].owsType=="WFS"&&(i.push(r[o].typeName),s=r[o].owsURL);var a={url:s,params:{SERVICE:"WFS",TYPENAME:i.toString(),REQUEST:"DescribeFeatureType",VERSION:"1.0.0"},callback:function(e){var t=new OpenLayers.Format.WFSDescribeFeatureType,n=e.responseXML;if(!n||!n.documentElement)n=e.responseText;var r=t.read(n);this.control.wfsCache[this.layer.id]=r,this.control._queue&&this.control.applySelection()},scope:this};OpenLayers.Request.GET(a)},getGeometryAttributes:function(e){var t=[],n=this.wfsCache[e.id];for(var r=0,i=n.featureTypes.length;r<i;r++){var s=n.featureTypes[r],o=s.properties;for(var u=0,a=o.length;u<a;u++){var f=o[u],l=f.type;(l.indexOf("LineString")>=0||l.indexOf("GeometryAssociationType")>=0||l.indexOf("GeometryPropertyType")>=0||l.indexOf("Point")>=0||l.indexOf("Polygon")>=0)&&t.push(f)}}return t},activate:function(){var e=OpenLayers.Control.prototype.activate.call(this);if(e)for(var t=0,n=this.layers.length;t<n;t++){var r=this.layers[t];if(r&&!this.wfsCache[r.id]){var i={url:r.url,params:{SERVICE:"WMS",VERSION:r.params.VERSION,LAYERS:r.params.LAYERS,REQUEST:"DescribeLayer"},callback:this.parseDescribeLayer,scope:{layer:r,control:this}};OpenLayers.Request.GET(i)}}return e},deactivate:function(){var e=OpenLayers.Control.prototype.deactivate.call(this);if(e)for(var t=0,n=this.layers.length;t<n;t++){var r=this.layers[t];if(r&&this.clearOnDeactivate===!0){var i=this.layerCache,s=i[r.id];s&&(r.events.un({visibilitychanged:this.coupleLayerVisiblity,scope:s}),s.destroy(),delete i[r.id])}}return e},setLayers:function(e){this.active?(this.deactivate(),this.layers=e,this.activate()):this.layers=e},createFilter:function(e,t){var n=null;return this.handler instanceof OpenLayers.Handler.RegularPolygon?this.handler.irregular===!0?n=new OpenLayers.Filter.Spatial({type:OpenLayers.Filter.Spatial.BBOX,property:e.name,value:t.getBounds()}):n=new OpenLayers.Filter.Spatial({type:OpenLayers.Filter.Spatial.INTERSECTS,property:e.name,value:t}):this.handler instanceof OpenLayers.Handler.Polygon?n=new OpenLayers.Filter.Spatial({type:OpenLayers.Filter.Spatial.INTERSECTS,property:e.name,value:t}):this.handler instanceof OpenLayers.Handler.Path?e.type.indexOf("Point")>=0?n=new OpenLayers.Filter.Spatial({type:OpenLayers.Filter.Spatial.DWITHIN,property:e.name,distance:this.map.getExtent().getWidth()*.01,distanceUnits:this.map.getUnits(),value:t}):n=new OpenLayers.Filter.Spatial({type:OpenLayers.Filter.Spatial.INTERSECTS,property:e.name,value:t}):this.handler instanceof OpenLayers.Handler.Click&&(e.type.indexOf("Polygon")>=0?n=new OpenLayers.Filter.Spatial({type:OpenLayers.Filter.Spatial.INTERSECTS,property:e.name,value:t}):n=new OpenLayers.Filter.Spatial({type:OpenLayers.Filter.Spatial.DWITHIN,property:e.name,distance:this.map.getExtent().getWidth()*.01,distanceUnits:this.map.getUnits(),value:t})),n},select:function(e){this._queue=function(){for(var t=0,n=this.layers.length;t<n;t++){var r=this.layers[t],i=this.getGeometryAttributes(r),s=[];for(var o=0,u=i.length;o<u;o++){var a=i[o];if(a!==null){if(!(e instanceof OpenLayers.Geometry)){var f=this.map.getLonLatFromPixel(e.xy);e=new OpenLayers.Geometry.Point(f.lon,f.lat)}var l=this.createFilter(a,e);l!==null&&s.push(l)}}var c=this.createSelectionLayer(r),h=this.createSLD(r,s,i);this.events.triggerEvent("selected",{layer:r,filters:s}),c.mergeNewParams({SLD_BODY:h}),delete this._queue}},this.applySelection()},applySelection:function(){var e=!0;for(var t=0,n=this.layers.length;t<n;t++)if(!this.wfsCache[this.layers[t].id]){e=!1;break}e&&this._queue.call(this)},CLASS_NAME:"OpenLayers.Control.SLDSelect"});