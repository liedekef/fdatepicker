const fs = require('fs');
const path = require('path');

// Directory containing your JS files
const dir = './localization'; // <-- adjust to your actual path

// Strings to add
const newStrings = {
  cloneRecord: 'Clone Record'
};

// Convert object to string entries
const entries = Object.entries(newStrings).map(([key, value]) => `        ${key}: '${value}'`).join(',\n');

fs.readdirSync(dir).forEach(file => {
  if (file.endsWith('.js')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    const regex = /(\$\.\s*extend\s*\(true\s*,\s*jTable\.prototype\.options\.messages\s*,\s*\{)([\s\S]*?)(^\s*\}\);)/m;
    const match = content.match(regex);

    if (match) {
      const newContent = content.replace(regex, (_, start, middle, end) => {
        // Ensure no duplicate keys
        const existingKeys = new RegExp(Object.keys(newStrings).join('|'));
        if (existingKeys.test(middle)) {
          console.log(`Skipped (already contains keys): ${file}`);
          return _;
        }
        return `${start}${middle.trim()},\n${entries}\n${end}`;
      });

      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated: ${file}`);
    } else {
      console.log(`No match found in: ${file}`);
    }
  }
});

