import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
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
    assert.ok(svg.includes('SEED: 0x'), 'should contain seed in watermark');
    assert.ok(svg.includes('SYS-LOCK'), 'should contain SYS-LOCK watermark');
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

  test('all 7 styles produce distinct compositions with animations under 80 KB', () => {
    const styleDates = {
      vault: '2026-10-02',
      aurora: '2026-10-03',
      matrix: '2026-10-04',
      solar: '2026-10-05',
      geodesic: '2026-10-06',
      constellation: '2026-10-07',
      kinetic: '2026-10-01',
    };

    const outputs = new Set();

    for (const [styleName, dt] of Object.entries(styleDates)) {
      const svg = generateDailySvg(dt);
      assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `${styleName} must be valid SVG`);
      assert.ok(svg.length > 500, `${styleName} SVG must not be empty`);
      assert.ok(Buffer.byteLength(svg, 'utf-8') < 80 * 1024, `${styleName} SVG must be under 80 KB`);
      assert.ok(svg.includes('<animate') || svg.includes('<animateTransform'), `${styleName} must include SVG animations`);
      assert.ok(!outputs.has(svg), 'each style must produce unique output');
      outputs.add(svg);

      // Verify style-specific elements
      if (styleName === 'vault') {
        assert.ok(svg.includes('vault-rings'), 'vault must have rings');
        assert.ok(svg.includes('vault-door'), 'vault must have central door hexagon');
      } else if (styleName === 'aurora') {
        assert.ok(svg.includes('aurora-curtains'), 'aurora must have vertical curtains');
        assert.ok(svg.includes('aurora-stars'), 'aurora must have stars');
      } else if (styleName === 'matrix') {
        assert.ok(svg.includes('matrix-rain'), 'matrix must have character rain');
        assert.ok(svg.includes('matrix-scanlines'), 'matrix must have scanlines');
      } else if (styleName === 'solar') {
        assert.ok(svg.includes('solar-burst'), 'solar must have starburst rays');
        assert.ok(svg.includes('solar-orbits'), 'solar must have orbital ellipses');
      } else if (styleName === 'geodesic') {
        assert.ok(svg.includes('geodesic-mesh'), 'geodesic must have polygon mesh');
        assert.ok(svg.includes('hex-grid'), 'geodesic must have hex pattern');
      } else if (styleName === 'constellation') {
        assert.ok(svg.includes('constellation-nodes'), 'constellation must have nodes');
        assert.ok(svg.includes('cluster-labels'), 'constellation must have cluster labels');
      } else if (styleName === 'kinetic') {
        assert.ok(svg.includes('kinetic-streaks'), 'kinetic must have motion streaks');
        assert.ok(svg.includes('kinetic-polygons'), 'kinetic must have rotating polygons');
      }
    }
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
