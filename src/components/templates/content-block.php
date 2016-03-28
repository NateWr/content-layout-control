<?php
/**
 * Layout template for the content-block component
 *
 * @param $this->title string Title text string
 * @param $this->content string Content text string
 * @param $this->links array List of links [ url: 'http://...', link_text: 'Click Here']
 * @param $this->image int Image attachment ID
 * @param $this->image_position string Position of the image: left|right
 * @since 0.1
 */
?>

<div class="clc-wrapper<?php if ( $this->image ) : ?> image-position-<?php echo esc_attr( $this->image_position ); endif; ?>">
	<?php if ( $this->image ) : ?>
		<div class="image">
			<?php echo wp_get_attachment_image( $this->image ); ?>
		</div>
	<?php endif; ?>
	<div class="text">
		<h2 class="title">
			<?php echo $this->title; ?>
		</h2>
		<div class="content">
			<?php echo $this->content; ?>
		</div>
		<?php if ( !empty( $this->links ) ) : ?>
			<ul class="links">
				<?php foreach( $this->links as $link ) : ?>
					<li>
						<a href="<?php echo esc_url( $link['url'] ); ?>"><?php echo esc_html( $link['link_text'] ); ?></a>
					</li>
				<?php endforeach; ?>
			</ul>
		<?php endif; ?>
	</div>
</div>
<?php
