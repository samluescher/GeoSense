var map,fixSize=function(){window.scrollTo(0,0),document.body.style.height="100%",/(iphone|ipod)/.test(navigator.userAgent.toLowerCase())||document.body.parentNode&&(document.body.parentNode.style.height="100%")};setTimeout(fixSize,700),setTimeout(fixSize,1500);var init=function(){map=new OpenLayers.Map({div:"map",theme:null,controls:[new OpenLayers.Control.Attribution,new OpenLayers.Control.TouchNavigation({dragPanOptions:{enableKinetic:!0}}),new OpenLayers.Control.Zoom],layers:[new OpenLayers.Layer.OSM("OpenStreetMap",null,{transitionEffect:"resize"})],center:new OpenLayers.LonLat(742e3,5861e3),zoom:3})};