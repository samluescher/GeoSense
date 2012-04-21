var GRID_MIN = .5;
var GRID_MAX = 1;
var GRID_STEP = .5;
var OUT_INDEX = {'value.loc': '2d'};

var lpad = function(str, padString, length) {
	var str = new String(str);
    while (str.length < length)
        str = padString + str;
    return str;
}

var ReductionKey = {
	copy: function(value) {
		return value;
	},
	Daily: function(t) {
		this.get = function(t) {
			return [
				t.getFullYear()+''+lpad(t.getMonth(), '0', 2)+''+lpad(t.getUTCDate(), '0', 2),
				new Date(t.getFullYear(), t.getMonth(), t.getUTCDate())
			];	
		};
		this.name = 'daily';
		this.index = function(collection, field_name) {
			var index = {};
			index[field_name] = 1;
			collection.ensureIndex(index);
			return (collectionHasIndex(collection, index));
		}
		return this;
	},
	Weekly: function(t) {
		this.get = function(t) {
			var onejan = new Date(t.getFullYear(), 0, 1);
			var week = Math.ceil((((t - onejan) / 86400000) + onejan.getDay() + 1) / 7);
			var day = t.getDay(),
		      diff = t.getDate() - day + (day == 0 ? -6 : 1);
			return [
				t.getFullYear() + '' + lpad(week, '0', 2),
				new Date(t.setDate(diff))
			];
		};
		this.name = 'weekly';
		this.index = function(collection, field_name) {
			var index = {};
			index[field_name] = 1;
			collection.ensureIndex(index);
			return (collectionHasIndex(collection, index));
		}
		return this;
	},
	Yearly: function(t) {
		this.get = function(t) {
			return [
				t.getFullYear(),
				new Date(t.getFullYear(), 0, 1)
			];
		};
		this.name = 'yearly';
		this.index = function(collection, field_name) {
			var index = {};
			index[field_name] = 1;
			collection.ensureIndex(index);
			return (collectionHasIndex(collection, index));
		}
		return this;
	},
	LocGrid: function(grid_size) {
		this.grid_size = grid_size;
		this.get = function(loc) {
			var grid_size = this.grid_size;
			if (!loc || isNaN(parseFloat(loc[0])) || isNaN(parseFloat(loc[1]))
				|| loc[0] < -180 || loc[0] > 180 || loc[1] < -180 || loc[1] > 180) return;
			var lng = loc[0];
			var lat = loc[1];
			// Mongo manual: The index space bounds are inclusive of the lower bound and exclusive of the upper bound.
			if (lng == 180) {
				lng = -180;
			}
			if (lat == 180) {
				lat = -180;
			}
			var grid_lng = Math.round((lng - lng % grid_size) / grid_size);
			var grid_lat = Math.round((lat - lat % grid_size) / grid_size);
			var loc = [grid_lng * grid_size, grid_lat * grid_size];
			return [
				grid_lng + ',' + grid_lat + ',' + grid_size, 
				[grid_lng * grid_size, grid_lat * grid_size]
			];
		};
		this.name = 'loc-'+this.grid_size;
		this.index = function(collection, field_name) {
			var index = {};
			index[field_name] = '2d';
			collection.ensureIndex(index);
			return (collectionHasIndex(collection, index));
		}
		return this;
	}
};
var runGridReduce = function(collection, reduced_collection, value_fields, reduction_keys, indexes, options) {
	var map = function() {
		var keyValues = [];
		var e = {};
		for (var k in reduction_keys) {
			var f = reduction_keys[k].get || reduction_keys[k];
			var keyValue = f.call(reduction_keys[k], this[k]);
			if (!keyValue) return;
			if (keyValue instanceof Array) {
				keyValues.push(keyValue[0]);
				e[k] = keyValue[1];
			} else {
				keyValues.push(keyValue);
				e[k] = keyValue;
			}
		}
		var key = keyValues.join('|');
		for (var k in value_fields) {
			var value_field = value_fields[k];
			e[value_field] = {
				sum: this[value_field],
				count: 1
			};
		}
		emit(key, e);
	};
	var reduce = function(key, values) {
		var reduced = {};
		for (var k in reduction_keys) {
			reduced[k] = values[0][k];
		}
		for (var k in value_fields) {
			var value_field = value_fields[k];
			reduced[value_field] = {
				sum: 0,
				count: 0
			};
		}
		values.forEach(function(doc) {
			for (var k in value_fields) {
				var value_field = value_fields[k];
				reduced[value_field].sum += doc[value_field].sum;
				reduced[value_field].count += doc[value_field].count;
			}
		});
		return reduced;
	};
	var finalize = function(key, value) {
		for (var k in value_fields) {
			var value_field = value_fields[k];
			value[value_field].avg = value[value_field].sum / value[value_field].count;
		}
		return value;
	};
	db[reduced_collection].drop();
	if (!value_fields) {
		value_fields = ['val'];
	}
	var params = {
		mapreduce: collection
		,map: map
		,reduce: reduce
		,finalize: finalize
		,out: {reduce: reduced_collection}
		,scope: {
			value_fields: value_fields,
			reduction_keys: reduction_keys,
			lpad: lpad
		}
		,verbose: true
		,keeptemp: true
	};
	if (options) {
		for (k in options) {
			params[k] = options[k];
		}
	} 
	var info = [];
	for (var k in reduction_keys) {
		info.push(reduction_keys[k].name || k);
	}
	print('* reducing '+collection+' to '+reduced_collection+' with key: '+info.join(' | ')+' ...');
	var op = db.runCommand(params);
	if (op.ok) {
		for (var k in reduction_keys) {
			if (reduction_keys[k].index) {
				var field_name = 'value.' + k;
				print('* building index for '+field_name+' ...');
				if (!reduction_keys[k].index.call(reduction_keys[k], 
						db[reduced_collection], field_name)) {
					print('ERROR: could not build index');
					return false;
				}
			}
		}
		if (indexes) {
			for (var k in indexes) {
				var field_name = 'value.' + k;
				print('* building index for '+field_name+' ...');
				var index = {};
				index[field_name] = indexes[k];
				db[reduced_collection].ensureIndex(index);
				if (!collectionHasIndex(db[reduced_collection], index)) {
					print('ERROR: could not build index');
					return false;
				}
			}
		}
		print('SUCCESS: reduced '+op.counts.input+' records to '+op.counts.output);
		return true;
	} else {
		print('ERROR: '+op.assertion);
		return false;		
	}
};

var collectionHasIndex = function(collection, key) {
	var indexes = collection.getIndexes();
	for (var i = 0; i < indexes.length; i++) {
		for (var j in key) {
			if (indexes[i].key[j] && indexes[i].key[j] == key[j]) {
				return true;
			}
		}
	}
	return false;
};

var reducePoints = function(reduction_keys) {
	var collection = 'points';
	var info = ['r', collection];
	for (var k in reduction_keys) {
		if (reduction_keys[k].name) {
			info.push(reduction_keys[k].name);
		}
	}
	var reduced_collection = info.join('_');
	db[reduced_collection].drop();
	return runGridReduce(collection, reduced_collection, ['val'], reduction_keys, {
		count: 1,
		avg: 1
	}, {
		limit: null
	});
};

use geo;

for (var grid_size = GRID_MIN; grid_size <= GRID_MAX; grid_size += GRID_STEP) {
	reducePoints({
		collectionid: ReductionKey.copy, 
		loc: new ReductionKey.LocGrid(grid_size), 
		datetime: new ReductionKey.Weekly()
	});
	reducePoints({
		collectionid: ReductionKey.copy, 
		loc: new ReductionKey.LocGrid(grid_size), 
		datetime: new ReductionKey.Yearly()
	});
	reducePoints({
		collectionid: ReductionKey.copy, 
		loc: new ReductionKey.LocGrid(grid_size), 
		datetime: new ReductionKey.Daily()
	});
}
