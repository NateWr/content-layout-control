<li class="type" data-type="{{ data.model.get( 'type' ) }}">
	<label><?php echo $this->strings['title']; ?>
		<input type="text" value="{{ data.model.get( 'title' ) }}" data-clc-setting-link="title">
	</label>
	<label><?php echo $this->strings['content']; ?>
		<input type="text" value="{{ data.model.get( 'content' ) }}" data-clc-setting-link="content">
	</label>
	<p>
		<a href="#" class="delete">Delete</a>
	</p>
</li>
