import * as dotenv from 'dotenv';
dotenv.config({ path: './.env' });
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import fetch from 'node-fetch';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';
import multer from 'multer';
import compression from 'compression';
import nodemailer from 'nodemailer';
import cookieParser from 'cookie-parser';

// Log environment details
console.log('Current working directory:', process.cwd());
console.log('.env file path:', path.join(process.cwd(), '.env'));
console.log('API Key loaded:', process.env.GEMINI_API_KEY ? 'Yes' : 'No');

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
console.log('JWT Secret generated');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const conversationHistory = new Map();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Admin credentials - In production, these should be in environment variables
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

// Basic middleware setup
app.use(express.json({limit: '100mb'}));
app.use(express.urlencoded({limit: '100mb', extended: true, parameterLimit: 50000}));
app.use(compression());
app.use(express.static('public'));
app.use(express.static('views'));
app.use('/video', express.static('video'));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(cookieParser());

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
    // Try to get token from cookie
    const token = req.cookies && req.cookies.adminToken;
    console.log('JWT from cookie:', token);
    if (!token) {
        return res.redirect('/admin/login');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        return res.redirect('/admin/login');
    }
}

// Admin routes
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin-login.html'));
});

app.post('/admin/login', express.json(), (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const token = jwt.sign(
            { username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '2h' }
        );
        // Set JWT as HTTP-only cookie
        res.cookie('adminToken', token, {
            httpOnly: true,
            maxAge: 2 * 60 * 60 * 1000, // 2 hours
            sameSite: 'lax',
        });
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Logout: clear the cookie
app.post('/admin/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ success: true });
});

// Token verify for AJAX (optional, for fetch-based checks)
app.post('/admin/verify-token', (req, res) => {
    const token = req.cookies && req.cookies.adminToken;
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});

app.get('/admin', authenticateAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, '../views/admin.html'));
});

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
    const { email, status, labName, date, time, patientName, service } = req.body;
    
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    const subject = `Appointment ${statusText} - ${labName}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Appointment Update</h2>
                <div style="background: ${status === 'approved' ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: ${status === 'approved' ? '#155724' : '#721c24'};">
                        Your appointment at ${labName} has been ${statusText}.
                    </p>
                </div>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <h3 style="color: #333; margin-top: 0;">Appointment Details:</h3>
                    <p><strong>Patient Name:</strong> ${patientName}</p>
                    <p><strong>Service:</strong> ${service}</p>
                    <p><strong>Date:</strong> ${date}</p>
                    <p><strong>Time:</strong> ${time}</p>
                    <p><strong>Lab:</strong> ${labName}</p>
                </div>
                ${status === 'approved' ? `
                    <div style="margin-top: 20px;">
                        <h4 style="color: #333;">Important Information:</h4>
                        <ul style="color: #666;">
                            <li>Please arrive 10 minutes before your scheduled time</li>
                            <li>Bring any relevant medical records or prescriptions</li>
                            <li>Wear a mask and follow COVID-19 safety protocols</li>
                        </ul>
                    </div>
                ` : `
                    <div style="margin-top: 20px; color: #666;">
                        <p>We apologize for any inconvenience. Please feel free to schedule another appointment.</p>
                    </div>
                `}
                <div style="text-align: center; margin-top: 30px; color: #666;">
                    <p>Thank you for choosing our services.</p>
                    <p>If you have any questions, please contact us.</p>
                </div>
            </div>
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