define(["jquery","underscore","backbone","views/homepage-view","views/header-view","views/setup-view","views/map-ol-view","views/layers-panel-view","views/data-detail-view","views/map-info-view","views/map-layer-editor-view","views/map-layer-view","views/data-library-view","views/data-import-view","views/modal-view","views/share-view","collections/geo-feature-collection","models/map","models/map_layer"],function(e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y){var b=n.Router.extend({routes:{},defaultRoutes:{"":"homeRoute",removed:"homeRoute","admin/:slug":"mapAdminRoute","admin/:slug/:view":"mapAdminRoute","admin/:slug/:view/:pos":"mapAdminRoute",":slug":"mapRoute",":slug/:view":"mapRoute",":slug/:view/:pos":"mapRoute"},byHostRoutes:{removed:"homeRoute",admin:"mapAdminRouteByHost","admin/:view":"mapAdminRouteByHost","admin/:view/:pos":"mapAdminRouteByHost","":"mapRouteByHost",":view":"mapRouteByHost",":view/:pos":"mapRouteByHost"},getRoutes:function(){var e;window.MAP_SLUG?(console.log("route by custom host"),e=this.byHostRoutes):(console.log("route by slug"),e=this.defaultRoutes);var t=[];for(var n in e)t.unshift([n,e[n]]);return t},setUIReady:function(){e("#center-spinner").hide("fast",function(){e(this).remove()})},initialize:function(){var e=this;t.each(this.getRoutes(),function(t){e.route.apply(e,t)}),this.map=null,this.firstLoad=!0,this.isRendered=!1,this.mapLayerSubViewsAttached=!1,this.mapLayerEditorViews={},this.settingsVisible=!0,this.graphVisible=!1,this.dataLibraryVisible=!1,this.chatVisible=!1,this.vent=t.extend({},n.Events),this.adminRoute=!1,this.routingByHost=!1,this.listenTo(this.vent,"showMapLayerEditor",this.showMapLayerEditor),this.listenTo(this.vent,"viewOptionsChanged",this.viewOptionsChanged),this.isEmbedded=window!=window.top},mapRoute:function(t,n,r){var i,s,o,u,a,f,l;if(n){this.setupRoute=n=="setup";if(!this.setupRoute){var c=n.split(":");i=c.shift(),c.length>1&&(s=c.shift()),c.length&&(o=c.shift())}else e("#app").empty()}if(r!=undefined){var c=r.split(",");c.length==3&&(a=c.pop()),c.length==2&&(f=parseFloat(c.shift()),l=parseFloat(c.shift()),!isNaN(f)&&!isNaN(l)&&(u=[f,l]))}console.log("slug:",t,"mapViewName:",i,"viewBase:",s,"viewStyle:",o,"center:",u,"zoom:",a),this.loadAndInitMap(t,i,u,a,s,o)},mapAdminRoute:function(e,t,n){this.adminRoute=!0,this.mapRoute(e,t,n)},mapRouteByHost:function(e,t){return this.routingByHost=!0,this.mapRoute(window.MAP_SLUG,e,t)},mapAdminRouteByHost:function(e,t){return this.routingByHost=!0,this.mapAdminRoute(window.MAP_SLUG,e,t)},homeRoute:function(){this.firstLoad?(this.firstLoad=!1,this.homepageView=new r,e("#app").append(this.homepageView.render().el)):window.location.reload(!0)},genMapViewParam:function(e){if(!e||e=="map"){var t=this.mapView.viewBase&&this.mapView.viewBase!=DEFAULT_MAP_VIEW_BASE,n=t||this.mapView.viewStyle&&this.mapView.viewStyle!=this.mapView.defaultViewStyle;e=this.mapViewName+(n||t?":":"")+(t?this.mapView.viewBase+":":"")+(n?this.mapView.viewStyle?this.mapView.viewStyle:"default":"")}return e},getCurrentViewOptions:function(){return{viewName:this.mapViewName,viewBase:this.mapView.viewBase,viewStyle:this.mapView.viewStyle}},genMapURI:function(e,t,n){var n=(n||n==undefined)&&this.adminRoute;return e=this.genMapViewParam(e),genMapURI(this.map.attributes,e,t,n,this.routingByHost?!1:"publicslug")},genPublicURL:function(e){return genMapURL(this.map.attributes,e?this.getURIOptsForVisibleMapArea():!1,!1)},getURIOptsForVisibleMapArea:function(e){if(!e)var e=this.mapView.getVisibleMapArea();var t={x:e.center[0],y:e.center[1],zoom:e.zoom,mapViewName:this.genMapViewParam("map")},n={x:this.map.attributes.initialArea.center.length?this.map.attributes.initialArea.center[0]:0,y:this.map.attributes.initialArea.center.length?this.map.attributes.initialArea.center[1]:0,zoom:this.map.attributes.initialArea.zoom!=undefined?this.map.attributes.initialArea.zoom:0};return n.x!=t.x||n.y!=t.y||n.zoom!=t.zoom?t:{mapViewName:t.mapViewName}},genMapURIForVisibleArea:function(e){return app.genMapURI(null,this.getURIOptsForVisibleMapArea(e))},genAdminURL:function(){return genMapURL(this.map.attributes,!1,!0)},loadAndInitMap:function(e,t,n,r,i,s){var o=this;if(!this.map){this.map=new g({publicslug:e}),this.map.fetch({success:function(e,u,a){console.log("initMapInfo"),o.initMap();var f=o.map.attributes.viewOptions||{},l=function(e,t){return e&&e!=""?e:t};o.initMapView(l(t,f.viewName),n,r,l(i,f.viewBase),l(s,f.viewStyle))},error:function(t,n,r){console.error("failed to load map",e)}});return}console.log("initMapView"),o.initMapView(t,n,r,i,s)},initMap:function(){var e=this;this.mapLayersById={},t.each(this.map.attributes.layers,function(t){e.initMapLayer(e.map.newLayerInstance(t))})},initMapView:function(t,n,r,i,s){var a=this;a.isRendered||a.render(t),this.mapViewName=t,this.mapView&&(this.mapView.remove(),this.mapView=null);switch(this.mapViewName){default:case"map":var f=o;this.mapViewName="map";break;case"globe":var f=MapGLView}e(".map-view-toggle").each(function(){e(this).toggleClass("active",e(this).hasClass(a.mapViewName))});var l=this.getDefaultVisibleMapArea();n&&(l.center=n),r&&(l.zoom=r),this.mapView=new f({vent:a.vent,visibleMapArea:l}),this.listenTo(this.mapView,"visibleAreaChanged",this.visibleMapAreaChanged),this.listenTo(this.mapView,"feature:select",this.showDetailData),this.listenTo(this.mapView,"feature:unselect",this.hideDetailData),this.listenTo(this.mapView,"view:ready",this.mapViewReady);var c=this.mapView.render().el;this.$mainEl.append(c),this.mapView.renderMap(i,s),this.viewOptionsChanged(this.mapView);var h=e('<div class="snap top" /><div class="snap right" />');this.$mainEl.append(h),this.layersPanelView=(new u({vent:this.vent})).render(),this.attachPanelView(this.layersPanelView)},mapViewReady:function(){var e=this;setTimeout(function(){console.log("mapViewReady: attaching sub views for all layers"),e.setUIReady(),e.attachMapLayerSubViews(),e.fetchMapFeatures()},200)},getMapLayer:function(e){return this.mapLayersById[e]},initMapLayer:function(e,t){var n=this;return console.log("initMapLayer",e.id),this.mapLayersById[e.id]=e,this.mapLayerSubViewsAttached&&(this.attachSubViewsForMapLayer(e,t),this.fetchMapFeatures()),this.listenTo(e,"toggle:enabled",function(){n.fetchMapFeatures()}),e.getDataStatus()!=DataStatus.COMPLETE&&this.pollForMapLayerStatus(e,INITIAL_POLL_INTERVAL),e},pollForMapLayerStatus:function(e,t){var n=this;if(t){setTimeout(function(){n.pollForMapLayerStatus(e)},t);return}e.once("sync",function(){e.canDisplayValues()&&n.fetchMapFeatures();if(e.getDataStatus()==DataStatus.COMPLETE)return;n.pollForMapLayerStatus(e,POLL_INTERVAL)}),e.fetch({data:{incomplete:!0}})},attachSubViewsForMapLayer:function(e,t){console.log("attachSubViewsForMapLayer",e.id,e.getDisplay("title"));var n=(new c({model:e,vent:this.vent})).render();this.layersPanelView.appendSubView(n),t&&n.hide().show("fast"),this.mapView.attachLayer(e),e.limitFeatures()&&e.featureCollection.setVisibleMapArea(this.mapView.getVisibleMapArea())},attachMapLayerSubViews:function(){var e=this;e.mapLayerSubViewsAttached||(e.mapLayerSubViewsAttached=!0,t.each(e.mapLayersById,function(t){e.attachSubViewsForMapLayer(t)}),this.layersPanelView.show("fast"))},visibleMapAreaChanged:function(){var e=this.mapView.getVisibleMapArea();t.each(this.mapLayersById,function(t){t.limitFeatures()&&t.featureCollection.setVisibleMapArea(e)}),this.fetchMapFeatures()},fetchMapFeatures:function(){t.each(this.mapLayersById,function(e){e.isEnabled()&&e.canDisplayValues()&&e.featureCollection.canFetch()&&!e.featureCollection.isCurrent()&&(console.log("Fetching features for",e.id,e.getDisplay("title")),e.featureCollection.fetch())})},getDefaultVisibleMapArea:function(){var e=DEFAULT_MAP_AREA;return this.map.attributes.initialArea&&this.map.attributes.initialArea.center.length&&(e.center=this.map.attributes.initialArea.center),this.map.attributes.initialArea.zoom!=undefined&&(e.zoom=this.map.attributes.initialArea.zoom),e},viewOptionsChanged:function(t){var n=this;if(t==this.mapView){e("#app").removeClass(function(e,t){return(t.match(/\bmap-style-\S+/g)||[]).join(" ")});if(this.mapView.viewStyles){e("#app").addClass("map-style-"+this.mapView.viewStyle);var r=[];e.each(this.mapView.viewStyles,function(e,t){var i=e;r.push("<li"+(i==n.mapView.viewStyle?' class="inactive"':"")+">"+'<a href="#'+i+'">'+t+"</a></li>")}),e("#viewStyle .dropdown-menu").html(r.join("")),e("#viewStyleCurrent").text(this.mapView.viewStyles[this.mapView.viewStyle]),e("#viewStyle").show()}else e("#viewStyle").hide();if(this.mapView.viewBase){var r=[];for(var i in this.mapView.ViewBase){var s=this.mapView.ViewBase[i].prototype;r.push("<li"+(i==n.mapView.viewBase?' class="inactive"':"")+">"+'<a href="#'+i+'">'+'<span class="view-base-thumb"'+(i!="blank"?' style="background: url(/assets/baselayer-thumbs/'+i+'.png)"':"")+"></span>"+'<span class="view-base-caption">'+s.providerName+"</span>"+"</a></li>")}e("#viewBase .dropdown-menu").html(r.join("")),e("#viewBaseCurrent").text(this.mapView.ViewBase[this.mapView.viewBase].prototype.providerName),e("#viewBaselayer").show()}else e("#viewBaselayer").hide()}},setViewStyle:function(e,t){this.vent.trigger("updateViewStyle",e),(t||t==undefined)&&app.navigate(app.genMapURIForVisibleArea(),{trigger:!1})},setViewBase:function(e,t){this.vent.trigger("updateViewBase",e),(t||t==undefined)&&app.navigate(app.genMapURIForVisibleArea(),{trigger:!1})},showMapInfo:function(){this.mapInfoView=(new f({model:this.map})).render(),this.mapInfoView.show()},toggleDataLibrary:function(){this.dataLibraryVisible?(this.dataLibraryView.remove(),this.dataLibraryVisible=!1):(this.dataLibraryView=new h,this.$mainEl.append(this.dataLibraryView.render().el),this.dataLibraryVisible=!0)},showShareLink:function(){var e=(new v).render();e.show()},showAbout:function(){var e=(new d).render();e.setTitle("About GeoSense"),e.setBody('<p class="well">Designed and engineered by <strong>Anthony DeVincenzi & Samuel Luescher</strong> at the <a href="http://www.mit.edu">Massachusetts Institute of Technology</a> / <a href="http://media.mit.edu/">MIT Media Lab</a>, with the friendly support of <a href="http://tangible.media.mit.edu/">Hiroshi Ishii</a> and <a href="http://safecast.org/">Safecast</a>.</p><p>GeoSense is an open publishing platform for visualization, social sharing, and data analysis of geospatial data. It explores the power of data analysis through robust layering and highly customizable data visualization. GeoSense supports the simultaneous comparison and individual styling for multiple massive data sources ranging from 10 thousand to 10 million geolocated points.</p><p>Powered by <a href="http://nodejs.org/">Node.js</a> and <a href="http://www.mongodb.org/">MongoDB</a>, head start thanks to <a href="http://backbonejs.org/">Backbone</a> and <a href="http://twitter.github.com/bootstrap/">Bootstrap</a>. Some interface elements courtesy of <a href="http://glyphicons.com/">glyphicons.com</a>.</p>'),e.show()},showSetupView:function(){this.setupView.show()},isMapAdmin:function(){return this.adminRoute&&this.map.attributes.admin},render:function(){console.log("main render");var t=this;window.document.title=this.map.get("title")+" – GeoSense",this.isEmbedded&&e("body").addClass("embed"),this.headerView=new i({vent:this.vent,model:this.map}),e("#app").append(this.headerView.render().el),this.$mainEl=e('<div id="main-viewport"></div>'),this.mainEl=this.$mainEl[0],e("#app").append(this.mainEl),e("body").css("overflow","hidden"),window.location.href.indexOf("4D4R0IjQJYzGP0m")!=-1&&e("body").addClass("embed"),this.isMapAdmin()&&(this.setupView=(new s({model:this.map})).render(),this.setupRoute&&this.showSetupView()),t.isRendered=!0},getURLParameter:function(e){return decodeURI((RegExp(e+"="+"(.+?)(&|$)").exec(location.search)||[,null])[1])},toggleDataImport:function(){this.dataImportView||(this.dataImportView=(new p({vent:this.vent})).render()),this.dataImportView.show()},showDetailData:function(e,t){this.dataDetailView||(this.dataDetailView=(new a).render()),this.dataDetailView.isAttached||(this.attachPanelView(this.dataDetailView),this.dataDetailView.snapToView(this.layersPanelView,"left",!0).hide().show("fast")),this.dataDetailView.setPanelState(!0),this.dataDetailView.setModel(e),this.dataDetailView.show()},hideDetailData:function(e){this.dataDetailView&&this.dataDetailView.hide()},showMapLayerEditor:function(e){var t=e.id,n=this;this.mapLayerEditorViews[t]||(this.mapLayerEditorViews[t]=(new l({vent:this.vent,model:this.getMapLayer(t)})).render());for(var r in this.mapLayerEditorViews)t!=this.mapLayerEditorViews[r].model.get("_id")?this.mapLayerEditorViews[r].detach():this.mapLayerEditorViews[r].isVisible()?this.mapLayerEditorViews[r].hide("fast",function(){n.mapLayerEditorViews[r].detach()}):(this.mapLayerEditorViews[r].hide(),this.attachPanelView(this.mapLayerEditorViews[r]),this.mapLayerEditorViews[r].snapToView(this.layersPanelView,"left",!0).show("fast"))},attachPanelView:function(e){e.attachTo(this.mainEl)},saveNewMapLayer:function(e){var t=this,n=this.map.newLayerInstance({featureCollection:{_id:e}});console.log("saving new map layer",n),n.once("sync",function(){t.initMapLayer(n,!0)}),n.save({},{success:function(e,t,n){console.log("new map layer saved",e)},error:function(e,t,n){console.error("failed to save new map layer")}})},geocode:function(e,t){var n=this,r=new google.maps.Geocoder;r.geocode({address:e},t)},zoomToAddress:function(t){var n=this;this.geocode(t,function(r,i){if(i!=google.maps.GeocoderStatus.OK){alert("Unable to find address: "+t);return}var s=r[0].geometry.viewport,o=s.getSouthWest(),u=s.getNorthEast();n.mapView.zoomToExtent([o.lng(),o.lat(),u.lng(),u.lat()]),e(".search-query").blur()})}}),w=function(){window.app=new b,n.history.start({pushState:!0})||e("#app").html("page not found")};return{initialize:w}});