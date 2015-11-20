<div class="header">
	<h4 class="name">
		<?php esc_html_e( $this->name ); ?>
		<span class="title">{{ data.model.get( 'title' ) }}</span>
	</h4>
	<a href="#" class="clc-toggle-component-form"><?php esc_html_e( CLC_Content_Layout_Control::$i18n['control-toggle'] ); ?></a>
</div>
<div class="control">
	<div class="setting">
		<span class="customize-control-title"><?php echo $this->i18n['image']; ?></span>
		<# if ( !data.model.get( 'image' ) ) { #>
			<div class="placeholder">
				<?php echo $this->i18n['image_placeholder']; ?>
			</div>
		<# } else { #>
			<div class="thumb loading"></div>
			<fieldset class="position checkbox-list">
				<legend>
					<?php echo $this->i18n['image_position']; ?>
				</legend>
				<label>
					<input type="radio" name="image_position_{{ data.model.get( 'id' ) }}" value="left"<# if ( data.model.get( 'image_position' ) == 'left' ) { #> checked<# } #>>
					<?php echo $this->i18n['image_position_left']; ?>
				</label>
				<label>
					<input type="radio" name="image_position_{{ data.model.get( 'id' ) }}" value="right"<# if ( data.model.get( 'image_position' ) == 'right' ) { #> checked<# } #>>
					<?php echo $this->i18n['image_position_right']; ?>
				</label>
				<label>
					<input type="radio" name="image_position_{{ data.model.get( 'id' ) }}" value="background"<# if ( data.model.get( 'image_position' ) == 'background' ) { #> checked<# } #>>
					<?php echo $this->i18n['image_position_background']; ?>
				</label>
			</fieldset>
		<# } #>
		<div class="buttons">
			<# if ( !data.model.get( 'image' ) ) { #>
				<button class="select-image button-secondary">
					<?php echo $this->i18n['image_select_button']; ?>
				</button>
			<# } else { #>
				<button class="select-image button-secondary">
					<?php echo $this->i18n['image_change_button']; ?>
				</button>
				<button class="remove-image button-secondary">
					<?php echo $this->i18n['image_remove_button']; ?>
				</button>
			<# } #>
		</div>
	</div>
	<label>
		<span class="customize-control-title"><?php echo $this->i18n['title']; ?></span>
		<input type="text" value="{{ data.model.get( 'title' ) }}" data-clc-setting-link="title">
	</label>
	<label>
		<span class="customize-control-title"><?php echo $this->i18n['content']; ?></span>
		<textarea data-clc-setting-link="content">{{ data.model.get( 'content' ) }}</textarea>
	</label>
</div>
<div class="footer">
	<a href="#" class="delete">Delete</a>
</div>
