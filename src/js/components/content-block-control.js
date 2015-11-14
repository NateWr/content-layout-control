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
			name:        '',
			description: '',
			type:        'content-block',
			image:       0,
			title:       '',
			content:     ''
		}
	});

	/**
	* View class for the Content Block form
	*
	* @augments wp.customize.ContentLayoutControl.Views.BaseComponentForm
	* @augments wp.Backbone.View
	* @since 0.1
	*/
	clc.Views.component_views['content-block'] = clc.Views.BaseComponentForm.extend({
		template: wp.template( 'clc-component-content-block' ),

		className: 'clc-component-content-block',

		events: {
			'click .delete': 'remove',
			'blur [data-clc-setting-link]': 'updateLinkedSetting',
			'keyup [data-clc-setting-link]': 'updateTextLive'
		},

		initialize: function( options ) {
			// Store reference to control
			_.extend( this, _.pick( options, 'control' ) );

			this.listenTo(this.model, 'change', this.componentChanged);
		},

		componentChanged: function( model ) {
			this.control.updateSetting();
		},

		/**
		 * Update text inputs in the browser without triggering a full
		 * component refresh
		 *
		 * @since 0.1
		 */
		updateTextLive: function( event ) {
			var target = $( event.target );

			wp.customize.previewer.send(
				'component-setting-changed-' + this.model.get( 'id' ) + '.clc',
				{
					setting: target.data( 'clc-setting-link' ),
					val: target.val()
				}
			);
		}
	});

} )( jQuery );
