define([
	'jquery',
	'underscore',
	'backbone',
], function($, _, Backbone) {
	var GeoFeature = Backbone.Model.extend({
		
		idAttribute: "_id",
		
		getRenderAttributes: function()
		{
            var l = this.collection.mapLayer,
                options = l.getLayerOptions(),
                extremes = l.getExtremes(),
                min = extremes.minVal,
                max = extremes.maxVal,
                val = this.get('val'),
                colors = l.getNormalizedColors();

            if (val && val.avg != null) {
                val = val.avg;
            }

            var count = this.get('count'),
                normVal = (val - min) / (max - min),
                normCount = count / extremes.maxCount,
                color,
                colorType = val != null ? options.colorType : ColorType.SOLID,
                size;

            switch (colorType) {
                case ColorType.SOLID: 
                    color = colors[0].color;
                    break;
                case ColorType.LINEAR_GRADIENT:
                case ColorType.PALETTE:
                    var colorPos;
                    switch (options.featureColorAttr) {
                        case 'count':
                            color = l.colorAt(normCount);
                            break;
                        default:
                        case 'val.avg':
                            color = l.colorAt(normVal);
                            break;
                    }
                    break;
            }

            switch (options.featureSizeAttr) {
                default:
                case 'count':
                    size = normCount;
                    break;
                case 'val.avg':
                    size = normVal;
                    break;
            };

            return {
                color: color,
                darkerColor: multRGB(color, .75),
                min: min,
                max: max,
                model: this,
                data: {
                    val: val,
                    normVal: normVal,
                    count: count,
                },
                size: size
            };

		}
	});

	return GeoFeature;
});