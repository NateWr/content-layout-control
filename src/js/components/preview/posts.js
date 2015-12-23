( function( $ ) {

	var clc = wp.customize.ContentLayoutControl;

	/**
	 * View class for the Posts layout
	 *
	 * @augments wp.customize.ContentLayoutControl.Views.BaseComponentForm
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.component_previews.posts = clc.Views.BaseComponentPreview.extend();

} )( jQuery );
