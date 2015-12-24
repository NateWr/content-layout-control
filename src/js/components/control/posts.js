( function( $ ) {

	var clc = wp.customize.ContentLayoutControl;

	/**
	 * View class for the Posts form
	 *
	 * @augments wp.customize.ContentLayoutControl.Views.BaseComponentForm
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.component_controls.posts = clc.Views.BaseComponentForm.extend({
		template: wp.template( 'clc-component-posts' ),

		className: 'clc-component-posts',

		events: {
			'click .clc-toggle-component-form': 'toggleDisplay',
			'click .delete': 'delete',
			'reordered': 'reordered',
			'click .add-post': 'togglePostPanel',
			'click .remove-post': 'removePost',
		},

		initialize: function( options ) {
			_.extend( this, _.pick( options, 'control', 'is_open' ) );

			// Preserves expanded/collapsed state as the user browses around
			this.setDisplayClass();

			this.listenTo(this.model, 'change', this.componentChanged);
			this.listenTo(this.model, 'focus', this.focus);
			this.listenTo(this, 'post-panel-add-post.clc', this.addPost );
			this.listenTo(this, 'secondary-panel-closed.clc', this.secondaryPanelClosed );

			if ( this.model.get( 'posts' ).length ) {
				this.fetchPostDetails();
			}
		},

		/**
		 * Retrieve search arguments for post lookup
		 *
		 * @since 0.1
		 */
		getSearchArgs: function( search_args ) {
			return { post_type: this.model.get( 'post_types' ) };
		},

		/**
		 * Create a new post panel and store a reference to the view
		 *
		 * @since 0.1
		 */
		createPostPanelView: function( options ) {
			this.post_panel_view = this.control.createPostPanelView( { search_args: this.getSearchArgs() } );
			return this.post_panel_view;
		},

		/**
		 * Open or close the post panel
		 *
		 * @since 0.1
		 */
		togglePostPanel: function( event ) {
			event.preventDefault();

			if ( !this.$el.hasClass( 'clc-posts-panel-open' ) ) {
				this.openLinkPanel();
			} else {
				this.closeLinkPanel();
			}

		},

		/**
		 * Open the post panel
		 *
		 * @since 0.1
		 */
		openLinkPanel: function() {
			clc.secondary_panel.trigger( 'load-secondary-panel.clc', this.createPostPanelView(), this );
			this.$el.addClass( 'clc-posts-panel-open' );
		},

		/**
		 * Close the post panel
		 *
		 * @since 0.1
		 */
		closeLinkPanel: function() {
			clc.secondary_panel.trigger( 'close-secondary-panel.clc' );
		},

		/**
		 * React to the secondary panel being closed
		 *
		 * @since 0.1
		 */
		secondaryPanelClosed: function( view ) {
			if ( view.cid === this.post_panel_view.cid ) {
				this.$el.removeClass( 'clc-posts-panel-open' );
				this.$el.find( '.add-post' ).focus();
			}
		},

		/**
		 * Add a post
		 *
		 * @since 0.1
		 */
		addPost: function( post ) {
			this.model.get( 'posts' ).push( post );
			this.control.updateSetting();
			this.render();
		},

		/**
		 * Remove a post
		 *
		 * @since 0.1
		 */
		removePost: function( event ) {
			this.model.get( 'posts' ).splice( $( event.target ).data( 'index' ), 1 );
			this.control.updateSetting();
			this.render();
		},

		/**
		 * Fetch post display details
		 *
		 * Used when loading the stored values from the database, which will
		 * only include an array of post IDs.
		 *
		 * @since 0.1
		 */
		fetchPostDetails: function() {

			for( var i in this.model.get( 'posts' ) ) {
				$.ajax({
					url: CLC_Control_Settings.root + '/content-layout-control/v1/posts/',
					type: 'POST',
					data: _.extend( this.getSearchArgs(), { ID: this.model.get( 'posts' )[i] } ),
					beforeSend: clc.Functions.getRequestHeader,
					complete: _.bind( this.fetchPostDetailsResponse, this )
				});
			}
		},

		/**
		 * Handle response from request to fetch post details
		 *
		 * @since 0.1
		 */
		fetchPostDetailsResponse: function( response ) {
			if ( typeof response === 'undefined' || response.status !== 200 ) {
				return;
			}

			var data = response.responseJSON;
			if ( typeof data.ID === 'undefined' ) {
				return;
			}

			for ( var i in this.model.get( 'posts' ) ) {
				if ( this.model.get( 'posts' )[i] == data.ID ) {
					this.model.get( 'posts' )[i] = data.posts;
					break;
				}
			}

			this.render();
		},

	});

} )( jQuery );
