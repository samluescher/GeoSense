// Good defaults for Safecast and Earthquakes
o = db.pointcollections.findOne({$or: [{"title" : "Safecast"}, {"title" : "measurements.csv"}]});
if (o) {
	db.pointcollections.update({_id: o._id}, {$set:
		{
			"title": "Safecast",
			"description": "Safecast is a global sensor network for collecting and sharing radiation measurements to empower people with data about their environments.",
			"source": "Safecast.org",
			"unit": "cpm",
			"altUnit": ["μSv/h"],
		}
	}, false, true);
	db.layeroptions.update({_id: o.defaults}, {$set: 
		{
			"visible" : true,
			"featureType" : "C",
			"colors" : [
				{
					"absPosition" : 10,
					"color" : "#0785a8",
					"interpolation": "threshold",
					"description": "basically no contamination"
				},
				{
					"absPosition" : 100, //0.3 * 350,
					"color" : "#ff00ff",
					"description": "minor contamination"
				},
				{
					"absPosition" : 0.5 * 350,
					"color" : "#ff1111",
					"description": "moderate contamination"
				},
				{
					"absPosition" : 1.0 * 350,
					"color" : "#ff8800",
					"description": "high contamination"
				},
				{
					"absPosition" : 1000, // 3.0 * 350,
					"color" : "#ffdc00",
					"description": "evacuation mandatory"
				},
				{
					"absPosition" : 10.0 * 350,
					"color" : "#ffff88",
					"description": "extremely high contamination"
				}
			],
			"colorType" : "L",
			"cropDistribution" : true,
			"valFormat": [
				{
				},
				{
					"unit": 'μSv/h',
					"eq": '%(val)f/350'
				}
			]
		}
	});

	print('Updated Safecast');
}

o = db.pointcollections.findOne({"title" : /Earthquakes.*/i});
if (o) {
	db.pointcollections.update({_id: o._id}, {$set:
		{
			"title": "Earthquakes 1973–2011",
			"description": "A global record of earthquakes with magnitude 4.5 or greater.",
			"source": "USGS/NEIC (PDE) 1973–2011",
			"unit": "Magnitude" 
		}
	}, false, true);
	db.layeroptions.update({_id: ObjectId(o.defaults)}, {$set:  
		{
			"visible" : true,
			"featureType" : "B",
			"colors" : [
				{
					"position" : 0,
					"color" : "#00C9FF"
				},
				{
					"position" : 0.21818181818181817,
					"color" : "#7fffd0"
				},
				{
					"position" : 0.45,
					"color" : "#e9ff45"
				}
			],
			"colorType" : "L",
			"opacity" : 0.3,
		}
	});
	print('Updated Earthquakes');
}


o = db.pointcollections.findOne({"title" : /Reactors.*/i});
if (o) {
	db.pointcollections.update({_id: o._id}, {$set:
		{
			"title": "Nuclear Reactors",
			"source": "World Nuclear Association",
			"unit": "MW" 
		}
	}, false, true);
	db.layeroptions.update({_id: ObjectId(o.defaults)}, {$set:  
		{
			"visible" : true,
			"featureType" : "P",
			"colors" : [
				{
					"position" : 0,
					"color" : "#bbbbbb"
				},
			],
			"colorType" : "S",
			"opacity" : 0.75,
			"datetimeFormat": '%Y'
		}
	});
	print('Updated Reactors');
}

