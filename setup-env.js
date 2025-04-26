import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envFilePath = path.join(__dirname, '.env');

// Check if .env file exists
const envExists = fs.existsSync(envFilePath);

console.log('Lab Finder .env Setup Utility');
console.log('-----------------------------');
console.log(`${envExists ? 'Updating' : 'Creating'} .env file...\n`);

// Load existing content if available
let envContent = {};
if (envExists) {
  const content = fs.readFileSync(envFilePath, 'utf8');
  content.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        envContent[key.trim()] = value.trim();
      }
    }
  });
  console.log('Loaded existing configuration.');
}

// Define questions
const questions = [
  {
    name: 'GEMINI_API_KEY',
    question: 'Gemini API Key (press Enter to keep existing value): ',
    defaultValue: envContent.GEMINI_API_KEY || '',
    required: false,
  },
  {
    name: 'EMAIL_USER',
    question: 'Email address for sending notifications (Gmail recommended): ',
    defaultValue: envContent.EMAIL_USER || '',
    required: true,
  },
  {
    name: 'EMAIL_PASS',
    question: 'Email app password (for Gmail, generate from Google Account): ',
    defaultValue: envContent.EMAIL_PASS || '',
    required: true,
  },
  {
    name: 'JWT_SECRET',
    question: 'JWT Secret (press Enter to auto-generate): ',
    defaultValue: envContent.JWT_SECRET || '',
    required: false,
    generate: () => crypto.randomBytes(64).toString('hex')
  }
];

async function askQuestions() {
  let newEnvContent = { ...envContent };
  
  for (const q of questions) {
    let value = '';
    
    // Skip fields that are already set and not required
    if (q.defaultValue && !q.required) {
      value = await new Promise(resolve => {
        rl.question(`${q.question}`, answer => {
          resolve(answer || q.defaultValue);
        });
      });
    } else {
      value = await new Promise(resolve => {
        const defaultText = q.defaultValue ? ` (default: ${q.defaultValue})` : '';
        rl.question(`${q.question}${defaultText}: `, answer => {
          resolve(answer || q.defaultValue);
        });
      });
    }
    
    // If field should be generated and no value provided
    if (!value && q.generate) {
      value = q.generate();
      console.log(`Auto-generated ${q.name}: ${value.substring(0, 10)}...`);
    }
    
    newEnvContent[q.name] = value;
  }
  
  // Prepare env file content
  let fileContent = '# Lab Finder Environment Configuration\n';
  fileContent += '# Generated on ' + new Date().toISOString() + '\n\n';
  
  // API Keys
  fileContent += '# API Keys\n';
  fileContent += `GEMINI_API_KEY=${newEnvContent.GEMINI_API_KEY || ''}\n\n`;
  
  // Email Configuration
  fileContent += '# Email Configuration\n';
  fileContent += `EMAIL_USER=${newEnvContent.EMAIL_USER || ''}\n`;
  fileContent += `EMAIL_PASS=${newEnvContent.EMAIL_PASS || ''}\n\n`;
  
  // JWT Configuration
  fileContent += '# JWT Configuration\n';
  fileContent += `JWT_SECRET=${newEnvContent.JWT_SECRET || ''}\n`;
  
  // Write to file
  fs.writeFileSync(envFilePath, fileContent);
  console.log(`\n.env file has been ${envExists ? 'updated' : 'created'} successfully!`);
  
  // Show next steps
  console.log('\nNext Steps:');
  console.log('1. Restart your server to apply changes');
  console.log('2. Log in to the admin panel to test the email functionality');
  console.log('3. Check server logs for any configuration issues');
  
  rl.close();
}

askQuestions(); 