/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Format.WMSDescribeLayer.v1_1=OpenLayers.Class(OpenLayers.Format.WMSDescribeLayer,{initialize:function(e){OpenLayers.Format.WMSDescribeLayer.prototype.initialize.apply(this,[e])},read:function(e){typeof e=="string"&&(e=OpenLayers.Format.XML.prototype.read.apply(this,[e]));var t=e.documentElement,n=t.childNodes,r=[],i,s;for(var o=0;o<n.length;++o){i=n[o],s=i.nodeName;if(s=="LayerDescription"){var u=i.getAttribute("name"),a="",f="",l="";i.getAttribute("owsType")?(a=i.getAttribute("owsType"),f=i.getAttribute("owsURL")):i.getAttribute("wfs")!=""?(a="WFS",f=i.getAttribute("wfs")):i.getAttribute("wcs")!=""&&(a="WCS",f=i.getAttribute("wcs"));var c=i.getElementsByTagName("Query");c.length>0&&(l=c[0].getAttribute("typeName"),l||(l=c[0].getAttribute("typename"))),r.push({layerName:u,owsType:a,owsURL:f,typeName:l})}}return r},CLASS_NAME:"OpenLayers.Format.WMSDescribeLayer.v1_1"});