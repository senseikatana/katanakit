<?php

declare(strict_types=1);

namespace KatanaWP\Tests\Support;

use KatanaWP\Exception\KatanaWPException;
use KatanaWP\KataWP;
use PHPUnit\Framework\TestCase;

final class KataWPTest extends TestCase
{
    protected function setUp(): void
    {
        $this->resetState();
        $this->resetBoot();
    }

    public function testBootRegistersThemeSupportsMenusAndImageSizes(): void
    {
        KataWP::boot([
            'supports' => ['title-tag', 'post-thumbnails'],
            'menus' => ['primary' => 'Primary Menu'],
            'image_sizes' => ['hero' => [1600, 900, true]],
        ]);

        self::assertSame(
            [
                ['feature' => 'title-tag', 'args' => []],
                ['feature' => 'post-thumbnails', 'args' => []],
            ],
            $GLOBALS['katana_supports'],
        );

        self::assertSame(['primary' => 'Primary Menu'], $GLOBALS['katana_menus']);

        self::assertSame(
            [['name' => 'hero', 'width' => 1600, 'height' => 900, 'crop' => true]],
            $GLOBALS['katana_image_sizes'],
        );
    }

    public function testBootEnqueuesAssets(): void
    {
        KataWP::boot([
            'assets' => [
                'styles' => [['handle' => 'main', 'src' => 'assets/css/main.css']],
                'scripts' => [['handle' => 'main', 'src' => 'assets/js/main.js', 'in_footer' => true]],
            ],
        ]);

        self::assertCount(1, $GLOBALS['katana_enqueued_styles']);
        self::assertSame('main', $GLOBALS['katana_enqueued_styles'][0]['handle']);
        self::assertSame(
            'https://example.com/wp-content/themes/demo/assets/css/main.css',
            $GLOBALS['katana_enqueued_styles'][0]['src'],
        );

        self::assertCount(1, $GLOBALS['katana_enqueued_scripts']);
        self::assertTrue($GLOBALS['katana_enqueued_scripts'][0]['in_footer']);
    }

    public function testConfigReturnsBootedInstance(): void
    {
        $config = KataWP::boot(['supports' => ['title-tag']]);

        self::assertSame($config, KataWP::config());
    }

    public function testConfigThrowsWhenNotBooted(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('not booted');

        KataWP::config();
    }

    private function resetState(): void
    {
        $GLOBALS['katana_supports'] = [];
        $GLOBALS['katana_image_sizes'] = [];
        $GLOBALS['katana_menus'] = [];
        $GLOBALS['katana_enqueued_styles'] = [];
        $GLOBALS['katana_enqueued_scripts'] = [];
    }

    private function resetBoot(): void
    {
        $property = new \ReflectionProperty(KataWP::class, 'config');
        $property->setValue(null, null);
    }
}
