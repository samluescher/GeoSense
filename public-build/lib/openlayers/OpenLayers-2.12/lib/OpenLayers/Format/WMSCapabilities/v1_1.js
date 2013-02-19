/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Format.WMSCapabilities.v1_1=OpenLayers.Class(OpenLayers.Format.WMSCapabilities.v1,{readers:{wms:OpenLayers.Util.applyDefaults({WMT_MS_Capabilities:function(e,t){this.readChildNodes(e,t)},Keyword:function(e,t){t.keywords&&t.keywords.push(this.getChildValue(e))},DescribeLayer:function(e,t){t.describelayer={formats:[]},this.readChildNodes(e,t.describelayer)},GetLegendGraphic:function(e,t){t.getlegendgraphic={formats:[]},this.readChildNodes(e,t.getlegendgraphic)},GetStyles:function(e,t){t.getstyles={formats:[]},this.readChildNodes(e,t.getstyles)},PutStyles:function(e,t){t.putstyles={formats:[]},this.readChildNodes(e,t.putstyles)},UserDefinedSymbolization:function(e,t){var n={supportSLD:parseInt(e.getAttribute("SupportSLD"))==1,userLayer:parseInt(e.getAttribute("UserLayer"))==1,userStyle:parseInt(e.getAttribute("UserStyle"))==1,remoteWFS:parseInt(e.getAttribute("RemoteWFS"))==1};t.userSymbols=n},LatLonBoundingBox:function(e,t){t.llbbox=[parseFloat(e.getAttribute("minx")),parseFloat(e.getAttribute("miny")),parseFloat(e.getAttribute("maxx")),parseFloat(e.getAttribute("maxy"))]},BoundingBox:function(e,t){var n=OpenLayers.Format.WMSCapabilities.v1.prototype.readers.wms.BoundingBox.apply(this,[e,t]);n.srs=e.getAttribute("SRS"),t.bbox[n.srs]=n},ScaleHint:function(e,t){var n=e.getAttribute("min"),r=e.getAttribute("max"),i=Math.pow(2,.5),s=OpenLayers.INCHES_PER_UNIT.m;t.maxScale=parseFloat((n/i*s*OpenLayers.DOTS_PER_INCH).toPrecision(13)),t.minScale=parseFloat((r/i*s*OpenLayers.DOTS_PER_INCH).toPrecision(13))},Dimension:function(e,t){var n=e.getAttribute("name").toLowerCase(),r={name:n,units:e.getAttribute("units"),unitsymbol:e.getAttribute("unitSymbol")};t.dimensions[r.name]=r},Extent:function(e,t){var n=e.getAttribute("name").toLowerCase();if(n in t.dimensions){var r=t.dimensions[n];r.nearestVal=e.getAttribute("nearestValue")==="1",r.multipleVal=e.getAttribute("multipleValues")==="1",r.current=e.getAttribute("current")==="1",r["default"]=e.getAttribute("default")||"";var i=this.getChildValue(e);r.values=i.split(",")}}},OpenLayers.Format.WMSCapabilities.v1.prototype.readers.wms)},CLASS_NAME:"OpenLayers.Format.WMSCapabilities.v1_1"});