window.SideBarView = Backbone.View.extend({

    tagName: 'div',
	className: 'sidebar-view',
	
    events: {
		'click #light_theme': 'lightFilterClicked',
		'click #dark_theme': 'darkFilterClicked',
		'click #standard_theme': 'standardFilterClicked',
		'click #display2D': 'display2DClicked',
		'click #display3D': 'display3DClicked',
		'click #addData': 'addDataClicked',
    },

    initialize: function(options) {
	    this.template = _.template(tpl.get('sidebar'));
		this.vent = options.vent;
		this.page = options.page;
		
		_.bindAll(this, "renderDataToggles");
	 	options.vent.bind("renderDataToggles", this.renderDataToggles);		
		
		this.collection.bind('add',   this.addOne, this);
	    this.collection.bind('reset', this.addAll, this);
	    this.collection.bind('all',   this.render, this);

	    //this.collection.fetch();
    },

    render: function() {
		$(this.el).html(this.template());	
				
		if(this.page == 'map')
		{
			this.$('#display2D').addClass('active');
			
		}
		else if (this.page =='map-gl')
		{
			this.$('#themeToggleGroup').hide();
			this.$('#display3D').addClass('active');
		}
					
        return this;
    },

	renderDataToggles: function(url){
		
		this.$('#accordion').empty();
		
		for (i=1; i<= num_data_sources; i++)
		{
			this.addDataToggle({number:i,url:url});
		}
	},

	addDataToggle: function(options) {
		
		this.sideBarDataView = new SideBarDataView({vent: this.vent, url: options.url});
        this.$('#accordion').append(this.sideBarDataView.render({number: options.number}).el);
	},
	
	removeDataToggle: function() {
		
	},

	lightFilterClicked: function() {
		this.vent.trigger("updateMapStyle", 'light');
	},

	darkFilterClicked: function() {
		this.vent.trigger("updateMapStyle", 'dark');
	},
	
	standardFilterClicked: function() {
		this.vent.trigger("updateMapStyle", 'standard'); 
	},
	
	display2DClicked: function() {
		//Todo: Replace with proper routing
		app.navigate("", {trigger: false});
		window.location.href = '';
	},

	display3DClicked: function() {
		//Todo: Replace with proper routing
		app.navigate("globe", {trigger: false});
		window.location.href = '/#globe';
	},
	
	addDataClicked: function() {
		this.addDataView = new AddDataView({vent: this.vent});
        $('body').append(this.addDataView.render().el);
		$('#addDataModal').modal('toggle');
		this.collection.create({text: 'hello sir bob!'});
	},
	
	addOne: function(comment) {
		var self = this;
		console.log('comment: ' + comment.get('text'))	
    },

    addAll: function() {
      var self = this;
		this.collection.each(function(comment){ 
		self.addOne(comment);
	 	});
    }

});