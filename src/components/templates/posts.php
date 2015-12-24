<?php
/**
 * Layout template for the post component
 *
 * @param $this->posts array List of posts
 * @since 0.1
 */
?>

<div class="clc-wrapper">
	<?php foreach( $this->posts as $post ) : ?>
		<?php $post_query = new WP_Query( array( 'post__in' => array( $post ) ) ); ?>
		<?php while( $post_query->have_posts() ) : $post_query->the_post(); ?>

			<article class="clc-post">
				<h3>
					<a href="<?php echo esc_url( get_the_permalink() ); ?>">
						<?php the_title(); ?>
					</a>
				</h3>
				<div class="excerpt">
					<?php the_excerpt(); ?>
				</div>
			</article>

		<?php endwhile; ?>
	<?php endforeach; ?>
</div>
<?php
