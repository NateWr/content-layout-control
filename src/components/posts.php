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
		 * Posts to display
		 *
		 * @param array List of post ids
		 * @since 0.1
		 */
		public $posts = array();

		/**
		 * Limit number of posts allowed (0 = unlimited)
		 *
		 * @since 0.1
		 */
		public $limit_posts = 0;

		/**
		 * Post types to allow
		 *
		 * @since 0.1
		 */
		public $post_types = 'any';

		/**
		 * Settings expected by this component
		 *
		 * @param array Setting keys
		 * @since 0.1
		 */
		public $settings = array( 'posts' );

		/**
		 * Get attribute hash
		 *
		 * @since 0.1
		 */
		public function get_attributes() {

			$atts = parent::get_attributes();
			$atts['limit_posts'] = $this->limit_posts;
			$atts['post_types'] = $this->post_types;

			return $atts;
		}

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
				'posts'          => isset( $val['posts'] ) ? $this->sanitize_posts( $val['posts'] ) : $this->posts,
				'order'          => isset( $val['order'] ) ? absint( $val['order'] ) : 0,
				'type'           => $this->type, // Don't allow this to be modified
			);
		}

		/**
		 * Sanitize posts array
		 *
		 * @since 0.1
		 */
		public function sanitize_posts( $posts ) {
			if ( !is_array( $posts ) ) {
				return $this->posts;
			}

			if ( $this->limit_posts ) {
				$posts = array_slice( $posts, 0, $this->limit_posts );
			}

			return array_map( array( $this, 'sanitize_post' ), $posts );
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
