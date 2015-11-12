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
		 * User capability required to save settings
		 *
		 * @since 0.1
		 */
		public $capability = 'edit_posts';

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

			<ul class="clc_content_list"></ul>

			<div class="buttons">
				<a href="#" class="add-item">
					{{ data.i18n['add_item'] }}
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

			// Load required control, model and view classes
			wp_enqueue_script( 'clc-customize-preview-js', CLC_Content_Layout_Control::$url  . '/js/customize-preview.js', array( 'customize-preview' ), '0.1', true );
			add_action( 'wp_footer', array( $this, 'enqueue_preview_data' ) ); // loads in wp_footer so we have access to template functions like is_page()

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

			// @TODO should use the active_callback to determine if the given
			//  post is editable.
			$data = array(
				'post_id' => is_page() ? get_the_ID() : 0
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
					<a href="#" class="clc-close">
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

			if ( !current_user_can( $this->capability ) ) {
				return;
			}

			foreach( $value as $post_id => $components ) {
				// Post exists. Checked in sanitize callback
				update_post_meta( $post_id, 'content_layout', $components );

				// Render and save as `post_content`
				wp_update_post(
					array(
						'ID'           => $post_id,
						'post_content' => $this->render_layout( $components ),
					)
				);
			}
		}

		/**
		 * Render out the layout when passed an array of component values
		 *
		 * $this->_load() must have already been called so it can find the
		 * registered components
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
				$components = CLC_Content_Layout_Control()->components;
				if ( !isset( $components[$type] ) || !is_subclass_of( $components[$type], 'CLC_Component' ) ) {
					continue;
				}

				$component = new $components[$type]( $cmp_vals );
				$component->render_layout();
			}
			?>

			</div><!-- .clc-content-layout -->

			<?php

			return ob_get_clean();
		}
	}
}
