( function( $ ) {
	/**
	 * Namespace for base controls, models, collections and views used by the
	 * Content Layout control. Individual component models and views are defined
	 * separately in /components.
	 *
	 * @since 0.1
	 */
	var clc = wp.customize.ContentLayoutControl;

	/**
	 * Bind to component change events
	 *
	 * @since 0.0.1
	 */
	$( function() {

		// Send updated post data to the controller
		wp.customize.preview.bind( 'active', function() {
			wp.customize.preview.send( 'customizer-active.clc', clc_customize_preview_data );
		});

		wp.customize.preview.bind( 'component-added.clc', function( model ) {
			console.log( 'component-added.clc' );
			console.log(model);
		});

		wp.customize.preview.bind( 'component-removed.clc', function( model ) {
			console.log( 'component-removed.clc' );
			console.log(model);
		});

		wp.customize.preview.bind( 'component-changed.clc', function( model ) {
			console.log( 'component-changed.clc' );
			console.log(model);
		});

		wp.customize.preview.bind( 'refresh-layout.clc', function( models ) {
			console.log( 'refresh-layout.clc' );
			console.log(models);
		});
	} );

} )( jQuery );
