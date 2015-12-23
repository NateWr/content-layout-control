( function( $ ) {

	var clc = wp.customize.ContentLayoutControl;

	/**
	 * Model class for the Posts component
	 *
	 * @augments Backbone.Model
	 * @since 0.1
	 */
	clc.Models.components.posts = clc.Models.Component.extend({
		defaults: {
			name:           '',
			description:    '',
			type:           'posts',
			title:          '',
			posts:          [],
			order:          0
		}
	});

} )( jQuery );
