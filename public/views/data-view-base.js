window.DataViewBase = Backbone.View.extend({

    tagName: 'div',
	className: 'data-inspector',
	
    events: {
		'click #removeData:' : 'removeDataClicked',
		'click #editData:' : 'editDataClicked',
		'click #updateData' : 'updateDataClicked',

		'click .color-type:' : 'colorTypeChanged',
		'click .feature-type:' : 'featureTypeChanged',
		'click .legend-button:' : 'visibilityChanged',
		'click .visibility:' : 'visibilityChanged',
		
		'click #colorInput' : 'colorInputClicked',
		'click #colorInputLow' : 'colorInputLowClicked',
		'click #colorInputHigh' : 'colorInputHighClicked',
		
    },

    initialize: function(options) {
		this.vent = options.vent;
	    this.template = _.template(tpl.get('data-inspector'));
		this.collectionId = options.collectionId;
		this.title = options.mapLayer.pointCollection.title;
		this.collection = options.collection;
		this.mapLayer = options.mapLayer;
		
		this.colors = [];
		this.colorType = null;
		this.featureType = null;
		this.visible = true;
		
		this.collection.bind('add', this.addOne, this);
		this.collection.bind('reset', this.addAll, this);
    },

    updateStatus: function() {
		var status = formatLargeNumber(this.collection.originalCount) + ' of ' + formatLargeNumber(this.collection.fullCount);
		this.$(".status").html(status);
    },

    render: function() {
		var self = this;
		$(this.el).html(this.template());
		$(this.el).addClass(this.mapLayer.pointCollection.collectionId);
				
		if (this.title != '') {
			dataTitle = this.title;
		} else {
			dataTitle = "Untitled Data";
		}

		this.updateStatus();

		this.$(".title").html(dataTitle);
		this.$(".title").attr("href", "#collapse" + this.collectionId);
		this.$("#collapse").attr("id", "collapse" + this.collectionId);

		if(!_admin) {
			this.$('#adminDataControls').remove();
		}
		
		this.$("#colorInput").miniColors({
		    change: function(hex, rgb) 
			{ 
				self.enableUpdateButton();
			}});
		this.$("#colorInput").miniColors('value','#0aa5ff');
		
		this.$("#colorInputLow").miniColors({
		    change: function(hex, rgb) 
			{ 
				self.enableUpdateButton();
			}});
		this.$("#colorInputLow").miniColors('value','#333');
		
		this.$("#colorInputHigh").miniColors({
		    change: function(hex, rgb) 
			{ 
				self.enableUpdateButton();
			}});
		this.$("#colorInputHigh").miniColors('value','#fff');
	

		this.setParameters();
		this.initHistogram();
	
        return this;
    },

    initGradientEditor: function() {
    	var colors = [];
    	var self = this;
    	for (var i = 0; i < this.colors.length; i++) {
			colors[i] = {
				color: this.colors[i].color,
				position: this.colors[i].position || 0.0
			};
    	}
    	if (colors.length == 1) {
    		colors[1] = {
				color: colors[0].color,
				position: 1.0
			};
    	}

		this.$("#gradientEditor").gradientEditor({
				width: 220,  
				height: 30,
				stopWidth: 12,
				stopHeight: 10,
				initialColor: "#ff00ff",
				onChange: function(colors) {
					self.colors = colors;
					self.enableUpdateButton();
				},
				colors: colors
		});
    },

	initHistogram: function()
	{	
		var self = this;
		var graphEl = self.$('.histogram');
		if (!graphEl.length) return;
		$.ajax({
			type: 'GET',
			url: '/api/histogram/' + this.collection.collectionId,
			success: function(data) {
				var graph = new Rickshaw.Graph({
					element: graphEl[0],
					renderer: 'bar',
					width: graphEl.innerWidth(), 
					height: graphEl.innerHeight(),
					series: [
						{
							data: data,
							color: '#fff' 
						}
					]
				});

				graph.render();
				
			},
			error: function() {
				console.error('failed to fetch histogram');
			}
		});
	},

	setParameters: function()
	{
		var self = this;
		var options = this.mapLayer.options;

		this.colors = options.colors;
		this.colorType = options.colorType;
		this.featureType = options.featureType;
		this.visible = options.visible;

		this.featureTypeChanged();
		this.colorTypeChanged();
		this.visibilityChanged();

		for (var k in options) {
			var input = this.$('[name='+k+']');
			if (input.length) {
				input.val(options[k]);
				input.change(function() {
					self.enableUpdateButton();
				});
			}
		}

		for (var i = 0; i < this.colors.length; i++) {
			var val;
			if (this.colors.length > 1 && this.colorType == ColorType.LINEAR_GRADIENT) {
				val = formatDecimalNumber(this.mapLayer.pointCollection.minVal + this.colors[i].position * (this.mapLayer.pointCollection.maxVal - this.mapLayer.pointCollection.minVal));
				if (i == this.colors.length - 1 && this.colors[i].position < 1) {
					val += '+';
				}			
			} else {
				val = formatDecimalNumber(this.mapLayer.pointCollection.minVal) + '–' + formatDecimalNumber(this.mapLayer.pointCollection.maxVal);
			}
			var li = '<li style="width: '+Math.floor(100 / this.colors.length)+'%;">'
				+ '<div class="segment" style="background: '+this.colors[i].color+'">'+val+'</div></li>';
			this.$('.color-bar').append(li);
		}

		this.$("#colorInput").miniColors('value', this.colors[0].color);
		this.initGradientEditor();
		this.disableUpdateButton();
	},

	removeDataClicked: function()
	{
		var self = this;
		$(this.el).fadeOut('fast');
		self.collection.reset();
		self.collection.unbindCollection();
   	},

	updateDataClicked: function()
	{
		//build json and update
		var self = this;
		//this.collection.unbindCollection();
				
		if (this.colorType == ColorType.SOLID) {
			this.colors = [{color: this.$('#colorInput').val()}];
		}
		
		var postData = {
			visible: this.visible,
			colorType: this.colorType,
			colors: this.colors,
			featureType: this.featureType,
			opacity: this.$('[name=opacity]').val(),
			title: this.$('[name=title]').val(),
			description: this.$('[name=description]').val(),
			unit: this.$('[name=unit]').val(),
			altUnit: this.$('[name=altUnit]').val()
		};
		
		$.ajax({
			type: 'POST',
			url: '/api/updatemapcollection/' + _mapId + '/' + this.collection.collectionId,
			dataType: 'json',
			data: postData,
			success: function(data) {
				self.disableUpdateButton();
				self.updateLegend();
				self.vent.trigger("redrawCollection", {collectionId: self.collectionId, 
					updateObject: postData});
			},
			error: function() {
				console.error('failed to join map with collection');
			}
		});	
			
	},

	editDataClicked: function()
	{
		var self = this;
		
		if(this.editDataView)
			this.editDataView.remove();
			
		this.editDataView = new EditDataView({vent: this.vent, collection:this.collection});
        $('body').append(this.editDataView.render().el);
		$('#editDataModal').modal('toggle');
   	},

	displayDataState: function(state)
	{
		console.log('Currently: ' + state);
	},

	updateLegend: function() {
		if (this.visible) {
			$(this.el).addClass('visible');
			$(this.el).removeClass('hidden');
		} else {
			$(this.el).removeClass('visible');
			$(this.el).addClass('hidden');
		}

		switch(this.colorType) {
			case ColorType.SOLID: 
				this.$('.legend-button').css('background-color', this.color);
				break;
			case ColorType.LINEAR_GRADIENT: 
				this.$('.legend-button').css('background-color', this.colorLow)	
				break;
		}

		for (t in FeatureType) {
			if (FeatureType[t] == this.featureType) {
				this.$('.legend-button').addClass(FeatureType[t]);
			} else {
				this.$('.legend-button').removeClass(FeatureType[t]);
			}
		}
	},

	addOne: function(data) {
		var self = this;
    },

    addAll: function() {
	    /*var self = this;
		this.collection.each(function(data){ 
		self.addOne(data);
	 	});*/
		this.updateStatus();
    },

	enableUpdateButton: function()
	{
		this.$('#updateData').removeClass('disabled');
		this.$('#updateData').addClass('btn-primary');
	},
	
	disableUpdateButton: function()
	{
		this.$('#updateData').removeClass('btn-primary');
		this.$('#updateData').addClass('disabled');
	},

	colorInputClicked: function()
	{
		this.enableUpdateButton();
	},
	
	colorInputLowClicked: function()
	{
		this.enableUpdateButton();
	},
	
	colorInputHighClicked: function()
	{
		this.enableUpdateButton();
	},

	featureTypeChanged: function(evt)
	{
		var self = this;
		if (evt) {
			var val = $(evt.currentTarget).val();
			if (val == this.colorType) return;
			this.featureType = val;
			this.enableUpdateButton();
		}

		this.$('.feature-type').each(function() {
			if ($(this).val() == self.featureType) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});

		this.$('.feature-settings').each(function() {
			if ($(this).hasClass(self.featureType)) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	},

	colorTypeChanged: function(evt)
	{
		var self = this;
		if (evt) {
			var val = $(evt.currentTarget).val();
			if (val == this.colorType) return;
			this.colorType = val;
			this.enableUpdateButton();
		}

		this.$('.color-type').each(function() {
			if ($(this).val() == self.colorType) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});

		switch (this.colorType) {
			case ColorType.SOLID: 
				this.$('.color-gradient').hide();
				this.$('.color-solid').show();
				this.updateLegend();
				break;
			case ColorType.LINEAR_GRADIENT: 
			  	this.$('.color-gradient').show();
				this.$('.color-solid').hide();
				this.updateLegend();
			  	break;
		}
	},

	visibilityChanged: function(evt)
	{
		var self = this;
		if (evt) {
			if (!$(evt.currentTarget).hasClass('toggle')) {
				var val = $(evt.currentTarget).val();
				val = Number(val) != 0;
				if (val == this.visible) return;
				this.visible = val;
			} else {
				this.visible = !this.visible;
			}
			this.enableUpdateButton();
			this.vent.trigger("toggleLayerVisibility", this.collectionId, this.visible);
		}

		this.$('.visibility').each(function() {
			var val = $(this).val();
			val = Number(val) != 0;
			if (val == self.visible) {
				$(this).addClass('active');
			} else {
				$(this).removeClass('active');
			}
		});

		this.updateLegend();
	}

});