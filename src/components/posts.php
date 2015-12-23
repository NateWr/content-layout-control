<?php if ( ! defined( 'ABSPATH' ) ) exit;
if ( !class_exists( 'CLC_Component_Posts' ) ) {
	/**
	 * Post layout component
	 *
	 * @since 0.1
	 */
	class CLC_Component_Posts extends CLC_Component {

		/**
		 * Type of component
		 *
		 * @param string
		 * @since 0.1
		 */
		public $type = 'posts';

		/**
		 * Psts to display
		 *
		 * @param array List of post ids
		 * @since 0.1
		 */
		public $posts = array();

		/**
		 * Settings expected by this component
		 *
		 * @param array Setting keys
		 * @since 0.1
		 */
		public $settings = array( 'posts' );

		/**
		 * Sanitize settings
		 *
		 * @param array val Values to be sanitized
		 * @return array
		 * @since 0.1
		 */
		public function sanitize( $val ) {

			return array(
				'id'             => isset( $val['id'] ) ? absint( $val['id'] ) : 0,
				'posts'          => isset( $val['posts'] ) ? array_map( array( $this, 'sanitize_post' ), $val['posts'] ) : $this->posts,
				'order'          => isset( $val['order'] ) ? absint( $val['order'] ) : 0,
				'type'           => $this->type, // Don't allow this to be modified
			);
		}

		/**
		 * Pluck and sanitize post data
		 *
		 * @since 0.1
		 */
		public function sanitize_post( $post ) {
			return isset( $post['ID'] ) ? absint( $post['ID'] ) : 0;
		}


		/**
		 * Render the layout template and return an HTML blob with the content,
		 * ready to be appended or saved to `post_content`
		 *
		 * @since 0.1
		 */
		public function render_layout() {
			include( CLC_Content_Layout_Control::$dir . '/components/templates/posts.php' );
		}

		/**
		 * Print the control template. It should be an Underscore.js template
		 * using the same template conventions as core WordPress controls
		 *
		 * @since 0.1
		 */
		public function control_template() {
			include( CLC_Content_Layout_Control::$dir . '/js/templates/components/posts.js' );
		}
	}
}
