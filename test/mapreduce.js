var	models = require('../models'),
	config = require('../config'),
	api = new require('../api')(),
	utils = require('../utils'),
	EmitKey = require('../api/mapreduce/mapreduce_abstraction').EmitKey,
	GeoFeatureCollection = models.GeoFeatureCollection,
	assert = require('assert'),
	mongoose = require('mongoose');

describe('MapReduce', function() {
	var featureCollection, GeoFeature,
		generateCount = 1024,
		normalZoom = 1,
		increment = config.GRID_SIZES[normalZoom] / Math.sqrt(generateCount),
		days;

	before(function(done) {
		mongoose.connect(config.DB_PATH);
		featureCollection = new GeoFeatureCollection({
			_id: new mongoose.Types.ObjectId(),
			active: true, 
			title: 'MapReduce test',
			reduce: true,
			numericAttr: 'properties.numVal',
			datetimeAttr: 'properties.date',
			maxReduceZoom: 8,
			timebased: true
		});
		featureCollection.save(function(err, collection) {
			GeoFeature = collection.getFeatureModel();
			return done(err);
		});
	});

	it('should create an array of points', function(done) {
		var features = [];

		// TODO: this should be handled better -- keeping track of extremes manually is not very nice
		featureCollection.extremes.properties = {};
		for (var y = 0; y < config.GRID_SIZES[normalZoom]; y += increment) {
			days = 0;
			for (var x = 0; x < config.GRID_SIZES[normalZoom]; x += increment) {
				var feature = new GeoFeature({
					featureCollection: featureCollection,
					geometry: {
						type: 'Point',
						coordinates: [x, y]
					},
					type: 'Point',
					properties: {
						numVal: x * y,
						x: x,
						y: y,
						strVal: '_' + x * y,
						otherVal: 'sameForAll',
						date: new Date(2013, 0, days + 1)
					}
				});
				days++;

				for (var key in feature.properties) {
					featureCollection.extremes.properties[key] = utils.findExtremes(feature.properties[key], featureCollection.extremes.properties[key]);
				}

				features.push(feature);
			}
		}

		assert.equal(features.length, generateCount);

		var dequeueFeature = function() {
			if (!features.length) {
				assert.equal(generateCount, featureCollection.extremes.properties.numVal.count);
				featureCollection.getFeatureModel().count({}, function(err, count) {
					if (err) throw (err);
					assert.equal(count, generateCount);
					done();
				});
				return;
			}
			features.shift().save(function(err, point) {
				if (err) throw err;
				dequeueFeature();
			});
		};

		dequeueFeature();
	});

	it('should run MapReduce to get a daily overall', function(done) {
		api.mapReduce.mapReduce({
			featureCollectionId: featureCollection._id.toString(),
			zoom: normalZoom,
			types: ['daily'],
			rebuild: true
		}, null, null, function(err) {
			if (err) throw err;

			featureCollection.findFeatures(null, null, {
				timebased: 'daily'
			}, function(err, collection) {
				if (err) throw err;
				assert.equal(collection.features.length, days);
				assert.equal(collection.features[0].count, days);
				done();
			});

		});
	});

	it('should run MapReduce at the size of the area where features where generated, resulting in 1 single feature', function(done) {
		api.mapReduce.mapReduce({
			featureCollectionId: featureCollection._id.toString(),
			zoom: normalZoom,
			types: ['tile'],
			rebuild: true
		}, null, null, function(err) {
			if (err) throw err;

			featureCollection.findFeatures(null, null, {
				gridSize: config.GRID_SIZES[normalZoom]
			}, function(err, collection) {
				if (err) throw err;
				assert.equal(collection.features.length, 1);
				assert.equal(collection.features[0].count, generateCount);
				console.log(collection.features[0].toGeoJSON());
				done();
			});

		});
	});

	it('should run MapReduce for the next zoom level, which has a grid cell area 4 times smaller, resulting in 4 features', function(done) {
		api.mapReduce.mapReduce({
			featureCollectionId: featureCollection._id.toString(),
			zoom: normalZoom + 1,
			types: ['tile'],
			rebuild: true
		}, null, null, function(err) {
			if (err) throw err;

			featureCollection.findFeatures(null, null, {
				gridSize: config.GRID_SIZES[normalZoom + 1]
			}, function(err, collection) {
				if (err) throw err;
				assert.equal(collection.features.length, 4);
				assert.equal(collection.features[0].count, generateCount / 4.0);
				console.log(collection.features[0].toGeoJSON());
				done();
			});
		});
	});

	after(function() {
		mongoose.disconnect();
	});

});



