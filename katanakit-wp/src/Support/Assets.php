<?php

declare(strict_types=1);

namespace KatanaWP\Support;

use KatanaWP\Config\Config;

/**
 * Enqueues styles and scripts from configuration.
 */
final class Assets
{
    public static function register(Config $config): void
    {
        ['styles' => $styles, 'scripts' => $scripts] = $config->assets();

        if ($styles === [] && $scripts === []) {
            return;
        }

        add_action(
            'wp_enqueue_scripts',
            static function () use ($styles, $scripts): void {
                foreach ($styles as $style) {
                    self::enqueueStyle($style);
                }

                foreach ($scripts as $script) {
                    self::enqueueScript($script);
                }
            },
        );
    }

    /**
     * @param array<string, mixed> $style
     */
    private static function enqueueStyle(array $style): void
    {
        wp_enqueue_style(
            (string) $style['handle'],
            self::resolveSrc((string) $style['src']),
            $style['deps'] ?? [],
            self::resolveVersion($style),
        );
    }

    /**
     * @param array<string, mixed> $script
     */
    private static function enqueueScript(array $script): void
    {
        wp_enqueue_script(
            (string) $script['handle'],
            self::resolveSrc((string) $script['src']),
            $script['deps'] ?? [],
            self::resolveVersion($script),
            (bool) ($script['in_footer'] ?? false),
        );
    }

    private static function resolveSrc(string $src): string
    {
        if (preg_match('~^(https?:)?//~', $src)) {
            return $src;
        }

        return rtrim(get_stylesheet_directory_uri(), '/') . '/' . ltrim($src, '/');
    }

    /**
     * @param array<string, mixed> $asset
     */
    private static function resolveVersion(array $asset): mixed
    {
        if (array_key_exists('version', $asset)) {
            return $asset['version'];
        }

        $src = (string) $asset['src'];

        // Only bust local files; remote assets keep WP's default version.
        if (preg_match('~^(https?:)?//~', $src)) {
            return null;
        }

        $path = get_theme_file_path($src);

        if (is_string($path) && file_exists($path)) {
            return (string) filemtime($path);
        }

        return null;
    }
}
