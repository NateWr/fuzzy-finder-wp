// Controller for the fuzzy finder component
var ffwp_finder = ffwp_finder || {};

jQuery(document).ready(function ($) {

	/**
	 * Initialize the component
	 *
	 * @since 0.1
	 */
	ffwp_finder.init = function() {

		this.cache = this.cache || {};
		this.cache.body = $( 'body' );
		this.cache.finder = $( '#ffwp-finder' );

		this.cache.body.on( 'keyup', this.handleShortcuts );
	};

	/**
	 * Open the finder
	 *
	 * @since 0.1
	 */
	ffwp_finder.open = function() {
		ffwp_finder.cache.body.addClass( 'ffwp-finder-is-visible' );
		ffwp_finder.cache.finder.addClass( 'is-visible' );

		setTimeout( function() {
			ffwp_finder.cache.finder.find( 'input' ).focus();
		}, 300 );
	};

	/**
	 * Close the finder
	 *
	 * @since 0.1
	 */
	ffwp_finder.close = function() {
		ffwp_finder.cache.body.removeClass( 'ffwp-finder-is-visible' );
		ffwp_finder.cache.finder.removeClass( 'is-visible' );

		setTimeout( function() {
			ffwp_finder.cache.finder.find( 'input' ).val( '' );
		}, 300 );
	};

	/**
	 * Process shortcut commands
	 *
	 * @since 0.1
	 */
	ffwp_finder.handleShortcuts = function( e ) {

		// ctrl+shift+f - Open
		if ( e.ctrlKey && e.shiftKey && e.which == 70 ) {
			ffwp_finder.open();
			return;

		// esc - Close
	} else if( e.which == 27 && ffwp_finder.cache.finder.hasClass( 'is-visible' ) ) {
			ffwp_finder.close();
			return;
		}
	};

	// Go!
	ffwp_finder.init();

});
