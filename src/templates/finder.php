<div id="ffwp-finder">
	<div class="ffwp-finder-container">
		<div class="ffwp-control">
			<label for="ffwp-search" class="screen-reader-text">
				<?php _e( 'Search' ); ?>
			</label>
			<input type="text" name="ffwp-search" id="ffwp-search" placeholder="<?php _e( 'Search' ); ?>">
		</div>
		<ul class="ffwp-results"></ul>
		<div class="ffwp-status waiting">
			<span class="ffwp-waiting">
				<?php esc_html_e( 'Waiting for input', 'fuzzy-finder-wp' ); ?>
			</span>
			<span class="ffwp-fetching">
				<?php esc_html_e( 'Fetching symbols', 'fuzzy-finder-wp' ); ?>
			</span>
			<span class="ffwp-searching">
				<?php esc_html_e( 'Searching', 'fuzzy-finder-wp' ); ?>
			</span>
			<span class="ffwp-complete">
				<?php esc_html_e( 'Finished', 'fuzzy-finder-wp' ); ?>
			</span>
		</div>
	</div>
</div>
