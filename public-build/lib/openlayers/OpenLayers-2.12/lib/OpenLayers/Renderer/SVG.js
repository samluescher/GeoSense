/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for 
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

OpenLayers.Renderer.SVG=OpenLayers.Class(OpenLayers.Renderer.Elements,{xmlns:"http://www.w3.org/2000/svg",xlinkns:"http://www.w3.org/1999/xlink",MAX_PIXEL:15e3,translationParameters:null,symbolMetrics:null,initialize:function(e){if(!this.supported())return;OpenLayers.Renderer.Elements.prototype.initialize.apply(this,arguments),this.translationParameters={x:0,y:0},this.symbolMetrics={}},supported:function(){var e="http://www.w3.org/TR/SVG11/feature#";return document.implementation&&(document.implementation.hasFeature("org.w3c.svg","1.0")||document.implementation.hasFeature(e+"SVG","1.1")||document.implementation.hasFeature(e+"BasicStructure","1.1"))},inValidRange:function(e,t,n){var r=e+(n?0:this.translationParameters.x),i=t+(n?0:this.translationParameters.y);return r>=-this.MAX_PIXEL&&r<=this.MAX_PIXEL&&i>=-this.MAX_PIXEL&&i<=this.MAX_PIXEL},setExtent:function(e,t){var n=OpenLayers.Renderer.Elements.prototype.setExtent.apply(this,arguments),r=this.getResolution(),i=-e.left/r,s=e.top/r;if(t){this.left=i,this.top=s;var o="0 0 "+this.size.w+" "+this.size.h;return this.rendererRoot.setAttributeNS(null,"viewBox",o),this.translate(this.xOffset,0),!0}var u=this.translate(i-this.left+this.xOffset,s-this.top);return u||this.setExtent(e,!0),n&&u},translate:function(e,t){if(!this.inValidRange(e,t,!0))return!1;var n="";if(e||t)n="translate("+e+","+t+")";return this.root.setAttributeNS(null,"transform",n),this.translationParameters={x:e,y:t},!0},setSize:function(e){OpenLayers.Renderer.prototype.setSize.apply(this,arguments),this.rendererRoot.setAttributeNS(null,"width",this.size.w),this.rendererRoot.setAttributeNS(null,"height",this.size.h)},getNodeType:function(e,t){var n=null;switch(e.CLASS_NAME){case"OpenLayers.Geometry.Point":t.externalGraphic?n="image":this.isComplexSymbol(t.graphicName)?n="svg":n="circle";break;case"OpenLayers.Geometry.Rectangle":n="rect";break;case"OpenLayers.Geometry.LineString":n="polyline";break;case"OpenLayers.Geometry.LinearRing":n="polygon";break;case"OpenLayers.Geometry.Polygon":case"OpenLayers.Geometry.Curve":n="path";break;default:}return n},setStyle:function(e,t,n){t=t||e._style,n=n||e._options;var r=parseFloat(e.getAttributeNS(null,"r")),i=1,s;if(e._geometryClass=="OpenLayers.Geometry.Point"&&r){e.style.visibility="";if(t.graphic===!1)e.style.visibility="hidden";else if(t.externalGraphic){s=this.getPosition(e);if(t.graphicTitle){e.setAttributeNS(null,"title",t.graphicTitle);var o=e.getElementsByTagName("title");if(o.length>0)o[0].firstChild.textContent=t.graphicTitle;else{var u=this.nodeFactory(null,"title");u.textContent=t.graphicTitle,e.appendChild(u)}}t.graphicWidth&&t.graphicHeight&&e.setAttributeNS(null,"preserveAspectRatio","none");var a=t.graphicWidth||t.graphicHeight,f=t.graphicHeight||t.graphicWidth;a=a?a:t.pointRadius*2,f=f?f:t.pointRadius*2;var l=t.graphicXOffset!=undefined?t.graphicXOffset:-(.5*a),c=t.graphicYOffset!=undefined?t.graphicYOffset:-(.5*f),h=t.graphicOpacity||t.fillOpacity;e.setAttributeNS(null,"x",(s.x+l).toFixed()),e.setAttributeNS(null,"y",(s.y+c).toFixed()),e.setAttributeNS(null,"width",a),e.setAttributeNS(null,"height",f),e.setAttributeNS(this.xlinkns,"href",t.externalGraphic),e.setAttributeNS(null,"style","opacity: "+h),e.onclick=OpenLayers.Renderer.SVG.preventDefault}else if(this.isComplexSymbol(t.graphicName)){var p=t.pointRadius*3,d=p*2,v=this.importSymbol(t.graphicName);s=this.getPosition(e),i=this.symbolMetrics[v.id][0]*3/d;var m=e.parentNode,g=e.nextSibling;m&&m.removeChild(e),e.firstChild&&e.removeChild(e.firstChild),e.appendChild(v.firstChild.cloneNode(!0)),e.setAttributeNS(null,"viewBox",v.getAttributeNS(null,"viewBox")),e.setAttributeNS(null,"width",d),e.setAttributeNS(null,"height",d),e.setAttributeNS(null,"x",s.x-p),e.setAttributeNS(null,"y",s.y-p),g?m.insertBefore(e,g):m&&m.appendChild(e)}else e.setAttributeNS(null,"r",t.pointRadius);var y=t.rotation;if((y!==undefined||e._rotation!==undefined)&&s){e._rotation=y,y|=0;if(e.nodeName!=="svg")e.setAttributeNS(null,"transform","rotate("+y+" "+s.x+" "+s.y+")");else{var b=this.symbolMetrics[v.id];e.firstChild.setAttributeNS(null,"transform","rotate("+y+" "+b[1]+" "+b[2]+")")}}}return n.isFilled?(e.setAttributeNS(null,"fill",t.fillColor),e.setAttributeNS(null,"fill-opacity",t.fillOpacity)):e.setAttributeNS(null,"fill","none"),n.isStroked?(e.setAttributeNS(null,"stroke",t.strokeColor),e.setAttributeNS(null,"stroke-opacity",t.strokeOpacity),e.setAttributeNS(null,"stroke-width",t.strokeWidth*i),e.setAttributeNS(null,"stroke-linecap",t.strokeLinecap||"round"),e.setAttributeNS(null,"stroke-linejoin","round"),t.strokeDashstyle&&e.setAttributeNS(null,"stroke-dasharray",this.dashStyle(t,i))):e.setAttributeNS(null,"stroke","none"),t.pointerEvents&&e.setAttributeNS(null,"pointer-events",t.pointerEvents),t.cursor!=null&&e.setAttributeNS(null,"cursor",t.cursor),e},dashStyle:function(e,t){var n=e.strokeWidth*t,r=e.strokeDashstyle;switch(r){case"solid":return"none";case"dot":return[1,4*n].join();case"dash":return[4*n,4*n].join();case"dashdot":return[4*n,4*n,1,4*n].join();case"longdash":return[8*n,4*n].join();case"longdashdot":return[8*n,4*n,1,4*n].join();default:return OpenLayers.String.trim(r).replace(/\s+/g,",")}},createNode:function(e,t){var n=document.createElementNS(this.xmlns,e);return t&&n.setAttributeNS(null,"id",t),n},nodeTypeCompare:function(e,t){return t==e.nodeName},createRenderRoot:function(){var e=this.nodeFactory(this.container.id+"_svgRoot","svg");return e.style.display="block",e},createRoot:function(e){return this.nodeFactory(this.container.id+e,"g")},createDefs:function(){var e=this.nodeFactory(this.container.id+"_defs","defs");return this.rendererRoot.appendChild(e),e},drawPoint:function(e,t){return this.drawCircle(e,t,1)},drawCircle:function(e,t,n){var r=this.getResolution(),i=(t.x-this.featureDx)/r+this.left,s=this.top-t.y/r;return this.inValidRange(i,s)?(e.setAttributeNS(null,"cx",i),e.setAttributeNS(null,"cy",s),e.setAttributeNS(null,"r",n),e):!1},drawLineString:function(e,t){var n=this.getComponentsString(t.components);return n.path?(e.setAttributeNS(null,"points",n.path),n.complete?e:null):!1},drawLinearRing:function(e,t){var n=this.getComponentsString(t.components);return n.path?(e.setAttributeNS(null,"points",n.path),n.complete?e:null):!1},drawPolygon:function(e,t){var n="",r=!0,i=!0,s,o;for(var u=0,a=t.components.length;u<a;u++)n+=" M",s=this.getComponentsString(t.components[u].components," "),o=s.path,o?(n+=" "+o,i=s.complete&&i):r=!1;return n+=" z",r?(e.setAttributeNS(null,"d",n),e.setAttributeNS(null,"fill-rule","evenodd"),i?e:null):!1},drawRectangle:function(e,t){var n=this.getResolution(),r=(t.x-this.featureDx)/n+this.left,i=this.top-t.y/n;return this.inValidRange(r,i)?(e.setAttributeNS(null,"x",r),e.setAttributeNS(null,"y",i),e.setAttributeNS(null,"width",t.width/n),e.setAttributeNS(null,"height",t.height/n),e):!1},drawText:function(e,t,n){var r=!!t.labelOutlineWidth;if(r){var i=OpenLayers.Util.extend({},t);i.fontColor=i.labelOutlineColor,i.fontStrokeColor=i.labelOutlineColor,i.fontStrokeWidth=t.labelOutlineWidth,delete i.labelOutlineWidth,this.drawText(e,i,n)}var s=this.getResolution(),o=(n.x-this.featureDx)/s+this.left,u=n.y/s-this.top,a=r?this.LABEL_OUTLINE_SUFFIX:this.LABEL_ID_SUFFIX,f=this.nodeFactory(e+a,"text");f.setAttributeNS(null,"x",o),f.setAttributeNS(null,"y",-u),t.fontColor&&f.setAttributeNS(null,"fill",t.fontColor),t.fontStrokeColor&&f.setAttributeNS(null,"stroke",t.fontStrokeColor),t.fontStrokeWidth&&f.setAttributeNS(null,"stroke-width",t.fontStrokeWidth),t.fontOpacity&&f.setAttributeNS(null,"opacity",t.fontOpacity),t.fontFamily&&f.setAttributeNS(null,"font-family",t.fontFamily),t.fontSize&&f.setAttributeNS(null,"font-size",t.fontSize),t.fontWeight&&f.setAttributeNS(null,"font-weight",t.fontWeight),t.fontStyle&&f.setAttributeNS(null,"font-style",t.fontStyle),t.labelSelect===!0?(f.setAttributeNS(null,"pointer-events","visible"),f._featureId=e):f.setAttributeNS(null,"pointer-events","none");var l=t.labelAlign||OpenLayers.Renderer.defaultSymbolizer.labelAlign;f.setAttributeNS(null,"text-anchor",OpenLayers.Renderer.SVG.LABEL_ALIGN[l[0]]||"middle"),OpenLayers.IS_GECKO===!0&&f.setAttributeNS(null,"dominant-baseline",OpenLayers.Renderer.SVG.LABEL_ALIGN[l[1]]||"central");var c=t.label.split("\n"),h=c.length;while(f.childNodes.length>h)f.removeChild(f.lastChild);for(var p=0;p<h;p++){var d=this.nodeFactory(e+a+"_tspan_"+p,"tspan");t.labelSelect===!0&&(d._featureId=e,d._geometry=n,d._geometryClass=n.CLASS_NAME),OpenLayers.IS_GECKO===!1&&d.setAttributeNS(null,"baseline-shift",OpenLayers.Renderer.SVG.LABEL_VSHIFT[l[1]]||"-35%"),d.setAttribute("x",o);if(p==0){var v=OpenLayers.Renderer.SVG.LABEL_VFACTOR[l[1]];v==null&&(v=-0.5),d.setAttribute("dy",v*(h-1)+"em")}else d.setAttribute("dy","1em");d.textContent=c[p]===""?" ":c[p],d.parentNode||f.appendChild(d)}f.parentNode||this.textRoot.appendChild(f)},getComponentsString:function(e,t){var n=[],r=!0,i=e.length,s=[],o,u;for(var a=0;a<i;a++)u=e[a],n.push(u),o=this.getShortString(u),o?s.push(o):(a>0&&this.getShortString(e[a-1])&&s.push(this.clipLine(e[a],e[a-1])),a<i-1&&this.getShortString(e[a+1])&&s.push(this.clipLine(e[a],e[a+1])),r=!1);return{path:s.join(t||","),complete:r}},clipLine:function(e,t){if(t.equals(e))return"";var n=this.getResolution(),r=this.MAX_PIXEL-this.translationParameters.x,i=this.MAX_PIXEL-this.translationParameters.y,s=(t.x-this.featureDx)/n+this.left,o=this.top-t.y/n,u=(e.x-this.featureDx)/n+this.left,a=this.top-e.y/n,f;if(u<-r||u>r)f=(a-o)/(u-s),u=u<0?-r:r,a=o+(u-s)*f;if(a<-i||a>i)f=(u-s)/(a-o),a=a<0?-i:i,u=s+(a-o)*f;return u+","+a},getShortString:function(e){var t=this.getResolution(),n=(e.x-this.featureDx)/t+this.left,r=this.top-e.y/t;return this.inValidRange(n,r)?n+","+r:!1},getPosition:function(e){return{x:parseFloat(e.getAttributeNS(null,"cx")),y:parseFloat(e.getAttributeNS(null,"cy"))}},importSymbol:function(e){this.defs||(this.defs=this.createDefs());var t=this.container.id+"-"+e,n=document.getElementById(t);if(n!=null)return n;var r=OpenLayers.Renderer.symbol[e];if(!r)throw new Error(e+" is not a valid symbol name");var i=this.nodeFactory(t,"symbol"),s=this.nodeFactory(null,"polygon");i.appendChild(s);var o=new OpenLayers.Bounds(Number.MAX_VALUE,Number.MAX_VALUE,0,0),u=[],a,f;for(var l=0;l<r.length;l+=2)a=r[l],f=r[l+1],o.left=Math.min(o.left,a),o.bottom=Math.min(o.bottom,f),o.right=Math.max(o.right,a),o.top=Math.max(o.top,f),u.push(a,",",f);s.setAttributeNS(null,"points",u.join(" "));var c=o.getWidth(),h=o.getHeight(),p=[o.left-c,o.bottom-h,c*3,h*3];return i.setAttributeNS(null,"viewBox",p.join(" ")),this.symbolMetrics[t]=[Math.max(c,h),o.getCenterLonLat().lon,o.getCenterLonLat().lat],this.defs.appendChild(i),i},getFeatureIdFromEvent:function(e){var t=OpenLayers.Renderer.Elements.prototype.getFeatureIdFromEvent.apply(this,arguments);if(!t){var n=e.target;t=n.parentNode&&n!=this.rendererRoot?n.parentNode._featureId:undefined}return t},CLASS_NAME:"OpenLayers.Renderer.SVG"}),OpenLayers.Renderer.SVG.LABEL_ALIGN={l:"start",r:"end",b:"bottom",t:"hanging"},OpenLayers.Renderer.SVG.LABEL_VSHIFT={t:"-70%",b:"0"},OpenLayers.Renderer.SVG.LABEL_VFACTOR={t:0,b:-1},OpenLayers.Renderer.SVG.preventDefault=function(e){e.preventDefault&&e.preventDefault()};