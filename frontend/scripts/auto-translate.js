import fs from 'fs';
import path from 'path';
import { translate } from 'google-translate-api-x';

const EN_PATH = './src/locales/en/translation.json';
const HI_PATH = './src/locales/hi/translation.json';
const MR_PATH = './src/locales/mr/translation.json';

// Utility to recursively find missing keys and translate them
async function translateMissingKeys(enObj, targetObj, targetLang) {
  let updated = false;

  for (const key in enObj) {
    if (typeof enObj[key] === 'object' && enObj[key] !== null) {
      if (!targetObj[key] || typeof targetObj[key] !== 'object') {
        targetObj[key] = {};
        updated = true;
      }
      const childUpdated = await translateMissingKeys(enObj[key], targetObj[key], targetLang);
      if (childUpdated) updated = true;
    } else if (typeof enObj[key] === 'string') {
      // If key is missing or empty in target, we translate it
      if (!targetObj[key] || targetObj[key].trim() === '') {
        try {
          console.log(`Translating [${targetLang}] key: ${key} -> "${enObj[key]}"`);
          const res = await translate(enObj[key], { to: targetLang });
          targetObj[key] = res.text;
          updated = true;
        } catch (err) {
          console.error(`Failed to translate key: ${key}`, err.message);
        }
      }
    }
  }

  return updated;
}

async function runAutoTranslate() {
  console.log('🤖 Starting auto-translation process...');
  
  const enData = JSON.parse(fs.readFileSync(EN_PATH, 'utf8'));
  const hiData = fs.existsSync(HI_PATH) ? JSON.parse(fs.readFileSync(HI_PATH, 'utf8')) : {};
  const mrData = fs.existsSync(MR_PATH) ? JSON.parse(fs.readFileSync(MR_PATH, 'utf8')) : {};

  console.log('\\n🇮🇳 Checking Hindi translations...');
  const hiUpdated = await translateMissingKeys(enData, hiData, 'hi');
  if (hiUpdated) {
    fs.writeFileSync(HI_PATH, JSON.stringify(hiData, null, 2));
    console.log('✅ Updated hi/translation.json');
  } else {
    console.log('✨ Hindi is already up to date.');
  }

  console.log('\\n🕉️ Checking Marathi translations...');
  const mrUpdated = await translateMissingKeys(enData, mrData, 'mr');
  if (mrUpdated) {
    fs.writeFileSync(MR_PATH, JSON.stringify(mrData, null, 2));
    console.log('✅ Updated mr/translation.json');
  } else {
    console.log('✨ Marathi is already up to date.');
  }

  console.log('\\n🎉 Auto-translation complete!');
}

runAutoTranslate().catch(console.error);
