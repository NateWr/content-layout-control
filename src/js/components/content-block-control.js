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
			links:          [],
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
			'click .delete': 'delete',
			'blur [data-clc-setting-link]': 'updateLinkedSetting',
			'keyup [data-clc-setting-link]': 'updateTextLive',
			'reordered': 'reordered',
			'click .select-image': 'openMedia',
			'click input[name^="image_position"]': 'updateImagePosition',
			'click .remove-image': 'removeImage',
			'click .add-link': 'toggleLinkPanel',
			'click .remove-link': 'removeLink',
		},

		initialize: function( options ) {
			// Store reference to control
			_.extend( this, _.pick( options, 'control', 'is_open' ) );

			// Preserves expanded/collapsed state as the user browses around
			this.setDisplayClass();

			this.listenTo(this.model, 'change', this.componentChanged);
			this.listenTo(this.model, 'focus', this.focus);
			this.listenTo(this, 'content-block-add-link.clc', this.addLink );

			// Ensure the add-link open/closed states are updated when the
			// secondary panel is closed
			this.listenTo(this.model, 'component-list-opened.clc', this.closeLinkPanel);
			this.listenTo(this.model, 'component-list-closed.clc', this.closeLinkPanel);
		},

		render: function() {
			wp.Backbone.View.prototype.render.apply( this );

			if ( this.image_thumb_url && this.model.get( 'image' ) ) {
				this.renderThumb();
			// Fetch the thumbnail URL from the server if we don't yet have one
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

		/**
		 * Update the setting and set the title, but don't automatically
		 * trigger a re-render. The image update is handled manually.
		 *
		 * @since 0.1
		 */
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
		 * Selects `medium` if it exists and is large enough. Falls back to
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
			event.preventDefault();

			this.model.set({
				image: 0,
				image_position: 'left'
			});
			this.render();
			wp.customize.previewer.send( 'component-changed.clc', this.model );
		},

		/**
		 * Open or close the link panel
		 *
		 * @since 0.1
		 */
		toggleLinkPanel: function( event ) {
			event.preventDefault();

			if ( !this.$el.hasClass( 'clc-control-links-open' ) ) {
				this.control.closeComponentPanel();
				this.openLinkPanel();
			} else {
				this.closeLinkPanel();
			}

		},

		/**
		 * Open the link panel
		 *
		 * @since 0.1
		 */
		openLinkPanel: function() {
			this.link_panel = new clc.Views.LinkPanel({
				collection: new Backbone.Collection(),
				component: this
			});
			this.link_panel.render();
			// Append directly so that we can call .remove() on the view
			// without losing the .clc-secondary-content div element
			this.link_panel.$el.appendTo( '#clc-secondary-panel .clc-secondary-content' );
			$( 'body' ).addClass( 'clc-secondary-open' );
			this.$el.addClass( 'clc-control-links-open' );
		},

		/**
		 * Close the link panel
		 *
		 * @since 0.1
		 */
		closeLinkPanel: function() {
			$( 'body' ).removeClass( 'clc-secondary-open' );
			this.$el.removeClass( 'clc-control-links-open' );
			if ( this.link_panel ) {
				this.link_panel.remove();
			}
		},

		/**
		 * Add a link
		 *
		 * @since 0.1
		 */
		addLink: function( link ) {
			this.model.get( 'links' ).push( link );
			this.closeLinkPanel();
			this.control.updateSetting();
			wp.customize.previewer.send( 'component-changed.clc', this.model );
			this.render();
		},

		/**
		 * Remove a link
		 *
		 * @since 0.1
		 */
		removeLink: function( event ) {
			this.model.get( 'links' ).splice( $( event.target ).data( 'index' ), 1 );
			this.control.updateSetting();
			wp.customize.previewer.send( 'component-changed.clc', this.model );
			this.render();
		}

	});

	/**
	* Panel for selecting and configuring links
	*
	* @augments wp.Backbone.View
	* @since 0.1
	*/
	clc.Views.LinkPanel = wp.Backbone.View.extend({
		template: wp.template( 'clc-component-content-block-link-selection' ),

		events: {
			'keyup .clc-content-block-link-search': 'keyupSearch',
			'keyup .clc-content-block-url': 'setButtonState',
			'keyup .clc-content-block-link-text': 'setButtonState',
			'click .add-link': 'add',
		},

		initialize: function( options ) {
			// Store reference to component
			_.extend( this, _.pick( options, 'component' ) );
			this.state = 'waiting';
			this.listenTo( this, 'content-block-select-link.clc', this.updateLink );
		},

		render: function() {
			$( '#clc-secondary-panel .clc-secondary-content' ).empty();

			wp.Backbone.View.prototype.render.apply( this );

			this.updateState();

			this.renderCollection();

			this.url = this.$el.find( '.clc-content-block-url' );
			this.link_text = this.$el.find( '.clc-content-block-link-text' );
			this.add_link = this.$el.find( '.add-link' );
			this.search_field = this.$el.find( '.clc-content-block-link-search' );

			this.setButtonState();
		},

		/**
		 * Render collection of links
		 *
		 * @since 0.1
		 */
		renderCollection: function() {
			var list = this.$el.find( '.clc-link-selection-list' );
			list.empty();
			this.collection.each( function( model ) {
				list.append( new clc.Views.LinkSummary( { model: model, link_panel: this } ).render().el );
			}, this );
		},

		/**
		 * Respond to typiing in the search field
		 *
		 * @since 0.1
		 */
		keyupSearch: function( event ) {
			event.preventDefault();

			var search = this.search_field.val();
			if ( search.length < 3 ) {
				this.resetSearch();
				return;
			}

			if ( this.search == search ) {
				return;
			}

			this.fetchLinks( search );
		},

		/**
		 * Reset the currently searched string
		 *
		 * @since 0.1
		 */
		resetSearch: function() {
			this.search = '';
			this.updateState( 'waiting' );
		},

		/**
		 * Fetch a list of links
		 *
		 * @since 0.1
		 */
		fetchLinks: function( search ) {
			this.search = search;
			this.updateState( 'fetching' );

			$.ajax({
				url: CLC_Control_Settings.root + '/content-layout-control/v1/components/content-block/links/' + this.search,
				type: 'GET',
				beforeSend: function( xhr ) {
					xhr.setRequestHeader( 'X-WP-Nonce', CLC_Control_Settings.nonce );
				},
				complete: _.bind( this.handleResponse, this )
			});
		},

		/**
		 * Handle response from search query
		 *
		 * @since 0.1
		 */
		handleResponse: function( response ) {
			if ( typeof response === 'undefined' || response.status !== 200 ) {
				return;
			}

			var data = response.responseJSON;
			if ( typeof data.search === 'undefined' || data.search != this.search ) {
				return;
			}

			this.updateState( 'waiting' );
			this.collection.reset( data.links );
			this.renderCollection();
		},

		/**
		 * Update view state
		 *
		 * @since 0.1
		 */
		updateState: function( state ) {
			if ( state ) {
				this.state = state;
			}

			this.$el.removeClass( 'waiting fetching' );
			this.$el.addClass( this.state );
		},

		/**
		 * Update link details
		 *
		 * @since 0.1
		 */
		updateLink: function( model ) {
			this.url.val( model.get( 'permalink' ) );
			this.link_text.val( model.get( 'title' ) );
			this.setButtonState();
		},

		/**
		 * Enable/disable the add link button
		 *
		 * @since 0.1
		 */
		setButtonState: function() {
			if ( this.isLinkValid() ) {
				this.add_link.removeAttr( 'disabled' );
			} else {
				this.add_link.attr( 'disabled', 'disabled' );
			}
		},

		/**
		 * Check if details about the link are sufficient
		 *
		 * @since 0.1
		 */
		isLinkValid: function() {
			return this.url.val() && this.link_text.val();
		},

		/**
		 * Add a link to the component
		 *
		 * @since 0.1
		 */
		add: function() {
			if ( !this.isLinkValid ) {
				return;
			}

			this.component.trigger( 'content-block-add-link.clc', { url: this.url.val(), link_text: this.link_text.val() } );
		}
	});

	/**
	* Link selection view
	*
	* @augments wp.Backbone.View
	* @since 0.1
	*/
	clc.Views.LinkSummary = wp.Backbone.View.extend({
		tagName: 'li',

		template: wp.template( 'clc-component-content-block-link-summary' ),

		events: {
			'click': 'select',
		},

		initialize: function( options ) {
			// Store reference to link panel
			_.extend( this, _.pick( options, 'link_panel' ) );
		},

		/**
		 * Select this link
		 *
		 * @since 0.1
		 */
		select: function() {
			this.link_panel.trigger( 'content-block-select-link.clc', this.model );
		}
	});

} )( jQuery );
