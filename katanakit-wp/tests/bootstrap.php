<?php

declare(strict_types=1);

/**
 * Minimal WordPress function stubs so KatanaWP can be unit-tested without
 * bootstrapping a full WordPress installation.
 *
 * Each stub records its invocation into $GLOBALS so tests can assert on the
 * registrations produced by KatanaWP. State is reset by tests via
 * KatanaWP\Tests\reset_state().
 */

require __DIR__ . '/../vendor/autoload.php';

if (!function_exists('add_action')) {
    function add_action(string $hook, callable $callback, int $priority = 10, int $accepted_args = 1): void
    {
        // Execute theme/enqueue hooks immediately so registration is assertable.
        if (in_array($hook, ['after_setup_theme', 'wp_enqueue_scripts', 'init'], true)) {
            $callback();
        }
    }
}

if (!function_exists('add_theme_support')) {
    function add_theme_support(string $feature, array $args = []): void
    {
        $GLOBALS['katana_supports'][] = ['feature' => $feature, 'args' => $args];
    }
}

if (!function_exists('add_image_size')) {
    function add_image_size(string $name, int $width, int $height, bool $crop = false): void
    {
        $GLOBALS['katana_image_sizes'][] = ['name' => $name, 'width' => $width, 'height' => $height, 'crop' => $crop];
    }
}

if (!function_exists('register_nav_menus')) {
    function register_nav_menus(array $menus): void
    {
        $GLOBALS['katana_menus'] = $menus;
    }
}

if (!function_exists('wp_enqueue_style')) {
    function wp_enqueue_style(string $handle, string $src = '', array $deps = [], mixed $ver = false, string $media = 'all'): void
    {
        $GLOBALS['katana_enqueued_styles'][] = compact('handle', 'src', 'deps', 'ver', 'media');
    }
}

if (!function_exists('wp_enqueue_script')) {
    function wp_enqueue_script(string $handle, string $src = '', array $deps = [], mixed $ver = false, bool $in_footer = false): void
    {
        $GLOBALS['katana_enqueued_scripts'][] = compact('handle', 'src', 'deps', 'ver', 'in_footer');
    }
}

if (!function_exists('get_stylesheet_directory_uri')) {
    function get_stylesheet_directory_uri(): string
    {
        return 'https://example.com/wp-content/themes/demo';
    }
}

if (!function_exists('get_theme_file_path')) {
    function get_theme_file_path(string $file): string
    {
        return '/srv/wordpress/wp-content/themes/demo/' . $file;
    }
}
