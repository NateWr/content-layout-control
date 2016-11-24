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
		public $items = array();

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
		public $settings = array( 'items' );

		/**
		 * Get meta attributes
		 *
		 * @since 0.1
		 */
		public function get_meta_attributes() {

			$atts = parent::get_meta_attributes();
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
				'items'          => isset( $val['items'] ) ? $this->sanitize_items( $val['items'] ) : $this->items,
				'order'          => isset( $val['order'] ) ? absint( $val['order'] ) : 0,
				'type'           => $this->type, // Don't allow this to be modified
			);
		}

		/**
		 * Sanitize items array
		 *
		 * @since 0.1
		 */
		public function sanitize_items( $items ) {
			if ( !is_array( $items ) ) {
				return $this->items;
			}

			if ( $this->limit_posts ) {
				$items = array_slice( $items, 0, $this->limit_posts );
			}

			return array_map( array( $this, 'sanitize_item' ), $items );
		}

		/**
		 * Pluck and sanitize item data
		 *
		 * @since 0.1
		 */
		public function sanitize_item( $item ) {
			return array( 'ID' => isset( $item['ID'] ) ? absint( $item['ID'] ) : 0 );
		}
	}
}
