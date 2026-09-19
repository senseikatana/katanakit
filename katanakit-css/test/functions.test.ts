// ============================================================
// functions.test.ts — Regression assertions for the public
// functions API: unit conversion (rem/px/fluid), token accessors
// (spacing/duration/z/radius) and color accessors
// (get-color/alpha). Compiles test/fixtures/functions-regression.scss
// in memory with loadPaths ['src/scss'].
//
// NOTE: fixtures in test/fixtures/ must NOT be named after the
// partials (functions.scss, variables.scss, …) because Sass
// resolves @use relative to the importing file BEFORE consulting
// loadPaths: a fixture named "functions.scss" would shadow the
// real partial and cause a "Module loop" error.
//
// Deterministic: no network, no git, read-only over src/ and dist/.
// ============================================================

import { describe, it } from 'vitest';
import assert from 'node:assert/strict';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURE = path.join(PROJECT_ROOT, 'test', 'fixtures', 'functions-regression.scss');
const LOAD_PATHS = [path.join(PROJECT_ROOT, 'src', 'scss')];

let testRule: string | null = null;

function getTestRule(): string {
  if (testRule === null) {
    const output = sass.compile(FIXTURE, { loadPaths: LOAD_PATHS }).css;
    const match = output.match(/\.test\s*\{([^}]*)\}/);
    assert.ok(match, 'expected the compiled fixture to contain a .test rule');
    testRule = match![1] ?? assert.fail('expected the .test rule to have a body');
  }
  return testRule;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function declarationValue(property: string): string | null {
  const rule = getTestRule();
  const match = rule.match(new RegExp(`${property}:\\s*([^;]+);`));
  return match?.[1]?.trim() ?? null;
}

function expectDeclaration(property: string, expected: string): void {
  const actual = declarationValue(property);
  assert.equal(
    actual,
    expected,
    `expected "${property}" to compile to "${expected}", got "${actual}"`,
  );
}

describe('functions: fixture test/fixtures/functions-regression.scss', () => {
  it('should compile without errors', () => {
    try {
      getTestRule();
    } catch (error) {
      assert.fail(`compiling ${FIXTURE} failed: ${errorMessage(error)}`);
    }
  });

  it('should convert px and unitless values to rem (base 10px)', () => {
    expectDeclaration('rem-from-px', '1.6rem');
    expectDeclaration('rem-from-unitless', '1.6rem');
  });

  it('should convert rem to px (base 10px)', () => {
    expectDeclaration('px-from-rem', '10px');
  });

  it('should return a clamp() expression from fluid', () => {
    const fluid = declarationValue('fluid-size');
    assert.ok(
      fluid !== null && fluid.startsWith('clamp('),
      `expected fluid-size to start with clamp(, got "${fluid}"`,
    );
  });

  it('should resolve spacing and duration tokens', () => {
    expectDeclaration('spacing-4', '1rem');
    expectDeclaration('duration-200', '200ms');
  });

  it('should resolve z-index for string and number keys', () => {
    expectDeclaration('z-modal', '1040');
    expectDeclaration('z-50', '50');
  });

  it('should resolve radius tokens', () => {
    expectDeclaration('radius-lg', '0.5rem');
  });

  it('should resolve colors and alpha variants', () => {
    expectDeclaration('neutral-500', 'hsl(0, 0%, 35%)');
    expectDeclaration('info-alpha', 'hsla(215, 95%, 71%, 0.5)');
  });
});
