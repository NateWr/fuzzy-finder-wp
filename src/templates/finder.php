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
				<span class="dashicons dashicons-arrow-right"></span>
				<?php esc_html_e( 'Waiting for 3 characters', 'fuzzy-finder-wp' ); ?>
			</span>
				<span class="ffwp-fetching">
					<span class="ffwp-spinner"></span>
					<?php esc_html_e( 'Fetching symbols', 'fuzzy-finder-wp' ); ?>
				</span>
			<span class="ffwp-searching">
				<span class="ffwp-spinner"></span>
				<?php esc_html_e( 'Searching', 'fuzzy-finder-wp' ); ?>
			</span>
			<span class="ffwp-complete">
				<span class="dashicons dashicons-yes"></span>
				<?php esc_html_e( 'Finished', 'fuzzy-finder-wp' ); ?>
			</span>
		</div>
	</div>
</div>
