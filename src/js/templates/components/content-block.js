<div class="header">
	<h4 class="name">
		<?php esc_html_e( $this->name ); ?>
		<span class="title">{{ data.model.get( 'title' ) }}</span>
	</h4>
	<a href="#" class="clc-toggle-component-form"><?php esc_html_e( CLC_Content_Layout_Control::$i18n['control-toggle'] ); ?></a>
</div>
<div class="control">
	<label>
		<span class="label"><?php echo $this->i18n['title']; ?></span>
		<input type="text" value="{{ data.model.get( 'title' ) }}" data-clc-setting-link="title">
	</label>
	<label>
		<span class="label"><?php echo $this->i18n['content']; ?></span>
		<textarea data-clc-setting-link="content">{{ data.model.get( 'content' ) }}</textarea>
	</label>
</div>
<div class="footer">
	<a href="#" class="delete">Delete</a>
</div>
