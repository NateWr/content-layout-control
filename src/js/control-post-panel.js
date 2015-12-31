( function( $ ) {

	var clc = wp.customize.ContentLayoutControl || {};

	/**
	 * Re-usable panel for searching and selecting posts
	 *
	 * @option search_args Parameters for post searching
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.PostPanel = wp.Backbone.View.extend({
		template: wp.template( 'clc-secondary-panel-post-selection' ),

		className: 'clc-post-panel',

		events: {
			'keyup .clc-search-input': 'keyupSearch',
		},

		initialize: function( options ) {
			_.extend( this, _.pick( options, 'search_args' ) );

			this.state = 'waiting';

			if ( typeof this.search_args == 'undefined' ) {
				this.search_args = {};
			}
		},

		render: function() {
			wp.Backbone.View.prototype.render.apply( this );

			this.updateState();
			this.search_input = this.$el.find( '.clc-search-input' );
			this.list = this.$el.find( '.clc-results-list' );
			this.renderCollection();
		},

		/**
		 * Render collection of posts
		 *
		 * @since 0.1
		 */
		renderCollection: function() {
			this.list.empty();
			this.collection.each( function( model ) {
				this.list.append( new clc.Views.PostSummary( { model: model, parent: this } ).render().el );
			}, this );
		},

		/**
		 * Respond to typing in the search field
		 *
		 * @since 0.1
		 */
		keyupSearch: function( event ) {
			event.preventDefault();

			var search = this.search_input.val();
			if ( search.length < 3 ) {
				this.resetSearch();
				return;
			}

			if ( this.search == search ) {
				return;
			}

			this.fetchPosts( search );
		},

		/**
		 * Reset the currently searched string
		 *
		 * @since 0.1
		 */
		resetSearch: function() {
			this.search = '';
			this.updatePosts([]);
			this.updateState( 'waiting' );
		},

		/**
		 * Fetch a list of posts
		 *
		 * @since 0.1
		 */
		fetchPosts: function( search ) {
			this.search = search.replace( /\s+/g, '+' );
			this.updateState( 'fetching' );

			this.search_args.s = this.search;

			$.ajax({
				url: CLC_Control_Settings.root + '/content-layout-control/v1/posts/',
				type: 'POST',
				data: this.search_args,
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
			if ( typeof data.s === 'undefined' || data.s != this.search ) {
				return;
			}

			this.updateState( 'waiting' );
			this.updatePosts( data.posts );
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
		 * Update the collection of s
		 *
		 * @since 0.1
		 */
		updatePosts: function( posts ) {
			this.collection.reset( posts );
			this.renderCollection();
		},

		/**
		 * Select a post
		 *
		 * @since 0.1
		 */
		select: function( model ) {
			clc.secondary_panel.send( 'post-panel-add-post.clc', model.attributes );
			clc.secondary_panel.close();
		}
	});

	/**
	 * Post selection view
	 *
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.PostSummary = wp.Backbone.View.extend({
		tagName: 'li',

		template: wp.template( 'clc-secondary-panel-post-summary' ),

		events: {
			'click': 'select',
		},

		initialize: function( options ) {
			_.extend( this, _.pick( options, 'parent' ) );
		},

		/**
		 * Select this post
		 *
		 * @since 0.1
		 */
		select: function() {
			this.parent.select( this.model );
		}
	});

} )( jQuery );
