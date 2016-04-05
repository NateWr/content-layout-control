( function( $ ) {

	var clc = wp.customize.ContentLayoutControl;

	/**
	 * Model class for the Content Block component
	 *
	 * @augments Backbone.Model
	 * @since 0.1
	 */
	clc.Models.components['content-block'] = clc.Models.Component.extend({
		defaults: function() {
			return {
				name:           '',
				description:    '',
				type:           'content-block',
				image:          0,
				image_position: 'left',
				title:          '',
				content:        '',
				links:          [],
				order:          0
			};
		}
	});

} )( jQuery );
