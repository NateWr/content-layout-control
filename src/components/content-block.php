<?php if ( ! defined( 'ABSPATH' ) ) exit;
if ( !class_exists( 'CLC_Component_Content_Block' ) ) {
	/**
	 * Single-block photo/text layout component
	 *
	 * @since 0.1
	 */
	class CLC_Component_Content_Block extends CLC_Component {

		/**
		 * Type of component
		 *
		 * @param string
		 * @since 0.1
		 */
		public $type = 'content-block';

		/**
		 * Image (attachment ID)
		 *
		 * @param int
		 * @since 0.1
		 */
		public $image = 0;

		/**
		 * Title
		 *
		 * @param string
		 * @since 0.1
		 */
		public $title = '';

		/**
		 * Content
		 *
		 * @param string
		 * @since 0.1
		 */
		public $content = '';

		/**
		 * Settings expected by this component
		 *
		 * @param array Setting keys
		 * @since 0.1
		 */
		public $settings = array( 'image', 'title', 'content' );

		/**
		 * Sanitize settings
		 *
		 * @param array val Values to be sanitized
		 * @return array
		 * @since 0.1
		 */
		public function sanitize( $val ) {

			return array(
				'id'      => isset( $val['id'] ) ? absint( $val['id'] ) : 0,
				'image'   => isset( $val['image'] ) ? absint( $val['image'] ) : $this->image,
				'title'   => isset( $val['title'] ) ? sanitize_text_field( $val['title'] ) : $this->title,
				'content' => isset( $val['content'] ) ? wp_kses_post( $val['content'] ) : $this->content,
				'order'   => isset( $val['order'] ) ? absint( $val['order'] ) : 0,
				'type'    => $this->type, // Don't allow this to be modified
			);
		}

		/**
		 * Enqueue customizer control assets
		 *
		 * @since 0.1
		 */
		public function enqueue_control_assets() {
			wp_enqueue_script( 'clc-component-content-block-control-js', CLC_Content_Layout_Control::$url  . '/js/components/content-block-control.js', array( 'customize-controls', 'clc-customize-control-js' ), '0.1', true );
		}

		/**
		 * Enqueue customizer preview assets
		 *
		 * @since 0.1
		 */
		public function enqueue_preview_assets() {
			wp_enqueue_script( 'clc-component-content-block-preview-js', CLC_Content_Layout_Control::$url  . '/js/components/content-block-preview.js', array( 'clc-customize-preview-js' ), '0.1', true );
		}

		/**
		 * Render the layout template and return an HTML blob with the content,
		 * ready to be appended or saved to `post_content`
		 *
		 * @since 0.1
		 */
		public function render_layout() {
			include( CLC_Content_Layout_Control::$dir . '/components/templates/content-block.php' );
		}

		/**
		 * Print the control template. It should be an Underscore.js template
		 * using the same template conventions as core WordPress controls
		 *
		 * @since 0.1
		 */
		public function control_template() {
			include( CLC_Content_Layout_Control::$dir . '/js/templates/components/content-block.js' );
		}
	}
}
