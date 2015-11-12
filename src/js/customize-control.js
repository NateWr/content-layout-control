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
		 * Base component model
		 *
		 * @augments Backbone.Model
		 * @since 0.1
		 */
		Component: Backbone.Model.extend({
			defaults: {
				id:          0,
				name:        '',
				description: '',
				type:        '',
			}
		}),

		/**
		 * Hash of component models
		 *
		 * @since 0.1
		 */
		component_models: {}
	};

	/**
	 * Define collections
	 *
	 * @since 0.1
	 */
	clc.Collections = {
		/**
		 * Collection of components that have been added to the layout control
		 *
		 * @augments Backbone.Collection
		 * @since 0.1
		 */
		Added: Backbone.Collection.extend({
			initialize: function( models, options ) {
				// Store reference to control
				_.extend( this, _.pick( options, 'control' ) );

				this.listenTo( this, 'add remove', _.bind( this.control.updateSetting, this.control ) );
				this.listenTo( this, 'add', this.sendAddEvent );
				this.listenTo( this, 'remove', this.sendRemoveEvent );
			},

			sendAddEvent: function( model ) {
				wp.customize.previewer.send( 'component-added.clc', model );
			},

			sendRemoveEvent: function( model ) {
				wp.customize.previewer.send( 'component-removed.clc', model );
			},

			// Generate an array of attributes to pass to the setting
			generateArray: function() {
				var output = [];
				this.each( function( model ) {
					output.push( model.attributes );
				});

				return output;
			}
		})
	};


	/**
	 * Define views
	 *
	 * @since 0.1
	 */
	clc.Views = {
		/**
		 * Summary of a component to appear in selection lists
		 *
		 * @augments wp.Backbone.View
		 * @since 0.1
		 */
		ComponentSummary: wp.Backbone.View.extend({
			tagName: 'li',

			className: 'component',

			template: wp.template( 'clc-component-summary' ),

			events: {
				// @TODO selecting components should be keyboard-accessible
				'click': 'add'
			},

			initialize: function( options ) {
				// Store reference to control
				_.extend( this, _.pick( options, 'control' ) );
			},

			add: function(e) {
				this.control.addComponent( this.model.get( 'type' ) );
			}
		}),

		/**
		 * List of components available for selection
		 *
		 * @augments wp.Backbone.View
		 * @since 0.1
		 */
		SelectionList: wp.Backbone.View.extend({
			initialize: function( options ) {
				// Store reference to control
				_.extend( this, _.pick( options, 'control' ) );
			},

			render: function() {
				wp.Backbone.View.prototype.render.apply( this );

				this.$el.empty();
				this.collection.each( function( model ) {
					this.$el.append( new clc.Views.ComponentSummary( { model: model, control: this.control } ).render().el );
				}, this );
			}
		}),

		/**
		 * List of components added to control
		 *
		 * @augments wp.Backone.View
		 * @since 0.1
		 */
		AddedList: wp.Backbone.View.extend({
			initialize: function( options ) {
				// Store reference to control
				_.extend( this, _.pick( options, 'control' ) );

				this.listenTo(this.collection, 'add remove reset', this.render);
			},

			render: function() {
				wp.Backbone.View.prototype.render.apply( this );

				this.$el.empty();
				this.collection.each( function( model ) {
					if ( typeof clc.Views.component_forms[ model.get('type') ] !== 'undefined' ) {
						this.$el.append( new clc.Views.component_forms[ model.get('type') ]( { model: model, control: this.control } ).render().el );
					}
				}, this );
			}
		}),

		/**
		 * Base view for component configuration forms
		 *
		 * @augments wp.Backbone.View
		 * @since 0.1
		 */
		BaseComponentForm: wp.Backbone.View.extend({
			template: null, // base views must define a template: wp.template( id )

			events: {
				'click .delete': 'remove',
				'keyup [data-clc-setting-link]': 'updateLinkedSetting'
			},

			initialize: function( options ) {
				// Store reference to control
				_.extend( this, _.pick( options, 'control' ) );

				this.listenTo(this.model, 'change', this.componentChanged);
			},

			componentChanged: function( model ) {
				this.control.updateSetting();
				wp.customize.previewer.send( 'component-changed.clc', model );
			},

			remove: function() {
				this.control.removeComponent( this.model );
			},

			/**
			 * Update model values that are synced to an input element via
			 * a `data-clc-setting-link` attribute.
			 *
			 * This provides easy value binding modeled after the Customizer,
			 * but it will only work for basic input fields where the value
			 * can be retrieved with .val()
			 *
			 * @since 0.1
			 */
			updateLinkedSetting: function( event ) {
				var target = $( event.target );
				var setting = target.data( 'clc-setting-link' );

				if ( this.model.get( setting ) === target.val() ) {
					return;
				}

				var atts = {};
				atts[ setting ] = target.val();
				this.model.set( atts );
			}
		}),

		/**
		 * Hash of component form views
		 *
		 * @since 0.1
		 */
		component_forms: {}
	};


	/**
	 * Customizer Content Layout Control class
	 *
	 * @class
	 * @augments wp.customize.Control
	 * @augments wp.customize.Class
	 */
	clc.Control = wp.customize.Control.extend({
		/**
		 * Current post_id being controlled
		 *
		 * @since 0.1
		 */
		post_id: 0,

		/**
		 * Object hash of post setting values
		 *
		 * @since 0.1
		 */
		edited_posts: {},

		/**
		 * Load and render the control settings
		 *
		 * @abstract
		 * @since 0.1
		 */
		ready: function() {
			var control = this;

			// Attach an empty list selection view to the DOM
			clc.selection_list = new clc.Views.SelectionList({
				el: '#clc-component-list .clc-list',
				collection: new Backbone.Collection(),
				control: control
			});

			// Generate the collection of allowed components
			control.allowed_components = new Backbone.Collection();
			for( var i in control.params.components ) {
				var type = control.params.components[i];
				if ( typeof clc.Models.component_models[type] !== undefined ) {
					control.allowed_components.add( new clc.Models.component_models[type]( clc_components[type] ) );
				}
			}

			// Generate an (empty) collection of components added to this control
			control.added_components = new clc.Collections.Added( [], { control: control } );
			control.added_components_view = new clc.Views.AddedList({
				el: '#customize-control-' + control.id + ' .clc_content_list',
				collection: control.added_components,
				control: control
			});
			control.added_components_view.render();

			// Register events
			_.bindAll( control, 'toggleComponentList', 'addComponent', 'updateSetting', 'onPageRefresh' );
			control.container.on( 'click keydown', '.add-item', control.toggleComponentList );
			wp.customize.previewer.bind( 'customizer-active.clc', this.onPageRefresh );

			// Listen to the close button in the component list
			$( '#clc-component-list .clc-header' ).on( 'click keydown', '.clc-close', function( event ) {
				if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}
				control.closeComponentList();
			});
		},

		/**
		 * Update the setting value
		 *
		 * Interacts with core WP customizer to store the setting for us when
		 * saving or during full page reloads of the preview.
		 *
		 * @since 0.1
		 */
		updateSetting: function() {
			this.edited_posts[this.post_id] = this.added_components.generateArray();
			this.setting( [] ); // Clear it to ensure the change gets noticed
			this.setting( this.edited_posts );
		},

		/**
		 * Assign the appropriate collection and open or close the list
		 *
		 * @since 0.1
		 */
		toggleComponentList: function( event ) {

			if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
				return;
			}

			event.preventDefault();

			if ( !$( 'body' ).hasClass( 'clc-list-open' ) ){
				clc.selection_list.collection = this.allowed_components;
				clc.selection_list.render();
			}

			$( 'body' ).toggleClass( 'clc-list-open' );
		},

		/**
		 * Close the component list
		 *
		 * @since 0.1
		 */
		closeComponentList: function() {
			$( 'body' ).removeClass( 'clc-list-open' );
		},

		/**
		 * Add a component to the control
		 *
		 * @since 0.1
		 */
		addComponent: function( type ) {

			if ( typeof clc.Models.component_models[type] === undefined ) {
				console.log( 'No component model found for type: ' + type );
				return;
			}

			var atts = _.clone( clc_components[type] );
			atts.id = _.uniqueId();
			this.added_components.add( new clc.Models.component_models[type]( atts ) );

			this.closeComponentList();
		},

		/**
		 * Remove a component from the control
		 *
		 * @since 0.1
		 */
		removeComponent: function( model ) {
			this.added_components.remove( model );
		},

		/**
		 * Load component set for a new post id
		 *
		 * When a post is loaded in the previewer, the control needs to be
		 * updated with the correct set of components. This loads the added
		 * components collection and sends the current post's components back to
		 * the previewer to be updated.
		 *
		 * @param data object Data about the current post passed from the previewer
		 * @since 0.1
		 */
		onPageRefresh: function( data ) {

			// The current previewer display is not a post
			if ( !data.post_id ) {
				this.post_id = 0;
				this.added_components.reset( [], { control: this } );
				return;
			}

			this.post_id = data.post_id;

			if ( typeof this.edited_posts[this.post_id] === 'undefined' ) {
				this.edited_posts[this.post_id] = data.components;
			}

			this.added_components.reset( this.edited_posts[this.post_id], { control: this } );

			wp.customize.previewer.send( 'refresh-layout.clc', this.added_components.generateArray() );
		}
	});

	// Register the media control with the content_layout control type
	wp.customize.controlConstructor.content_layout = clc.Control;

} )( jQuery );
