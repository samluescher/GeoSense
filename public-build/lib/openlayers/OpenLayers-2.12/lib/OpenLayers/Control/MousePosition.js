/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Control.MousePosition=OpenLayers.Class(OpenLayers.Control,{autoActivate:!0,element:null,prefix:"",separator:", ",suffix:"",numDigits:5,granularity:10,emptyString:null,lastXy:null,displayProjection:null,destroy:function(){this.deactivate(),OpenLayers.Control.prototype.destroy.apply(this,arguments)},activate:function(){return OpenLayers.Control.prototype.activate.apply(this,arguments)?(this.map.events.register("mousemove",this,this.redraw),this.map.events.register("mouseout",this,this.reset),this.redraw(),!0):!1},deactivate:function(){return OpenLayers.Control.prototype.deactivate.apply(this,arguments)?(this.map.events.unregister("mousemove",this,this.redraw),this.map.events.unregister("mouseout",this,this.reset),this.element.innerHTML="",!0):!1},draw:function(){return OpenLayers.Control.prototype.draw.apply(this,arguments),this.element||(this.div.left="",this.div.top="",this.element=this.div),this.div},redraw:function(e){var t;if(e==null){this.reset();return}if(this.lastXy==null||Math.abs(e.xy.x-this.lastXy.x)>this.granularity||Math.abs(e.xy.y-this.lastXy.y)>this.granularity){this.lastXy=e.xy;return}t=this.map.getLonLatFromPixel(e.xy);if(!t)return;this.displayProjection&&t.transform(this.map.getProjectionObject(),this.displayProjection),this.lastXy=e.xy;var n=this.formatOutput(t);n!=this.element.innerHTML&&(this.element.innerHTML=n)},reset:function(e){this.emptyString!=null&&(this.element.innerHTML=this.emptyString)},formatOutput:function(e){var t=parseInt(this.numDigits),n=this.prefix+e.lon.toFixed(t)+this.separator+e.lat.toFixed(t)+this.suffix;return n},CLASS_NAME:"OpenLayers.Control.MousePosition"});