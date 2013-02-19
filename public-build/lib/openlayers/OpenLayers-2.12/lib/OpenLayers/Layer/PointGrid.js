/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Layer.PointGrid=OpenLayers.Class(OpenLayers.Layer.Vector,{dx:null,dy:null,ratio:1.5,maxFeatures:250,rotation:0,origin:null,gridBounds:null,initialize:function(e){e=e||{},OpenLayers.Layer.Vector.prototype.initialize.apply(this,[e.name,e])},setMap:function(e){OpenLayers.Layer.Vector.prototype.setMap.apply(this,arguments),e.events.register("moveend",this,this.onMoveEnd)},removeMap:function(e){e.events.unregister("moveend",this,this.onMoveEnd),OpenLayers.Layer.Vector.prototype.removeMap.apply(this,arguments)},setRatio:function(e){this.ratio=e,this.updateGrid(!0)},setMaxFeatures:function(e){this.maxFeatures=e,this.updateGrid(!0)},setSpacing:function(e,t){this.dx=e,this.dy=t||e,this.updateGrid(!0)},setOrigin:function(e){this.origin=e,this.updateGrid(!0)},getOrigin:function(){return this.origin||(this.origin=this.map.getExtent().getCenterLonLat()),this.origin},setRotation:function(e){this.rotation=e,this.updateGrid(!0)},onMoveEnd:function(){this.updateGrid()},getViewBounds:function(){var e=this.map.getExtent();if(this.rotation){var t=this.getOrigin(),n=new OpenLayers.Geometry.Point(t.lon,t.lat),r=e.toGeometry();r.rotate(-this.rotation,n),e=r.getBounds()}return e},updateGrid:function(e){if(e||this.invalidBounds()){var t=this.getViewBounds(),n=this.getOrigin(),r=new OpenLayers.Geometry.Point(n.lon,n.lat),i=t.getWidth(),s=t.getHeight(),o=i/s,u=Math.sqrt(this.dx*this.dy*this.maxFeatures/o),a=u*o,f=Math.min(i*this.ratio,a),l=Math.min(s*this.ratio,u),c=t.getCenterLonLat();this.gridBounds=new OpenLayers.Bounds(c.lon-f/2,c.lat-l/2,c.lon+f/2,c.lat+l/2);var h=Math.floor(l/this.dy),p=Math.floor(f/this.dx),d=n.lon+this.dx*Math.ceil((this.gridBounds.left-n.lon)/this.dx),v=n.lat+this.dy*Math.ceil((this.gridBounds.bottom-n.lat)/this.dy),m=new Array(h*p),g,y,b;for(var w=0;w<p;++w){g=d+w*this.dx;for(var E=0;E<h;++E)y=v+E*this.dy,b=new OpenLayers.Geometry.Point(g,y),this.rotation&&b.rotate(this.rotation,r),m[w*h+E]=new OpenLayers.Feature.Vector(b)}this.destroyFeatures(this.features,{silent:!0}),this.addFeatures(m,{silent:!0})}},invalidBounds:function(){return!this.gridBounds||!this.gridBounds.containsBounds(this.getViewBounds())},CLASS_NAME:"OpenLayers.Layer.PointGrid"});