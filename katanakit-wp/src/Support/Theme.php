<?php

declare(strict_types=1);

namespace KatanaWP\Support;

use KatanaWP\Config\Config;

/**
 * Registers theme supports and image sizes from configuration.
 */
final class Theme
{
    public static function register(Config $config): void
    {
        add_action(
            'after_setup_theme',
            static function () use ($config): void {
                foreach ($config->supports() as $feature => $args) {
                    add_theme_support($feature, $args);
                }

                foreach ($config->imageSizes() as $name => [$width, $height, $crop]) {
                    add_image_size($name, $width, $height, $crop);
                }
            },
        );
    }
}
