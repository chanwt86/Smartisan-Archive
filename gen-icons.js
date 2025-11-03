const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ICON_ROOT = path.join(ROOT, 'icons');                 // icons/
const OUT_DIR = path.join(ROOT, 'data');
const OUT = path.join(OUT_DIR, 'icons.json');

const exts = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg']);

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(p));
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      if (exts.has(ext)) {
        const rel = p.replace(ROOT + path.sep, '').replace(/\\/g, '/'); // e.g. icons/system/camera.png
        // category = first folder under icons/
        const m = rel.match(/^icons\/([^/]+)\//);
        let category = m ? m[1] : 'unknown';
        if (category === 'thrid_party') category = 'third_party'; // tolerate typo
        results.push({ path: rel, category });
      }
    }
  }
  return results;
}

const files = walk(ICON_ROOT).sort((a, b) => a.path.localeCompare(b.path));
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(files, null, 2));
console.log(`Found ${files.length} icons`);
console.log(`Wrote ${OUT}`);