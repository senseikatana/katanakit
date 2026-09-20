<?php

declare(strict_types=1);

namespace KatanaWP;

use KatanaWP\Config\Config;
use KatanaWP\Config\Loader;
use KatanaWP\Exception\KatanaWPException;
use KatanaWP\Support\Assets;
use KatanaWP\Support\Menu;
use KatanaWP\Support\Theme;

/**
 * KatanaWP — code-first WordPress configuration entry point.
 *
 * @example
 * ```php
 * use KatanaWP\KataWP;
 *
 * KataWP::boot(get_stylesheet_directory() . '/katana.json');
 * ```
 */
final class KataWP
{
    private static ?Config $config = null;

    /**
     * Boots KatanaWP from a config file path or an inline array.
     *
     * @param string|array<string, mixed> $source Absolute path to a config file,
     *                                           or an inline configuration array.
     *
     * @throws KatanaWPException When the source is invalid.
     */
    public static function boot(string|array $source): Config
    {
        $data = is_array($source) ? $source : Loader::load($source);
        $config = new Config($data);

        self::$config = $config;

        Theme::register($config);
        Menu::register($config);
        Assets::register($config);

        return $config;
    }

    /**
     * Returns the booted configuration.
     *
     * @throws KatanaWPException When KatanaWP has not been booted yet.
     */
    public static function config(): Config
    {
        if (self::$config === null) {
            throw new KatanaWPException('KatanaWP is not booted. Call KataWP::boot() first.');
        }

        return self::$config;
    }
}
