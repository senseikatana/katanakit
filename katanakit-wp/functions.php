<?php

/**
 * KatanaWP Demo theme — boots KatanaWP from katana.json.
 */

declare(strict_types=1);

use KatanaWP\KataWP;

require __DIR__ . '/vendor/autoload.php';

KataWP::boot(__DIR__ . '/katana.json');
