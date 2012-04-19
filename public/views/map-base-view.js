window.MapViewBase = Backbone.View.extend({

    initialize: function(options) {
		this.collections = {};
		
		this.vent = options.vent;
		_.bindAll(this, "setMapLocation");
		options.vent.bind("setMapLocation", this.setMapLocation);
		
		this.dataObjectArray = [];
	},

	setMapLocation: function(addr)
	{				
		var self = this;
		
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( {'address': addr}, function (results, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					self.setViewPort(results);
				}
				else { 	
					alert ("Cannot find " + addr + "! Status: " + status);
				}
		});
	},

	addCollection: function(id, collection)
	{		
		var self = this;
		$.ajax({
			type: 'GET',
			url: '/api/map/' + _mapId,
			ajaxId: id,
			ajaxCollection: collection,
			success: function(data) {
				var scope = this;
				$.each(data[0].collections, function(key, parameterCollection) { 
					$.each(parameterCollection, function(key, val) { 
						if(key == 'collectionid')
						{
							if(scope.ajaxId == val)
							{
								scope.ajaxCollection.params = parameterCollection;
								self.collections[scope.ajaxId] = scope.ajaxCollection;
								self.collections[scope.ajaxId].bind('reset', self.reset, self);
								self.collections[scope.ajaxId].bind('add', self.addOne, self);
								self.addCollectionToMap(self.collections[scope.ajaxId]);
								self.vent.trigger("setStateType", 'complete');
								
							}
						}	
					});
				});
				
			},
			error: function() {
				console.error('failed to fetch map collection');
			}
		});
		
	},
	
	fetchParameters: function()
	{
		var self = this;
		$.ajax({
			type: 'GET',
			url: '/api/map/' + _mapId,
			success: function(data) {
				
				$.each(data[0].collections, function(key, collection) { 
					$.each(collection, function(key, val) { 
						if(key == 'collectionid')
						{
							if(self.collectionId == val)
								self.setParameters(collection);
								_boundCollections[self.collectionId] = collection;
						}	
					});
				});
				
			},
			error: function() {
				console.error('failed to fetch map collection');
			}
		});
	},
	
	addCommentCollection: function(collection)
	{
		var self = this;
		this.commentCollection = collection;
		this.commentCollection.bind('reset', this.resetComments, this);
		this.commentCollection.bind('add', this.addOneComment, this);
		this.commentCollection.fetch();
	},

	cleanPointModel: function(model) {
		var input = model.get('location');
		var latlngStr = input.split(/[, ]/, 2);
		var lat = parseFloat(latlngStr[0]);
		var lng = parseFloat(latlngStr[1]);
		model.set('lat', lat);
		model.set('lon', lng);
	},

    addAll: function() {
		this.addCollectionToMap(this.collection);
    },

	reset: function(model) {
		this.removeCollectionFromMap(model);
		if(model.length > 0)
			this.addCollectionToMap(this.collections[model.collectionId]);
	},

	resetComments: function(model) {
		//this.removeCollectionFromMap(model);
		this.addCommentToMap(model);
	},

	addCollectionToMap: function(collection)
	{
		var self = this;
		this.vent.trigger("setStateType", 'drawing');
		
		//Create specific layer
		this.addCollectionAsLayer(collection);
		
		var currCollection = collection.collectionId;
		var currIndex;
		$.each(this.layerArray, function(index, value) { 
			if(value.collectionId == currCollection)
				currIndex = index;
		});
				
		collection.each(function(model) {
			self.cleanPointModel(model);
			self.addOne(model, currIndex);
		});
				
		this.layerArray[currIndex].redraw();
		
		if(_loaded_data_sources == (_num_data_sources-1))
			this.vent.trigger("setStateType", 'complete');	
	},
	
	addCommentToMap: function(collection)
	{
		var self = this;
		collection.each(function(model) {
			self.addOneComment(model);
		});
	}
});