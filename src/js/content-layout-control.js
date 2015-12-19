( function( $ ) {
	/**
	 * Namespace for base controls, models, collections and views used by the
	 * Content Layout control. Individual component models and views are defined
	 * separately in /components.
	 *
	 * @since 0.1
	 */
	var clc = wp.customize.ContentLayoutControl = {};

	/**
	 * Define models
	 *
	 * Each component should have a corresponding model that extends the
	 * Component model.
	 *
	 * @since 0.1
	 */
	clc.Models = {
		/**
		 * Base component model
		 *
		 * @augments Backbone.Model
		 * @since 0.1
		 */
		Component: Backbone.Model.extend({
			defaults: {
				id:          0,
				name:        '',
				description: '',
				type:        '',
				order:       0
			}
		}),

		/**
		 * Hash of component models
		 *
		 * @since 0.1
		 */
		components: {}
	};

} )( jQuery );
