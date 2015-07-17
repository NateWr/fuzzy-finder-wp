<?php
/**
 * Plugin Name: Fuzzy Finder
 * Plugin URI: https://github.com/NateWr
 * Description: Fast fuzzy finder for your WordPress admin.
 * Version: 0.1.0
 * Author: Nate Wright
 * Author URI: http://twitter.com/NateWr
 * License:     GNU General Public License v2.0 or later
 * License URI: http://www.gnu.org/licenses/gpl-2.0.html
 *
 * Text Domain: fuzzy-finder-wp
 * Domain Path: /languages/
 *
 * This program is free software; you can redistribute it and/or modify it under the terms of the GNU
 * General Public License as published by the Free Software Foundation; either version 2 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU General Public License along with this program; if not, write
 * to the Free Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
 */
if ( ! defined( 'ABSPATH' ) )
	exit;

if ( !class_exists( 'ffwpInit' ) ) {
class ffwpInit {

	/**
	 * The single instance of this class
	 *
	 * @since 0.1
	 */
	private static $instance;

	/**
	 * Path to the plugin directory
	 *
	 * @since 0.1
	 */
	static $plugin_dir;

	/**
	 * URL to the plugin
	 *
	 * @since 0.1
	 */
	static $plugin_url;

	/**
	 * Version of the plugin
	 *
	 * @since 0.1
	 */
	static $plugin_version;

	/**
	 * Array of strings for search matches
	 *
	 * @since 0.1
	 */
	public $strings;

	/**
	 * Array of URLs which match the self::$strings array
	 *
	 * @since 0.1
	 */
	public $urls;

	/**
	 * Create or retrieve the single instance of the class
	 *
	 * @since 0.1
	 */
	public static function instance() {

		if ( !isset( self::$instance ) ) {

			self::$instance = new ffwpInit();

			self::$plugin_dir = untrailingslashit( plugin_dir_path( __FILE__ ) );
			self::$plugin_url = untrailingslashit( plugin_dir_url( __FILE__ ) );

			self::$instance->init();
		}

		return self::$instance;
	}

	/**
	 * Initialize the plugin and register hooks
	 */
	public function init() {

		if ( !current_user_can( 'manage_options' ) ) {
			return;
		}

		// Initialize the plugin
		add_action( 'admin_init', array( $this, 'load_textdomain' ) );
		add_action( 'admin_init', array( $this, 'load_config' ) );

		add_action( 'admin_enqueue_scripts', array( $this, 'register_assets' ) );

		// Load search data and pass finder to the frontend
		add_action( 'admin_footer', array( $this, 'load_finder' ) );

	}

	/**
	 * Load the plugin textdomain for localistion
	 *
	 * @since 0.1
	 */
	public function load_textdomain() {
		load_plugin_textdomain( 'fuzzy-finder-wp', false, plugin_basename( dirname( __FILE__ ) ) . '/languages/' );
	}

	/**
	 * Load the plugin's configuration variables
	 *
	 * @since 0.1
	 */
	public function load_config() {
		$data = get_plugin_data( __FILE__, false, false );
		self::$plugin_version = $data['Version'];
	}

	/**
	 * Register the script and style assets
	 *
	 * @since 0.1
	 */
	public function register_assets() {
		wp_enqueue_style( 'ffwp_finder', self::$plugin_url . '/assets/css/finder.css', '', self::$plugin_version );
		wp_enqueue_script( 'ffwp_finder', self::$plugin_url . '/assets/js/finder.js', array( 'jquery' ), self::$plugin_version, true );
	}

	/**
	 * Load search data and pass finder to the frontend
	 *
	 * @since 0.1
	 */
	public function load_finder() {

		$this->get_menu_strings();

		// Compile a template for a result
		ob_start();
		include( self::$plugin_dir . '/templates/result.php' );
		$result_template = ob_get_clean();

		// Pass data
		wp_localize_script(
			'ffwp_finder',
			'ffwp_finder_settings',
			array(
				'strings' => $this->strings,
				'urls' => $this->urls,
				'result_template' => $result_template,
			)
		);

		// Print modal template markup
		include( self::$plugin_dir . '/templates/finder.php' );
	}

	/**
	 * Retrieve all menu strings
	 *
	 * @since 0.1
	 */
	public function get_menu_strings() {
		global $menu;
		global $submenu;

		foreach( $menu as $item ) {

			// Skip separators
			if ( empty( $item[0] ) ) {
				continue;
			}

			$this->strings[] = $item[0];
			$this->urls[] = $this->get_menu_item_url( $item[2] );

			if ( !empty( $submenu[ $item[2] ] ) ) {
				foreach( $submenu[ $item[2] ] as $subitem ) {
					$this->strings[] = $item[0] . apply_filters( 'ffwp_string_separator', ' > ' ) . $subitem[0];
					$this->urls[] = $this->get_menu_item_url( $subitem[2] );
				}
			}
		}
	}

	/**
	 * Retrieve a URL for a menu item
	 *
	 * @since 0.1
	 */
	public function get_menu_item_url( $slug ) {
		return strpos( $slug, '.php' ) === false ? menu_page_url( $slug, false ) : get_admin_url( null, $slug );
	}
}
} // endif;

/**
 * This function returns one ffwpInit instance everywhere
 * and can be used like a global, without needing to declare the global.
 *
 * Example: $ffwp = ffwpInit();
 */
if ( !function_exists( 'ffwpInit' ) ) {
function ffwpInit() {
	return ffwpInit::instance();
}
add_action( 'plugins_loaded', 'ffwpInit' );
} // endif;
