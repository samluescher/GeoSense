/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Handler.Feature=OpenLayers.Class(OpenLayers.Handler,{EVENTMAP:{click:{"in":"click",out:"clickout"},mousemove:{"in":"over",out:"out"},dblclick:{"in":"dblclick",out:null},mousedown:{"in":null,out:null},mouseup:{"in":null,out:null},touchstart:{"in":"click",out:"clickout"}},feature:null,lastFeature:null,down:null,up:null,touch:!1,clickTolerance:4,geometryTypes:null,stopClick:!0,stopDown:!0,stopUp:!1,initialize:function(e,t,n,r){OpenLayers.Handler.prototype.initialize.apply(this,[e,n,r]),this.layer=t},touchstart:function(e){return this.touch||(this.touch=!0,this.map.events.un({mousedown:this.mousedown,mouseup:this.mouseup,mousemove:this.mousemove,click:this.click,dblclick:this.dblclick,scope:this})),OpenLayers.Event.isMultiTouch(e)?!0:this.mousedown(e)},touchmove:function(e){OpenLayers.Event.stop(e)},mousedown:function(e){if(OpenLayers.Event.isLeftClick(e)||OpenLayers.Event.isSingleTouch(e))this.down=e.xy;return this.handle(e)?!this.stopDown:!0},mouseup:function(e){return this.up=e.xy,this.handle(e)?!this.stopUp:!0},click:function(e){return this.handle(e)?!this.stopClick:!0},mousemove:function(e){return!this.callbacks.over&&!this.callbacks.out?!0:(this.handle(e),!0)},dblclick:function(e){return!this.handle(e)},geometryTypeMatches:function(e){return this.geometryTypes==null||OpenLayers.Util.indexOf(this.geometryTypes,e.geometry.CLASS_NAME)>-1},handle:function(e){this.feature&&!this.feature.layer&&(this.feature=null);var t=e.type,n=!1,r=!!this.feature,i=t=="click"||t=="dblclick"||t=="touchstart";this.feature=this.layer.getFeatureFromEvent(e),this.feature&&!this.feature.layer&&(this.feature=null),this.lastFeature&&!this.lastFeature.layer&&(this.lastFeature=null);if(this.feature){t==="touchstart"&&OpenLayers.Event.stop(e);var s=this.feature!=this.lastFeature;this.geometryTypeMatches(this.feature)?(r&&s?(this.lastFeature&&this.triggerCallback(t,"out",[this.lastFeature]),this.triggerCallback(t,"in",[this.feature])):(!r||i)&&this.triggerCallback(t,"in",[this.feature]),this.lastFeature=this.feature,n=!0):(this.lastFeature&&(r&&s||i)&&this.triggerCallback(t,"out",[this.lastFeature]),this.feature=null)}else this.lastFeature&&(r||i)&&this.triggerCallback(t,"out",[this.lastFeature]);return n},triggerCallback:function(e,t,n){var r=this.EVENTMAP[e][t];if(r)if(e=="click"&&this.up&&this.down){var i=Math.sqrt(Math.pow(this.up.x-this.down.x,2)+Math.pow(this.up.y-this.down.y,2));i<=this.clickTolerance&&this.callback(r,n)}else this.callback(r,n)},activate:function(){var e=!1;return OpenLayers.Handler.prototype.activate.apply(this,arguments)&&(this.moveLayerToTop(),this.map.events.on({removelayer:this.handleMapEvents,changelayer:this.handleMapEvents,scope:this}),e=!0),e},deactivate:function(){var e=!1;return OpenLayers.Handler.prototype.deactivate.apply(this,arguments)&&(this.moveLayerBack(),this.feature=null,this.lastFeature=null,this.down=null,this.up=null,this.touch=!1,this.map.events.un({removelayer:this.handleMapEvents,changelayer:this.handleMapEvents,scope:this}),e=!0),e},handleMapEvents:function(e){(e.type=="removelayer"||e.property=="order")&&this.moveLayerToTop()},moveLayerToTop:function(){var e=Math.max(this.map.Z_INDEX_BASE.Feature-1,this.layer.getZIndex())+1;this.layer.setZIndex(e)},moveLayerBack:function(){var e=this.layer.getZIndex()-1;e>=this.map.Z_INDEX_BASE.Feature?this.layer.setZIndex(e):this.map.setLayerZIndex(this.layer,this.map.getLayerIndex(this.layer))},CLASS_NAME:"OpenLayers.Handler.Feature"});