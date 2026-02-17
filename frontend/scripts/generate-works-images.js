// Скрипт для генерации works-images.ts на основе содержимого папки public/images/works
const fs = require('fs');
const path = require('path');

const worksDir = path.join(__dirname, '../public/images/works');
const outputFile = path.join(__dirname, '../src/data/works-images.ts');

const files = fs.readdirSync(worksDir)
  .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
  .sort();

const images = files.map(f => `/images/works/${f}`);

const content = `// Автоматически сгенерировано
export const worksImages = ${JSON.stringify(images, null, 2)};
`;

fs.writeFileSync(outputFile, content, 'utf8');
console.log(`Сгенерировано ${images.length} изображений в works-images.ts`);