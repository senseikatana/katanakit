<?php

declare(strict_types=1);

namespace KatanaWP\Tests;

use KatanaWP\Config\Loader;
use KatanaWP\Exception\KatanaWPException;
use PHPUnit\Framework\TestCase;

final class LoaderTest extends TestCase
{
    private const FIXTURES = __DIR__ . '/Fixtures';

    public function testLoadsJsonWithComments(): void
    {
        $data = Loader::load(self::FIXTURES . '/valid.json');

        self::assertSame(['title-tag', 'post-thumbnails'], $data['supports']);
        self::assertSame('Primary Menu', $data['menus']['primary']);
        self::assertSame([1600, 900, true], $data['image_sizes']['hero']);
    }

    public function testLoadsPhpArray(): void
    {
        $data = Loader::load(self::FIXTURES . '/valid.php');

        self::assertSame(['title-tag', 'custom-logo'], $data['supports']);
    }

    public function testPreservesUrlsInsideStrings(): void
    {
        $data = Loader::load(self::FIXTURES . '/urls.json');

        self::assertSame(
            'https://example.com/wp-content/uploads/2024/01/image.jpg',
            $data['site']['url'],
        );
        self::assertSame('//example.com/wp-json', $data['site']['api']);
    }

    public function testThrowsOnInvalidJson(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('Invalid JSON');

        Loader::load(self::FIXTURES . '/invalid.json');
    }

    public function testRejectsTopLevelJsonArray(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('JSON object');

        Loader::load(self::FIXTURES . '/list.json');
    }

    public function testThrowsOnMissingFile(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('not found');

        Loader::load(self::FIXTURES . '/nope.json');
    }

    public function testThrowsOnUnsupportedExtension(): void
    {
        $this->expectException(KatanaWPException::class);
        $this->expectExceptionMessage('Unsupported config extension');

        Loader::load(self::FIXTURES . '/unsupported.txt');
    }

    public function testLoadsYaml(): void
    {
        $data = Loader::load(self::FIXTURES . '/config.yaml');

        self::assertSame(['title-tag'], $data['supports']);
        self::assertSame('Primary Menu', $data['menus']['primary']);
    }
}
