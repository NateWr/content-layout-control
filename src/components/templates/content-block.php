<?php
/**
 * Layout template for the content-block component
 *
 * @param $this->image int Image attachment ID
 * @param $this->image_position string Position of the image: left|right|background
 * @param $this->title string Title text string
 * @param $this->content string Content text string
 * @since 0.1
 */
?>

<div class="clc-wrapper<?php if ( $this->image ) : ?> image-position-<?php esc_attr_e( $this->image_position ); endif; ?>">
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
	</div>
</div>
<?php
