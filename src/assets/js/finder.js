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

		// Search data
		this.strings = [];
		this.urls = [];
		this.post_ids = [];
		this.term_ids = [];
		this.user_ids = [];
		this.comment_ids = [];

		// Check for local storage support in browser
		var stored_strings = [];
		var stored_urls = [];
		try {
			stored_strings = JSON.parse( localStorage.getItem( 'ffwp_finder_strings' ) ) || [];
			stored_urls = JSON.parse( localStorage.getItem( 'ffwp_finder_urls' ) ) || [];
			this.post_ids = JSON.parse( localStorage.getItem( 'ffwp_finder_post_ids' ) ) || [];
			this.term_ids = JSON.parse( localStorage.getItem( 'ffwp_finder_term_ids' ) ) || [];
			this.user_ids = JSON.parse( localStorage.getItem( 'ffwp_finder_user_ids' ) ) || [];
			this.comment_ids = JSON.parse( localStorage.getItem( 'ffwp_finder_comment_ids' ) ) || [];
			this.hasLocalStorage = true;
		} catch( e ) {
			this.hasLocalStorage = false;
		}

		this.strings = ffwp_finder_settings.strings.concat( stored_strings );
		this.urls = ffwp_finder_settings.urls.concat( stored_urls );

		// Current status
		this.status = 'waiting';
		this.searched_count = 0;
		this.total_count = ffwp_finder.strings.length;

		// A timer used to throttle the search
		this.search_throttle = 0;

		// jQuery object cache
		this.cache = this.cache || {};
		this.cache.body = $( 'body' );
		this.cache.finder = $( '#ffwp-finder' );
		this.cache.search = this.cache.finder.find( '#ffwp-search' );
		this.cache.results = this.cache.finder.find( '.ffwp-results' );
		this.cache.status = this.cache.finder.find( '.ffwp-status' );
		this.cache.progress = this.cache.status.find( '.ffwp-progress' );

		this.cache.body.on( 'keyup', this.handleShortcuts );
		this.cache.search.on( 'keyup', this.searchThrottle );
		this.cache.finder.on( 'click', this.handleFinderWrapperEvents );
		this.cache.finder.on( 'ffwpSearchBegun', this.setStatusSearching );
		this.cache.finder.on( 'ffwpSearchFinished', this.setStatusComplete );
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
			ffwp_finder.setStatusWaiting();
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
	 * Process click events on the modal wrapper
	 *
	 * @since 0.1
	 */
	ffwp_finder.handleFinderWrapperEvents = function( e ) {
		if ( e.type == 'click' && e.target.id == 'ffwp-finder' ) {
			ffwp_finder.close();
		}
	};

	/**
	 * Wrap the search function with a small utility to throttle requests.
	 *
	 * This prevents the search from firing unless its been 300ms since the last
	 * request.
	 *
	 * @since 0.1
	 */
	ffwp_finder.searchThrottle = function() {
		clearTimeout( ffwp_finder.search_throttle );
		ffwp_finder.search_throttle = setTimeout( ffwp_finder.search, 300 );
	};

	/**
	 * Search for results
	 *
	 * @since 0.1
	 */
	ffwp_finder.search = function() {

		var term = ffwp_finder.cache.search.val();

		if ( term === ffwp_finder.current_term ) {
			return;
		}

		ffwp_finder.current_term = term;

		if ( term.length < 3 ) {
			ffwp_finder.clearResults();
			ffwp_finder.setStatusWaiting();
			return;
		}

		// Remove existing results that no longer match
		// Loop in reverse order so we don't tamper with array keys
		for( var r = ffwp_finder.results.length - 1; r >= 0; r-- ) {
			if ( !( new RegExp( term, 'i' ) ).test( ffwp_finder.strings[ ffwp_finder.results[r] ] ) ) {
				ffwp_finder.removeResult( ffwp_finder.results[r] );
			}
		}

		ffwp_finder.setStatusSearching();

		// Search the database
		if ( wp.api !== 'undefined' ) {

			var apiError = function() {
				if ( term !== ffwp_finder.current_term ) {
					return;
				}
				console.log( 'Error fetching results. This error should probably be more helpful.' );
			};

			if ( ffwp_finder_settings.post_types.length ) {

				var apiSuccessPosts = function( collection, models, xhr ) {
					if ( term !== ffwp_finder.current_term || !collection.length ) {
						return;
					}
					var post_type = _.findWhere( ffwp_finder_settings.post_types, { post_type: collection.at(0).get( 'type' ) } );
					var url = ffwp_finder_settings.admin_url + post_type.edit_link + '&action=edit';
					collection.forEach( function( post ) {

						// Don't add an item twice
						var key = ffwp_finder.post_ids.indexOf( post.get( 'id' ) );
						if ( key < 0 ) {
							key = ffwp_finder.strings.length;
						}

						ffwp_finder.strings[key] = post_type.label + ' > ' + post.get('title').rendered;
						ffwp_finder.urls[key] = url.replace( '%d', post.get( 'id' ) );
						ffwp_finder.post_ids[key] = post.get( 'id' );
						ffwp_finder.addResult( key, 'live', true );
					} );
					ffwp_finder.updateProgress();
					ffwp_finder.updateLocalStorage();
				};

				for ( var p in ffwp_finder_settings.post_types ) {
					var post_type = ffwp_finder_settings.post_types[p].post_type;
					var posts;
					if ( post_type === 'post' ) {
						posts = new wp.api.collections.Posts();
					} else if ( post_type === 'page' ) {
						posts = new wp.api.collections.Pages();
					} else if ( post_type === 'attachment' ) {
						posts = new wp.api.collections.Media();
					} else {
						var routeModel = wp.api.endpoints.at(1);
						var postModel = wp.api.collections.Posts.extend({
							url: routeModel.get( 'apiRoot' ) + routeModel.get( 'versionString' ) + post_type,
						});
						posts = new postModel();
					}

					if ( posts && typeof posts.fetch === 'function' ) {
						posts.fetch({
							data: {
								search: term,
								posts_per_page: 100,
								context: 'edit',
								status: 'any',
							},
							error: apiError,
							success: apiSuccessPosts,
						});
					}
				}
			}

			if ( ffwp_finder_settings.taxonomies.length ) {

				var apiSuccessTerms = function( collection, models, xhr ) {
					if ( term !== ffwp_finder.current_term || !collection.length ) {
						return;
					}
					var taxonomy = _.findWhere( ffwp_finder_settings.taxonomies, { taxonomy_name: collection.at(0).get( 'taxonomy' ) } );
					var url = ffwp_finder_settings.admin_url + 'term.php?taxonomy=' + taxonomy + '&tag_ID=';
					collection.forEach( function( term ) {

						// Don't add an item twice
						var key = ffwp_finder.term_ids.indexOf( term.get( 'id' ) );
						if ( key < 0 ) {
							key = ffwp_finder.strings.length;
						}

						ffwp_finder.strings[key] = taxonomy.label + ' > ' + term.get('name');
						ffwp_finder.urls[key] = url + term.get( 'id' );
						ffwp_finder.term_ids[key] = term.get( 'id' );
						ffwp_finder.addResult( key, 'live', true );
					} );
					ffwp_finder.updateProgress();
					ffwp_finder.updateLocalStorage();
				};

				for ( var t in ffwp_finder_settings.taxonomies ) {
					var taxonomy_name = ffwp_finder_settings.taxonomies[t].taxonomy_name;
					var terms;
					if ( taxonomy_name === 'category' ) {
						terms = new wp.api.collections.Categories();
					} else if ( taxonomy_name === 'post_tag' ) {
						terms = new wp.api.collections.Tags();
					} else {
						terms = null;
					}

					if ( terms ) {
						terms.fetch({
							data: {
								search: term,
								posts_per_page: 100,
								context: 'edit',
							},
							error: apiError,
							success: apiSuccessTerms,
						});
					}
				}
			}

			var users = new wp.api.collections.Users();
			users.fetch({
				data: {
					search: term,
					posts_per_page: 100,
					context: 'edit',
				},
				error: apiError,
				success: function( collection, models, xhr ) {
					if ( term !== ffwp_finder.current_term || !collection.length ) {
						return;
					}
					var url = ffwp_finder_settings.admin_url + 'user-edit.php?user_id=';
					collection.forEach( function( user ) {

						// Don't add an item twice
						var key = ffwp_finder.user_ids.indexOf( user.get( 'id' ) );
						if ( key < 0 ) {
							key = ffwp_finder.strings.length;
						}

						ffwp_finder.strings[key] = 'User > ' + user.get('name');
						ffwp_finder.urls[key] = url + user.get( 'id' );
						ffwp_finder.user_ids[key] = user.get( 'id' );
						ffwp_finder.addResult( key, 'live', true );
					} );
					ffwp_finder.updateProgress();
					ffwp_finder.updateLocalStorage();
				},
			});

			var comments = new wp.api.collections.Comments();
			comments.fetch({
				data: {
					search: term,
					posts_per_page: 100,
					context: 'edit',
					status: 'any',
					_embed: true,
				},
				error: apiError,
				success: function( collection, models, xhr ) {
					if ( term !== ffwp_finder.current_term || !collection.length ) {
						return;
					}
					var url = ffwp_finder_settings.admin_url + 'comment.php?action=editcomment&c=';
					collection.forEach( function( comment ) {

						// Don't add an item twice
						var key = ffwp_finder.comment_ids.indexOf( comment.get( 'id' ) );
						if ( key < 0 ) {
							key = ffwp_finder.strings.length;
						}

						ffwp_finder.strings[key] = 'Comment > ' + comment.get('author_name') + ' > ' + comment.get( '_embedded' ).up[0].title.rendered + ' > ' + $( comment.get( 'content' ).rendered ).text().substring( 0, 50 );
						ffwp_finder.urls[key] = url + comment.get( 'id' );
						ffwp_finder.comment_ids[key] = comment.get( 'id' );
						ffwp_finder.addResult( key, 'live', true );
					} );
					ffwp_finder.updateProgress();
					ffwp_finder.updateLocalStorage();
				},
			});
		}

		// Search list for matches
		var i = 0;
		var len = ffwp_finder.strings.length;
		var processBatch = function() {
			for( i; i < len; i++ ) {

				if ( ( new RegExp( term, 'i' ) ).test( ffwp_finder.strings[i] ) ) {
					ffwp_finder.addResult( i, 'cache' );
				}

				// Emit an event when we've finished the search
				if ( i + 1 >= len ) {
					i++;
					ffwp_finder.updateProgress( i );
					ffwp_finder.cache.finder.trigger( 'ffwpSearchFinished' );

				// Take a breath before continuing with the next batch
				} else if ( i % 100 === 0 ) {
					ffwp_finder.updateProgress( i );

					// Stop looping if the term has changed
					if ( term !== ffwp_finder.current_term ) {
						break;
					}

					setTimeout( processBatch, 0 );
					i++;
					break;
				}
			}
		};
		processBatch();
	};

	/**
	 * Add a result to the list
	 *
	 * @since 0.1
	 */
	ffwp_finder.addResult = function( i, resultClass, prepend ) {

		// Already in results. Remove the existing result so it can be updated
		// with the new result
		if ( ffwp_finder.results.indexOf( i ) !== -1 ) {
			ffwp_finder.removeResult(i);
		}

		// Don't show too many results in the list. It just makes browsers cry
		if ( ffwp_finder.results.length > 100 ) {
			// @todo attach a note saying: more results available, refine search query.
			return;
		}

		// Add to array of visible resuls
		ffwp_finder.results.push( i );

		// Attach to dom
		var html = ffwp_finder_settings.result_template.replace( '{url}', ffwp_finder.urls[i] )
			.replace( '{string}', ffwp_finder.strings[i] )
			.replace( '{index}', i.toString() )
			.replace( '{class}', resultClass );
		if ( prepend ) {
			ffwp_finder.cache.results.prepend( html );
		} else {
			ffwp_finder.cache.results.append( html );
		}
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

		ffwp_finder.updateProgress();
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

	/**
	 * Set the finder's status to fetching
	 *
	 * @since 0.1
	 */
	ffwp_finder.setStatusFetching = function() {

		ffwp_finder.cache.status.removeClass( 'fetching complete waiting' )
			.addClass( 'fetching' );

		ffwp_finder.status = 'fetching';
		ffwp_finder.clearProgress();
	};

	/**
	 * Set the finder's status to searching
	 *
	 * @since 0.1
	 */
	ffwp_finder.setStatusSearching = function() {

		ffwp_finder.cache.status.removeClass( 'fetching complete waiting' )
			.addClass( 'searching' );

		ffwp_finder.status = 'searching';
	};

	/**
	 * Set the finder's status to complete
	 *
	 * @since 0.1
	 */
	ffwp_finder.setStatusComplete = function() {

		ffwp_finder.cache.status.removeClass( 'fetching searching waiting' )
			.addClass( 'complete' );

		ffwp_finder.status = 'complete';
	};

	/**
	 * Set the finder's status to waiting
	 *
	 * This status indicates that no search will be processed for current terms
	 *
	 * @since 0.1
	 */
	ffwp_finder.setStatusWaiting = function() {

		ffwp_finder.cache.status.removeClass( 'fetching searching complete' )
			.addClass( 'waiting' );

		ffwp_finder.status = 'waiting';
		ffwp_finder.clearProgress();
	};

	/**
	 * Update the search progress tracker
	 *
	 * @since 0.1
	 */
	ffwp_finder.updateProgress = function( searched ) {
		this.searched_count += searched;

		// @todo needs to be translatable
		if ( typeof searched === 'undefined' || searched === this.total_count ) {
			ffwp_finder.cache.progress.html( ffwp_finder.results.length + ' matches' );
		} else {
			ffwp_finder.cache.progress.html( searched + '/' + this.total_count );
		}
	};

	/**
	 * Clear the search progress tracker
	 *
	 * @since 0.1
	 */
	ffwp_finder.clearProgress = function() {
		ffwp_finder.cache.progress.empty();
	};

	/**
	 * Update arrays in local storage
	 *
	 * @since 0.1
	 */
	ffwp_finder.updateLocalStorage = function( keys ) {

		if ( !ffwp_finder.hasLocalStorage ) {
			return;
		}

		var strings = ffwp_finder.strings.slice(0);
		strings.splice( 0, ffwp_finder_settings.strings.length );
		var urls = ffwp_finder.urls.slice(0);
		urls.splice( 0, ffwp_finder_settings.urls.length );

		if ( strings.length > 1000 ) {
			strings.splice( 0, strings.length - 1000 );
			urls.splice( 0, urls.length - 1000 );
		}

		localStorage.setItem( 'ffwp_finder_strings', JSON.stringify( strings ) );
		localStorage.setItem( 'ffwp_finder_urls', JSON.stringify( urls ) );
		localStorage.setItem( 'ffwp_finder_post_ids', JSON.stringify( ffwp_finder.post_ids ) );
		localStorage.setItem( 'ffwp_finder_term_ids', JSON.stringify( ffwp_finder.term_ids ) );
		localStorage.setItem( 'ffwp_finder_user_ids', JSON.stringify( ffwp_finder.user_ids ) );
		localStorage.setItem( 'ffwp_finder_comment_ids', JSON.stringify( ffwp_finder.comment_ids ) );
	};

	// Go!
	ffwp_finder.init();

});
