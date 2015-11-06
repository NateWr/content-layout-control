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
		 * Label for the Add Item button
		 *
		 * @since 0.1
		 */
		public $add_item_string = '';

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
					<?php esc_html_e( $this->add_item_string ); ?>
				</a>
			</div>

			<?php
		}

		/**
		 * Refresh the parameters passed to the JavaScript via JSON.
		 *
		 * @see WP_Customize_Media_Control::to_json()
		 * @since 0.0.1
		 */
		public function to_json() {
			parent::to_json();

			$this->json['components'] = $this->components;
		}
	}
}
