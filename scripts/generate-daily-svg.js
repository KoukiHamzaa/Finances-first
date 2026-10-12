#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { generateDailySvg, DAILY_THEMES } from '../src/dailySvgGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Helper to get today's date in Tunis timezone (or fallback to UTC)
function getTodayDateStr() {
  try {
    const fmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Tunis',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return fmt.format(new Date());
  } catch (_e) {
    return new Date().toISOString().slice(0, 10);
  }
}

// Parse simple CLI arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: getTodayDateStr(),
    out: path.join(projectRoot, 'public', 'daily-lock-bg.svg'),
    stdout: false,
    width: 1440,
    height: 900,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--stdout') {
      options.stdout = true;
    } else if (arg.startsWith('--date=')) {
      options.date = arg.split('=')[1];
    } else if (arg === '-d' && args[i + 1]) {
      options.date = args[++i];
    } else if (arg.startsWith('--out=')) {
      options.out = path.resolve(process.cwd(), arg.split('=')[1]);
    } else if (arg === '-o' && args[i + 1]) {
      options.out = path.resolve(process.cwd(), args[++i]);
    } else if (arg.startsWith('--width=')) {
      options.width = parseInt(arg.split('=')[1], 10) || 1440;
    } else if (arg.startsWith('--height=')) {
      options.height = parseInt(arg.split('=')[1], 10) || 900;
    }
  }

  return options;
}

function printHelp() {
  console.log(`
Daily Lock Background SVG Generator
====================================
Generates a unique, procedural vector background SVG picture for the lock screen.

Usage:
  node scripts/generate-daily-svg.js [options]
  npm run generate:bg [-- [options]]

Options:
  -d, --date <YYYY-MM-DD>  Specify date for the procedural seed (default: today's Tunis date)
  -o, --out <path>         Output file path (default: public/daily-lock-bg.svg)
  --width <number>         SVG width in pixels (default: 1440)
  --height <number>        SVG height in pixels (default: 900)
  --stdout                 Print SVG XML directly to stdout
  -h, --help               Display this help guide

Examples:
  node scripts/generate-daily-svg.js
  node scripts/generate-daily-svg.js --date=2026-10-12
  node scripts/generate-daily-svg.js --out=dist/lock-bg.svg
`);
}

function run() {
  const options = parseArgs();

  if (options.help) {
    printHelp();
    process.exit(0);
  }

  const svgContent = generateDailySvg(options.date, {
    width: options.width,
    height: options.height,
  });

  if (options.stdout) {
    process.stdout.write(svgContent);
    return;
  }

  // Ensure output directory exists
  const outDir = path.dirname(options.out);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(options.out, svgContent, 'utf-8');

  // Calculate day theme for summary
  let dateSum = 0;
  for (let i = 0; i < options.date.length; i++) {
    dateSum = (dateSum * 31 + options.date.charCodeAt(i)) >>> 0;
  }
  const theme = DAILY_THEMES[dateSum % DAILY_THEMES.length];
  const stats = fs.statSync(options.out);
  const sizeKb = (stats.size / 1024).toFixed(1);

  const relOut = path.relative(projectRoot, options.out);
  console.log(`✓ Generated daily SVG background picture:`);
  console.log(`  • Date:   ${options.date}`);
  console.log(`  • Theme:  ${theme.name} (${theme.style})`);
  console.log(`  • Output: ${relOut}`);
  console.log(`  • Size:   ${sizeKb} KB (${options.width}x${options.height})`);
}

run();
