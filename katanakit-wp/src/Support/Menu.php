<?php

declare(strict_types=1);

namespace KatanaWP\Support;

use KatanaWP\Config\Config;

/**
 * Registers navigation menu locations from configuration.
 */
final class Menu
{
    public static function register(Config $config): void
    {
        $menus = $config->menus();

        if ($menus === []) {
            return;
        }

        add_action(
            'after_setup_theme',
            static function () use ($menus): void {
                register_nav_menus($menus);
            },
        );
    }
}
