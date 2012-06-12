window.MapViewBase = Backbone.View.extend({

    initialize: function(options) {
		var self = this;
		this.collections = {};
		this.layerArray = {};
		this.vent = options.vent;
		this.colorGradients = {};
		_.bindAll(this, "setMapLocation");
		options.vent.bind("setMapLocation", this.setMapLocation);
		
		_.bindAll(this, "redrawCollection");
		options.vent.bind("redrawCollection", this.redrawCollection);  

		options.vent.bind("setViewport", function(params) {
			self.setViewport(params);  
		});
		options.vent.bind("broadcastMessageReceived", function(message) {
			var match = new String(message).match(/^@([a-zA-Z0-9_]+)( (.*))?$/);
			if (match) {
				switch (match[1]) {
					case 'setViewport':
						if (!IS_REMOTE_CONTROLLED) return;
						var obj = $.parseJSON(match[3]);
						if (obj) {
							self.vent.trigger('setViewport', obj);
						}
						return;
				}
			}
		});
	},

	setMapLocation: function(addr)
	{				
		var self = this;
		
		geocoder = new google.maps.Geocoder();
		geocoder.geocode( {'address': addr}, function (results, status)
			{
				if (status == google.maps.GeocoderStatus.OK)
				{
					results.type = 'google';
					self.setViewport(results);
				}
				else { 	
					alert ("Cannot find " + addr + "! Status: " + status);
				}
		});
	},

	/**
	* Required to be implemented by descendants.
	*/
	getVisibleMapArea: function()
	{
		return {
			bounds: null,
			zoom: null
		};
	},
	
	/**
	* Required to be implemented by descendants.
	*/
	setViewport: function(to) {
	},

	mapAreaChanged: function(visibleMapArea)
	{
		//this.vent.trigger("setStateType", 'loading');

		$.each(this.collections, function(collectionid, collection) { 
			collection.setVisibleMapArea(visibleMapArea);
			collection.fetch();
		});

		this.vent.trigger("updateGraphCollections", visibleMapArea);
	},

	redrawCollection: function(options)
	{
		var self = this;

		var collectionId = options.collectionId;
		var updateObject = options.updateObject;

		this.collections[collectionId].params.colors = updateObject.colors;
		this.collections[collectionId].params.colorType = updateObject.colorType;
		this.collections[collectionId].params.featureType = updateObject.featureType;
		this.collections[collectionId].params.visible = updateObject.visible;

		$.each(this.collections, function(collectionid, collection) { 
			if(collectionid == collectionId)
				collection.fetch();
		})

	},

	addCollection: function(collection)
	{	
		console.log('addCollection');

		var self = this;
		$.ajax({
			type: 'GET',
			url: '/api/map/' + _mapId,
			success: function(data) {
				var scope = this;
				$.each(data[0].collections, function(key, link) { 
					if (link.collectionid == collection.collectionId) {
						//scope.ajaxCollection.params = parameterCollection;
						
						collection.params = link.options;
						self.collections[link.collectionid] = collection;

						self.collections[link.collectionid].bind('reset', self.reset, self);
						self.collections[link.collectionid].bind('add', self.addOne, self);
						self.addCollectionToMap(self.collections[link.collectionid]);
						self.vent.trigger("setStateType", 'complete');

					}	
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

    addAll: function() {	
		this.addCollectionToMap(this.collection);
    },

	reset: function(model) {
		this.removeCollectionFromMap(model);
		if (model.length > 0) {
			this.addCollectionToMap(this.collections[model.collectionId]);
		}
	},

	resetComments: function(model) {
		//this.removeCollectionFromMap(model);
		this.addCommentToMap(model);
	},

	addCollectionToMap: function(collection)
	{
		var self = this;
		this.vent.trigger("setStateType", 'drawing');
		this.initLayerForCollection(collection);
		collection.each(function(model) {
			self.addOne(model, collection.collectionId);
		});
		this.drawLayerForCollection(collection);
		this.vent.trigger("setStateType", 'complete');	
	},

	/**
	* Required to be implemented by descendants.
	*/
	initLayerForCollection: function(collection)
	{ 
		switch (collection.params.colorType) {
			case ColorType.LINEAR_GRADIENT:
				this.colorGradients[collection.collectionId] = new ColorGradient(collection.params.colors);
				break;
		}
	},

	/**
	* Required to be implemented by descendants.
	*/
    addPointToLayer: function(model, opts, collectionId) 
    {
    },

	/**
	* Required to be implemented by descendants.
	*/
	drawLayerForCollection: function(collection) 
	{
	},

    addOne: function(model, collectionId) 
    {
		var c = this.collections[collectionId];
		var params = c.params;
		var min = Number(c.minVal);
		var max = Number(c.maxVal);
		var val = model.get('val');
		var count = model.get('count');
		var normVal = (val - min) / (max - min);

		var color;
		switch (params.colorType) {
			case ColorType.SOLID: 
				color = params.colors[0].color;
				break;
			case ColorType.LINEAR_GRADIENT:
				color = this.colorGradients[collectionId].colorAt(normVal, COLOR_GRADIENT_STEP);
				break;
		}

		this.addPointToLayer(model, {
			color: color,
			min: min,
			max: max,
			data: {
				val: val,
				normVal: normVal,
				count: count,
				altVal: model.get('altVal')
			},
			size: count / this.collections[collectionId].maxCount
		}, collectionId);
    },
	
	updateFromNewCollection: function(collection)
	{
		
	},
	
	addCommentToMap: function(collection)
	{
		var self = this;
		collection.each(function(model) {
			self.addOneComment(model);
		});
	}
});
