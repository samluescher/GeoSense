function init(){var e=new OpenLayers.Bounds(-11593508,5509847,-11505759,5557774);map=new OpenLayers.Map("map",{projection:new OpenLayers.Projection("EPSG:900913"),displayProjection:new OpenLayers.Projection("EPSG:4326"),restrictedExtent:e,controls:[new OpenLayers.Control.PanZoom,new OpenLayers.Control.Navigation]});var t=new OpenLayers.Layer.Google("Google Physical",{type:G_PHYSICAL_MAP,sphericalMercator:!0}),n=new OpenLayers.Strategy.Save;wfs=new OpenLayers.Layer.Vector("Editable Features",{strategies:[new OpenLayers.Strategy.BBOX,n],projection:new OpenLayers.Projection("EPSG:4326"),protocol:new OpenLayers.Protocol.WFS({version:"1.1.0",srsName:"EPSG:4326",url:"http://demo.opengeo.org/geoserver/wfs",featureNS:"http://opengeo.org",featureType:"restricted",geometryName:"the_geom",schema:"http://demo.opengeo.org/geoserver/wfs/DescribeFeatureType?version=1.1.0&typename=og:restricted"})}),map.addLayers([t,wfs]);var r=new OpenLayers.Control.Panel({displayClass:"customEditingToolbar",allowDepress:!0}),i=new OpenLayers.Control.DrawFeature(wfs,OpenLayers.Handler.Polygon,{title:"Draw Feature",displayClass:"olControlDrawFeaturePolygon",multi:!0}),s=new OpenLayers.Control.ModifyFeature(wfs,{title:"Modify Feature",displayClass:"olControlModifyFeature"}),o=new DeleteFeature(wfs,{title:"Delete Feature"}),u=new OpenLayers.Control.Button({title:"Save Changes",trigger:function(){s.feature&&s.selectControl.unselectAll(),n.save()},displayClass:"olControlSaveFeatures"});r.addControls([u,o,s,i]),map.addControl(r),map.zoomToExtent(e,!0)}var map,wfs;OpenLayers.ProxyHost="proxy.cgi?url=";var DeleteFeature=OpenLayers.Class(OpenLayers.Control,{initialize:function(e,t){OpenLayers.Control.prototype.initialize.apply(this,[t]),this.layer=e,this.handler=new OpenLayers.Handler.Feature(this,e,{click:this.clickFeature})},clickFeature:function(e){e.fid==undefined?this.layer.destroyFeatures([e]):(e.state=OpenLayers.State.DELETE,this.layer.events.triggerEvent("afterfeaturemodified",{feature:e}),e.renderIntent="select",this.layer.drawFeature(e))},setMap:function(e){this.handler.setMap(e),OpenLayers.Control.prototype.setMap.apply(this,arguments)},CLASS_NAME:"OpenLayers.Control.DeleteFeature"});