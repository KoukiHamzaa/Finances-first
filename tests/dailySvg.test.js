import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { generateDailySvg, createRng, DAILY_THEMES } from '../src/dailySvgGenerator.js';

describe('dailySvgGenerator', () => {
  test('generates valid SVG markup with dimensions', () => {
    const svg = generateDailySvg('2026-10-12', { width: 1440, height: 900 });
    assert.ok(svg.startsWith('<svg'), 'should start with <svg tag');
    assert.ok(svg.endsWith('</svg>'), 'should end with </svg>');
    assert.ok(svg.includes('viewBox="0 0 1440 900"'), 'should contain viewBox');
    assert.ok(svg.includes('2026-10-12'), 'should embed target date');
    assert.ok(svg.includes('DAILY SECURITY VECTOR'), 'should contain watermark');
  });

  test('is strictly deterministic for identical dates', () => {
    const svg1 = generateDailySvg('2026-10-12');
    const svg2 = generateDailySvg('2026-10-12');
    assert.equal(svg1, svg2, 'two runs on the same date must produce identical SVG output');
  });

  test('produces distinct patterns and seeds for different dates', () => {
    const svgA = generateDailySvg('2026-10-12');
    const svgB = generateDailySvg('2026-10-13');
    assert.notEqual(svgA, svgB, 'consecutive dates should produce different SVG outputs');
  });

  test('createRng generates uniform numbers in [0, 1)', () => {
    const rng = createRng('test-seed-xyz');
    for (let i = 0; i < 20; i++) {
      const val = rng();
      assert.ok(val >= 0 && val < 1, `val ${val} should be in [0, 1)`);
    }
  });

  test('themes array contains valid color configurations', () => {
    assert.ok(DAILY_THEMES.length >= 7, 'should have at least 7 daily themes');
    for (const theme of DAILY_THEMES) {
      assert.ok(theme.name, 'theme must have a name');
      assert.ok(theme.bgStart, 'theme must have bgStart');
      assert.ok(theme.accent1, 'theme must have accent1');
      assert.ok(theme.glow, 'theme must have glow color');
    }
  });
});

describe('scripts/generate-daily-svg.js CLI', () => {
  test('generates SVG file on disk via CLI execution', () => {
    const tmpOut = path.resolve('public', 'test-lock-bg.svg');
    try {
      if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
      const stdout = execFileSync('node', [
        'scripts/generate-daily-svg.js',
        '--date=2026-10-12',
        `--out=${tmpOut}`,
      ], { encoding: 'utf-8' });

      assert.ok(stdout.includes('Generated daily SVG background picture'), 'should log success');
      assert.ok(fs.existsSync(tmpOut), 'file should exist on disk');
      const content = fs.readFileSync(tmpOut, 'utf-8');
      assert.ok(content.startsWith('<svg'), 'should be SVG content');
      assert.ok(content.includes('2026-10-12'), 'should match date');
    } finally {
      if (fs.existsSync(tmpOut)) fs.unlinkSync(tmpOut);
    }
  });
});
