( function( $ ) {

	var clc = wp.customize.ContentLayoutControl;

	/**
	 * Model class for the Content Block component
	 *
	 * @augments Backbone.Model
	 * @since 0.1
	 */
	clc.Models.component_models['content-block'] = clc.Models.Component.extend({
		defaults: {
			id:          0,
			name:        '',
			description: '',
			type:        'content-block',
			image:       0,
			title:       '',
			content:     ''
		}
	});

	/**
	* View class for the Content Block layout
	*
	* @augments wp.customize.ContentLayoutControl.Views.BaseComponentForm
	* @augments wp.Backbone.View
	* @since 0.1
	*/
	clc.Views.component_views['content-block'] = clc.Views.BaseComponentForm.extend({
		template: wp.template( 'clc-component-content-block' ),

		events: {
			'click .delete': 'remove',
			'blur [data-clc-setting-link]': 'updateLinkedSetting'
		}
	});

} )( jQuery );
