/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Control.Snapping=OpenLayers.Class(OpenLayers.Control,{DEFAULTS:{tolerance:10,node:!0,edge:!0,vertex:!0},greedy:!0,precedence:["node","vertex","edge"],resolution:null,geoToleranceCache:null,layer:null,feature:null,point:null,initialize:function(e){OpenLayers.Control.prototype.initialize.apply(this,[e]),this.options=e||{},this.options.layer&&this.setLayer(this.options.layer);var t=OpenLayers.Util.extend({},this.options.defaults);this.defaults=OpenLayers.Util.applyDefaults(t,this.DEFAULTS),this.setTargets(this.options.targets),this.targets.length===0&&this.layer&&this.addTargetLayer(this.layer),this.geoToleranceCache={}},setLayer:function(e){this.active?(this.deactivate(),this.layer=e,this.activate()):this.layer=e},setTargets:function(e){this.targets=[];if(e&&e.length){var t;for(var n=0,r=e.length;n<r;++n)t=e[n],t instanceof OpenLayers.Layer.Vector?this.addTargetLayer(t):this.addTarget(t)}},addTargetLayer:function(e){this.addTarget({layer:e})},addTarget:function(e){e=OpenLayers.Util.applyDefaults(e,this.defaults),e.nodeTolerance=e.nodeTolerance||e.tolerance,e.vertexTolerance=e.vertexTolerance||e.tolerance,e.edgeTolerance=e.edgeTolerance||e.tolerance,this.targets.push(e)},removeTargetLayer:function(e){var t;for(var n=this.targets.length-1;n>=0;--n)t=this.targets[n],t.layer===e&&this.removeTarget(t)},removeTarget:function(e){return OpenLayers.Util.removeItem(this.targets,e)},activate:function(){var e=OpenLayers.Control.prototype.activate.call(this);return e&&this.layer&&this.layer.events&&this.layer.events.on({sketchstarted:this.onSketchModified,sketchmodified:this.onSketchModified,vertexmodified:this.onVertexModified,scope:this}),e},deactivate:function(){var e=OpenLayers.Control.prototype.deactivate.call(this);return e&&this.layer&&this.layer.events&&this.layer.events.un({sketchstarted:this.onSketchModified,sketchmodified:this.onSketchModified,vertexmodified:this.onVertexModified,scope:this}),this.feature=null,this.point=null,e},onSketchModified:function(e){this.feature=e.feature,this.considerSnapping(e.vertex,e.vertex)},onVertexModified:function(e){this.feature=e.feature;var t=this.layer.map.getLonLatFromViewPortPx(e.pixel);this.considerSnapping(e.vertex,new OpenLayers.Geometry.Point(t.lon,t.lat))},considerSnapping:function(e,t){var n={rank:Number.POSITIVE_INFINITY,dist:Number.POSITIVE_INFINITY,x:null,y:null},r=!1,i,s;for(var o=0,u=this.targets.length;o<u;++o){s=this.targets[o],i=this.testTarget(s,t);if(i){if(this.greedy){n=i,n.target=s,r=!0;break}if(i.rank<n.rank||i.rank===n.rank&&i.dist<n.dist)n=i,n.target=s,r=!0}}if(r){var a=this.events.triggerEvent("beforesnap",{point:e,x:n.x,y:n.y,distance:n.dist,layer:n.target.layer,snapType:this.precedence[n.rank]});a!==!1?(e.x=n.x,e.y=n.y,this.point=e,this.events.triggerEvent("snap",{point:e,snapType:this.precedence[n.rank],layer:n.target.layer,distance:n.dist})):r=!1}this.point&&!r&&(e.x=t.x,e.y=t.y,this.point=null,this.events.triggerEvent("unsnap",{point:e}))},testTarget:function(e,t){var n=this.layer.map.getResolution();if("minResolution"in e&&n<e.minResolution)return null;if("maxResolution"in e&&n>=e.maxResolution)return null;var r={node:this.getGeoTolerance(e.nodeTolerance,n),vertex:this.getGeoTolerance(e.vertexTolerance,n),edge:this.getGeoTolerance(e.edgeTolerance,n)},i=Math.max(r.node,r.vertex,r.edge),s={rank:Number.POSITIVE_INFINITY,dist:Number.POSITIVE_INFINITY},o=!1,u=e.layer.features,a,f,l,c,h,p,d,v=this.precedence.length,m=new OpenLayers.LonLat(t.x,t.y);for(var g=0,y=u.length;g<y;++g){a=u[g];if(a!==this.feature&&!a._sketch&&a.state!==OpenLayers.State.DELETE&&(!e.filter||e.filter.evaluate(a))&&a.atPoint(m,i,i))for(var b=0,w=Math.min(s.rank+1,v);b<w;++b){f=this.precedence[b];if(e[f])if(f==="edge"){h=a.geometry.distanceTo(t,{details:!0}),p=h.distance;if(p<=r[f]&&p<s.dist){s={rank:b,dist:p,x:h.x0,y:h.y0},o=!0;break}}else{l=a.geometry.getVertices(f==="node"),d=!1;for(var E=0,S=l.length;E<S;++E)c=l[E],p=c.distanceTo(t),p<=r[f]&&(b<s.rank||b===s.rank&&p<s.dist)&&(s={rank:b,dist:p,x:c.x,y:c.y},o=!0,d=!0);if(d)break}}}return o?s:null},getGeoTolerance:function(e,t){t!==this.resolution&&(this.resolution=t,this.geoToleranceCache={});var n=this.geoToleranceCache[e];return n===undefined&&(n=e*t,this.geoToleranceCache[e]=n),n},destroy:function(){this.active&&this.deactivate(),delete this.layer,delete this.targets,OpenLayers.Control.prototype.destroy.call(this)},CLASS_NAME:"OpenLayers.Control.Snapping"});