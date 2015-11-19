<?php
/**
 * Layout template for the content-block component
 *
 * @param $this->image int Image attachment ID
 * @param $this->title string Title text string
 * @param $this->content string Content text string
 * @since 0.1
 */
?>

<?php echo wp_get_attachment_image( $this->image ); ?>
<h2 class="title">
	<?php echo $this->title; ?>
</h2>
<div class="content">
	<?php echo $this->content; ?>
</div>
<?php
