<?php

declare(strict_types=1);

namespace KatanaWP\Config;

use KatanaWP\Exception\KatanaWPException;

/**
 * Normalized, validated view over a KatanaWP configuration array.
 *
 * Phase 1 exposes theme-level keys (supports, menus, image_sizes, assets).
 * Later phases (post_types, taxonomies, fields) consume the same raw payload
 * through {@see Config::get()} until dedicated accessors are added.
 */
final class Config
{
    /**
     * @param array<string, mixed> $data
     */
    public function __construct(private readonly array $data)
    {
        $this->validate();
    }

    /**
     * Returns the raw configuration payload.
     *
     * @return array<string, mixed>
     */
    public function all(): array
    {
        return $this->data;
    }

    /**
     * Reads a top-level key with a fallback default.
     *
     * @return mixed
     */
    public function get(string $key, mixed $default = null): mixed
    {
        return $this->data[$key] ?? $default;
    }

    /**
     * Theme supports as a normalized map of `feature => args`.
     *
     * Accepts either a plain list of feature names or a map where the key is
     * the feature and the value is the arguments array passed to
     * `add_theme_support($feature, $args)`.
     *
     * @return array<string, array<int, mixed>>
     */
    public function supports(): array
    {
        $supports = $this->get('supports', []);

        if (!is_array($supports)) {
            throw new KatanaWPException('"supports" must be a list of feature names or a map of feature => args.');
        }

        $normalized = [];

        foreach ($supports as $key => $value) {
            if (is_int($key)) {
                if (!is_string($value) || $value === '') {
                    throw new KatanaWPException('"supports" entries must be non-empty feature name strings.');
                }
                $normalized[$value] = [];
                continue;
            }

            if (!is_string($key) || !is_array($value)) {
                throw new KatanaWPException('"supports" map entries must be "feature => array of args".');
            }
            $normalized[$key] = array_values($value);
        }

        return $normalized;
    }

    /**
     * Registered navigation menus as a `location => description` map.
     *
     * @return array<string, string>
     */
    public function menus(): array
    {
        return $this->stringMap('menus');
    }

    /**
     * Image sizes as a normalized `name => [width, height, crop]` map.
     *
     * @return array<string, array{0: int, 1: int, 2: bool}>
     */
    public function imageSizes(): array
    {
        $sizes = $this->get('image_sizes', []);

        if (!is_array($sizes)) {
            throw new KatanaWPException('"image_sizes" must be a map of name => [width, height, crop].');
        }

        $normalized = [];

        foreach ($sizes as $name => $spec) {
            if (!is_string($name) || $name === '') {
                throw new KatanaWPException('"image_sizes" keys must be non-empty strings.');
            }

            $normalized[$name] = $this->normalizeImageSize($name, $spec);
        }

        return $normalized;
    }

    /**
     * Enqueued assets as `{ styles: [...], scripts: [...] }`.
     *
     * @return array{styles: list<array<string, mixed>>, scripts: list<array<string, mixed>>}
     */
    public function assets(): array
    {
        $assets = $this->get('assets', []);

        if (!is_array($assets)) {
            throw new KatanaWPException('"assets" must be an object with optional "styles" and "scripts" lists.');
        }

        return [
            'styles' => $this->assetList($assets['styles'] ?? [], 'styles'),
            'scripts' => $this->assetList($assets['scripts'] ?? [], 'scripts'),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function stringMap(string $key): array
    {
        $map = $this->get($key, []);

        if (!is_array($map)) {
            throw new KatanaWPException(sprintf('"%s" must be a map of string => string.', $key));
        }

        foreach ($map as $name => $value) {
            if (!is_string($name) || !is_string($value)) {
                throw new KatanaWPException(sprintf('"%s" must be a map of string => string.', $key));
            }
        }

        return $map;
    }

    /**
     * @return array{0: int, 1: int, 2: bool}
     */
    private function normalizeImageSize(string $name, mixed $spec): array
    {
        if (!is_array($spec)) {
            throw new KatanaWPException(
                sprintf('Image size "%s" must be an array [width, height, crop].', $name),
            );
        }

        $values = array_values($spec);
        $width = $values[0] ?? null;
        $height = $values[1] ?? null;
        $crop = $values[2] ?? false;

        if (!is_int($width) || !is_int($height) || $width < 0 || $height < 0) {
            throw new KatanaWPException(
                sprintf('Image size "%s" must define integer width and height.', $name),
            );
        }

        if (!is_bool($crop)) {
            throw new KatanaWPException(
                sprintf('Image size "%s" crop flag must be a boolean.', $name),
            );
        }

        return [$width, $height, $crop];
    }

    /**
     * @param mixed $value
     * @return list<array<string, mixed>>
     */
    private function assetList(mixed $value, string $section): array
    {
        if (!is_array($value)) {
            throw new KatanaWPException(sprintf('"assets.%s" must be a list of asset definitions.', $section));
        }

        $assets = [];

        foreach ($value as $asset) {
            if (!is_array($asset) || !isset($asset['handle']) || !isset($asset['src'])) {
                throw new KatanaWPException(
                    sprintf('Each "assets.%s" entry must define "handle" and "src".', $section),
                );
            }
            $assets[] = $asset;
        }

        return $assets;
    }

    /**
     * Validates top-level key types to fail fast with a clear message.
     */
    private function validate(): void
    {
        $this->supports();
        $this->menus();
        $this->imageSizes();
        $this->assets();
    }
}
