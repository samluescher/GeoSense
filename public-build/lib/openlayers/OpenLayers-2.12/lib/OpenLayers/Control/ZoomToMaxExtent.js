/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Control.ZoomToMaxExtent=OpenLayers.Class(OpenLayers.Control,{type:OpenLayers.Control.TYPE_BUTTON,trigger:function(){this.map&&this.map.zoomToMaxExtent()},CLASS_NAME:"OpenLayers.Control.ZoomToMaxExtent"});