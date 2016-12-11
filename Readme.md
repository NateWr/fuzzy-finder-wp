# Fuzzy Finder

A fuzzy finder for your WordPress admin. <kbd>ctrl-shift-f</kbd> from any WordPress admin area to quickly search for Posts, Pages, Categories, Tags and Users.

Search results are cached in your browser's local storage. Previous results that match your current search will be shown immediately.

It will also search custom post types that have been registered with the `show_ui` and `show_in_rest` arguments set to `true`.

Inspired by the [Atom package](https://github.com/atom/fuzzy-finder).

## Installation

Download the latest [release package](https://github.com/NateWr/fuzzy-finder-wp/releases), upload to your WordPress site from Plugins > Add New > Upload Plugin, and activate the Fuzzy Finder from the Plugins list.

Or install with [WP-CLI](http://wp-cli.org/): `wp plugin install <url-to-latest-release-package> --activate`.
