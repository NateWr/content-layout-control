<div class="clc-link-form">
	<label>
		<span class="customize-control-title">
			<?php echo $this->i18n['links_url']; ?>
		</span>
		<input type="url" class="clc-content-block-url">
	</label>
	<label>
		<span class="customize-control-title">
			<?php echo $this->i18n['links_text']; ?>
		</span>
		<input type="text" class="clc-content-block-link-text">
	</label>
	<div class="buttons">
		<button class="add-link button-secondary">
			<?php echo $this->i18n['links_add_button']; ?>
		</button>
	</div>
</div>
<div class="clc-link-search">
	<label>
		<span class="label">
			<?php echo $this->i18n['links_search_existing_content']; ?>
		</span>
		<input type="text" class="clc-content-block-link-search">
		<span class="clc-spinner"></span>
	</label>
</div>
<ul class="clc-link-selection-list"></ul>
