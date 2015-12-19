( function( $ ) {

	var clc = wp.customize.ContentLayoutControl;

	/**
	 * View class for the Content Block layout
	 *
	 * @augments wp.customize.ContentLayoutControl.Views.BaseComponentForm
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.component_previews['content-block'] = clc.Views.BaseComponentPreview.extend({
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
			if ( data.setting == 'image-position' ) {
				this.updateImagePosition( data.val );
			} else {
				this.$el.find( '.' + data.setting ).html( data.val );
			}
		},

		/**
		 * Fires when view is destroyed
		 *
		 * @since 0.1
		 */
		remove: function() {
			// Clean up events bound to wp.customize.preview when the view is removed
			wp.customize.preview.unbind( 'component-setting-changed-' + this.model.get( 'id' ) +'.clc', this.settingChanged );

			Backbone.View.prototype.remove.apply( this );
		},

		/**
		 * Update the image position
		 *
		 * @since 0.1
		 */
		updateImagePosition: function( position ) {
			this.$el.find( '.clc-wrapper' ).removeClass( 'image-position-left image-position-right' )
				.addClass( 'image-position-' + position );
		}
	});

} )( jQuery );
