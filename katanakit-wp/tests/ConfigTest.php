<?php

declare(strict_types=1);

namespace KatanaWP\Tests;

use KatanaWP\Config\Config;
use KatanaWP\Exception\KatanaWPException;
use PHPUnit\Framework\TestCase;

final class ConfigTest extends TestCase
{
    public function testDefaultsToEmpty(): void
    {
        $config = new Config([]);

        self::assertSame([], $config->supports());
        self::assertSame([], $config->menus());
        self::assertSame([], $config->imageSizes());
        self::assertSame(['styles' => [], 'scripts' => []], $config->assets());
    }

    public function testNormalizesSupportsListAndMap(): void
    {
        $config = new Config([
            'supports' => ['title-tag', 'custom-logo' => ['height' => 100]],
        ]);

        self::assertSame(
            ['title-tag' => [], 'custom-logo' => [100]],
            $config->supports(),
        );
    }

    public function testNormalizesImageSizes(): void
    {
        $config = new Config([
            'image_sizes' => ['hero' => [1600, 900, true]],
        ]);

        self::assertSame(['hero' => [1600, 900, true]], $config->imageSizes());
    }

    public function testReadsMenus(): void
    {
        $config = new Config(['menus' => ['primary' => 'Primary Menu']]);

        self::assertSame(['primary' => 'Primary Menu'], $config->menus());
    }

    public function testReadsAssets(): void
    {
        $config = new Config([
            'assets' => [
                'styles' => [['handle' => 'main', 'src' => 'assets/css/main.css']],
                'scripts' => [],
            ],
        ]);

        $assets = $config->assets();

        self::assertCount(1, $assets['styles']);
        self::assertSame('main', $assets['styles'][0]['handle']);
        self::assertSame([], $assets['scripts']);
    }

    public function testThrowsOnInvalidImageSize(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('must be an array');

        new Config(['image_sizes' => ['hero' => 'not-an-array']]);
    }

    public function testThrowsOnNegativeImageDimensions(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('integer width and height');

        new Config(['image_sizes' => ['hero' => [-1, 900, true]]]);
    }

    public function testThrowsOnNonStringMenuValue(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('string => string');

        new Config(['menus' => ['primary' => 123]]);
    }

    public function testThrowsOnAssetMissingHandle(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('"handle" and "src"');

        new Config(['assets' => ['styles' => [['src' => 'assets/css/main.css']]]]);
    }
}
