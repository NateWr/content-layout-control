( function( $ ) {

	var clc = wp.customize.ContentLayoutControl || {};

	/**
	 * Re-usable panel for selecting and configuring links
	 *
	 * @option component The component view which opened the panel
	 * @option search_args @TODO search parameters for getting links from existing content
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.LinkPanel = wp.Backbone.View.extend({
		template: wp.template( 'clc-secondary-panel-link-selection' ),

		className: 'clc-link-panel',

		events: {
			'keyup .clc-link-panel-search-input': 'keyupSearch',
			'keyup .clc-link-panel-url': 'setButtonState',
			'keyup .clc-link-panel-link-text': 'setButtonState',
			'click .add-link': 'add',
		},

		initialize: function( options ) {
			// Store reference to component
			_.extend( this, _.pick( options, 'component' ) );
			this.state = 'waiting';
			this.listenTo( this, 'link-panel-select-link.clc', this.updateLink );
		},

		render: function() {
			wp.Backbone.View.prototype.render.apply( this );

			this.updateState();

			this.renderCollection();

			this.url = this.$el.find( '.clc-link-panel-url' );
			this.link_text = this.$el.find( '.clc-link-panel-link-text' );
			this.add_link = this.$el.find( '.add-link' );
			this.search_input = this.$el.find( '.clc-link-panel-search-input' );

			this.setButtonState();
		},

		/**
		 * Render collection of links
		 *
		 * @since 0.1
		 */
		renderCollection: function() {
			var list = this.$el.find( '.clc-link-panel-list' );
			list.empty();
			this.collection.each( function( model ) {
				list.append( new clc.Views.LinkSummary( { model: model, link_panel_view: this } ).render().el );
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

			this.fetchLinks( search );
		},

		/**
		 * Reset the currently searched string
		 *
		 * @since 0.1
		 */
		resetSearch: function() {
			this.search = '';
			this.updateLinks([]);
			this.updateState( 'waiting' );
		},

		/**
		 * Fetch a list of links
		 *
		 * @since 0.1
		 */
		fetchLinks: function( search ) {
			this.search = search.replace( /\s+/g, '+' );
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
			this.updateLinks( data.links );
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
		 * Update the collection of links
		 *
		 * @since 0.1
		 */
		updateLinks: function( links ) {
			this.collection.reset( links );
			this.renderCollection();
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

			clc.secondary_panel.send(
				'link-panel-add-link.clc',
				{
					url: this.url.val(),
					link_text: this.link_text.val()
				}
			);

			clc.secondary_panel.close();
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

		template: wp.template( 'clc-secondary-panel-link-summary' ),

		events: {
			'click': 'select',
		},

		initialize: function( options ) {
			// Store reference to link panel
			_.extend( this, _.pick( options, 'link_panel_view' ) );
		},

		/**
		 * Select this link
		 *
		 * @since 0.1
		 */
		select: function() {
			this.link_panel_view.trigger( 'link-panel-select-link.clc', this.model );
		}
	});

} )( jQuery );
