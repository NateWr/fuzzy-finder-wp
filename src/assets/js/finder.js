// Controller for the fuzzy finder component
var ffwp_finder = ffwp_finder || {};

jQuery(document).ready(function ($) {

	/**
	 * Initialize the component
	 *
	 * @since 0.1
	 */
	ffwp_finder.init = function() {

		// Result index keys currently being shown
		this.results = [];

		// jQuery object cache
		this.cache = this.cache || {};
		this.cache.body = $( 'body' );
		this.cache.finder = $( '#ffwp-finder' );
		this.cache.search = this.cache.finder.find( '#ffwp-search' );
		this.cache.results = this.cache.finder.find( '.ffwp-results' );

		this.cache.body.on( 'keyup', this.handleShortcuts );
		this.cache.search.on( 'keyup', this.search );
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
			ffwp_finder.cache.search.focus();
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
			ffwp_finder.cache.search.val( '' );
			ffwp_finder.clearResults();
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

	/**
	 * Search for results
	 *
	 * @since 0.1
	 */
	ffwp_finder.search = function() {

		var term = ffwp_finder.cache.search.val();
		ffwp_finder.current_term = term;

		if ( term.length < 3 ) {
			ffwp_finder.clearResults();
			return;
		}

		// Remove existing results that no longer match
		// Loop in reverse order so we don't tamper with array keys
		for( var r = ffwp_finder.results.length - 1; r >= 0; r-- ) {
			if ( !( new RegExp( term, 'i' ) ).test( ffwp_finder_settings.strings[ ffwp_finder.results[r] ] ) ) {
				ffwp_finder.removeResult( ffwp_finder.results[r] );
			}
		}

		// Search list for matches
		for( var i = 0; i < ffwp_finder_settings.strings.length; i++ ) {

			// Stop looping if the term has changed
			if ( term !== ffwp_finder.current_term ) {
				break;
			}

			if ( ( new RegExp( term, 'i' ) ).test( ffwp_finder_settings.strings[i] ) ) {
				ffwp_finder.addResult( i );
			}
		}
	};

	/**
	 * Add a result to the list
	 *
	 * @since 0.1
	 */
	ffwp_finder.addResult = function( i ) {

		// Already visible
		if ( ffwp_finder.results.indexOf( i ) !== -1 ) {
			return;
		}

		// Add to array of visible resuls
		ffwp_finder.results.push( i );

		// Attach to dom
		var html = ffwp_finder_settings.result_template.replace( '{url}', ffwp_finder_settings.urls[i] )
			.replace( '{string}', ffwp_finder_settings.strings[i] )
			.replace( '{index}', i.toString() );
		ffwp_finder.cache.results.append( html );
	};

	/**
	 * Remove a result from teh list
	 *
	 * @since 0.1
	 */
	ffwp_finder.removeResult = function( i ) {

		var index = ffwp_finder.results.indexOf( i );
		if ( index > -1 ) {
			ffwp_finder.results.splice( index, 1 );
		}

		ffwp_finder.cache.results.find( '#ffwp-result-' + i.toString() ).remove();
	};

	/**
	 * Clear out all results from the list
	 *
	 *  @since 0.1
	 */
	ffwp_finder.clearResults = function() {
		ffwp_finder.results = [];
		ffwp_finder.cache.results.empty();
	};

	// Go!
	ffwp_finder.init();

});
