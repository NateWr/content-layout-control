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
			name:           '',
			description:    '',
			type:           'content-block',
			image:          0,
			image_position: 'left',
			title:          '',
			content:        '',
			order:          0
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
			'click .clc-toggle-component-form': 'toggleDisplay',
			'click .delete': 'remove',
			'blur [data-clc-setting-link]': 'updateLinkedSetting',
			'keyup [data-clc-setting-link]': 'updateTextLive',
			'reordered': 'reordered',
			'click .select-image': 'openMedia',
			'keydown .select-image': 'openMedia',
			'click input[name^="image_position"]': 'updateImagePosition',
			'click .remove-image': 'removeImage',
			'keydown .remove-image': 'removeImage',
		},

		render: function() {
			wp.Backbone.View.prototype.render.apply( this );

			if ( this.image_thumb_url && this.model.get( 'image' ) ) {
				this.renderThumb();
			} else if ( this.model.get( 'image' ) ) {
				$.ajax({
					url: CLC_Control_Settings.root + '/content-layout-control/v1/components/content-block/thumb-url/' + parseInt( this.model.get( 'image' ), 10 ),
					type: 'GET',
					beforeSend: function( xhr ) {
						xhr.setRequestHeader( 'X-WP-Nonce', CLC_Control_Settings.nonce );
					},
					complete: _.bind( function( r ) {
						var url = '';
						if ( typeof r.success !== 'undefined' && r.success() && typeof r.responseJSON !== 'undefined' ) {
							url = r.responseJSON;
						}

						this.image_thumb_url = url;
						this.renderThumb();
					}, this )
				});
			}
		},

		componentChanged: function( model ) {
			this.control.updateSetting();
			this.$el.find( '.header .title' ).text( model.get( 'title' ) );
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
		},

		/**
		 * Open the media modal
		 *
		 * @since 0.1
		 */
		openMedia: function( event ) {
			if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
				return;
			}

			event.preventDefault();

			if ( !this.media ) {
				this.initMedia();
			}

			this.media.open();
		},

		/**
		 * Create a media modal
		 *
		 * @since 0.1
		 */
		initMedia: function() {
			this.media = wp.media({
				states: [
					new wp.media.controller.Library({
						title: 'Title Test',
						library: wp.media.query({ type: 'image' }),
						multiple: false,
						date: false,
					})
				]
			});

			this.media.on( 'select', _.bind( this.selectImage, this ) );
		},

		/**
		 * Receive the selected image from the media modal and assign it to
		 * the control
		 *
		 * @since 0.1
		 */
		selectImage: function() {
			var attachment = this.media.state().get( 'selection' ).first().toJSON();

			if ( attachment.id == this.model.get( 'image' ) ) {
				return;
			}

			this.model.set({ image: attachment.id });
			this.image_thumb_url = this.getThumbUrl( attachment.sizes );
			this.render();
			wp.customize.previewer.send( 'component-changed.clc', this.model );
		},

		/**
		 * Retrieve a thumbnail URL when passed an array of available image
		 * sizes
		 *
		 * Selects `medium` if it exists and is large nough. Falls back to
		 * `full` otherwise.
		 *
		 * @since 0.1
		 */
		getThumbUrl: function( sizes ) {
			var size;
			if ( typeof sizes.medium !== 'undefined' && sizes.medium.width >= 238 ) {
				size = sizes.medium;
			} else if ( typeof sizes.full !== 'undefined' ) {
				size = sizes.full;
			}

			if ( !size ) {
				return '';
			}

			return size.url;
		},

		/**
		 * Add the image thumbnail preview
		 *
		 * This should normally be set with the template. However, in some cases
		 * we'll need to set it by making an end-run to the server to fetch the
		 * url. In such cases, we can slot it in when it returns without
		 * re-rendering the whole view.
		 *
		 * @since 0.1
		 */
		renderThumb: function() {
			this.$el.find( '.thumb' ).removeClass( 'loading' )
				.html( '<img src="' + this.image_thumb_url + '">' );
		},

		/**
		 * Update the image position when selected
		 *
		 * @since 0.1
		 */
		updateImagePosition: function( event ) {
			var val = $( event.target ).val();

			wp.customize.previewer.send(
				'component-setting-changed-' + this.model.get( 'id' ) + '.clc',
				{
					setting: 'image-position',
					val: val
				}
			);
			this.model.set({ image_position: val });
		},

		/**
		 * Remove the image and reset to defaults
		 *
		 * @since 0.1
		 */
		removeImage: function( event ) {
			if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
				return;
			}

			event.preventDefault();

			this.model.set({
				image: 0,
				image_position: 'left'
			});
			this.render();
			wp.customize.previewer.send( 'component-changed.clc', this.model );
		}

	});

} )( jQuery );
