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
		 * An array hash of attributes that should be saved to the database
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
		public $strings = array();

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
		 * The base class operates a strict sanitization, but this should be
		 * extended in child classes to sanitize appropriately.
		 *
		 * @return array
		 * @since 0.1
		 */
		public function sanitize() {
			$this->settings = absint( $this->settings );
			return $this->settings;
		}

		/**
		 * Get attribute hash for passing to Backbone Model
		 *
		 * All attributes here will be saved with the control data.
		 *
		 * @return array
		 * @since 0.1
		 */
		public function get_attributes() {

			$atts = array(
				'type'        => $this->type,
				'name'        => $this->name,
				'description' => $this->description,
			);

			foreach( $this->settings as $setting ) {
				if (  isset( $this->{$setting} ) ) {
					$atts[$setting] =$this->{$setting};
				}
			}

			return $atts;
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
		 * Render the layout with the content ready to be appended or saved to
		 * `post_content`
		 *
		 * @since 0.1
		 */
		public function render_layout() {}

		/**
		 * Print the control template. It should be an Underscore.js template
		 * using the same template conventions as core WordPress controls
		 *
		 * @since 0.1
		 */
		public function control_template() {}
	}
}
