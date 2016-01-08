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
			'keyup .clc-link-panel-url': 'setButtonState',
			'keyup .clc-link-panel-link-text': 'setButtonState',
			'click .add-link': 'add',
			'click .search-content-link': 'openSearch',
			'click .back-to-search-form': 'closeSearch',
		},

		initialize: function( options ) {
			// Store reference to component
			_.extend( this, _.pick( options, 'component' ) );

			this.views.set( '.clc-link-panel-search-form', new clc.Views.LinkPanelPostSearch({ parent: this, collection: new Backbone.Collection() }) );
		},

		render: function() {
			wp.Backbone.View.prototype.render.apply( this );

			this.url = this.$el.find( '.clc-link-panel-url' );
			this.link_text = this.$el.find( '.clc-link-panel-link-text' );
			this.add_link = this.$el.find( '.add-link' );

			this.setButtonState();
		},

		/**
		 * Open the search view
		 *
		 * @since 0.1
		 */
		openSearch: function( event ) {
			event.preventDefault();
			this.$el.addClass( 'search-visible' );
			this.views.first( '.clc-link-panel-search-form' ).$el
				.find( 'input' ).focus();
		},

		/**
		 * Close the search window
		 *
		 * @since 0.1
		 */
		closeSearch: function( event ) {
			if ( typeof event !== 'undefined' ) {
				event.preventDefault();
			}

			this.$el.removeClass( 'search-visible' );
			this.add_link.focus();
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
			this.closeSearch();
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
	 * Search panel for finding links to existing content
	 *
	 * @option parent The link panel view which opened the panel
	 * @augments clc.Views.PostPanel
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.LinkPanelPostSearch = clc.Views.PostPanel.extend({

		initialize: function( options ) {
			_.extend( this, _.pick( options, 'parent', 'search_args' ) );

			this.state = 'waiting';

			if ( typeof this.search_args == 'undefined' ) {
				this.search_args = {
					return: {
						title: 'title',
						description: 'post_type_label',
						permalink: 'permalink',
					},
				};
			}
		},

		/**
		 * Select a post and pass the model to the link panel
		 *
		 * @since 0.1
		 */
		select: function( model ) {
			this.parent.updateLink( model );
		}
	});

	/**
	 * Link selection view when looking up a post
	 *
	 * @augments wp.Backbone.View
	 * @since 0.1
	 */
	clc.Views.LinkPostSummary = clc.Views.PostSummary.extend({
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
