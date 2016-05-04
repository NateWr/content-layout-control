<div class="header">
	<h4 class="name">
		<?php esc_html_e( $this->name ); ?>
		<span class="title">{{ data.model.get( 'title' ) }}</span>
	</h4>
	<a href="#" class="clc-toggle-component-form"><?php esc_html_e( CLC_Content_Layout_Control::$i18n['control-toggle'] ); ?></a>
</div>
<div class="control">
	<div class="setting">
		<# if ( data.model.get( 'items' ).length ) { #>
			<ul class="post-list">
				<# for ( var i in data.model.get( 'items' ) ) { #>
					<# if ( data.model.get( 'limit_posts' ) > 0 && i >= data.model.get( 'limit_posts' ) ) { break; } #>
					<li>
						<# if ( typeof data.model.get( 'items' )[i].title === 'undefined' ) { #>
							<div class="loading">
								<span class="screen-reader-text">
									<?php echo $this->i18n['posts_loading']; ?>
								</span>
							</div>
						<# } else { #>
							{{ data.model.get( 'items' )[i].title }}
							<a href="#" class="remove-post" data-index="{{ i }}">
								<?php echo $this->i18n['posts_remove_button']; ?>
							</a>
						<# } #>
					</li>
				<# } #>
			</ul>
		<# } else { #>
			<div class="placeholder">
				<?php echo $this->i18n['placeholder']; ?>
			</div>
		<# } #>
		<div class="buttons">
			<button class="add-post button-secondary" <# if ( data.model.get( 'limit_posts' ) !== 0 && data.model.get( 'limit_posts' ) <= data.model.get( 'items' ).length ) { #>disabled="disabled"<# } #>>
				<?php echo $this->i18n['posts_add_button']; ?>
			</button>
		</div>
	</div>
</div>
<div class="footer">
	<a href="#" class="delete"><?php esc_html_e( CLC_Content_Layout_Control::$i18n['delete'] ); ?></a>
</div>
