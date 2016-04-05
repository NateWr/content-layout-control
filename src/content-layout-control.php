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
		static $i18n = array();

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
				self::$i18n = $args['i18n'];

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
			add_action( 'rest_api_init', array( $this, 'remove_customize_signature' ) );
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
				$components[$id] = $component->get_meta_attributes();
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

				$post_id = absint( $post_id );

				// check if post exists
				if ( !get_post_status( $post_id ) ) {
					continue;
				}

				$output[$post_id] = array();

				foreach( $components as $component ) {

					if ( !is_array( $component ) || empty( $component['type'] ) ||
							!isset( $clc->components[ $component['type'] ] ) ||
							!is_subclass_of( $clc->components[ $component['type'] ], 'CLC_Component' ) ) {
						continue;
					}
					$output[$post_id][] = $clc->components[ $component['type'] ]->sanitize( $component );
				}
			}

			return $output;
		}

		/**
		 * Render out the layout when passed an array of component values
		 *
		 * Expect components to have been registered with $this->_load_components()
		 *
		 * @TODO this should be in a template
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
				?>

				<div class="clc-component-layout clc-component-<?php echo esc_attr( $type ); ?>"><?php $component->render_layout(); ?></div>

				<?php
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

			register_rest_route(
				'content-layout-control/v1',
				'/posts/',
				array(
					'methods'   => 'POST',
					'callback' => array( $this, 'api_get_posts' ),
					'permission_callback' => array( $this, 'current_user_can' ),
				)
			);

			$this->_load_components();
			foreach( $this->components as $component ) {
				$component->register_endpoints();
			}
		}

		/**
		 * Compile and return layout in an API request
		 *
		 * @since 0.1
		 */
		public function api_get_layout( WP_REST_Request $request ) {
			$params = stripslashes_deep( $request->get_body_params() );
			$params['html'] = '';

			$this->_load_components();

			if ( !isset( $params['type'] ) || empty( $this->components[$params['type']] ) ) {
				return ''; // @TODO error message much?
			}

			$component = new $this->components[$params['type']]( $params );

			ob_start();
			$component->render_layout();
			return do_shortcode( ob_get_clean() );
		}

		/**
		 * Retrieve a list of posts matching a search query or a single post by
		 * ID
		 *
		 * @since 0.1
		 */
		public function api_get_posts( WP_REST_Request $request ) {
			$params = stripslashes_deep( $request->get_body_params() );

			if ( !isset( $params['s'] ) && !isset( $params['ID'] ) ) {
				return array();
			}

			if ( !isset( $params['return'] ) ) {
				$params['return'] = array(
					'ID'       => 'ID',
					'title'    => 'title',
					'description' => 'post_type_label',
				);
			}

			$args = array(
				'posts_per_page' => 50,
			);

			if ( isset( $params['s'] ) ) {
				$args['s'] = sanitize_text_field( $params['s'] );
			}

			if ( isset( $params['ID'] ) ) {
				$args['post__in'] = is_array( $params['ID'] ) ? array_map( 'absint', $params['ID'] ) : array( absint( $params['ID'] ) );
			}

			if ( isset( $params['post_type'] ) ) {
				$args['post_type'] = is_array( $params['post_type'] ) ? array_map( 'sanitize_text_field', $params['post_type'] ) : sanitize_text_field( $params['post_type'] );
			}

			if ( isset( $params['posts_per_page'] ) ) {
				$args['posts_per_page'] = absint( $params['posts_per_page'] );
			}

			$query = new WP_Query( $args );

			$posts = array();
			while ( $query->have_posts() ) {
				$query->the_post();

				$match = array();
				foreach( $params['return'] as $key => $type ) {
					$match[$key] = $this->api_get_posts_post_data( $type );
				}
				$posts[] = $match;
			}

			if ( isset( $params['s'] ) ) {
				return array(
					's'     => $params['s'],
					'posts' => $posts,
				);
			} elseif ( isset( $params['ID'] ) ) {
				return array(
					'ID'    => $params['ID'],
					'posts' => empty( $posts ) ? array() : $posts[0],
				);
			}

			return array();
		}

		/**
		 * Return a requested value for the post's api endpoint
		 *
		 * @TODO In the future it will probably be better just to use the REST
		 *  API's posts endpoint, which has a schema and fields system for
		 *  deciding what data to return to an endpoint.
		 * @since 0.1
		 */
		public function api_get_posts_post_data( $type ) {
			switch( $type ) {
				case 'ID':
					return get_the_ID();
				case 'permalink':
					return get_the_permalink();
				case 'title':
					return get_the_title();
				case 'date':
					return get_the_date();
				case 'excerpt':
					return get_the_excerpt();
				case 'content':
					return get_the_content();
				case 'post_type':
					return get_post_type( get_the_ID() );
				case 'post_type_label':
					$post_type = get_post_type_object( get_post_type() );
					return $post_type->labels->singular_name;
				default:
					return apply_filters( 'clc_get_posts_post_data', $type );
			}
		}

		/**
		 * Remove the Customizer preview signature during REST API requests
		 * since it corrupts the JSON.
		 *
		 * Lifted with gratitude from: https://github.com/xwp/wp-customize-rest-resources
		 *
		 * @since 0.1
		 */
		public function remove_customize_signature() {
			global $wp_customize;
			if ( ! is_customize_preview() || empty( $wp_customize ) || ! defined( 'REST_REQUEST' ) ) {
				return;
			}
			$wp_customize->remove_preview_signature();
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
