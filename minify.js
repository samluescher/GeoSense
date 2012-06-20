var compressor = require('node-minify');


new compressor.minify({
    type: 'yui-js',
    fileIn: [
        
        'public/libs/jquery.1.7.1.min.js',
        'public/libs/jquery.miniColors.min.js',
        'public/libs/jquery-ui.min.js',
        'public/libs/jquery.ui.touch-punch.min.js',
        'public/libs/jquery.color.js',
        'public/libs/jquery.glowing.js',
        'public/libs/json2.js',
        'public/libs/color_gradient.js',
        'public/libs/proj4js-compressed.js',
        'public/libs/date.js',
        'public/libs/d3.v2.min.js',
        'public/libs/rickshaw.min.js',
        'public/libs/underscore.js',
        'public/libs/backbone.js',
        'public/libs/utils.js',
        'public/libs/three/build/Three.js',
        'public/libs/ShaderExtras.js',
        'public/libs/postprocessing/EffectComposer.js',
        'public/libs/postprocessing/MaskPass.js',
        'public/libs/postprocessing/RenderPass.js',
        'public/libs/postprocessing/ShaderPass.js',
        'public/libs/postprocessing/BloomPass.js',
        'public/libs/map-gl-libs/THREEx.point-widgets.js',
        'public/libs/threex/THREEx.WindowResize.js',
        'public/libs/Tween.js',
        'public/libs/globe.js',
        'public/libs/stats.js',
        'public/libs/gradient-editor/gradient-editor.js',
        'public/libs/colorpicker/js/colorpicker.js',
        'public/libs/OpenLayers.js',
        'public/libs/OpenLayers-extended.js',
        'public/libs/bootstrap/bootstrap-transition.js',
        'public/libs/bootstrap/bootstrap-alert.js',
        'public/libs/bootstrap/bootstrap-modal.js',
        'public/libs/bootstrap/bootstrap-dropdown.js',
        'public/libs/bootstrap/bootstrap-tab.js',
        'public/libs/bootstrap/bootstrap-tooltip.js',
        'public/libs/bootstrap/bootstrap-popover.js',
        'public/libs/bootstrap/bootstrap-button.js',
        'public/libs/bootstrap/bootstrap-collapse.js',
        'public/libs/infobox.js',
    	'public/app.js',
    	'public/config.js',
    	'public/utils.js',
    	'public/models/point.js',
    	'public/collections/point-collection.js',
    	'public/models/tweet.js',
    	'public/collections/tweet-collection.js',
    	'public/models/comment.js',
    	'public/collections/comment-collection.js',
    	'public/views/map-view-base.js',
		'public/views/homepage-view.js',
		'public/views/setup-view.js',
		'public/views/map-ol-view.js',
		'public/views/map-gl-view.js',
		'public/views/header-view.js',
		'public/views/data-view-base.js',
		'public/views/data-inspector-view.js',
		'public/views/data-legend-view.js',
		'public/views/sidebar-view.js',
		'public/views/modal-view.js',
		'public/views/add-data-view.js',
		'public/views/edit-data-view.js',
		'public/views/chat-view.js',
		'public/views/data-library-view.js',
		'public/views/graph-view.js',
		'public/views/data-info-view.js'
    ],

    fileOut: 'public/miniapp.js',
    callback: function(err){
        console.log(err);
    }
});