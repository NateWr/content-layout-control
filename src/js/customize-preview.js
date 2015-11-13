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
		 * Hash of component models
		 *
		 * @since 0.1
		 */
		component_models: {}
	};

	/**
	 * Define views
	 *
	 * @since 0.1
	 */
	clc.Views = {
		/**
		 * Base view for component layouts
		 *
		 * These aren't traditional Backbone Views. They'll just fetch and
		 * inject HTML from the server. Using Views allows us to take advantage
		 * of Backbone's cleanup of listeners and provides a consistent way to
		 * tie listeners to the dom element.
		 *
		 * @augments wp.Backbone.View
		 * @since 0.1
		 */
		BaseComponentLayout: wp.Backbone.View.extend({
			template: null, // doesn't use template. injects HTML passed from the server

			/**
			 * Initialize
			 *
			 * @since 0.1
			 */
			initialize: function( options ) {
				this.listenTo( this.model, 'change', this.load );
			},

			/**
			 * Load HTML and insert into the DOM
			 *
			 * @since 0.1
			 */
			load: function() {
				this.fetchHTML();
			},

			/**
			 * Fetch HTML from the server for the attached model
			 *
			 * @since 0.1
			 */
			fetchHTML: function() {
				$.ajax({
					url: CLC_WP_API_Settings.root + '/content-layout-control/v1/render-components',
					type: 'POST',
					beforeSend: function( xhr ) {
						xhr.setRequestHeader( 'X-WP-Nonce', CLC_WP_API_Settings.nonce );
					},
					data: this.model.attributes,
					complete: _.bind( this.handleResponse, this )
				});
			},

			/**
			 * Handle ajax response
			 *
			 * @since 0.1
			 */
			handleResponse: function( r ) {
				var html = '';
				if ( typeof r.success !== 'undefined' && r.success && typeof r.responseJSON !== 'undefined' ) {
					html = r.responseJSON;
				}

				this.injectHTML( html );
			},

			/**
			 * Inject HTML into the dom
			 *
			 * @since 0.1
			 */
			injectHTML: function( html ) {
				this.$el.html( html );
			}
		}),

		/**
		 * Hash of component layout views
		 *
		 * @since 0.1
		 */
		component_views: {}
	};

	/**
	 * Handler for the live preview
	 *
	 * @since 0.1
	 */
	clc.preview = {
		/**
		 * Current page/post being previewed
		 *
		 * @since 0.1
		 */
		current: {},

		/**
		 * Models currently being handled
		 *
		 * @since 0.1
		 */
		models: {},

		/**
		 * Views currently being handled
		 *
		 * @since 0.1
		 */
		views: {},

		/**
		 * Initialize
		 *
		 * @since 0.1
		 */
		init: function( data ) {
			_.bindAll( this, 'reset', 'refresh', 'destroyViews' );
			this.reset( data );
		},

		/**
		 * Reset data on page loads
		 *
		 * @since 0.1
		 */
		reset: function( data ) {
			this.destroyViews();
			this.models = this.views = {};
			this.current = data;
			wp.customize.preview.send( 'previewer-reset.clc', clc.preview.current );
		},

		/**
		 * Refresh the layout. Goes to the server for a complete render.
		 *
		 * @params array components Array of components to render
		 * @since 0.1
		 */
		refresh: function( components ) {
			this.destroyViews();
			$( '#content-layout-control' ).empty();
			for( var i in components ) {
				this.add( components[i] );
			}
		},

		/**
		 * Add component view
		 *
		 * @since 0.1
		 */
		add: function( component ) {
			$( '#content-layout-control' ).append( '<div id="content-layout-control-' + component.id + '"></div>' );
			this.views[component.id] = new clc.Views.BaseComponentLayout( {
				el: '#content-layout-control-' + component.id,
				model: new Backbone.Model( component )
			} );
			this.views[component.id].load();
		},

		/**
		 * Update a view when a model has changed
		 *
		 * @since 0.1
		 */
		update: function( component ) {
			if ( typeof this.views[component.id] == 'undefined' ) {
				return;
			}

			this.views[component.id].model.set( component );
		},

		/**
		 * Remove component view
		 *
		 *  @since 0.1
		 */
		remove: function( component ) {
			if ( typeof this.views[component.id] == 'undefined' ) {
				return;
			}

			this.views[component.id].remove();
		},

		/**
		 * Destroy the existing views to unbind events
		 *
		 * @since 0.1
		 */
		destroyViews: function() {
			for( var i in this.views ) {
				this.views[i].remove();
			}
		}
	};

	/**
	 * Bind to component change events
	 *
	 * @since 0.0.1
	 */
	$( function() {

		// Send updated post data to the controller
		wp.customize.preview.bind( 'active', function() {
			clc.preview.init( clc_customize_preview_data );
		});

		wp.customize.preview.bind( 'component-added.clc', function( component ) {
			clc.preview.add( component );
		});

		wp.customize.preview.bind( 'component-removed.clc', function( component ) {
			clc.preview.remove( component );
		});

		wp.customize.preview.bind( 'component-changed.clc', function( component ) {
			clc.preview.update( component );
		});

		wp.customize.preview.bind( 'refresh-layout.clc', function( components ) {
			clc.preview.refresh( components );
		});
	} );

} )( jQuery );
