<div class="clc-link-panel-form">
	<label>
		<span class="customize-control-title">
			<?php echo $this->i18n['links_url']; ?>
		</span>
		<input type="url" class="clc-link-panel-url">
	</label>
	<label>
		<span class="customize-control-title">
			<?php echo $this->i18n['links_text']; ?>
		</span>
		<input type="text" class="clc-link-panel-link-text">
	</label>
	<div class="buttons">
		<button class="add-link button-secondary">
			<?php echo $this->i18n['links_add_button']; ?>
		</button>
	</div>
</div>
<div class="clc-link-panel-search">
	<label>
		<span class="label">
			<?php echo $this->i18n['links_search_existing_content']; ?>
		</span>
		<input type="text" class="clc-link-panel-search-input">
		<span class="clc-spinner"></span>
	</label>
</div>
<ul class="clc-link-panel-list"></ul>
