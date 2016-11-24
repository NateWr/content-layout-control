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
		 * Links to display
		 *
		 * @param array
		 * @since 0.1
		 */
		public $links = array();

		/**
		 * Image (attachment ID)
		 *
		 * @param int
		 * @since 0.1
		 */
		public $image = 0;

		/**
		 * Image position
		 *
		 * @param string left|right
		 * @since 0.1
		 */
		public $image_position = 'left';

		/**
		 * Settings expected by this component
		 *
		 * @param array Setting keys
		 * @since 0.1
		 */
		public $settings = array( 'title', 'content', 'links', 'image', 'image_position' );

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
				'title'          => isset( $val['title'] ) ? sanitize_text_field( $val['title'] ) : $this->title,
				'content'        => isset( $val['content'] ) ? wp_kses_post( $val['content'] ) : $this->content,
				'links'          => isset( $val['links'] ) ? $this->sanitize_links( $val['links'] ) : $this->links,
				'image'          => isset( $val['image'] ) ? absint( $val['image'] ) : $this->image,
				'image_position' => isset( $val['image_position'] ) ? sanitize_text_field( $val['image_position'] ) : $this->image_position,
				'order'          => isset( $val['order'] ) ? absint( $val['order'] ) : 0,
				'type'           => $this->type, // Don't allow this to be modified
			);
		}

		/**
		 * Register custom endpoint to transform image ID into thumb URL
		 *
		 * @since 0.1
		 */
		public function register_endpoints() {
			register_rest_route(
				'content-layout-control/v1',
				'/components/content-block/thumb-url/(?P<id>\d+)',
				array(
					'methods'   => 'GET',
					'callback' => array( $this, 'api_get_thumb_url' ),
					'permission_callback' => array( CLC_Content_Layout_Control(), 'current_user_can' ),
				)
			);
			register_rest_route(
				'content-layout-control/v1',
				'/components/content-block/links/(?P<search>.+)',
				array(
					'methods'   => 'GET',
					'callback' => array( $this, 'api_get_links' ),
					'permission_callback' => array( CLC_Content_Layout_Control(), 'current_user_can' ),
				)
			);
		}

		/**
		 * API endpoint: transform an image ID into the thumbnail URL
		 *
		 * @since 0.1
		 */
		public function api_get_thumb_url( WP_REST_Request $request ) {

			if ( !isset( $request['id'] ) ) {
				return '';
			}

			$img = wp_get_attachment_image_src( absint( $request['id'] ), 'medium' );
			return $img[0];
		}

		/**
		 * API endpoint: retrieve a list of potential links matching search
		 * query
		 *
		 * @since 0.1
		 */
		public function api_get_links( WP_REST_Request $request ) {

			if ( !isset( $request['search'] ) ) {
				return array();
			}

			$search = sanitize_text_field( $request['search'] );

			$args = array(
				's'              => $search,
				'post_type'      => 'any',
				'posts_per_page' => 50,
			);
			$query = new WP_Query( $args );

			$links = array();
			while ( $query->have_posts() ) {
				$query->the_post();

				$post_type = get_post_type_object( get_post_type() );
				$links[] = array(
					'ID' => get_the_ID(),
					'permalink' => get_the_permalink(),
					'title' => get_the_title(),
					'post_type_label' => $post_type->labels->singular_name,
				);
			}

			return array(
				'search' => $search,
				'links'  => $links,
			);
		}

		/**
		 * Saanitize the array of links
		 *
		 * @since 0.1
		 */
		public function sanitize_links( $links ) {
			if ( !is_array( $links ) || empty( $links ) ) {
				return array();
			}


			$new_links = array();
			foreach( $links as $link ) {
				$new_links[] = array_map( 'sanitize_text_field', $link );
			}

			return $new_links;
		}
	}
}
