/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Format.OWSCommon.v1_0_0=OpenLayers.Class(OpenLayers.Format.OWSCommon.v1,{namespaces:{ows:"http://www.opengis.net/ows",xlink:"http://www.w3.org/1999/xlink"},readers:{ows:OpenLayers.Util.applyDefaults({ExceptionReport:function(e,t){t.success=!1,t.exceptionReport={version:e.getAttribute("version"),language:e.getAttribute("language"),exceptions:[]},this.readChildNodes(e,t.exceptionReport)}},OpenLayers.Format.OWSCommon.v1.prototype.readers.ows)},writers:{ows:OpenLayers.Format.OWSCommon.v1.prototype.writers.ows},CLASS_NAME:"OpenLayers.Format.OWSCommon.v1_0_0"});