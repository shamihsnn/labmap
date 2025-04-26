import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import compression from 'compression';
import nodemailer from 'nodemailer';

// Log environment details
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.join(process.cwd(), '.env'));

// Configure environment

console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const conversationHistory = new Map();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// Middleware

app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb', extended: true, parameterLimit: 50000}));
app.use(express.static('public'));
app.use('/video', express.static('video'));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));
app.use(compression());



// ApiMedic credentials
const USERNAME = "x5NRy_GMAIL_COM_AUT";
const PASSWORD = "i5YJn4x3WPz92DaRg";
const AUTH_URL = "https://authservice.priaid.ch/login";
const BASE_URL = "https://healthservice.priaid.ch";

// Initialize ratings storage
const ratings = {};

// Generate authentication hash
function generateAuthHash() {
    const rawHash = crypto
        .createHmac('md5', PASSWORD)
        .update(AUTH_URL)
        .digest('base64');
    return rawHash;
}

async function getToken() {
    const computedHash = generateAuthHash();
    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${USERNAME}:${computedHash}`
        }
    });
    const data = await response.json();
    return data.Token;
}

// API Routes
app.get('/api/symptoms', async (req, res) => {
    try {
        const token = await getToken();
        const response = await fetch(
            `${BASE_URL}/symptoms?token=${token}&language=en-gb`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/diagnosis', async (req, res) => {
    try {
        const { symptoms, gender, yearOfBirth } = req.body;
        const token = await getToken();
        const response = await fetch(
            `${BASE_URL}/diagnosis?symptoms=${JSON.stringify(symptoms)}&gender=${gender}&year_of_birth=${yearOfBirth}&token=${token}&language=en-gb`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ratings', (req, res) => {
    const { labName, rating, review } = req.body;
    try {
        if (!ratings[labName]) {
            ratings[labName] = [];
        }
        ratings[labName].push({ rating, review, date: new Date() });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save rating' });
    }
});

app.get('/api/ratings/:labName', (req, res) => {
    const { labName } = req.params;
    try {
        const labRatings = ratings[labName] || [];
        res.json(labRatings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch ratings' });
    }
});

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/video', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/video.html'));
});

app.get('/chatbot', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/chatbot.html'));
});

app.get('/symptoms', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/symptoms.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


app.get('/ambulance-loader.svg', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/ambulance-loader.svg'));
});


function formatAIResponse(text) {
    // Add markdown-style formatting
    const formatted = text
        // Format headings
        .replace(/^(.*?):\s*$/gm, '## $1\n')
        // Format lists
        .replace(/^[-*]\s+(.*?)$/gm, '• $1')
        // Format important points
        .replace(/(Important|Note|Warning):/g, '**$1:**')
        // Format medical terms
        .replace(/\b([A-Z][a-zA-Z]*(?:\s+[A-Z][a-zA-Z]*)*)\b(?=\s*:)/g, '**$1**')
        // Add line breaks for readability
        .replace(/\n\n/g, '\n\n<br>\n\n')
        // Format numbers and percentages
        .replace(/\b(\d+(?:\.\d+)?%?)\b/g, '<strong>$1</strong>')
    
        .replace(/\n---+\n/g, '\n<hr>\n');

    return `<div class="formatted-response">
        ${formatted}
    </div>`;
}




app.post('/api/medicalchatbot', async (req, res) => {
    const { message, imageData, sessionId } = req.body;
    
    try {
  
        let history = conversationHistory.get(sessionId) || [];
        
     
if (imageData) {
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    const prompt = {
        contents: [{
            parts: [{
                text: `You are a highly experienced medical professional with expertise in diagnostic imaging and radiology. Please analyze the provided medical image comprehensively and provide:
1. A detailed description of any visible anatomical structures
2. Identification and analysis of any abnormalities, lesions, or unusual patterns
3. Assessment of tissue density, contrast, and structural relationships
4. Comparison with normal anatomical references where applicable
5. Potential differential diagnoses based on visible features
6. Recommendations for additional imaging or tests if necessary
7. Technical evaluation of image quality, positioning, and any artifacts
8. Clear indication of the anatomical orientation and viewing perspective

Please present your findings in a structured format using standard medical terminology while also providing explanations in clear, understandable language. Note any limitations in the assessment due to image quality or positioning. Context: ${message}`
            }, {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Data
                }
            }]
        }]
    };

    try {
        const result = await visionModel.generateContent(prompt);
        const response = await result.response;
        const reply = response.text();
        
        history.push({ role: "user", content: `${message} [Image Analysis Request]` });
        history.push({ role: "assistant", content: reply });
        
        conversationHistory.set(sessionId, history);
        return res.json({ success: true, reply: formatAIResponse(reply) });
    } catch (imageError) {
        console.error('Vision Model Error:', imageError);
        
        // Fallback to text-only response if image analysis fails
        const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const fallbackResult = await textModel.generateContent({
            contents: [{
                parts: [{
                    text: `I received an image but couldn't analyze it. How else can I help you with your medical question: ${message}`
                }]
            }]
        });
        
        const fallbackReply = fallbackResult.response.text();
        return res.json({ success: true, reply: fallbackReply });
    }
}

// Regular text conversation with memory
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });


const formattedHistory = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
}));

const chat = model.startChat({
    history: formattedHistory,
    generationConfig: {
        maxOutputTokens: 2048,
    },
});

const result = await chat.sendMessage(message);
const response = await result.response;
const reply = response.text();

// Store history with 'assistant' role for consistency
history.push({ role: "user", content: message });
history.push({ role: "assistant", content: reply });

// Keep last 20 messages for memory efficiency
if (history.length > 20) {
    history = history.slice(-20);
}

conversationHistory.set(sessionId, history);


res.json({ 
    reply: formatAIResponse(reply),
    success: true 
});

    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ 
            error: 'Failed to get response from AI',
            details: error.message,
            success: false 
        });
    }
});

app.get('/medicalchatbot', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/medicalchatbot.html'));
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Email notification endpoint
app.post('/send-appointment-email', async (req, res) => {
    const { email, status, labName, date, time } = req.body;
    
    const statusText = status === 'accepted' ? 'accepted' : 'rejected';
    const subject = `Appointment ${statusText} - ${labName}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
            <h2>Appointment Update</h2>
            <p>Your appointment at ${labName} has been ${statusText}.</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            ${status === 'accepted' ? `
                <p>Please arrive 10 minutes before your scheduled time.</p>
                <p>Don't forget to bring any relevant medical records or prescriptions.</p>
            ` : `
                <p>We apologize for any inconvenience. Please feel free to schedule another appointment.</p>
            `}
            <p>Thank you for choosing our services.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});