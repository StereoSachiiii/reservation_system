const fs = require('fs');
const path = require('path');

function getFiles(dir, allFiles = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, allFiles);
        } else {
            if (name.endsWith('.tsx') || name.endsWith('.ts')) {
                allFiles.push(name);
            }
        }
    }
    return allFiles;
}

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'frontend', 'src');
const files = getFiles(srcDir);

const largeFiles = [];
for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    if (lines > 150) {
        largeFiles.push({ lines, path: path.relative(rootDir, file) });
    }
}

largeFiles.sort((a, b) => b.lines - a.lines);

const output = largeFiles.map(f => `${f.lines.toString().padStart(5)} | ${f.path}`).join('\n');
fs.writeFileSync('large_files_clean.txt', output);
console.log(`Found ${largeFiles.length} large files.`);
