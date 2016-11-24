<?php if ( ! defined( 'ABSPATH' ) ) exit;
if ( !class_exists( 'CLC_Component' ) ) {
	/**
	 * Base component class
	 *
	 * @since 0.1
	 */
	abstract class CLC_Component {

		/**
		 * Type of component
		 *
		 * @param string
		 * @since 0.1
		 */
		public $type = '';

		/**
		 * Name of component type
		 *
		 * @param string
		 * @since 0.1
		 */
		public $name = '';

		/**
		 * Description of component type
		 *
		 * @param string
		 * @since 0.1
		 */
		public $description = '';

		/**
		 * Settings
		 *
		 * An array of attributes that should be saved to the database. Array
		 * values match settings keys, eg:
		 *
		 * array( 'image', 'title', 'content' )
		 *
		 * @param array
		 * @since 0.1
		 */
		public $settings = array();

		/**
		 * Translatable strings
		 *
		 * These should be passed in when the setting is registered so that
		 * the appropriate textdomain can be used.
		 *
		 * @param array
		 * @since 0.1
		 */
		public $i18n = array();

		/**
		 * Initialize
		 *
		 * @since 0.1
		 */
		public function __construct( $args ) {
			foreach( $args as $key => $val ) {
				if ( isset( $this->{$key} ) ) {
					$this->{$key} = $val;
				}
			}
		}

		/**
		 * Sanitize settings
		 *
		 * @param array val Values to be sanitized
		 * @return array
		 * @since 0.1
		 */
		abstract function sanitize( $val );

		/**
		 * Get meta attributes
		 *
		 * Meta attributes are passed to the Backbone model and are not intended
		 * to be modified in each instance of the component. Defaults that
		 * that will be modified in each instance should be defined in the
		 * Backbone model.
		 *
		 * These attributes are passed to the Backbone model with a shallow
		 * copy. Arrays or objects will be passed by reference, which may lead
		 * to unexpected results if these attributes are modified in each
		 * instance of the component.
		 *
		 * If you want to pass a meta attribute that will also be modified in
		 * each instance, it must be a JS primitive (null, boolean, string or
		 * and number) that can be cloned with _.clone().
		 *
		 * @return array
		 * @since 0.1
		 */
		public function get_meta_attributes() {
			return array(
				'type'        => $this->type,
				'name'        => $this->name,
				'description' => $this->description,
			);
		}

		/**
		 * Enqueue customizer control assets
		 *
		 * @since 0.1
		 */
		public function enqueue_control_assets() {}

		/**
		 * Enqueue customizer preview assets
		 *
		 * @since 0.1
		 */
		public function enqueue_preview_assets() {}

		/**
		 * Retrieve the template file for this component output
		 *
		 * @since 0.1
		 */
		public function get_render_template() {

			$dirs = wp_unslash(
				apply_filters(
					'clc_component_render_template_dirs',
					array(
						CLC_Content_Layout_Control::$dir . '/components/templates',
					),
					$this
				)
			);

			$file = apply_filters( 'clc_component_render_template_filename', $this->type . '.php', $this );

			foreach( $dirs as $dir ) {
				if ( file_exists( $dir . '/' . $file ) ) {
					return $dir . '/' . $file;
				}
			}

			return '';
		}

		/**
		 * Retrieve the template file for this component's customizer control
		 *
		 * @since 0.1
		 */
		public function get_control_template() {

			$dirs = wp_unslash(
				apply_filters(
					'clc_component_control_template_dirs',
					array(
						CLC_Content_Layout_Control::$dir . '/js/templates/components',
					),
					$this
				)
			);

			$file = apply_filters( 'clc_component_control_template_filename', $this->type . '.js', $this );

			foreach( $dirs as $dir ) {
				if ( file_exists( $dir . '/' . $file ) ) {
					return $dir . '/' . $file;
				}
			}

			return '';
		}

		/**
		 * Render the layout with the content ready to be appended or saved to
		 * `post_content`
		 *
		 * @since 0.1
		 */
		public function render_layout() {
			$file = $this->get_render_template();
			if ( $file ) {
				include( $file );
			}
		}

		/**
		 * Print the control template. It should be an Underscore.js template
		 * using the same template conventions as core WordPress controls
		 *
		 * @since 0.1
		 */
		public function control_template() {
			$file = $this->get_control_template();
			if ( $file ) {
				include( $file );
			}
		}

		/**
		 * Register any custom endpoints required by this component
		 *
		 * @since 0.1
		 */
		public function register_endpoints() {}
	}
}
