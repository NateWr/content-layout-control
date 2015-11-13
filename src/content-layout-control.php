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
		 * User capability required to save settings
		 *
		 * @since 0.1
		 */
		public $capability = 'edit_posts';

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

				if ( isset( $args['capability'] ) ) {
					$this->capability = $args['capability'];
				}

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
			add_action( 'customize_register', array( $this, '_load_customizer'), 9 );
			add_action( 'rest_api_init', array( $this, 'register_endpoints' ) );
		}

		/**
		 * Check if user can interact with this control
		 *
		 * @since 0.1
		 */
		public function current_user_can() {
			return current_user_can( $this->capability );
		}

		/**
		 * Load the control files used for the customizer control and preview
		 * panes.
		 *
		 * @return null
		 * @since 0.1
		 */
		public function _load_customizer( $wp_customize ) {

			include_once( self::$dir . '/includes/CLC_WP_Customize_Content_Layout_Control.php' );
			$wp_customize->register_control_type( 'CLC_WP_Customize_Content_Layout_Control' );

			$this->_load_components();
		}

		/**
		 * Load components
		 *
		 * @since 0.1
		 */
		public function _load_components() {

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

		/**
		 * Render out the layout when passed an array of component values
		 *
		 * Expect components to have been registered with $this->_load_components()
		 *
		 * @return string HTML blog to be stored in post_content
		 * @since 0.1
		 */
		public function render_layout( $value ) {

			ob_start();
			// @TODO use a template and maybe even allow a new template to be
			//  specified when instantiating this class
			?>

			<div class="clc-content-layout">

			<?php
			foreach( $value as $cmp_vals ) {

				if ( !isset( $cmp_vals['type'] ) ) {
					continue;
				}

				$type = $cmp_vals['type'];
				$components = $this->components;
				if ( !isset( $components[$type] ) || !is_subclass_of( $components[$type], 'CLC_Component' ) ) {
					continue;
				}

				$component = new $components[$type]( $cmp_vals );
				$component->render_layout();
			}
			?>

			</div>

			<?php

			return ob_get_clean();
		}

		/**
		 * Register endpoints
		 *
		 * @since 0.1
		 */
		public function register_endpoints() {
			register_rest_route(
				'content-layout-control/v1',
				'/render-components',
				array(
					'methods'   => 'POST',
					'callback' => array( $this, 'api_get_layout' ),
					'permission_callback' => array( $this, 'current_user_can' ),
				)
			);
		}

		/**
		 * Compile and return layout in an API request
		 *
		 * @since 0.1
		 */
		public function api_get_layout( WP_REST_Request $request ) {
			$params = $request->get_body_params();
			$params['html'] = '';

			$this->_load_components();

			if ( !isset( $params['type'] ) || empty( $this->components[$params['type']] ) ) {
				return ''; // @TODO error message much?
			}

			$component = new $this->components[$params['type']]( $params );

			ob_start();
			$component->render_layout();
			return ob_get_clean();
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
