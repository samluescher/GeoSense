Point = Backbone.Model.extend({
	
	idAttribute: "_id",
	
	defaults: function() {
	      return {
			collectionid: null,
	        name:  'data point',
	        location: '0,0',
			lat: 0,
			lon: 0,
			val: 0,
			color: '#F0F0F0'
	      };
	    },
});