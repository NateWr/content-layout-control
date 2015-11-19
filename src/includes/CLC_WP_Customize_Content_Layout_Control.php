<?php
if ( !class_exists( 'CLC_WP_Customize_Content_Layout_Control' ) ) {
	/**
	 * Customizer Content Layout Control class
	 *
	 * A small container control that provides a container in which most
	 * of the content layout component functionality lives. If you want to
	 * add custom `active_callback` or other control arguments, you should
	 * extend this class.
	 *
	 * @see WP_Customize_Control
	 * @since 0.1
	 */
	class CLC_WP_Customize_Content_Layout_Control extends WP_Customize_Control {
		/**
		 * Control type
		 *
		 * @since 0.1
		 */
		public $type = 'content_layout';

		/**
		 * Allowed components
		 *
		 * @since 0.1
		 */
		public $components = array();

		/**
		 * Translatable strings
		 *
		 * @since 0.1
		 */
		public $i18n = array();

		/**
		 * Initialize
		 *
		 * @since 0.1
		 */
		public function __construct( $manager, $id, $args = array() ) {
			parent::__construct( $manager, $id, $args );

			add_action( 'customize_controls_enqueue_scripts', array( $this, 'enqueue_control_assets' ) );
			add_action( 'customize_controls_print_footer_scripts', array( $this, 'add_component_templates' ) );
			add_action( 'customize_preview_init', array( $this, 'enqueue_preview_assets' ) );
			add_action( 'customize_update_content_layout', array( $this, 'save_to_post_content' ), 10, 2 );
			add_action( 'customize_preview_init', array( $this, 'filter_preview_content' ) );
		}

		/**
		 * Render a JS template for the content of the media control.
		 *
		 * This adds a range input below the media control.
		 *
		 * @since 0.1
		 */
		public function content_template() {
			?>

			<ul class="clc-content-list"></ul>

			<div class="buttons">
				<a href="#" class="add-component button-secondary">
					{{ data.i18n['add_component'] }}
				</a>
			</div>

			<?php
		}

		/**
		 * Refresh the parameters passed to the JavaScript via JSON.
		 *
		 * @see WP_Customize_Media_Control::to_json()
		 * @since 0.1
		 */
		public function to_json() {
			parent::to_json();

			$this->json['components'] = $this->components;
			$this->json['i18n'] = $this->i18n;
		}

		/**
		 * Active callback to determine whether control should be visible
		 *
		 * @return bool
		 * @since 0.1
		 */
		public function active_callback() {
			return is_page();
		}

		/**
		 * Enqueue scripts and styles for the control panel
		 *
		 * @return null
		 * @since 0.1
		 */
		public function enqueue_control_assets() {

			$clc = CLC_Content_Layout_Control();

			// Load core control style
			wp_enqueue_style( 'clc-customize-control', CLC_Content_Layout_Control::$url . '/css/customize-control.css', '0.1' );

			// Load required control, model and view classes
			wp_enqueue_script( 'clc-customize-control-js', CLC_Content_Layout_Control::$url  . '/js/customize-control.js', array( 'customize-controls' ), '0.1', true );

			// Pass component defaults for locating component-specific
			// models/views
			wp_localize_script(
				'clc-customize-control-js',
				'clc_components',
				$clc->get_component_attributes()
			);

			// Load component-specific models and views
			foreach( $clc->components as $id => $component ) {
				$component->enqueue_control_assets();
			}
		}


		/**
		 * Enqueue scripts and styles for the preview panel
		 *
		 * @return null
		 * @since 0.1
		 */
		public function enqueue_preview_assets() {

			// Load core preview styles
			wp_enqueue_style( 'clc-customize-preview', CLC_Content_Layout_Control::$url . '/css/customize-preview.css', '0.1' );

			// Load required control, model and view classes
			wp_enqueue_script( 'clc-customize-preview-js', CLC_Content_Layout_Control::$url  . '/js/customize-preview.js', array( 'wp-backbone', 'customize-preview' ), '0.1', true );

			// Pass settings to the script
			wp_localize_script(
				'clc-customize-preview-js',
				'CLC_Preview_Settings',
				array(
					'root' 	=> home_url( rest_get_url_prefix() ),
					'nonce'	=> wp_create_nonce( 'wp_rest' ),
					'i18n'  => array(
						'edit_component' => $this->i18n['edit_component'],
					),
				)
			);

			// Load preview data in `wp_footer` so we have access to template functions like is_page()
			add_action( 'wp_footer', array( $this, 'enqueue_preview_data' ) );

			// Load component-specific models and views
			foreach( CLC_Content_Layout_Control()->components as $id => $component ) {
				$component->enqueue_preview_assets();
			}
		}

		/**
		 * Pass data about the page being previewed to the preview assets
		 *
		 * @see self::enqueue_preview_assets()
		 * @since 0.1
		 */
		public function enqueue_preview_data() {

			$data = array(
				'post_id' => call_user_func( $this->active_callback, $this ) ? get_the_ID() : 0
			);

			if ( is_page() ) {
				$data['components'] = get_post_meta( get_the_ID(), 'content_layout', true );
			}

			wp_localize_script( 'clc-customize-preview-js', 'clc_customize_preview_data', $data );
		}

		/**
		 * Print component templates for use in Backbone Views
		 *
		 * @return array
		 * @since 0.1
		 */
		public function add_component_templates() {

			$clc = CLC_Content_Layout_Control();

			// Add template for component selection view
			?>
			<script type="text/html" id="tmpl-clc-component-summary"><?php $clc->component_summary_template(); ?></script>
			<?php

			// Print each component's control template
			foreach( $clc->components as $id => $component ) {
				?>
				<script type="text/html" id="tmpl-clc-component-<?php esc_attr_e( $id ); ?>"><?php $component->control_template(); ?></script>
				<?php
			}

			// Print component list container
			?>
			<div id="clc-component-list">
				<div class="clc-header">
					<a href="#" class="clc-close button-secondary">
						<?php esc_html_e( CLC_Content_Layout_Control::$strings['close'] ); ?>
					</a>
				</div>
				<ul class="clc-list"></ul>
			</div>
			<?php
		}

		/**
		 * Save values as post meta and render post_content
		 *
		 * @since 0.1
		 */
		public function save_to_post_content( $value, $setting ) {

			if ( empty( $value ) || !is_array( $value ) ) {
				return;
			}

			if ( !current_user_can( CLC_Content_Layout_Control()->capability ) ) {
				return;
			}

			foreach( $value as $post_id => $components ) {
				// Post exists. Checked in sanitize callback
				update_post_meta( $post_id, 'content_layout', $components );

				// Render and save as `post_content`
				wp_update_post(
					array(
						'ID'           => $post_id,
						'post_content' => CLC_Content_Layout_Control()->render_layout( $components ),
					)
				);
			}
		}

		/**
		 * Add content filters to the preview to output layout component wrapper
		 *
		 * @since 0.1
		 */
		public function filter_preview_content() {

			// Filter the_content early so other things can hook in
			add_filter( 'the_content', array( $this, 'create_layout_container' ), 1 );
		}

		/**
		 * Replace saved content with a layout container div for the preview
		 *
		 * @since 0.1
		 */
		public function create_layout_container( $val ) {

			if ( !is_main_query() || !in_the_loop() ) {
				return $val;
			}

			return '<div id="content-layout-control" class="clc-content-layout"></div>';
		}
	}
}
