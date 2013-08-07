/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Popup.AnchoredBubble=OpenLayers.Class(OpenLayers.Popup.Anchored,{rounded:!1,initialize:function(e,t,n,r,i,s,o){OpenLayers.Console.warn("AnchoredBubble is deprecated"),this.padding=new OpenLayers.Bounds(0,OpenLayers.Popup.AnchoredBubble.CORNER_SIZE,0,OpenLayers.Popup.AnchoredBubble.CORNER_SIZE),OpenLayers.Popup.Anchored.prototype.initialize.apply(this,arguments)},draw:function(e){return OpenLayers.Popup.Anchored.prototype.draw.apply(this,arguments),this.setContentHTML(),this.setBackgroundColor(),this.setOpacity(),this.div},updateRelativePosition:function(){this.setRicoCorners()},setSize:function(e){OpenLayers.Popup.Anchored.prototype.setSize.apply(this,arguments),this.setRicoCorners()},setBackgroundColor:function(e){e!=undefined&&(this.backgroundColor=e),this.div!=null&&this.contentDiv!=null&&(this.div.style.background="transparent",OpenLayers.Rico.Corner.changeColor(this.groupDiv,this.backgroundColor))},setOpacity:function(e){OpenLayers.Popup.Anchored.prototype.setOpacity.call(this,e),this.div!=null&&this.groupDiv!=null&&OpenLayers.Rico.Corner.changeOpacity(this.groupDiv,this.opacity)},setBorder:function(e){this.border=0},setRicoCorners:function(){var e=this.getCornersToRound(this.relativePosition),t={corners:e,color:this.backgroundColor,bgColor:"transparent",blend:!1};this.rounded?(OpenLayers.Rico.Corner.reRound(this.groupDiv,t),this.setBackgroundColor(),this.setOpacity()):(OpenLayers.Rico.Corner.round(this.div,t),this.rounded=!0)},getCornersToRound:function(){var e=["tl","tr","bl","br"],t=OpenLayers.Bounds.oppositeQuadrant(this.relativePosition);return OpenLayers.Util.removeItem(e,t),e.join(" ")},CLASS_NAME:"OpenLayers.Popup.AnchoredBubble"}),OpenLayers.Popup.AnchoredBubble.CORNER_SIZE=5;