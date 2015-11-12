<?php if ( ! defined( 'ABSPATH' ) ) exit;
if ( !class_exists( 'CLC_Content_Layout_Control' ) ) {
	/**
	 * Content Layout Control
	 *
	 * Wrapper class which provides an API for deploying the layout control.
	 *
	 * @since 0.1
	 */
	class CLC_Content_Layout_Control {

		/**
		 * The single instance of this class
		 *
		 * @param string
		 * @since 0.1
		 */
		private static $instance;

		/**
		 * Path to this lib
		 *
		 * @param string
		 * @since 0.1
		 */
		static $dir;

		/**
		 * URL to this lib
		 *
		 * @param string
		 * @since 0.1
		 */
		static $url;

		/**
		 * Translatable strings
		 *
		 * These need to be passed in when instantiated so they can use the
		 * correct textdomain of the theme deploying this control.
		 *
		 * @param array
		 * @since 0.1
		 */
		static $strings = array();

		/**
		 * Registered components
		 *
		 * @param array
		 * @since 0.1
		 */
		public $components = array();


		/**
		 * Create or retrieve the single instance of the class
		 *
		 * @param array $args Array of settings
		 * @return CLC_Content_Layout_Control
		 * @since 0.1
		 */
		public static function instance( $args = array() ) {

			if ( !isset( self::$instance ) ) {

				self::$instance = new CLC_Content_Layout_Control();

				self::$dir = untrailingslashit( plugin_dir_path( __FILE__ ) );
				self::$url = untrailingslashit( $args['url'] );
				self::$strings = $args['strings'];

				self::$instance->init();
			}

			return self::$instance;
		}

		/**
		 * Initialize and register hooks
		 *
		 * @return null
		 * @since 0.1
		 */
		public function init() {
			add_action( 'customize_register', array( $this, '_load'), 9 );
		}

		/**
		 * Load the files required to manage the layout control, preview and
		 * rendering.
		 *
		 * @return null
		 * @since 0.1
		 */
		public function _load( $wp_customize ) {

			// Load control
			include_once( self::$dir . '/includes/CLC_WP_Customize_Content_Layout_Control.php' );
			$wp_customize->register_control_type( 'CLC_WP_Customize_Content_Layout_Control' );

			// Load components
			if ( empty( $this->components ) ) {

				/**
				 * Register allowable components
				 *
				 * This filter allows you to register custom components.
				 * Components are defined by a key and a matching set of
				 * arguments.
				 *
				 * @file required Path to load the component class
				 * @class required Component class found in @file
				 * @name required Name of the component
				 * @description required Short description of the component
				 * @anything optional Pass any details you want to retrieve
				 *  and store in the class's constructor function.
				 *
				 * This is a global register of components. You still need
				 * to define the allowable components when you define the
				 * control alongside other cutomizer controls.
				 *
				 * @see `clc_component_paths` for locating custom component
				 *  files.
				 * @since 0.1
				 */
				$components = apply_filters( 'clc_register_components', array() );

				// Load BaseComponent
				include_once( self::$dir . '/components/base-component.php' );

				// Store all components that are found and instantiated
				foreach( $components as $key => $component ) {
					if ( !array_key_exists( 'file', $component ) || !array_key_exists( 'class', $component ) ) {
						continue;
					}

					if ( file_exists( $component['file'] ) ) {
						include_once( $component['file'] );
						if ( class_exists( $component['class'] ) ) {
							$this->components[ $key ] = new $component['class']( $component );
						}
					}
				}
			}
		}

		/**
		 * Retrieve a hash of component attributes to pass to Backbone Models
		 *
		 * @return array
		 * @since 0.1
		 */
		public function get_component_attributes() {

			$components = array();
			foreach( $this->components as $id => $component ) {
				$components[$id] = $component->get_attributes();
			}

			return $components;
		}

		/**
		 * Sanitize component values
		 *
		 * @since 0.1
		 */
		static function sanitize( $val ) {

			$output = array();

			if ( !is_array( $val ) ) {
				return $output;
			}

			$clc = CLC_Content_Layout_Control();
			if ( empty( $clc->components ) ) {
				return $output;
			}

			foreach( $val as $post_id => $components ) {
				foreach( $components as $component ) {

					if ( !is_array( $component ) || empty( $component['type'] ) ||
							!isset( $clc->components[ $component['type'] ] ) ||
							!is_subclass_of( $clc->components[ $component['type'] ], 'CLC_Component' ) ) {
						continue;
					}

					// check if post exists
					if ( !get_post_status( $post_id ) ) {
						return;
					}

					$output[ absint( $post_id ) ][] = $clc->components[ $component['type'] ]->sanitize( $component );
				}
			}

			return $output;
		}

		/**
		 * Template for a component in the selection list
		 *
		 * @since 0.1
		 */
		public function component_summary_template() {
			include( self::$dir . '/js/templates/component-summary.js' );
		}
	}
}

/**
 * This function returns one CLC_Content_Layout_Control instance everywhere
 * and can be used like a global, without needing to declare the global.
 *
 * Example: $content_layout_control = CLC_Content_Layout_Control();
 */
if ( !function_exists( 'CLC_Content_Layout_Control' ) ) {
	function CLC_Content_Layout_Control( $args = array() ) {
		return CLC_Content_Layout_Control::instance( $args );
	}
}
