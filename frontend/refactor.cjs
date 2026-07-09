const fs = require('fs');
const path = require('path');

function replaceInFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInFiles(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            const patterns = [
                [/err instanceof Error \? \(err as any\)\.response\?\.data\?\.message : '[^']+'/g, 'getErrorMessage(err)'],
                [/\(err as any\)\.response\?\.data\?\.message/g, 'getErrorMessage(err)'],
                [/\(error as any\)\?\.response\?\.data\?\.message/g, 'getErrorMessage(error)'],
                [/\(err as any\)\.response\?\.status/g, '(axios.isAxiosError(err) ? err.response?.status : 500)'],
                [/\/\/\s*eslint-disable-next-line\s+@typescript-eslint\/no-explicit-any\s*\n\s*/g, '']
            ];

            for (const [regex, replacement] of patterns) {
                if (regex.test(content)) {
                    content = content.replace(regex, replacement);
                    modified = true;
                }
            }

            if (modified) {
                if (content.includes('getErrorMessage(') && !content.includes('import { getErrorMessage }')) {
                    content = "import { getErrorMessage } from '@/utils/error';\n" + content;
                }
                if (content.includes('axios.isAxiosError') && !content.includes('import axios')) {
                    content = "import axios from 'axios';\n" + content;
                }
                fs.writeFileSync(fullPath, content);
                console.log('Updated: ' + fullPath);
            }
        }
    }
}

replaceInFiles('D:/reservation-system/frontend/src');
