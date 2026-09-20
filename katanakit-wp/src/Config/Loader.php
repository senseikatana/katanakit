<?php

declare(strict_types=1);

namespace KatanaWP\Config;

use KatanaWP\Exception\KatanaWPException;

/**
 * Loads KatanaWP configuration from a JSON, YAML or PHP file.
 *
 * The JSON loader also accepts line ("//") and block ("/* *\/") comments so
 * non-developers can annotate configuration. Comments inside string literals
 * (for example URLs) are preserved.
 */
final class Loader
{
    /**
     * Loads a config file and returns its contents as an associative array.
     *
     * @param string $path Absolute path to a .json, .yaml/.yml or .php file.
     * @return array<string, mixed>
     *
     * @throws KatanaWPException When the file is missing, unreadable, uses an
     *                           unsupported extension, or contains invalid data.
     */
    public static function load(string $path): array
    {
        if (!is_file($path)) {
            throw new KatanaWPException(sprintf('Config file not found: %s', $path));
        }

        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));

        return match ($extension) {
            'json' => self::loadJson($path),
            'yaml', 'yml' => self::loadYaml($path),
            'php' => self::loadPhp($path),
            default => throw new KatanaWPException(
                sprintf(
                    'Unsupported config extension ".%s" in %s. Use .json, .yaml/.yml or .php.',
                    $extension,
                    $path,
                ),
            ),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private static function loadJson(string $path): array
    {
        $contents = @file_get_contents($path);

        if ($contents === false) {
            throw new KatanaWPException(sprintf('Unable to read config file: %s', $path));
        }

        $contents = self::stripComments($contents);

        try {
            $data = json_decode($contents, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $exception) {
            throw new KatanaWPException(
                sprintf('Invalid JSON in %s: %s', $path, $exception->getMessage()),
                0,
                $exception,
            );
        }

        self::assertMap($data, $path, 'a JSON object');

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private static function loadYaml(string $path): array
    {
        if (!class_exists(\Symfony\Component\Yaml\Yaml::class)) {
            throw new KatanaWPException(
                'YAML support requires "symfony/yaml". Install it with: composer require symfony/yaml',
            );
        }

        try {
            $data = \Symfony\Component\Yaml\Yaml::parseFile($path);
        } catch (\Throwable $exception) {
            throw new KatanaWPException(
                sprintf('Invalid YAML in %s: %s', $path, $exception->getMessage()),
                0,
                $exception,
            );
        }

        self::assertMap($data, $path, 'a YAML mapping');

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private static function loadPhp(string $path): array
    {
        $data = require $path;

        self::assertMap($data, $path, 'an array');

        return $data;
    }

    /**
     * @param mixed $data
     */
    private static function assertMap(mixed $data, string $path, string $expected): void
    {
        if (!is_array($data) || ($data !== [] && array_is_list($data))) {
            throw new KatanaWPException(
                sprintf('Config file %s must contain %s.', $path, $expected),
            );
        }
    }

    /**
     * Strips "//" and "/* *\/" comments without touching string literals.
     */
    private static function stripComments(string $json): string
    {
        $result = '';
        $length = strlen($json);
        $inString = false;
        $inLineComment = false;
        $inBlockComment = false;

        for ($i = 0; $i < $length; $i++) {
            $char = $json[$i];
            $next = ($i + 1 < $length) ? $json[$i + 1] : '';

            if ($inLineComment) {
                if ($char === "\n") {
                    $inLineComment = false;
                    $result .= $char;
                }
                continue;
            }

            if ($inBlockComment) {
                if ($char === '*' && $next === '/') {
                    $inBlockComment = false;
                    $i++;
                }
                continue;
            }

            if ($inString) {
                $result .= $char;

                if ($char === '\\') {
                    if ($i + 1 < $length) {
                        $result .= $next;
                        $i++;
                    }
                    continue;
                }

                if ($char === '"') {
                    $inString = false;
                }
                continue;
            }

            if ($char === '"') {
                $inString = true;
                $result .= $char;
                continue;
            }

            if ($char === '/' && $next === '/') {
                $inLineComment = true;
                $i++;
                continue;
            }

            if ($char === '/' && $next === '*') {
                $inBlockComment = true;
                $i++;
                continue;
            }

            $result .= $char;
        }

        return $result;
    }
}
