define(["jquery","underscore","backbone","config","utils","text!templates/setup.html","views/modal-view"],function(e,t,n,r,i,s,o){var u=o.extend({tagName:"div",className:"setup-view modal fade",events:{"click #deleteMapButton":"deleteMapClicked","click #saveCloseButton":"saveClicked"},initialize:function(e){this.template=t.template(s),this.vent=e.vent,this.mapInfo=e.mapInfo,this.mapInfoChanged=!1,t.bindAll(this,"updateMapInfo"),e.vent.bind("updateMapInfo",this.updateMapInfo)},updateMapInfo:function(t){var n=this;t&&(this.mapInfo=t),this.$(".map-name").html(this.mapInfo.title+" Setup"),this.mapInfoFields.each(function(){e(this).removeClass("error");var t=this.name.split(".");t.length==2?n.mapInfo[t[0]]&&e(this).val(n.mapInfo[t[0]][t[1]]):e(this).val(n.mapInfo[this.name])}),this.$(".map-url").val(app.genPublicURL()),this.$(".map-admin-url").val(app.genAdminURL())},render:function(){var t=this;return e(this.el).html(this.template()),this.$(".map-url, .map-admin-url").click(function(){e(this).select()}),this.$(".enter-email").click(function(){return e("#tab-setup-metadata").trigger("click"),!1}),this.mapInfoFields=this.$("#setup-metadata input, #setup-metadata textarea, #setup-custom-domain input"),this.mapInfoFields.each(function(){e(this).on("change keydown",function(){t.mapInfoChanged=!0,t.$("#saveCloseButton").text(__("Save & close"))})}),e(this.el).on("hidden",function(){app.navigate(app.genMapURI(null))}),this.updateMapInfo(),this},saveClicked:function(){console.log("saveClicked",this.mapInfoChanged);if(!this.mapInfoChanged)return this.close(),!1;var t={};this.mapInfoFields.each(function(){t[this.name]=e(this).val()});var n=this;return this.$("#saveCloseButton").attr("disabled",!0),e.ajax({type:"POST",url:"/api/map/"+n.mapInfo._id,data:t,success:function(e){n.close(),n.vent.trigger("updateMapInfo",e),n.$("#saveCloseButton").attr("disabled",!1),n.mapInfoChanged=!1},error:function(t,r,i){var s=e.parseJSON(t.responseText);console.error("failed to update map: "+n.mapInfo._id);if(s&&s.errors){n.mapInfoFields.removeClass("error");for(var o in s.errors)e('[name="'+s.errors[o].path+'"]',this.mapInfoFields).addClass("error");console.error("errors:",s.errors)}n.$("#saveCloseButton").attr("disabled",!1)}}),!1},deleteMapClicked:function(t){var n=this;return window.confirm(__("Are you sure you want to delete this map? This action cannot be reversed!"))&&e.ajax({type:"DELETE",url:"/api/map/"+n.mapInfo._id,success:function(){console.log("deleted map: "+n.mapInfo._id),window.location="/"},error:function(e){console.error("failed to delete map: "+n.mapInfo._id)}}),!1}});return u});