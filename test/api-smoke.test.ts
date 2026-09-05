// ============================================================
// api-smoke.test.ts — Compiles test/fixtures/api-smoke.scss
// with loadPaths ['src/scss'] and asserts the public API
// surface: breakpoint aliases (xxl/xxxl/x2l-down/x3l-down),
// grid-stack/grid-stack-item/grid-placement/grid-item-full,
// token accessors, and the dark theme inversion.
//
// Deterministic: compiles in memory. No network, no git,
// read-only over src/ and dist/.
// ============================================================

import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = path.join(PROJECT_ROOT, 'test', 'fixtures', 'api-smoke.scss');
const LOAD_PATHS = [path.join(PROJECT_ROOT, 'src', 'scss')];

let css: string | null = null;

function getCss(): string {
  if (css === null) {
    css = sass.compile(FIXTURE, { loadPaths: LOAD_PATHS }).css;
  }
  return css;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Extracts the body of the first rule whose selector matches exactly.
function extractRule(stylesheet: string, selector: string): string | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = stylesheet.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  return match ? (match[1] ?? null) : null;
}

// Extracts the value of a declaration inside a rule body.
function declarationValue(ruleBody: string, property: string): string | null {
  const match = ruleBody.match(new RegExp(`${property}:\\s*([^;]+);`));
  return match?.[1]?.trim() ?? null;
}

describe('api-smoke: fixture test/fixtures/api-smoke.scss', () => {
  it('should compile without errors', () => {
    let output: string;
    try {
      output = getCss();
    } catch (error) {
      assert.fail(`compiling ${FIXTURE} failed: ${errorMessage(error)}`);
    }
    assert.ok(output.length > 0, `compiled CSS of ${FIXTURE} should not be empty`);
  });

  it('should emit the xxl and xxxl up media queries', () => {
    const output = getCss();
    assert.ok(output.includes('@media (min-width: 1536px)'), 'expected xxl @media (min-width: 1536px)');
    assert.ok(output.includes('@media (min-width: 1920px)'), 'expected xxxl @media (min-width: 1920px)');
  });

  it('should emit the x2l-down and x3l-down max-width media queries', () => {
    const output = getCss();
    assert.ok(
      output.includes('max-width: calc(1536px - 0.02px)'),
      'expected x2l-down max-width: calc(1536px - 0.02px)',
    );
    assert.ok(
      output.includes('max-width: calc(1920px - 0.02px)'),
      'expected x3l-down max-width: calc(1920px - 0.02px)',
    );
  });

  it('should place grid-stack children with grid-column and grid-row', () => {
    const rule = extractRule(getCss(), '.stack .parent > span');
    assert.ok(rule, 'expected a rule for ".stack .parent > span"');
    assert.ok(rule!.includes('grid-column: 2/3'), 'expected grid-column: 2/3');
    assert.ok(rule!.includes('grid-row: 1/2'), 'expected grid-row: 1/2');
  });

  it('should place grid-stack-item with grid-column', () => {
    const rule = extractRule(getCss(), '.stack-item');
    assert.ok(rule, 'expected a rule for ".stack-item"');
    assert.ok(rule!.includes('grid-column: 3/4'), 'expected grid-column: 3/4');
  });

  it('should place grid-placement items with grid-column', () => {
    const rule = extractRule(getCss(), '.placement');
    assert.ok(rule, 'expected a rule for ".placement"');
    assert.ok(rule!.includes('grid-column: 2/4'), 'expected grid-column: 2/4');
  });

  it('should honor the custom span of grid-item-full', () => {
    const rule = extractRule(getCss(), '.full');
    assert.ok(rule, 'expected a rule for ".full"');
    assert.ok(rule!.includes('grid-column: 2 / 4'), 'expected grid-column: 2 / 4');
  });

  it('should expose tokens with spacing, font family and a multi-value shadow', () => {
    const rule = extractRule(getCss(), '.tokens');
    assert.ok(rule, 'expected a rule for ".tokens"');
    assert.ok(rule!.includes('padding: 1rem 1.6rem'), 'expected padding: 1rem 1.6rem');

    const fontFamily = declarationValue(rule!, 'font-family');
    assert.ok(
      fontFamily !== null && fontFamily.includes('ui-sans-serif'),
      'expected font-family to contain ui-sans-serif',
    );

    const boxShadow = declarationValue(rule!, 'box-shadow');
    assert.ok(
      boxShadow !== null && boxShadow.includes(','),
      'expected a multi-value box-shadow (at least two shadow layers)',
    );
  });

  it('should emit the dark theme with the inverted neutral palette', () => {
    const output = getCss();
    assert.ok(
      output.includes(':root[data-theme'),
      'expected a dark theme block :root[data-theme="dark"]',
    );

    const darkStart = output.indexOf(':root[data-theme');
    const darkBlock = output.slice(darkStart);
    assert.ok(
      darkBlock.includes('--neutral-100: hsl(0, 0%, 6%)'),
      'expected --neutral-100 to hold the darkest tone (900) in dark mode',
    );

    for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]) {
      assert.ok(
        darkBlock.includes(`--neutral-${shade}:`),
        `expected the dark theme to define --neutral-${shade}`,
      );
    }
  });
});
