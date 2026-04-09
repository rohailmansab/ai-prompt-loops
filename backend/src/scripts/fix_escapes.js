import fs from 'fs';

const files = [
  'e:/AI Prompt Engineering Hub/backend/src/scripts/seed_blogs_part1.js',
  'e:/AI Prompt Engineering Hub/backend/src/scripts/seed_blogs_part2.js',
  'e:/AI Prompt Engineering Hub/backend/src/scripts/seed_blogs_part3.js'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // Replace \` with `
  content = content.split('\\`').join('`');
  // Replace \${ with ${
  content = content.split('\\${').join('${');
  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
