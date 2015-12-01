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
				order:       0
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

			comparator: function( model ) {
				return model.get( 'order' );
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
				e.preventDefault();
				e.stopPropagation();
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
				var list = $( '<ul></ul>' );
				this.collection.each( function( model ) {
					list.append( new clc.Views.ComponentSummary( { model: model, control: this.control } ).render().el );
				}, this );
				this.$el.append( list  );
			}
		}),

		/**
		 * List of components added to control
		 *
		 * @augments wp.Backone.View
		 * @since 0.1
		 */
		AddedList: wp.Backbone.View.extend({
			// List of components in an "open" state
			open_components: [],

			events: {
				'update-sort': 'updateSort',
			},

			initialize: function( options ) {
				// Store reference to control
				_.extend( this, _.pick( options, 'control' ) );

				this.listenTo(this.collection, 'add remove reset', this.render);
			},

			render: function() {
				wp.Backbone.View.prototype.render.apply( this );

				this.$el.empty();
				this.collection.each( function( model ) {
					if ( typeof clc.Views.component_views[ model.get('type') ] !== 'undefined' ) {
						var is_open = this.open_components.indexOf( model.get( 'id' ) ) > -1;
						var view = new clc.Views.component_views[ model.get('type') ]( { model: model, control: this.control, is_open: is_open } );
						view.render();
						this.$el.append( view.el );
					}
				}, this );
			},

			updateSort: function( event, model, position ) {

				this.collection.remove( model );
				this.collection.add( model, { at: position } );

				this.collection.each(function( model, index ) {
					model.set( 'order', index );
				});

				this.collection.sort();

				wp.customize.previewer.send( 'refresh-layout.clc', this.collection.generateArray() );
			},

			/**
			 * Reset the open_components list when the collection is replaced
			 * whole-sale
			 *
			 * @since 0.1
			 */
			resetComponentStates: function() {
				this.open_components = [];
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

			tagName: 'li',

			className: 'clc-component-base',

			events: {
				'click .clc-toggle-component-form': 'toggleDisplay',
				'click .delete': 'delete',
				'blur [data-clc-setting-link]': 'updateLinkedSetting',
				'onchange [data-clc-setting-link]': 'updateLinkedSetting',
				'reordered': 'reordered',
			},

			initialize: function( options ) {
				// Store reference to control
				_.extend( this, _.pick( options, 'control', 'is_open' ) );

				// Preserves expanded/collapsed state as the user browses around
				this.setDisplayClass();

				this.listenTo(this.model, 'change', this.componentChanged);
				this.listenTo(this.model, 'focus', this.focus);
			},

			/**
			 * By default this will fire whenever the model is changed. The
			 * base view will send an event to the preview frame that will
			 * request a complete refresh of the component. Overwite this
			 * if you want to perform some content updates without re-fetching
			 * the component from the server.
			 *
			 * @since 0.1
			 */
			componentChanged: function( model ) {
				this.control.updateSetting();
				wp.customize.previewer.send( 'component-changed.clc', model );
			},

			/**
			 * Delete this component from the list of added components
			 *
			 * @since 0.1
			 */
			delete: function() {
				this.control.removeComponent( this.model );
				this.remove();
			},

			/**
			 * Update model values that are synced to an input element via
			 * a `data-clc-setting-link` attribute.
			 *
			 * This provides easy value binding modeled after the Customizer,
			 * but it will only work for basic input fields where the value
			 * can be retrieved with .val().
			 *
			 * The default view sends a component-changed event whenever the
			 * model changes, which will trigger a call  back to the server to
			 * re-render the entire component. Don't use this for update-as-you-
			 * type or other high-frequency changes, unless you disable the
			 * listener which fires this.componentChanged(), or overwrite
			 * this.componentChanged() so it doesn't send the default event.
			 *
			 * @since 0.1
			 */
			updateLinkedSetting: function( event ) {
				var target = $( event.target );
				var setting = target.data( 'clc-setting-link' );
				var val = target.val();

				if ( this.model.get( setting ) === val ) {
					return;
				}

				var atts = {};
				atts[ setting ] = val;
				this.model.set( atts );
			},

			/**
			 * Triggers a resort on the collection when this model's order has
			 * been changed
			 *
			 * @since 0.1
			 */
			reordered: function( event, index ) {
				this.$el.trigger( 'update-sort', [this.model, index] );
			},

			/**
			 * Toggle the display status open/close
			 *
			 * @since 0.1
			 */
			toggleDisplay: function( event ) {
				if ( this.is_open ) {
					this.contract();
				} else {
					this.expand();
				}
			},

			/**
			 * Expand form
			 *
			 * @since 0.1
			 */
			expand: function() {
				this.is_open = true;
				this.setDisplayClass();
				if ( this.control.added_components_view.open_components.indexOf( this.model.get( 'id' ) ) < 0 ) {
					this.control.added_components_view.open_components.push( this.model.get( 'id' ) );
				}
			},

			/**
			 * Contract form
			 *
			 * @since 0.1
			 */
			contract: function() {
				this.is_open = false;
				this.setDisplayClass();
				var index = this.control.added_components_view.open_components.indexOf( this.model.get( 'id' ) );
				if ( index > -1 ) {
					this.control.added_components_view.open_components.splice( index, 1 );
				}
			},

			/**
			 * Set visibility class for the form
			 *
			 * @since 0.1
			 */
			setDisplayClass: function( state ) {
				if ( state || this.is_open ) {
					this.$el.addClass( 'is-open' );
				} else {
					this.$el.removeClass( 'is-open' );
				}
			},

			/**
			 * Open this component and focus on it
			 *
			 * @since 0.1
			 */
			focus: function() {
				this.expand();
				this.$el.find( '.clc-toggle-component-form' ).focus();
			}
		}),

		/**
		 * Hash of component form views
		 *
		 * @since 0.1
		 */
		component_views: {}
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
				el: '#clc-secondary-panel .clc-secondary-content',
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
				el: '#customize-control-' + control.id + ' .clc-content-list',
				collection: control.added_components,
				control: control
			});
			control.added_components_view.render();

			// Register events
			_.bindAll( control, 'toggleSecondaryPanel', 'addComponent', 'updateSetting', 'onPageRefresh', 'focusComponent' );
			control.container.on( 'click keydown', '.add-component', control.toggleSecondaryPanel );
			wp.customize.previewer.bind( 'previewer-reset.clc', this.onPageRefresh );
			wp.customize.previewer.bind( 'edit-component.clc', this.focusComponent );

			// Listen to the close button in the component list
			$( '#clc-secondary-panel .clc-header' ).on( 'click keydown', '.clc-close', function( event ) {
				if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
					return;
				}
				control.closeSecondaryPanel();
			});

			// Make the list sortable
			$( '#customize-control-' + control.id + ' .clc-content-list' ).sortable({
				placeholder: 'clc-content-list-placeholder',
				delay: '150',
				handle: '.header',
				update: this.sortingComplete
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
		toggleSecondaryPanel: function( event ) {

			if ( wp.customize.utils.isKeydownButNotEnterEvent( event ) ) {
				return;
			}

			event.preventDefault();

			if ( !$( 'body' ).hasClass( 'clc-secondary-open' ) ) {
				clc.selection_list.collection = this.allowed_components;
				clc.selection_list.render();
			}

			$( 'body' ).toggleClass( 'clc-secondary-open' );
		},

		/**
		 * Close the component list
		 *
		 * @since 0.1
		 */
		closeSecondaryPanel: function() {
			$( 'body' ).removeClass( 'clc-secondary-open' );
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
			atts.order = this.added_components.length;

			// Generate a unique ID for the model in this collection. Since it's
			// just an arbitrary id, it will sometimes match an existing
			// component. It should be rare so just re-generate an ID until we
			// find something unique.
			var get_unique_id = function( id, collection ) {
				return collection.get( id ) ? get_unique_id( _.uniqueId(), collection ) : id;
			};

			atts.id = get_unique_id( _.uniqueId(), this.added_components );

			this.added_components.add( new clc.Models.component_models[type]( atts ).toJSON() );

			this.closeSecondaryPanel();
		},

		/**
		 * Remove a component from the collection of added components
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

			// Clear out component open/closed state
			this.added_components_view.resetComponentStates();

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
		},

		/**
		 * Reset component order when list has been sorted
		 *
		 * @since 0.1
		 */
		sortingComplete: function( event, ui ) {
			ui.item.trigger( 'reordered', ui.item.index() );
		},

		/**
		 * Open and focus on a component
		 *
		 * @since 0.1
		 */
		focusComponent: function( id ) {
			this.focus();
			this.added_components.get( id ).trigger( 'focus' );
		}
	});

	// Register the media control with the content_layout control type
	wp.customize.controlConstructor.content_layout = clc.Control;

} )( jQuery );
