/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Control.SelectFeature=OpenLayers.Class(OpenLayers.Control,{multipleKey:null,toggleKey:null,multiple:!1,clickout:!0,toggle:!1,hover:!1,highlightOnly:!1,box:!1,onBeforeSelect:function(){},onSelect:function(){},onUnselect:function(){},scope:null,geometryTypes:null,layer:null,layers:null,callbacks:null,selectStyle:null,renderIntent:"select",handlers:null,initialize:function(e,t){OpenLayers.Control.prototype.initialize.apply(this,[t]),this.scope===null&&(this.scope=this),this.initLayer(e);var n={click:this.clickFeature,clickout:this.clickoutFeature};this.hover&&(n.over=this.overFeature,n.out=this.outFeature),this.callbacks=OpenLayers.Util.extend(n,this.callbacks),this.handlers={feature:new OpenLayers.Handler.Feature(this,this.layer,this.callbacks,{geometryTypes:this.geometryTypes})},this.box&&(this.handlers.box=new OpenLayers.Handler.Box(this,{done:this.selectBox},{boxDivClassName:"olHandlerBoxSelectFeature"}))},initLayer:function(e){OpenLayers.Util.isArray(e)?(this.layers=e,this.layer=new OpenLayers.Layer.Vector.RootContainer(this.id+"_container",{layers:e})):this.layer=e},destroy:function(){this.active&&this.layers&&this.map.removeLayer(this.layer),OpenLayers.Control.prototype.destroy.apply(this,arguments),this.layers&&this.layer.destroy()},activate:function(){return this.active||(this.layers&&this.map.addLayer(this.layer),this.handlers.feature.activate(),this.box&&this.handlers.box&&this.handlers.box.activate()),OpenLayers.Control.prototype.activate.apply(this,arguments)},deactivate:function(){return this.active&&(this.handlers.feature.deactivate(),this.handlers.box&&this.handlers.box.deactivate(),this.layers&&this.map.removeLayer(this.layer)),OpenLayers.Control.prototype.deactivate.apply(this,arguments)},unselectAll:function(e){var t=this.layers||[this.layer],n,r;for(var i=0;i<t.length;++i){n=t[i];for(var s=n.selectedFeatures.length-1;s>=0;--s)r=n.selectedFeatures[s],(!e||e.except!=r)&&this.unselect(r)}},clickFeature:function(e){if(!this.hover){var t=OpenLayers.Util.indexOf(e.layer.selectedFeatures,e)>-1;t?this.toggleSelect()?this.unselect(e):this.multipleSelect()||this.unselectAll({except:e}):(this.multipleSelect()||this.unselectAll({except:e}),this.select(e))}},multipleSelect:function(){return this.multiple||this.handlers.feature.evt&&this.handlers.feature.evt[this.multipleKey]},toggleSelect:function(){return this.toggle||this.handlers.feature.evt&&this.handlers.feature.evt[this.toggleKey]},clickoutFeature:function(e){!this.hover&&this.clickout&&this.unselectAll()},overFeature:function(e){var t=e.layer;this.hover&&(this.highlightOnly?this.highlight(e):OpenLayers.Util.indexOf(t.selectedFeatures,e)==-1&&this.select(e))},outFeature:function(e){if(this.hover)if(this.highlightOnly){if(e._lastHighlighter==this.id)if(e._prevHighlighter&&e._prevHighlighter!=this.id){delete e._lastHighlighter;var t=this.map.getControl(e._prevHighlighter);t&&t.highlight(e)}else this.unhighlight(e)}else this.unselect(e)},highlight:function(e){var t=e.layer,n=this.events.triggerEvent("beforefeaturehighlighted",{feature:e});if(n!==!1){e._prevHighlighter=e._lastHighlighter,e._lastHighlighter=this.id;var r=this.selectStyle||this.renderIntent;t.drawFeature(e,r),this.events.triggerEvent("featurehighlighted",{feature:e})}},unhighlight:function(e){var t=e.layer;e._prevHighlighter==undefined?delete e._lastHighlighter:e._prevHighlighter==this.id?delete e._prevHighlighter:(e._lastHighlighter=e._prevHighlighter,delete e._prevHighlighter),t.drawFeature(e,e.style||e.layer.style||"default"),this.events.triggerEvent("featureunhighlighted",{feature:e})},select:function(e){var t=this.onBeforeSelect.call(this.scope,e),n=e.layer;t!==!1&&(t=n.events.triggerEvent("beforefeatureselected",{feature:e}),t!==!1&&(n.selectedFeatures.push(e),this.highlight(e),this.handlers.feature.lastFeature||(this.handlers.feature.lastFeature=n.selectedFeatures[0]),n.events.triggerEvent("featureselected",{feature:e}),this.onSelect.call(this.scope,e)))},unselect:function(e){var t=e.layer;this.unhighlight(e),OpenLayers.Util.removeItem(t.selectedFeatures,e),t.events.triggerEvent("featureunselected",{feature:e}),this.onUnselect.call(this.scope,e)},selectBox:function(e){if(e instanceof OpenLayers.Bounds){var t=this.map.getLonLatFromPixel({x:e.left,y:e.bottom}),n=this.map.getLonLatFromPixel({x:e.right,y:e.top}),r=new OpenLayers.Bounds(t.lon,t.lat,n.lon,n.lat);this.multipleSelect()||this.unselectAll();var i=this.multiple;this.multiple=!0;var s=this.layers||[this.layer];this.events.triggerEvent("boxselectionstart",{layers:s});var o;for(var u=0;u<s.length;++u){o=s[u];for(var a=0,f=o.features.length;a<f;++a){var l=o.features[a];if(!l.getVisibility())continue;(this.geometryTypes==null||OpenLayers.Util.indexOf(this.geometryTypes,l.geometry.CLASS_NAME)>-1)&&r.toGeometry().intersects(l.geometry)&&OpenLayers.Util.indexOf(o.selectedFeatures,l)==-1&&this.select(l)}}this.multiple=i,this.events.triggerEvent("boxselectionend",{layers:s})}},setMap:function(e){this.handlers.feature.setMap(e),this.box&&this.handlers.box.setMap(e),OpenLayers.Control.prototype.setMap.apply(this,arguments)},setLayer:function(e){var t=this.active;this.unselectAll(),this.deactivate(),this.layers&&(this.layer.destroy(),this.layers=null),this.initLayer(e),this.handlers.feature.layer=this.layer,t&&this.activate()},CLASS_NAME:"OpenLayers.Control.SelectFeature"});