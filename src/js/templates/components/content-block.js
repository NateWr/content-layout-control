<li class="type" data-type="{{ data.model.get( 'type' ) }}">
	<label><?php echo $this->strings['title']; ?>
		<input type="text" value="{{ data.model.get( 'title' ) }}" data-clc-setting-link="title">
	</label>
	<label><?php echo $this->strings['content']; ?>
		<textarea data-clc-setting-link="content">{{ data.model.get( 'content' ) }}</textarea>
	</label>
	<p>
		<a href="#" class="delete">Delete</a>
	</p>
</li>
