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
	clc.Views.component_views['content-block'] = clc.Views.BaseComponentLayout.extend({
		/**
		* Initialize
		*
		* @since 0.1
		*/
		initialize: function( options ) {
			this.listenTo( this.model, 'change', this.load );
			_.bindAll( this, 'settingChanged' );
			wp.customize.preview.bind( 'component-setting-changed-' + this.model.get( 'id' ) +'.clc', this.settingChanged );
		},

		/**
		 * Update the text settings immediately in the browser
		 *
		 * @since 0.1
		 */
		settingChanged: function( data ) {
			this.$el.find( '.' + data.setting ).html( data.val );
		},

		/**
		 * Fires when view is destroyed
		 *
		 * @since 0.1
		 */
		remove: function() {
			// Clean up events bound to wp.customize.preview when the view is removed
			wp.customize.preview.unbind( 'component-setting-changed-' + this.model.get( 'id' ) +'.clc', this.settingChanged );

			Backbone.View.prototype.remove.apply(this, arguments);
		}
	});

} )( jQuery );
