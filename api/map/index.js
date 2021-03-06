var config = require('../../config.js'),
	models = require("../../models.js"),
	permissions = require("../../permissions.js"),
	utils = require("../../utils.js"),
	uuid = require('node-uuid'),
	md5 = require('MD5'),
	url = require('url'),
	mongoose = require('mongoose'),
	_ = require('cloneextend');

var Point = models.Point,
	GeoFeatureCollection = models.GeoFeatureCollection,
	Map = models.Map,
	LayerOptions = models.LayerOptions,
	User = models.User,
	handleDbOp = utils.handleDbOp,
	console = require('../../ext-console');

var MapAPI = function(app) 
{
	if (app) {
		// Returns a list of maps
		app.get('/api/maps(\/latest|\/featured)' , function(req, res){
			var query = {status: config.MapStatus.PUBLIC};
			var options = {};
			switch (req.params[0]) {
				case '/latest':
					options.sort = {'createdAt': -1};
					options.limit = 20;		
					break;
				case '/featured':
					if (!config.DEBUG) {
						query.featured = {$gt: 0};
					}
					options.sort = {'featured': -1};
					break;
			}
			Map.find(query, null, options)
				.exec(function(err, maps) {
					if (handleDbOp(req, res, err, maps)) return;
					var preparedMaps = [];
					for (var i = 0; i < maps.length; i++) {
						if (permissions.canViewMap(req, res, maps[i])) {
							preparedMaps.push(prepareMapResult(req, maps[i]));
						}
					}
					res.send(preparedMaps);
				});
		});

		var sortByPosition = function(arr) 
		{
			return arr.sort(function(a, b) { return a.position - b.position });
		}

		var prepareMapResult = function(req, map) 
		{
			var m = {
				admin: permissions.canAdminMap(req, map)
			};
			var obj = map.toObject();
			for (var k in obj) {
				if (m.admin || (k != 'email' && k != 'adminslug')) {
					m[k] = obj[k];
				}
				if (k == 'layers') {
					for (var i = 0; i < m[k].length; i++) {
						m[k][i] = prepareLayerResult(req, m[k][i], map);
					}
					m[k] = sortByPosition(m[k]);
				}
			}
			return m;
		}

		var prepareLayerResult = function (req, layer, map) 
		{
			// if this is called by prepareMapResult, the layer's toObject() 
			// was already called.
			var layer = layer.toObject ?
				layer.toObject() : layer;

			if (!permissions.canAdminMap(req, map)) {
				delete layer.featureCollection.importParams;
			}

			return layer;
		};

		// Returns a specific map by publicslug
		app.get('/api/map/:publicslug', function(req, res){
			Map.findOne({publicslug: req.params.publicslug})
				.populate('layers.featureCollection')
				.populate('layers.layerOptions')
				.populate('createdBy')
				.populate('modifiedBy')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map', permissions.canViewMap)) return;
					var preparedMap = prepareMapResult(req, map);
					console.log(preparedMap);
			       	res.send(preparedMap);
				});
		});

		// Returns a specific map by adminslug, and sets its admin state to true for current 
		// session
		app.get('/api/map/admin/:adminslug', function(req, res) {	
			Map.findOne({adminslug: req.params.adminslug})
				.populate('layers.featureCollection')
				.populate('layers.layerOptions')
				.populate('createdBy')
				.populate('modifiedBy')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map')) return;
					permissions.canAdminMap(req, map, true);
					req.session.user = map.createdBy;
			       	res.send(prepareMapResult(req, map));
				});
		});

		// Creates and returns a new map
		app.post('/api/map', function(req, res)
		{
			if (!permissions.canCreateMap(req)) {
	            res.send('Cannot create map', 403);
	            return;
			}

			var currDate = Math.round((new Date).getTime() / 1000);
			var collections = {};
			var slugCounter = 1;

			var map = new Map({
				title: req.body.title,
				description: '',
				adminslug: new Buffer(uuid.v4(), 'hex').toString('base64'),
				collections: collections,
			});	

			map.createdBy = map.modifiedBy = req.session.user;

			var makeUniqueSlugAndSave = function() 
			{
				map.publicslug = utils.slugify(req.body.title) + (slugCounter > 1 ? '-' + slugCounter : '');
				if (map.publicslug.match(config.RESERVED_URI)) {
					slugCounter++;
					makeUniqueSlugAndSave();
					return;
				}
			    console.log('post new map, looking for existing slug "'+map.publicslug+'"')
				Map.findOne({publicslug: map.publicslug}, function(err, existingMap) {
					if (handleDbOp(req, res, err, true)) return;
					if (existingMap) {
						console.log('publicslug "' + map.publicslug + '" exists, increasing counter');
						slugCounter++;
						makeUniqueSlugAndSave();
					} else {
						console.log('saving map')
						map.save(function(err, map) {
							if (handleDbOp(req, res, err, map, 'map')) return;
							permissions.canAdminMap(req, map, true);
						 	res.send(prepareMapResult(req, map));
						});
					}
				});
			}

			makeUniqueSlugAndSave();
		});

		// Updates a map 
		app.put('/api/map/:publicslug', function(req, res)
		{
			Map.findOne({publicslug: req.params.publicslug})
				.populate('layers.featureCollection')
				.populate('layers.layerOptions')
				.populate('createdBy')
				.populate('modifiedBy')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map', permissions.canAdminMap)) return;

					var fields = ['title', 'description', 'author', 
						'linkURL', 'twitter', 'initialArea', 'viewOptions', 
						'displayInfo', 'host'];

					for (var i = fields.length - 1; i >= 0; i--) {
						var f = req.body[fields[i]];
						if (f != undefined) {
							map[fields[i]] = f;
							console.log(fields[i], f);
						}
					}

					if (map.host && map.host != '') {
						var split = map.host.split('://');
						map.host = split.pop();
					}

					if (map.linkURL && map.linkURL != '') {
						var split = map.linkURL.split('://');
						map.linkURL = split.pop();
						map.linkURL = (split.length ? split.pop() : 'http') + '://' + map.linkURL;
					}

					if (map.twitter && map.twitter != '') {
						var split = map.twitter.split(/^@/);
						map.twitter = split.pop();
					}

					email = req.body['createdBy.email'];
					var prevEmail = req.body.createdBy ? req.body.createdBy.email : null;

					if (email && email != '' && (!map.createdBy || map.createdBy.email != email)) {
						var user;
						if (map.createdBy) {
							user = map.createdBy;
						} else {
							user = new User();
						}				
						user.email = email;
						user.save(function(err, user) {
							if (err && err.errors.email) {
								err.errors.email.path = 'createdBy.email';
							}
							if (handleDbOp(req, res, err, user, 'user')) return;
							map.createdBy = map.modifiedBy = user;
							map.save(function(err, map) {
								if (handleDbOp(req, res, err, map, 'map')) return;
								console.log('map updated');

								// find again since createdBy and modifiedBy won't be populated after map.save()
								Map.findOne({_id: req.params.mapid})
									.populate('layers.featureCollection')
									.populate('layers.layerOptions')
									.populate('createdBy')
									.populate('modifiedBy')
									.exec(function(err, map) {
										if (handleDbOp(req, res, err, map, 'map')) return;
									 	res.send(prepareMapResult(req, map));
									 	if (prevEmail != user.email && config.SMTP_HOST) {
											console.log('emailing info to user');
										 	utils.sendEmail(user.email, 'Your map URLs', 'urls', {
										 		adminUrl: config.BASE_URL + 'admin/' + map.adminslug,
										 		publicUrl: config.BASE_URL + map.publicslug
										 	});
									 	}
									});
							});
						});
					} else {
						if (email == '') {
							map.createdBy = map.modifiedBy = null;
						}
						map.save(function(err, map) {
							if (handleDbOp(req, res, err, map, 'map')) return;
							console.log('map updated');
						 	res.send(prepareMapResult(req, map));
						});
					}
			  	});
		});

		// Deletes a map
		app.delete('/api/map/:publicslug', function(req, res)
		{
			Map.findOne({publicslug: req.params.publicslug})
				.populate('layers.featureCollection')
				.populate('layers.layerOptions')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map', permissions.canAdminMap)) return;

					while (map.layers.length > 0) {
						map.layers[0].layerOptions.remove();
						map.layers[0].remove();
					}

					map.remove(function(err) {
					    if (handleDbOp(req, res, err, true)) return;
						console.log('map removed');
						res.send({_id: map._id});
					});
			  	});
		});

		// Returns map layer
		app.get('/api/map/:publicslug/layer/:layerId', function(req, res)
		{
			Map.findOne({publicslug: req.params.publicslug})
				.populate('layers.featureCollection')
				.populate('layers.layerOptions')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map', permissions.canViewMap)) return;
					var mapLayer = map.layers.id(req.params.layerId);
					// check if found
					if (handleDbOp(req, res, false, mapLayer, 'map layer')) return;
					// only send if complete; or incomplete was requested 
					if (mapLayer.featureCollection && (mapLayer.featureCollection.status == config.DataStatus.COMPLETE ||
						url.parse(req.url, true).query.incomplete)) {
							res.send(prepareLayerResult(req, mapLayer, map));
					} else {
						res.send('map layer is incomplete', 403);
					}
				});
		});

		// Updates options for a map layer
		app.put('/api/map/:publicslug/layer/:layerId', function(req, res)
		{
			Map.findOne({publicslug: req.params.publicslug})
				.populate('layers.featureCollection')
				.populate('layers.layerOptions')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map', permissions.canAdminMap)) return;
					console.log('updating layer ' + req.body._id + ' for map '+map.publicslug);
					var mapLayer = map.layers.id(req.params.layerId);
					// check if found
					if (handleDbOp(req, res, false, mapLayer, 'map layer')) return;

					var cloneDefaults;
					if (!mapLayer.featureCollection || (mapLayer.featureCollection.defaults 
						&& mapLayer.layerOptions._id.toString() == mapLayer.featureCollection.defaults.toString())) {
							console.warn('Cloning defaults for new layerOptions');
							
							cloneDefaults = function(callback) {
								models.cloneLayerOptionsDefaults(mapLayer.featureCollection, function(err, clone) {
								if (handleDbOp(req, res, err, clone)) return;
									mapLayer.layerOptions = clone._id;
									map.save(function(err, map) {
										// TODO: Can this really not be simplified?
										Map.findById(map._id)
											.populate('layers.featureCollection')
											.populate('layers.layerOptions')
											.exec(function(err, map) {
												if (handleDbOp(req, res, err, map)) return;
												var mapLayer = map.layers.id(req.params.layerId);
												callback(false, mapLayer);
											});
									});
								});
							};

					} else {
						console.warn('Updating existing layerOptions');
						cloneDefaults = function(callback) { callback(false, mapLayer); }
					}

					cloneDefaults.call(mapLayer.featureCollection, function(err, mapLayer) {
						if (handleDbOp(req, res, err, true)) return;

						// set all public elements of layerOptions
						for (var k in req.body.layerOptions) {
							if (k[0] != '_') {
								//console.log(k, req.body.layerOptions[k]);
								mapLayer.layerOptions.set(k, req.body.layerOptions[k]);
							}
						}

						mapLayer.layerOptions.save(function(err, opts) {
							if (handleDbOp(req, res, err, true)) return;

							console.success('layerOptions updated');
							
							if (req.body.position != undefined) {
								var newPosition = parseInt(req.body.position);
								if (!isNaN(newPosition)) {
									var newIndex = newPosition < 0 ? 0 : newPosition >= map.layers.length ? map.layers.length : newPosition,
										sortedLayers = sortByPosition(map.layers),
										oldIndex = sortedLayers.indexOf(mapLayer),
										layerIds = sortedLayers.map(function(obj) { return obj._id });
									var setIndex = function(arr, oldIndex, newIndex) { arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]); };
									setIndex(layerIds, oldIndex, newIndex);
									for (var j = 0; j < layerIds.length; j++) {
										map.layers.id(layerIds[j]).set('position', j);
										//console.log(map.layers.id(layerIds[j]).featureCollection.title, map.layers.id(layerIds[j]).position);
									}
									map.save(function(err, map) {
										if (!handleDbOp(req, res, err, true)) {
											console.log('layer position set to ' + newPosition);
											res.send(prepareLayerResult(req, mapLayer, map));
										}
									});
									return;
								}
							}

							res.send(prepareLayerResult(req, mapLayer, map));
						});
					});
			  	});
		});

		// Creates a new map layer from a point collection
		app.post('/api/map/:publicslug/layer', function(req, res)
		{
			if (!req.body.featureCollection) {
				res.send('no feature collection specified', 403);
			}
			Map.findOne({publicslug: req.params.publicslug})
				.populate('layers.featureCollection')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map', permissions.canAdminMap)) return;
				    GeoFeatureCollection.findOne({_id: req.body.featureCollection._id, $or: [{active: true}, 
				    	// TODO: check ownership instead of (unreliably) checking for status
				    	{status: {$in: [config.DataStatus.IMPORTING]}}]})
				    	.populate('defaults')
				    	.exec(function(err, collection) {
							if (handleDbOp(req, res, err, collection, 'collection')) return;


							if (!collection.defaults) {
								console.warn('Creating new layerOptions');
								getDefaults = function(callback) {
									// TODO: the GeoFeatureCollection has no defaults, due to a bug.
									// create new:
									models.cloneLayerOptionsDefaults(collection, callback);
								};
							} else {
								// Until overwritten by the user, the new layer will use the GeoFeatureCollection's
								// default settings.
								console.warn('Using defaults for layerOptions');
								getDefaults = function(callback) { callback(false, collection.defaults); }
							}

							getDefaults.call(collection, function(err, layerOptions) {
								var sortedLayers = sortByPosition(map.layers);
							    var layer = {
							    	// set _id so it can be referenced below
							    	_id: new mongoose.Types.ObjectId(),
							    	featureCollection: collection,
							    	layerOptions: layerOptions,
							    	position: (sortedLayers.length ? 
							    		(sortedLayers[sortedLayers.length - 1].position != null ?
							    		sortedLayers[sortedLayers.length - 1].position + 1 : null) : 0)
							    };    

						      	map.layers.push(layer);
						      	map.save(function(err, map) {
								    if (handleDbOp(req, res, err, map)) return;
							        console.log("map layer created");
									Map.findOne({_id: map._id})
										.populate('layers.featureCollection')
										.populate('layers.layerOptions')
										.exec(function(err, map) {
										    if (handleDbOp(req, res, err, map)) return;
									       	res.send(prepareLayerResult(req, map.layers.id(layer._id), map));
										});
							  	});
							});

					    });
			    });
		});

		// Deletes a map layer from a map
		app.delete('/api/map/:publicslug/layer/:layerId', function(req, res)
		{
			Map.findOne({publicslug: req.params.publicslug})
				.populate('layers.featureCollection')
				.populate('layers.layerOptions')
				.exec(function(err, map) {
					if (handleDbOp(req, res, err, map, 'map', permissions.canAdminMap)) return;
					var mapLayer = map.layers.id(req.params.layerId);
					if (mapLayer) {
						mapLayer.remove();
					}
					map.save(function(err) {
						if (handleDbOp(req, res, err, true)) return;
						console.log('map layer deleted');
						res.send({_id: mapLayer._id});
					});
			  	});
		});
	}
};

module.exports = MapAPI;
