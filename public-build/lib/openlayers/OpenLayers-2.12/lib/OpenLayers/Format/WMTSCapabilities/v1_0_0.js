/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Format.WMTSCapabilities.v1_0_0=OpenLayers.Class(OpenLayers.Format.OWSCommon.v1_1_0,{version:"1.0.0",namespaces:{ows:"http://www.opengis.net/ows/1.1",wmts:"http://www.opengis.net/wmts/1.0",xlink:"http://www.w3.org/1999/xlink"},yx:null,defaultPrefix:"wmts",initialize:function(e){OpenLayers.Format.XML.prototype.initialize.apply(this,[e]),this.options=e;var t=OpenLayers.Util.extend({},OpenLayers.Format.WMTSCapabilities.prototype.yx);this.yx=OpenLayers.Util.extend(t,this.yx)},read:function(e){typeof e=="string"&&(e=OpenLayers.Format.XML.prototype.read.apply(this,[e])),e&&e.nodeType==9&&(e=e.documentElement);var t={};return this.readNode(e,t),t.version=this.version,t},readers:{wmts:{Capabilities:function(e,t){this.readChildNodes(e,t)},Contents:function(e,t){t.contents={},t.contents.layers=[],t.contents.tileMatrixSets={},this.readChildNodes(e,t.contents)},Layer:function(e,t){var n={styles:[],formats:[],dimensions:[],tileMatrixSetLinks:[]};n.layers=[],this.readChildNodes(e,n),t.layers.push(n)},Style:function(e,t){var n={};n.isDefault=e.getAttribute("isDefault")==="true",this.readChildNodes(e,n),t.styles.push(n)},Format:function(e,t){t.formats.push(this.getChildValue(e))},TileMatrixSetLink:function(e,t){var n={};this.readChildNodes(e,n),t.tileMatrixSetLinks.push(n)},TileMatrixSet:function(e,t){if(t.layers){var n={matrixIds:[]};this.readChildNodes(e,n),t.tileMatrixSets[n.identifier]=n}else t.tileMatrixSet=this.getChildValue(e)},TileMatrix:function(e,t){var n={supportedCRS:t.supportedCRS};this.readChildNodes(e,n),t.matrixIds.push(n)},ScaleDenominator:function(e,t){t.scaleDenominator=parseFloat(this.getChildValue(e))},TopLeftCorner:function(e,t){var n=this.getChildValue(e),r=n.split(" "),i;if(t.supportedCRS){var s=t.supportedCRS.replace(/urn:ogc:def:crs:(\w+):.+:(\w+)$/,"urn:ogc:def:crs:$1::$2");i=!!this.yx[s]}i?t.topLeftCorner=new OpenLayers.LonLat(r[1],r[0]):t.topLeftCorner=new OpenLayers.LonLat(r[0],r[1])},TileWidth:function(e,t){t.tileWidth=parseInt(this.getChildValue(e))},TileHeight:function(e,t){t.tileHeight=parseInt(this.getChildValue(e))},MatrixWidth:function(e,t){t.matrixWidth=parseInt(this.getChildValue(e))},MatrixHeight:function(e,t){t.matrixHeight=parseInt(this.getChildValue(e))},ResourceURL:function(e,t){t.resourceUrl=t.resourceUrl||{},t.resourceUrl[e.getAttribute("resourceType")]={format:e.getAttribute("format"),template:e.getAttribute("template")}},WSDL:function(e,t){t.wsdl={},t.wsdl.href=e.getAttribute("xlink:href")},ServiceMetadataURL:function(e,t){t.serviceMetadataUrl={},t.serviceMetadataUrl.href=e.getAttribute("xlink:href")},LegendURL:function(e,t){t.legend={},t.legend.href=e.getAttribute("xlink:href"),t.legend.format=e.getAttribute("format")},Dimension:function(e,t){var n={values:[]};this.readChildNodes(e,n),t.dimensions.push(n)},Default:function(e,t){t["default"]=this.getChildValue(e)},Value:function(e,t){t.values.push(this.getChildValue(e))}},ows:OpenLayers.Format.OWSCommon.v1_1_0.prototype.readers.ows},CLASS_NAME:"OpenLayers.Format.WMTSCapabilities.v1_0_0"});