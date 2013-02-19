/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Format.SOSCapabilities.v1_0_0=OpenLayers.Class(OpenLayers.Format.SOSCapabilities,{namespaces:{ows:"http://www.opengis.net/ows/1.1",sos:"http://www.opengis.net/sos/1.0",gml:"http://www.opengis.net/gml",xlink:"http://www.w3.org/1999/xlink"},regExes:{trimSpace:/^\s*|\s*$/g,removeSpace:/\s*/g,splitSpace:/\s+/,trimComma:/\s*,\s*/g},initialize:function(e){OpenLayers.Format.XML.prototype.initialize.apply(this,[e]),this.options=e},read:function(e){typeof e=="string"&&(e=OpenLayers.Format.XML.prototype.read.apply(this,[e])),e&&e.nodeType==9&&(e=e.documentElement);var t={};return this.readNode(e,t),t},readers:{gml:OpenLayers.Util.applyDefaults({name:function(e,t){t.name=this.getChildValue(e)},TimePeriod:function(e,t){t.timePeriod={},this.readChildNodes(e,t.timePeriod)},beginPosition:function(e,t){t.beginPosition=this.getChildValue(e)},endPosition:function(e,t){t.endPosition=this.getChildValue(e)}},OpenLayers.Format.GML.v3.prototype.readers.gml),sos:{Capabilities:function(e,t){this.readChildNodes(e,t)},Contents:function(e,t){t.contents={},this.readChildNodes(e,t.contents)},ObservationOfferingList:function(e,t){t.offeringList={},this.readChildNodes(e,t.offeringList)},ObservationOffering:function(e,t){var n=this.getAttributeNS(e,this.namespaces.gml,"id");t[n]={procedures:[],observedProperties:[],featureOfInterestIds:[],responseFormats:[],resultModels:[],responseModes:[]},this.readChildNodes(e,t[n])},time:function(e,t){t.time={},this.readChildNodes(e,t.time)},procedure:function(e,t){t.procedures.push(this.getAttributeNS(e,this.namespaces.xlink,"href"))},observedProperty:function(e,t){t.observedProperties.push(this.getAttributeNS(e,this.namespaces.xlink,"href"))},featureOfInterest:function(e,t){t.featureOfInterestIds.push(this.getAttributeNS(e,this.namespaces.xlink,"href"))},responseFormat:function(e,t){t.responseFormats.push(this.getChildValue(e))},resultModel:function(e,t){t.resultModels.push(this.getChildValue(e))},responseMode:function(e,t){t.responseModes.push(this.getChildValue(e))}},ows:OpenLayers.Format.OWSCommon.v1_1_0.prototype.readers.ows},CLASS_NAME:"OpenLayers.Format.SOSCapabilities.v1_0_0"});