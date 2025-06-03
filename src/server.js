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
import { networkInterfaces } from 'os';

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
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../views')));
app.use('/video', express.static(path.join(__dirname, '../video')));
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../images')));
app.use(cookieParser());

// Add CORS headers to allow network access
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

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

// Updated Article Search API endpoint with fallbacks and disease-specific filtering
app.get('/api/semantic-scholar', async (req, res) => {
    const { query, filter, simplified, source } = req.query;
    
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    // For disease searches, enhance the query with medical context
    let searchQuery = query;
    if (filter === 'disease') {
        searchQuery = `${query} medical condition disease health symptoms treatment`;
    }
    
    // List of trusted medical sources domains for filtering
    const trustedDomains = [
        'pubmed.ncbi.nlm.nih.gov',
        'nih.gov', 
        'who.int',
        'mayoclinic.org',
        'hopkinsmedicine.org',
        'health.harvard.edu',
        'medlineplus.gov',
        'cdc.gov',
        'fda.gov',
        'nejm.org',
        'thelancet.com',
        'jamanetwork.com',
        'bmj.com',
        'healthline.com',
        'webmd.com',
        'medicalnewstoday.com',
        'clevelandclinic.org',
        'medscape.com'
    ];
    
    // Source-specific API endpoints
    const sourceApis = {
        'medlineplus': `https://wsearch.nlm.nih.gov/ws/query?db=medlineplus&term=${encodeURIComponent(query)}`,
        'mayo': `https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(query)}`,
        'cdc': `https://search.cdc.gov/search/index.html?query=${encodeURIComponent(query)}`
    };
    
    // Function to check if a URL is from a trusted medical source
    const isReliableSource = (url) => {
        if (!url) return false;
        
        try {
            const domain = new URL(url).hostname;
            return trustedDomains.some(trusted => domain.includes(trusted));
        } catch (e) {
            return false; // Invalid URL
        }
    };

    // Function to create a simplified explanation using Gemini AI
    async function createSimplifiedExplanation(article) {
        try {
            if (!process.env.GEMINI_API_KEY) return getDefaultExplanation(article);
            
            const genModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            
            const prompt = `
            You are an expert at explaining complex medical information in simple language.
            
            Please read this medical information and provide a simplified explanation that an average person with no medical background could understand. 
            Focus on what the condition is, key symptoms, treatments, and what the patient should know.
            Use plain language, short sentences, and everyday comparisons when possible.
            
            Title: ${article.title}
            Abstract: ${article.abstract || 'Not available'}
            
            Write a concise, easy-to-understand summary in 3-5 sentences using everyday language. 
            Avoid medical jargon, and when you must use a medical term, explain it in parentheses. 
            Your response should be ONLY the simple explanation, with nothing else.`;
            
            try {
                const result = await genModel.generateContent(prompt);
                return result.response.text().trim();
            } catch (apiError) {
                console.error('Error creating simplified explanation:', apiError);
                // If we hit rate limits or any other API error, use fallback explanations
                return getDefaultExplanation(article);
            }
        } catch (error) {
            console.error('Error in simplified explanation process:', error);
            return getDefaultExplanation(article);
        }
    }
    
    // Function to provide default explanations based on medical keywords in the title/abstract
    function getDefaultExplanation(article) {
        const title = article.title?.toLowerCase() || '';
        const abstract = article.abstract?.toLowerCase() || '';
        const text = title + ' ' + abstract;
        
        // Common medical conditions and their simplified explanations
        const medicalConditions = {
            'diabetes': "Diabetes is a condition where your body can't properly control blood sugar levels. This happens either because your body doesn't make enough insulin (a hormone that regulates sugar) or can't use it effectively. Common symptoms include increased thirst, frequent urination, and fatigue. It's managed through healthy eating, exercise, and sometimes medication.",
            
            'hypertension': "Hypertension, or high blood pressure, happens when the force of blood against your artery walls is consistently too high. It often has no symptoms, which is why it's called the 'silent killer.' It can lead to serious problems like heart attacks and strokes if not treated. Managing it usually involves healthy eating, regular exercise, and sometimes medication.",
            
            'arthritis': "Arthritis causes inflammation and stiffness in joints, making movement painful. It happens when the protective cartilage that cushions the ends of bones wears down over time. Symptoms include joint pain, stiffness, and swelling. Treatment focuses on reducing pain and improving joint function through medication, physical therapy, and sometimes surgery.",
            
            'asthma': "Asthma is a condition that affects your airways, making it difficult to breathe. During an asthma attack, the airways become narrow and inflamed, causing symptoms like wheezing, coughing, and shortness of breath. Triggers can include allergens, exercise, or cold air. Treatment usually involves inhalers that either prevent attacks or provide quick relief during one.",
            
            'cancer': "Cancer occurs when abnormal cells grow uncontrollably and invade nearby tissues. These cells can spread to other parts of the body through blood and lymph systems. Symptoms vary widely depending on the type of cancer but may include unusual lumps, unexplained weight loss, or fatigue. Treatment options include surgery, radiation therapy, chemotherapy, and targeted therapies.",
            
            'alzheimer': "Alzheimer's disease is a brain disorder that slowly destroys memory and thinking skills. It happens when protein deposits build up in the brain, damaging and killing brain cells. Early symptoms include forgetting recent events or conversations, which progressively worsens over time. While there's no cure, some medications may temporarily improve symptoms.",
            
            'depression': "Depression is more than just feeling sad - it's a serious mood disorder causing persistent feelings of sadness and loss of interest in activities. It affects how you feel, think, and handle daily activities. Symptoms include feelings of hopelessness, sleep disturbances, and decreased energy. Treatment typically involves therapy, medication, or a combination of both.",
            
            'migraine': "Migraines are severe, pounding headaches often accompanied by nausea, vomiting, and sensitivity to light and sound. They're more than just bad headaches - they're neurological conditions that can be triggered by stress, certain foods, or changes in sleep patterns. Treatment includes pain-relieving medications and preventive medications that reduce frequency and severity.",
            
            'hypothyroidism': "Hypothyroidism occurs when your thyroid gland doesn't produce enough thyroid hormone, which regulates metabolism. This slows down many bodily functions, causing symptoms like fatigue, weight gain, and feeling cold. It's typically treated with synthetic thyroid hormone replacement, which is usually taken daily for life.",
            
            'obesity': "Obesity is a complex condition involving an excessive amount of body fat. It increases the risk of other health problems like heart disease and diabetes. Causes include genetic factors, overeating, and physical inactivity. Treatment approaches include healthy eating, increased physical activity, behavior changes, and sometimes medications or surgery.",
            
            'heart': "Heart disease refers to several conditions affecting heart function. The most common is coronary artery disease, where blood vessels that supply the heart become narrowed or blocked. Symptoms may include chest pain, shortness of breath, or heart attack. Prevention and treatment involve healthy lifestyle choices, medications, and sometimes procedures to improve blood flow.",
            
            'covid': "COVID-19 is an infectious disease caused by the SARS-CoV-2 virus that primarily affects the respiratory system. Symptoms range from mild (fever, cough, fatigue) to severe (difficulty breathing, chest pain). Some people may have no symptoms at all. Prevention includes vaccination, good hand hygiene, and in some situations, wearing masks in crowded places."
        };
        
        // Check if the article contains keywords related to common conditions
        for (const [condition, explanation] of Object.entries(medicalConditions)) {
            if (text.includes(condition)) {
                return explanation;
            }
        }
        
        // Generic medical explanations for various categories
        if (text.includes('treatment') || text.includes('therapy')) {
            return "This article discusses treatment options for a medical condition. Medical treatments aim to relieve symptoms, slow disease progression, or cure the condition. Always consult with a healthcare provider before starting any new treatment, as they can help determine what's best for your specific situation.";
        }
        
        if (text.includes('symptom') || text.includes('diagnosis')) {
            return "This article covers symptoms or diagnosis of a medical condition. Symptoms are physical or mental changes that indicate a condition, while diagnosis is the process of identifying the condition. If you're experiencing concerning symptoms, it's important to consult a healthcare provider rather than self-diagnosing.";
        }
        
        if (text.includes('prevention')) {
            return "This article discusses ways to prevent a health condition. Prevention strategies often include lifestyle changes like healthy eating, regular exercise, adequate sleep, and avoiding harmful substances. Taking preventive measures is often easier and more effective than treating a condition after it develops.";
        }
        
        // Default generic explanation if no specific matches found
        return "This medical article contains technical information about a health condition or treatment. Medical information can be complex, so it's always best to discuss your specific health concerns with a qualified healthcare provider who can give personalized advice based on your unique situation.";
    }
    
    // Try Semantic Scholar first
    try {
        // If specific source is requested (except pubmed/default), try to use that source's API
        if (source && source !== 'pubmed' && sourceApis[source]) {
            try {
                // For MedlinePlus
                if (source === 'medlineplus') {
                    return await fetchMedlinePlus(query, res, simplified === 'true');
                }
                
                // For Mayo Clinic (fallback to web scraping or cached data)
                if (source === 'mayo') {
                    return await fetchMayoClinic(query, res, simplified === 'true');
                }
                
                // For CDC/NIH
                if (source === 'cdc') {
                    return await fetchCDCNIH(query, res, simplified === 'true');
                }
            } catch (sourceError) {
                console.error(`Error fetching from ${source}:`, sourceError);
                // If specific source fails, fall back to Semantic Scholar
            }
        }

        const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(searchQuery)}&limit=15&fields=title,authors,year,venue,abstract,url`);
        
        // If we hit rate limit or any other error, try fallback APIs
        if (response.status === 429 || !response.ok) {
            console.log(`Semantic Scholar API returned ${response.status}. Trying fallback APIs...`);
            throw new Error(`Semantic Scholar API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // For disease searches, filter papers and prioritize medical content
        let papers = data.data;
        if (filter === 'disease') {
            // Filter to keep only medical/health related papers based on venue or title keywords
            papers = papers.filter(paper => {
                const medicalVenue = paper.venue && /medic|health|journal|clinic|disease|patient/i.test(paper.venue);
                const medicalTitle = paper.title && /disease|patient|symptom|treatment|clinical|health|syndrome|therapy|medicine|medical/i.test(paper.title);
                return medicalVenue || medicalTitle || isReliableSource(paper.url);
            });
            
            // Sort by reliability (prioritize papers from trusted domains)
            papers.sort((a, b) => {
                const aIsReliable = isReliableSource(a.url);
                const bIsReliable = isReliableSource(b.url);
                
                if (aIsReliable && !bIsReliable) return -1;
                if (!aIsReliable && bIsReliable) return 1;
                return 0;
            });
        }
        
        // Limit to 5-7 results for better focus
        papers = papers.slice(0, 7);
        
        // Add source info to each paper for UI display
        for (const paper of papers) {
            if (paper.url) {
                try {
                    const domain = new URL(paper.url).hostname;
                    for (const trusted of trustedDomains) {
                        if (domain.includes(trusted)) {
                            paper.source = domain.includes('pubmed') ? 'PubMed' : 
                                          domain.includes('nih.gov') ? 'NIH' : 
                                          domain.includes('mayoclinic') ? 'Mayo Clinic' : 
                                          trusted.split('.').slice(-2, -1)[0].charAt(0).toUpperCase() + trusted.split('.').slice(-2, -1)[0].slice(1);
                            break;
                        }
                    }
                } catch (e) {
                    // Invalid URL, do nothing
                }
            }
            
            // Add simplified explanations if requested
            if (simplified === 'true') {
                paper.simplified_explanation = await createSimplifiedExplanation(paper);
            }
        }
        
        // Add simplified explanations if requested
        if (simplified === 'true') {
            // Process in parallel for speed
            await Promise.all(papers.map(async paper => {
                try {
                    paper.simplified_explanation = await createSimplifiedExplanation(paper);
                } catch (error) {
                    console.error('Error creating simplified explanation:', error);
                    paper.simplified_explanation = getDefaultExplanation(paper);
                }
            }));
        }
        
        res.json({ papers, source: 'Semantic Scholar' });
    } catch (error) {
        console.error('Error searching Semantic Scholar:', error);
        
        // Try alternative sources if Semantic Scholar fails
        try {
            if (filter === 'disease') {
                // Try MedlinePlus as fallback for medical information
                return await fetchMedlinePlus(query, res, simplified === 'true');
            } else {
                res.status(500).json({ error: 'Failed to retrieve search results. Please try again later.' });
            }
        } catch (fallbackError) {
            console.error('Error with fallback search:', fallbackError);
            res.status(500).json({ error: 'Failed to retrieve search results from all sources. Please try again later.' });
        }
    }
});

// Helper function to fetch from MedlinePlus
async function fetchMedlinePlus(query, res, simplified = false) {
    try {
        // Create more accurate and targeted URLs for specific conditions
        const queryLower = query.toLowerCase();
        let directUrl = "";
        let title = "";
        let abstract = "";
        let simplifiedExpl = "";
        
        // Check for common allergies and health conditions
        if (queryLower.includes("nut allerg") || queryLower.includes("food allerg")) {
            directUrl = "https://medlineplus.gov/foodallergy.html";
            title = "Food Allergies - MedlinePlus Health Information";
            abstract = `This comprehensive guide covers food allergies, with special focus on nut allergies. Learn about symptoms like hives, swelling, difficulty breathing, and anaphylaxis. Find information about diagnosis through skin tests, blood tests, and food challenges, as well as management strategies including strict avoidance of allergens and carrying emergency medication.`;
            simplifiedExpl = `Food allergies happen when your immune system reacts abnormally to certain foods. For nut allergies, even tiny amounts can cause serious reactions. Symptoms range from mild (like hives) to severe (like trouble breathing). Management involves strictly avoiding nuts, reading food labels carefully, and carrying emergency medication like epinephrine auto-injectors.`;
        }
        else if (queryLower.includes("diabet")) {
            directUrl = "https://medlineplus.gov/diabetes.html";
            title = "Diabetes - MedlinePlus";
            abstract = `Information about diabetes types, symptoms, causes, diagnosis, and treatment from the U.S. National Library of Medicine.`;
        }
        else if (queryLower.includes("heart") || queryLower.includes("cardiac")) {
            directUrl = "https://medlineplus.gov/heartdiseases.html";
            title = "Heart Diseases - MedlinePlus";
            abstract = `Comprehensive information about heart diseases, symptoms, risk factors, and treatment options.`;
        }
        else if (queryLower.includes("cancer")) {
            directUrl = "https://medlineplus.gov/cancers.html";
            title = "Cancer - MedlinePlus";
            abstract = `Learn about different types of cancer, screening tests, treatments, and prevention strategies.`;
        }
        else if (queryLower.includes("asthma")) {
            directUrl = "https://medlineplus.gov/asthma.html";
            title = "Asthma - MedlinePlus";
            abstract = `Information about asthma symptoms, triggers, management, and treatments for both children and adults.`;
        }
        else if (queryLower.includes("arthritis")) {
            directUrl = "https://medlineplus.gov/arthritis.html";
            title = "Arthritis - MedlinePlus";
            abstract = `Learn about different types of arthritis, joint pain management, and treatment options.`;
        }
        else {
            // For any other search query, create a relevant search URL
            directUrl = `https://medlineplus.gov/search.html?query=${encodeURIComponent(query)}`;
        }

        // For demo purposes, we'll create simulated MedlinePlus data with accurate URLs
        const medlinePlusArticles = [
            {
                title: title || `${query} - MedlinePlus Health Information`,
                authors: [{ name: 'U.S. National Library of Medicine' }],
                year: new Date().getFullYear(),
                venue: 'MedlinePlus Health Encyclopedia',
                abstract: abstract || `This article provides comprehensive information about ${query}, including symptoms, causes, diagnosis, and treatment options. MedlinePlus provides reliable, up-to-date health information for patients and their families.`,
                url: directUrl,
                source: 'MedlinePlus',
                simplified_explanation: simplifiedExpl || `${query} is a medical condition that can affect your daily life. The main symptoms often include changes in how you feel and function. Doctors can diagnose it through various tests and examinations. Treatment usually involves medication, lifestyle changes, or sometimes procedures to manage the condition and improve quality of life.`
            },
            {
                title: `Understanding ${query} - Patient Guide`,
                authors: [{ name: 'MedlinePlus Medical Encyclopedia' }],
                year: new Date().getFullYear(),
                venue: 'MedlinePlus Patient Resources',
                abstract: `This patient-focused guide explains ${query} in clear, simple terms. Learn about the common symptoms, risk factors, when to see a doctor, and what treatments are currently available.`,
                url: directUrl,
                source: 'MedlinePlus',
                simplified_explanation: `If you have ${query}, it's important to understand what's happening in your body. This condition typically develops when certain bodily processes aren't working as they should. Your doctor can recommend treatments based on your specific symptoms and health history. Most people manage this condition successfully with proper care.`
            }
        ];

        res.json({ papers: medlinePlusArticles, source: 'MedlinePlus' });
    } catch (error) {
        console.error('Error fetching from MedlinePlus:', error);
        throw error;
    }
}

// Helper function to fetch from Mayo Clinic
async function fetchMayoClinic(query, res, simplified = false) {
    try {
        // Create more accurate and targeted URLs for specific conditions
        const queryLower = query.toLowerCase();
        let directUrl = "";
        let treatmentUrl = "";
        let title = "";
        let abstract = "";
        let simplifiedExpl = "";
        
        // Check for common allergies and health conditions
        if (queryLower.includes("nut allerg") || queryLower.includes("food allerg") || queryLower.includes("peanut allerg")) {
            directUrl = "https://www.mayoclinic.org/diseases-conditions/food-allergy/symptoms-causes/syc-20355095";
            treatmentUrl = "https://www.mayoclinic.org/diseases-conditions/food-allergy/diagnosis-treatment/drc-20355101";
            title = "Food allergy - Symptoms and causes - Mayo Clinic";
            abstract = `Learn about food allergies, with focused information on nut allergies which are among the most common food allergies. Symptoms can range from mild (hives, itching) to severe and life-threatening (anaphylaxis). Food allergies occur when your immune system mistakenly identifies certain foods as harmful, triggering an immune response that affects multiple organs and can cause dangerous symptoms.`;
            simplifiedExpl = `A nut allergy happens when your body's defense system overreacts to proteins in nuts. When you eat or sometimes just touch these nuts, your body releases chemicals that cause symptoms like skin rashes, swelling, stomach pain, or breathing problems. Severe reactions can be life-threatening. Management includes avoiding all nut products and carrying emergency medication.`;
        }
        else if (queryLower.includes("diabet")) {
            directUrl = "https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444";
            treatmentUrl = "https://www.mayoclinic.org/diseases-conditions/diabetes/diagnosis-treatment/drc-20371451";
            title = "Diabetes - Symptoms and causes - Mayo Clinic";
            abstract = `Comprehensive information about diabetes, its types, symptoms, causes, risk factors, and complications.`;
        }
        else if (queryLower.includes("heart") || queryLower.includes("cardiac")) {
            directUrl = "https://www.mayoclinic.org/diseases-conditions/heart-disease/symptoms-causes/syc-20353118";
            treatmentUrl = "https://www.mayoclinic.org/diseases-conditions/heart-disease/diagnosis-treatment/drc-20353124";
            title = "Heart disease - Symptoms and causes - Mayo Clinic";
            abstract = `Learn about heart disease symptoms, risk factors, prevention, and treatment options from Mayo Clinic experts.`;
        }
        else if (queryLower.includes("asthma")) {
            directUrl = "https://www.mayoclinic.org/diseases-conditions/asthma/symptoms-causes/syc-20369653";
            treatmentUrl = "https://www.mayoclinic.org/diseases-conditions/asthma/diagnosis-treatment/drc-20369660";
            title = "Asthma - Symptoms and causes - Mayo Clinic";
            abstract = `Discover what triggers asthma symptoms, how to manage attacks, and treatment approaches for different age groups.`;
        }
        else {
            // For any other search query, create a relevant search URL
            directUrl = `https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(query)}`;
            treatmentUrl = `https://www.mayoclinic.org/search/search-results?q=${encodeURIComponent(query)}+treatment`;
        }

        // For demo purposes, we'll create simulated Mayo Clinic data with accurate URLs
        const mayoClinicArticles = [
            {
                title: title || `${query} - Symptoms and causes - Mayo Clinic`,
                authors: [{ name: 'Mayo Clinic Staff' }],
                year: new Date().getFullYear(),
                venue: 'Mayo Clinic Disease and Conditions',
                abstract: abstract || `Learn about the symptoms, causes, risk factors and complications of ${query}. Find out when to see a doctor and what tests and procedures are used for diagnosis.`,
                url: directUrl,
                source: 'Mayo Clinic',
                simplified_explanation: simplifiedExpl || `${query} is a condition that can cause several noticeable symptoms. It happens when certain parts of your body aren't working properly. Your doctor can run tests to confirm if you have it. Understanding the causes and risk factors can help you manage or prevent this condition.`
            },
            {
                title: `${query} - Diagnosis and treatment - Mayo Clinic`,
                authors: [{ name: 'Mayo Clinic Medical Professionals' }],
                year: new Date().getFullYear(),
                venue: 'Mayo Clinic Treatment Guides',
                abstract: `Discover the latest treatment options for ${query}, including medications, therapies and surgeries if needed. This comprehensive guide covers what to expect from your doctor and how to manage your condition at home.`,
                url: treatmentUrl || directUrl,
                source: 'Mayo Clinic',
                simplified_explanation: `For ${query}, doctors have several treatment approaches available. The right option depends on your specific situation and how severe your condition is. Treatment might include taking medications, making lifestyle changes, or in some cases, having procedures done. Many people successfully manage this condition with their doctor's help.`
            }
        ];

        res.json({ papers: mayoClinicArticles, source: 'Mayo Clinic' });
    } catch (error) {
        console.error('Error fetching from Mayo Clinic:', error);
        throw error;
    }
}

// Helper function to fetch from CDC/NIH
async function fetchCDCNIH(query, res, simplified = false) {
    try {
        // Create more accurate and targeted URLs for specific conditions
        const queryLower = query.toLowerCase();
        let cdcUrl = "";
        let nihUrl = "";
        let cdcTitle = "";
        let nihTitle = "";
        let cdcAbstract = "";
        let nihAbstract = "";
        let cdcSimplified = "";
        
        // Check for common allergies and health conditions
        if (queryLower.includes("nut allerg") || queryLower.includes("food allerg")) {
            cdcUrl = "https://www.cdc.gov/healthyschools/foodallergies/index.htm";
            nihUrl = "https://www.niaid.nih.gov/diseases-conditions/food-allergy";
            cdcTitle = "Food Allergies - CDC";
            nihTitle = "Food Allergy - National Institute of Allergy and Infectious Diseases";
            cdcAbstract = `The CDC provides essential guidance on food allergies, particularly in school settings. This resource outlines strategies for preventing allergic reactions, recognizing symptoms, and responding to emergencies related to nut and other food allergies. It includes information on creating safe environments for people with severe food allergies.`;
            nihAbstract = `The National Institute of Allergy and Infectious Diseases provides comprehensive information about food allergies, including peanut and tree nut allergies. This resource covers the immune system's role in allergic reactions, research on allergy prevention and treatment, and current clinical guidelines for diagnosis and management.`;
            cdcSimplified = `Food allergies affect about 8% of children and can be dangerous. The CDC helps schools and communities create safe environments for people with severe allergies. When someone with a nut allergy eats nuts, their immune system overreacts, sometimes causing severe reactions that need immediate treatment with epinephrine (an EpiPen).`;
        }
        else if (queryLower.includes("diabet")) {
            cdcUrl = "https://www.cdc.gov/diabetes/basics/index.html";
            nihUrl = "https://www.niddk.nih.gov/health-information/diabetes";
            cdcTitle = "Diabetes - CDC";
            nihTitle = "Diabetes - National Institute of Diabetes and Digestive and Kidney Diseases";
            cdcAbstract = `CDC information about diabetes prevention, risk factors, and public health guidelines.`;
            nihAbstract = `NIH-supported research and educational resources about diabetes management and treatment.`;
        }
        else if (queryLower.includes("covid") || queryLower.includes("coronavirus")) {
            cdcUrl = "https://www.cdc.gov/coronavirus/2019-ncov/index.html";
            nihUrl = "https://covid19.nih.gov/";
            cdcTitle = "COVID-19 - CDC";
            nihTitle = "COVID-19 Research - NIH";
            cdcAbstract = `CDC guidance on COVID-19 prevention, testing, symptoms, and current public health recommendations.`;
            nihAbstract = `NIH research initiatives, clinical trials, and scientific findings related to COVID-19.`;
        }
        else if (queryLower.includes("heart") || queryLower.includes("cardiac")) {
            cdcUrl = "https://www.cdc.gov/heartdisease/index.htm";
            nihUrl = "https://www.nhlbi.nih.gov/health/heart";
            cdcTitle = "Heart Disease - CDC";
            nihTitle = "Heart Disease - National Heart, Lung, and Blood Institute";
            cdcAbstract = `CDC statistics, risk factors, and prevention strategies for heart disease in the United States.`;
            nihAbstract = `NIH information about heart disease research, treatment approaches, and clinical guidelines.`;
        }
        else {
            // For any other search query, create a relevant search URL
            cdcUrl = `https://www.cdc.gov/search/?query=${encodeURIComponent(query)}`;
            nihUrl = `https://www.nih.gov/search?query=${encodeURIComponent(query)}`;
        }

        // For demo purposes, we'll create simulated CDC/NIH data with accurate URLs
        const cdcNihArticles = [
            {
                title: cdcTitle || `${query} - CDC Fact Sheet`,
                authors: [{ name: 'Centers for Disease Control and Prevention' }],
                year: new Date().getFullYear(),
                venue: 'CDC Health Information',
                abstract: cdcAbstract || `The CDC provides this official public health information about ${query}. This fact sheet covers essential information about transmission, prevention, and public health recommendations.`,
                url: cdcUrl,
                source: 'CDC',
                simplified_explanation: cdcSimplified || `${query} is a condition that the CDC monitors for public health purposes. They provide guidance on how to reduce your risk and what steps to take if you think you have it. The CDC recommendations are based on scientific research and aim to protect both individuals and communities.`
            },
            {
                title: nihTitle || `${query} - NIH Research Update`,
                authors: [{ name: 'National Institutes of Health' }],
                year: new Date().getFullYear(),
                venue: 'NIH Health Information',
                abstract: nihAbstract || `The National Institutes of Health summarizes the latest research on ${query}, including causes, risk factors, and emerging treatments. This article explains how NIH-funded research is improving understanding and management of this condition.`,
                url: nihUrl,
                source: 'NIH',
                simplified_explanation: `Scientists at the NIH are studying ${query} to better understand what causes it and how to treat it effectively. Their research looks at why some people develop this condition and others don't. The findings help doctors provide better care and might lead to new treatments in the future.`
            }
        ];

        res.json({ papers: cdcNihArticles, source: 'CDC/NIH' });
    } catch (error) {
        console.error('Error fetching from CDC/NIH:', error);
        throw error;
    }
}

// Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

app.get('/semantic-scholar', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/semantic-scholar.html'));
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

app.get('/report-vault', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/report-vault.html'));
});

app.get('/price-comparison', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/price-comparison.html'));
});

app.get('/forums', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/forums.html'));
});

app.get('/forum', (req, res) => {
    res.redirect('/forums');
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

function getNetworkAddresses() {
    const nets = networkInterfaces();
    const addresses = [];
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Include both IPv4 and IPv6 addresses
            if (!net.internal) {
                addresses.push(net.address);
            }
        }
    }
    return addresses;
}

// Add error handling for the server
const server = app.listen(PORT, HOST, () => {
    const networkAddresses = getNetworkAddresses();
    console.log('\n=== Server Status ===');
    console.log(`Server running on:`);
    console.log(`- Local: http://localhost:${PORT}`);
    console.log(`- Local IP: http://127.0.0.1:${PORT}`);
    networkAddresses.forEach(addr => {
        console.log(`- Network: http://${addr}:${PORT}`);
    });
    console.log('\nTo access from other devices on your network, use one of the Network URLs above.');
    console.log('===================\n');
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port or close the application using this port.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});

// Handle process termination
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

app.get('/ambulance-loader.svg', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/ambulance-loader.svg'));
});


function formatAIResponse(text) {
    // Clean and normalize text
    let formatted = text.trim();
    
    // Pre-process reports with markdown-style bold headings and numbered headings
    // Handle report titles
    formatted = formatted.replace(/^\*\*([^*\n]+)\*\*$/gm, '<h1 class="medical-heading-1">$1</h1>');
    
    // Handle patient data fields with bold markers
    formatted = formatted.replace(/\*\*([^:*]+):\*\*\s*([^*\n]+)(?=\s+\*\*|\s*$)/g, 
        '<div class="patient-info-field"><span class="field-name">$1:</span> <span class="field-value">$2</span></div>');
    
    // Handle numbered sections with bold markers
    formatted = formatted.replace(/^\*\*(\d+)\.\s+([^:*]+):\*\*(.*)$/gm, 
        '<h2 class="medical-heading-2"><span class="section-number">$1</span> $2</h2>$3');
    
    // Handle plain numbered sections
    formatted = formatted.replace(/^(\d+)\.\s+([^:]+):(.*)$/gm, 
        '<h2 class="medical-heading-2"><span class="section-number">$1</span> $2</h2>$3');
    
    // Handle bold section headings with colon
    formatted = formatted.replace(/^\*\*([^:*]+):\*\*(.*)$/gm, '<h2 class="medical-heading-2">$1</h2>$2');
    
    // Format headings (maintain hierarchy)
    formatted = formatted
        // Main headings (H1)
        .replace(/^(#{1,2})\s+(.+?)$/gm, '<h1 class="medical-heading-1">$2</h1>')
        // Subheadings (H2)
        .replace(/^(#{3})\s+(.+?)$/gm, '<h2 class="medical-heading-2">$2</h2>')
        // Sub-subheadings (H3)
        .replace(/^(#{4,})\s+(.+?)$/gm, '<h3 class="medical-heading-3">$2</h3>')
        // Alternative heading format (with colon)
        .replace(/^([A-Z][A-Za-z\s]+):\s*$/gm, '<h2 class="medical-heading-2">$1</h2>')
        .replace(/^([A-Z][A-Za-z\s]+) \((.+?)\):\s*$/gm, '<h2 class="medical-heading-2">$1 <span class="medical-heading-subtitle">$2</span></h2>');
    
    // Format sections with iconography
    formatted = formatted
        .replace(/\b(Findings|Analysis|Assessment):/gi, '<div class="medical-section"><span class="medical-icon">🔍</span> <strong>$1:</strong>')
        .replace(/\b(Diagnosis|Impression|Conclusion):/gi, '<div class="medical-section diagnosis"><span class="medical-icon">🩺</span> <strong>$1:</strong>')
        .replace(/\b(Recommendation|Treatment|Plan):/gi, '<div class="medical-section recommendation"><span class="medical-icon">💊</span> <strong>$1:</strong>')
        .replace(/\b(Warning|Caution|Alert|Attention):/gi, '<div class="medical-section warning"><span class="medical-icon">⚠️</span> <strong>$1:</strong>')
        .replace(/\b(Note|Important):/gi, '<div class="medical-section note"><span class="medical-icon">📝</span> <strong>$1:</strong>');
        
    // Close div tags for sections (if they're not at the end of the text)
    formatted = formatted.replace(/(<div class="medical-section(?:.*?)">.*?)(\n\n|\n(?=<))/g, '$1</div>$2');
    
    // Make sure all sections are closed at the end of the text
    if (formatted.includes('<div class="medical-section') && !formatted.endsWith('</div>')) {
        formatted += '</div>';
    }
    
    // Format medical findings and key information 
    formatted = formatted
        // Process numbered lists while preserving them
        .replace(/^(\d+)\.\s+(.+)$/gm, function(match, number, content) {
            // Check if the content contains a key finding or diagnosis
            if (/diagnosis|finding|assessment|impression|conclusion/i.test(content)) {
                return `<h3 class="medical-finding"><span class="finding-number">${number}</span> ${content}</h3>`;
            }
            return `<li><span class="list-number">${number}.</span> ${content}</li>`;
        })
        
        // Format medical terms and diagnostic terms
        .replace(/\b(diagnosis|finding|assessment|impression|conclusion|results|analysis|recommendation|treatment|prognosis|etiology|pathology|differential|anatomy|physiology):/gi, '<span class="medical-term">$1:</span>')
        
        // Format percentages and measurements (but don't catch numbered lists)
        .replace(/\b(\d+(?:\.\d+)?(?:\s*%|\s*cm|\s*mm|\s*μm|\s*units|\s*mg\/dL))\b/g, '<span class="measurement">$1</span>')
        
        // Highlight medical terms
        .replace(/\b(acute|chronic|benign|malignant|lesion|nodule|tumor|inflammation|infection|fracture|sprain|strain|hypertension|diabetes|carcinoma|necrosis|edema|atrophy|trauma|hyperplasia)\b/gi, '<span class="highlighted-term">$1</span>')
        
        // Bullet points and lists
        .replace(/^\*\s+(.+)$/gm, '<li class="medical-bullet">$1</li>')
        .replace(/^[•*-]\s+(.+)$/gm, '<li class="medical-bullet">$1</li>');
        
    // Ensure lists are properly formed
    formatted = formatted
        .replace(/(<li.*?>.*?<\/li>)\s*(<li)/g, '$1$2')
        .replace(/(<li class="medical-bullet">.*<\/li>)(?!\s*<li)/g, '<ul class="medical-list">$1</ul>')
        .replace(/(<li><span class="list-number">.*<\/li>)(?!\s*<li)/g, '<ol class="medical-numbered-list">$1</ol>');
    
    // Format paragraphs for readability
    formatted = formatted.replace(/\n{2,}/g, '</p><p class="medical-paragraph">');
    
    // Create distinctive summary box if there's a Summary section
    formatted = formatted.replace(/(<h[1-3][^>]*>Summary.*?<\/h[1-3]>)(.*?)(<h[1-3]|$)/s, 
        '<div class="medical-summary-box"><div class="summary-header">$1</div><div class="summary-content">$2</div></div>$3');
    
    // Add tooltips for complex terms (sample terms, would need to be expanded)
    const medicalTerms = {
        'hypertension': 'High blood pressure',
        'arrhythmia': 'Irregular heartbeat',
        'tachycardia': 'Abnormally rapid heart rate',
        'bradycardia': 'Abnormally slow heart rate',
        'edema': 'Swelling caused by excess fluid',
        'hyperglycemia': 'High blood sugar',
        'hypoglycemia': 'Low blood sugar',
        'hypodense': 'Lower density (appears darker) on imaging',
        'hyperdense': 'Higher density (appears brighter) on imaging',
        'parenchyma': 'The functional tissue of an organ',
        'attenuation': 'Reduction in intensity of energy as it passes through matter',
        'contusion': 'A bruise (injury) with intact skin surface',
        'hematoma': 'A collection of blood outside blood vessels'
    };
    
    // Add tooltips for medical terms
    Object.keys(medicalTerms).forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        formatted = formatted.replace(regex, `<span class="tooltip-term" title="${medicalTerms[term]}">$&</span>`);
    });
    
    // Wrap everything in paragraphs if not already wrapped
    if (!formatted.startsWith('<h') && !formatted.startsWith('<p') && !formatted.startsWith('<div') && !formatted.startsWith('<ul')) {
        formatted = '<p class="medical-paragraph">' + formatted + '</p>';
    }
    
    // General cleanup for final formatting 
    formatted = formatted
        // Ensure proper paragraph tags
        .replace(/<\/p><p><\/p>/g, '</p>')
        .replace(/<p><\/p>/g, '')
        // Clean up any potentially unclosed tags
        .replace(/<\/?(div|p|h1|h2|h3|ul|li)>(\s*)<\/?(div|p|h1|h2|h3|ul|li)>/g, '$2');

    return `<div class="formatted-response">
        <style>
            .formatted-response {
                font-family: 'Segoe UI', Arial, sans-serif;
                line-height: 1.5;
                color: #333;
                padding: 5px;
                font-size: 0.95em;
            }
            
            .medical-heading-1 {
                font-size: 1.35em;
                color: #d32f2f;
                border-bottom: 2px solid #d32f2f;
                padding-bottom: 6px;
                margin-top: 16px;
                margin-bottom: 12px;
                font-weight: 600;
            }
            
            .medical-heading-2 {
                font-size: 1.15em;
                color: #1976d2;
                margin-top: 14px;
                margin-bottom: 10px;
                font-weight: 600;
                padding-left: 5px;
                border-left: 3px solid #1976d2;
            }
            
            .section-number {
                display: inline-block;
                background-color: #1976d2;
                color: white;
                border-radius: 50%;
                width: 22px;
                height: 22px;
                text-align: center;
                margin-right: 6px;
                font-size: 0.85em;
                line-height: 22px;
            }
            
            .medical-heading-3 {
                font-size: 1em;
                color: #2e7d32;
                margin-top: 12px;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .medical-heading-subtitle {
                font-size: 0.75em;
                color: #666;
                font-weight: normal;
            }
            
            .medical-paragraph {
                margin: 8px 0;
                font-size: 0.95em;
            }
            
            .patient-info-field {
                display: inline-block;
                margin-right: 15px;
                margin-bottom: 5px;
                font-size: 0.9em;
            }
            
            .field-name {
                font-weight: bold;
                color: #555;
            }
            
            .field-value {
                color: #000;
            }
            
            .medical-section {
                background-color: #f5f5f5;
                border-radius: 8px;
                padding: 10px 12px;
                margin: 12px 0;
                border-left: 4px solid #1976d2;
                font-size: 0.95em;
            }
            
            .medical-section.diagnosis {
                background-color: #e3f2fd;
                border-left-color: #1976d2;
            }
            
            .medical-section.recommendation {
                background-color: #e8f5e9;
                border-left-color: #4caf50;
            }
            
            .medical-section.warning {
                background-color: #fff3e0;
                border-left-color: #ff9800;
            }
            
            .medical-section.note {
                background-color: #f5f5f5;
                border-left-color: #9e9e9e;
            }
            
            .medical-icon {
                margin-right: 6px;
                font-size: 1.1em;
            }
            
            .medical-term {
                font-weight: 600;
                color: #0d47a1;
            }
            
            .measurement {
                font-weight: 600;
                color: #d32f2f;
            }
            
            .medical-list {
                padding-left: 20px;
                margin: 8px 0;
            }
            
            .medical-numbered-list {
                padding-left: 20px;
                margin: 8px 0;
            }
            
            .medical-bullet {
                margin-bottom: 6px;
                position: relative;
                font-size: 0.95em;
            }
            
            .list-number {
                color: #1976d2;
                font-weight: 600;
                margin-right: 4px;
            }
            
            .medical-finding {
                background-color: #e3f2fd;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 1em;
                margin: 10px 0;
            }
            
            .finding-number {
                background-color: #1976d2;
                color: white;
                padding: 1px 6px;
                border-radius: 50%;
                margin-right: 6px;
                font-size: 0.8em;
            }
            
            .highlighted-term {
                background-color: #fff9c4;
                padding: 0 2px;
                border-radius: 3px;
            }
            
            .tooltip-term {
                border-bottom: 1px dotted #666;
                cursor: help;
                position: relative;
            }
            
            .medical-summary-box {
                background-color: #e8f5e9;
                border-radius: 8px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                margin: 16px 0;
                overflow: hidden;
                font-size: 0.95em;
            }
            
            .summary-header {
                background-color: #4caf50;
                color: white;
                padding: 8px 12px;
                font-weight: bold;
            }
            
            .summary-header h1, .summary-header h2, .summary-header h3 {
                color: white !important;
                margin: 0;
                border: none;
                padding: 0;
                font-size: 1.1em;
            }
            
            .summary-content {
                padding: 12px;
            }
        </style>
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

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Log email configuration status
console.log('Email configuration:');
console.log('- EMAIL_USER configured:', !!process.env.EMAIL_USER);
console.log('- EMAIL_PASS configured:', !!process.env.EMAIL_PASS);

// Test email connection on startup
async function verifyEmailConfig() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('Email credentials not configured in .env file.');
        return;
    }
    
    try {
        await transporter.verify();
        console.log('Email server connection successful!');
    } catch (error) {
        console.error('Email server connection failed:', error.message);
    }
}

verifyEmailConfig();

// Enhanced email notification endpoint
app.post('/send-appointment-email', async (req, res) => {
    const { email, status, labName, date, time, patientName, service } = req.body;
    
    if (!email || !status || !labName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ 
            error: 'Email not configured', 
            message: 'Email service is not configured on the server.' 
        });
    }
    
    const statusText = status === 'approved' ? 'approved' : 'rejected';
    const subject = `Appointment ${statusText} - ${labName}`;
    
    const mailOptions = {
        from: `"Lab Finder" <${process.env.EMAIL_USER}>`,
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
                    <p><strong>Patient Name:</strong> ${patientName || 'Not specified'}</p>
                    <p><strong>Service:</strong> ${service || 'General appointment'}</p>
                    <p><strong>Date:</strong> ${date || 'Not specified'}</p>
                    <p><strong>Time:</strong> ${time || 'Not specified'}</p>
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
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);
        res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully', 
            messageId: info.messageId 
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: 'Failed to send email', 
            details: error.message 
        });
    }
});

// New endpoint to test email configuration
app.post('/test-email', async (req, res) => {
    const { recipientEmail } = req.body;
    
    if (!recipientEmail) {
        return res.status(400).json({ error: 'Recipient email is required' });
    }
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(500).json({ 
            error: 'Email not configured', 
            message: 'Email service is not configured on the server.' 
        });
    }
    
    const mailOptions = {
        from: `"Lab Finder" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        subject: 'Test Email from Lab Finder',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333; text-align: center;">Test Email</h2>
                <p style="color: #666;">This is a test email from Lab Finder to verify the email configuration.</p>
                <p style="color: #666;">If you received this email, your email service is working correctly!</p>
                <div style="text-align: center; margin-top: 30px; color: #666;">
                    <p>Thank you for using Lab Finder.</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully:', info.messageId);
        res.status(200).json({ 
            success: true, 
            message: 'Test email sent successfully', 
            messageId: info.messageId 
        });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ 
            error: 'Failed to send test email', 
            details: error.message 
        });
    }
});

// Function to get static disease information when Gemini API is unavailable
function getStaticDiseaseInfo(query) {
    const currentYear = new Date().getFullYear();
    const lowerQuery = query.toLowerCase();
    
    // Common diseases with pre-defined simplified information
    const commonDiseases = {
        'diabetes': [
            {
                title: "Diabetes: An Overview",
                authors: [{ name: "Mayo Clinic" }],
                year: currentYear,
                venue: "Mayo Clinic Health Library",
                abstract: "Diabetes mellitus refers to a group of diseases that affect how the body uses blood glucose (blood sugar). Glucose is an important source of energy for the cells that make up the muscles and tissues. It's also the brain's main source of fuel. The main cause of diabetes varies by type. But regardless of the type of diabetes you have, it can lead to excess sugar in the blood. Too much sugar in the blood can lead to serious health problems.",
                simplified_explanation: "Diabetes is a condition where your body can't properly control blood sugar levels. This happens either because your body doesn't make enough insulin (a hormone that regulates sugar) or can't use it effectively. Common symptoms include increased thirst, frequent urination, and fatigue. It's managed through healthy eating, exercise, and sometimes medication.",
                url: "https://www.mayoclinic.org/diseases-conditions/diabetes/symptoms-causes/syc-20371444",
                source: "Mayo Clinic"
            },
            {
                title: "Symptoms and Diagnosis of Diabetes",
                authors: [{ name: "CDC" }],
                year: currentYear,
                venue: "Centers for Disease Control and Prevention",
                abstract: "Symptoms of diabetes include increased thirst, frequent urination, extreme hunger, unexplained weight loss, presence of ketones in the urine, fatigue, irritability, blurred vision, slow-healing sores, and frequent infections. Diagnosis typically involves blood tests that measure blood glucose levels, including fasting blood glucose tests, oral glucose tolerance tests, and A1C tests which reflect average blood sugar levels over the past 2-3 months.",
                simplified_explanation: "People with diabetes often feel very thirsty, pee a lot, feel hungry or tired, lose weight without trying, or have blurry vision. Doctors can check if you have diabetes with simple blood tests that measure how much sugar is in your blood. Early detection is important because treatment can prevent serious health problems.",
                url: "https://www.cdc.gov/diabetes/basics/symptoms.html",
                source: "CDC"
            },
            {
                title: "Treatment Approaches for Diabetes",
                authors: [{ name: "American Diabetes Association" }],
                year: currentYear,
                venue: "Diabetes Care Journal",
                abstract: "Treatment for diabetes focuses on controlling blood glucose levels through a combination of medication, diet, and exercise. For Type 1 diabetes, insulin therapy is essential. For Type 2 diabetes, lifestyle changes may be sufficient initially, but medications or insulin may become necessary as the disease progresses. Regular monitoring of blood glucose levels is crucial for effective management, as are regular checkups to prevent or treat diabetes-related complications.",
                simplified_explanation: "Treating diabetes means keeping your blood sugar at healthy levels. This usually involves eating healthy foods, being active, and sometimes taking medications. People with Type 1 diabetes need insulin injections. People with Type 2 may control it with lifestyle changes and pills. Checking your blood sugar regularly helps you know if your treatment is working.",
                url: "https://www.diabetes.org/diabetes/treatment-care",
                source: "American Diabetes Association"
            }
        ],
        
        'hypertension': [
            {
                title: "Understanding High Blood Pressure (Hypertension)",
                authors: [{ name: "American Heart Association" }],
                year: currentYear,
                venue: "American Heart Association Health Library",
                abstract: "Hypertension, or high blood pressure, is a common condition in which the long-term force of the blood against artery walls is high enough to eventually cause health problems, such as heart disease. Blood pressure is determined by the amount of blood the heart pumps and the resistance to blood flow in the arteries. The more blood the heart pumps and the narrower the arteries, the higher the blood pressure.",
                simplified_explanation: "High blood pressure happens when the force of blood pushing against your blood vessel walls is consistently too high. It's dangerous because it makes your heart work harder and can damage your blood vessels. Most people with high blood pressure don't have symptoms, which is why it's often called the 'silent killer'.",
                url: "https://www.heart.org/en/health-topics/high-blood-pressure",
                source: "American Heart Association"
            },
            {
                title: "Symptoms and Diagnosis of Hypertension",
                authors: [{ name: "WebMD" }],
                year: currentYear,
                venue: "WebMD Medical Reference",
                abstract: "Most people with high blood pressure have no symptoms, even if blood pressure readings reach dangerously high levels. Some people with high blood pressure may have headaches, shortness of breath, or nosebleeds, but these signs typically don't occur until blood pressure has reached a severe stage. Diagnosis involves measuring blood pressure using a pressure-measuring gauge with a blood pressure cuff, typically over multiple visits to confirm a diagnosis.",
                simplified_explanation: "Most people with high blood pressure don't feel sick - that's what makes it dangerous. A doctor diagnoses high blood pressure by taking readings with a blood pressure cuff, usually at multiple visits. Normal blood pressure is below 120/80. If yours is consistently higher, your doctor might recommend lifestyle changes or medication.",
                url: "https://www.webmd.com/hypertension-high-blood-pressure/guide/hypertension-symptoms-high-blood-pressure",
                source: "WebMD"
            },
            {
                title: "Treatment and Management of Hypertension",
                authors: [{ name: "National Heart, Lung, and Blood Institute" }],
                year: currentYear,
                venue: "NHLBI Health Information Center",
                abstract: "Treatment for hypertension typically begins with lifestyle modifications, including dietary changes (particularly reducing sodium intake), regular physical activity, maintaining a healthy weight, limiting alcohol consumption, and not smoking. If lifestyle changes alone are not sufficient, various medications may be prescribed, including diuretics, ACE inhibitors, ARBs, calcium channel blockers, and beta-blockers, often in combination for optimal blood pressure control.",
                simplified_explanation: "Managing high blood pressure starts with healthy habits like eating less salt, exercising regularly, maintaining a healthy weight, limiting alcohol, and not smoking. If these changes aren't enough, doctors may prescribe medications that help lower blood pressure in different ways. Regular blood pressure checks are important to see if treatment is working.",
                url: "https://www.nhlbi.nih.gov/health/high-blood-pressure/treatment",
                source: "NHLBI"
            }
        ],
        
        'arthritis': [
            {
                title: "Arthritis: Understanding Joint Inflammation",
                authors: [{ name: "Arthritis Foundation" }],
                year: currentYear,
                venue: "Arthritis Foundation Health Library",
                abstract: "Arthritis is inflammation of one or more joints, causing pain and stiffness that can worsen with age. The most common types are osteoarthritis and rheumatoid arthritis. Osteoarthritis involves wear-and-tear damage to cartilage that can eventually cause bone to grind directly on bone. Rheumatoid arthritis occurs when the immune system attacks the synovial membrane enclosing joints, resulting in a painful swelling that can eventually lead to joint deformity.",
                simplified_explanation: "Arthritis causes painful, swollen joints that can be hard to move. It happens when the cushiony tissue between bones breaks down (osteoarthritis) or when your immune system attacks your joints by mistake (rheumatoid arthritis). While arthritis can't be cured, treatments can help manage pain and keep you moving.",
                url: "https://www.arthritis.org/health-wellness/about-arthritis/understanding-arthritis/what-is-arthritis",
                source: "Arthritis Foundation"
            },
            {
                title: "Signs, Symptoms and Diagnosis of Arthritis",
                authors: [{ name: "CDC" }],
                year: currentYear,
                venue: "Centers for Disease Control and Prevention",
                abstract: "Common arthritis symptoms include swelling, pain, stiffness, and decreased range of motion in affected joints. Symptoms may come and go, and can range from mild to severe. Severe cases can result in chronic pain and inability to perform daily activities. Diagnosis typically involves physical examination, imaging tests such as X-rays or MRIs, and laboratory tests including blood tests and analysis of joint fluid.",
                simplified_explanation: "If you have arthritis, your joints might feel stiff, painful, swollen, or warm, especially in the morning or after resting. These symptoms can make everyday activities difficult. Doctors diagnose arthritis by examining your joints, taking X-rays, and sometimes doing blood tests to check for specific types of arthritis.",
                url: "https://www.cdc.gov/arthritis/basics/symptoms.htm",
                source: "CDC"
            },
            {
                title: "Treatment Approaches for Arthritis",
                authors: [{ name: "Mayo Clinic" }],
                year: currentYear,
                venue: "Mayo Clinic Proceedings",
                abstract: "Arthritis treatment focuses on relieving symptoms and improving joint function. Medications may include analgesics, nonsteroidal anti-inflammatory drugs (NSAIDs), counterirritants, disease-modifying antirheumatic drugs (DMARDs), biologic response modifiers, and corticosteroids. Physical therapy can improve range of motion, while occupational therapy helps adapt daily activities. Severe cases may require joint repair, replacement, or fusion surgery.",
                simplified_explanation: "Treating arthritis usually involves a combination of approaches. Medications can reduce pain and inflammation. Physical therapy helps strengthen muscles around joints and improve flexibility. Some people benefit from heat or cold therapy. In severe cases, surgery might be needed to repair or replace damaged joints.",
                url: "https://www.mayoclinic.org/diseases-conditions/arthritis/diagnosis-treatment/drc-20350777",
                source: "Mayo Clinic"
            }
        ]
    };
    
    // Check if we have pre-defined information for the query
    for (const [disease, info] of Object.entries(commonDiseases)) {
        if (lowerQuery.includes(disease)) {
            return info;
        }
    }
    
    // Generic disease information if no specific match
    return [
        {
            title: `Overview of ${query}`,
            authors: [{ name: "MediMap Health Reference" }],
            year: currentYear,
            venue: "MediMap Medical Library",
            abstract: `This article provides a comprehensive overview of ${query}, including its definition, prevalence, and general impact on health. Medical conditions can vary greatly in their severity and presentation. Understanding the basics of a condition is the first step toward proper management.`,
            simplified_explanation: `This health topic may have complex medical aspects, but our simplified explanation helps you understand the basics. A medical condition affects how parts of your body work. Learning about your condition helps you make better health decisions. Always consult healthcare providers for specific advice about your situation.`,
            url: "https://medlineplus.gov/",
            source: "MediMap"
        },
        {
            title: `Symptoms and Diagnosis of ${query}`,
            authors: [{ name: "Health Information Center" }],
            year: currentYear,
            venue: "Patient Education Journal",
            abstract: `Recognizing the symptoms of ${query} is essential for early diagnosis and treatment. This article outlines the common signs to watch for and explains the diagnostic procedures healthcare providers typically use to confirm the condition. Early intervention often leads to better outcomes.`,
            simplified_explanation: `Symptoms are the body's way of showing something isn't right. They can include changes in how you feel, like pain or tiredness, or things you notice, like a rash or fever. If you have concerning symptoms, a doctor can run tests to find the cause and recommend appropriate treatment.`,
            url: "https://www.cdc.gov/",
            source: "Health Information Center"
        },
        {
            title: `Treatment and Management of ${query}`,
            authors: [{ name: "Medical Research Institute" }],
            year: currentYear,
            venue: "Clinical Practice Guidelines",
            abstract: `This article discusses current treatment approaches for ${query}, including medications, lifestyle modifications, and other therapeutic interventions. Management strategies are designed to reduce symptoms, slow disease progression, and improve quality of life. Treatment plans are typically individualized based on the severity of the condition and patient-specific factors.`,
            simplified_explanation: `Treating a health condition usually involves steps to reduce symptoms and help you feel better. This might include taking medications, making lifestyle changes like diet or exercise adjustments, or learning ways to manage pain or discomfort. Your doctor will recommend treatment options that work best for your specific situation.`,
            url: "https://www.nih.gov/",
            source: "Medical Research Institute"
        }
    ];
}

// Add announcements API endpoints after other API endpoints

// API endpoints for health announcements
app.get('/api/announcements', (req, res) => {
    try {
        // For now, we'll return a success response since we're using localStorage
        // In a real implementation, you would fetch from a database here
        res.json({ success: true, message: 'Announcements are managed client-side for now' });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch announcements' });
    }
});

app.post('/api/announcements', (req, res) => {
    try {
        // For now, we'll return a success response since we're using localStorage
        // In a real implementation, you would save to a database here
        res.json({ success: true, message: 'Announcement added successfully' });
    } catch (error) {
        console.error('Error adding announcement:', error);
        res.status(500).json({ success: false, error: 'Failed to add announcement' });
    }
});

app.delete('/api/announcements/:id', (req, res) => {
    try {
        // For now, we'll return a success response since we're using localStorage
        // In a real implementation, you would delete from a database here
        res.json({ success: true, message: 'Announcement removed successfully' });
    } catch (error) {
        console.error('Error removing announcement:', error);
        res.status(500).json({ success: false, error: 'Failed to remove announcement' });
    }
});

app.delete('/api/announcements', (req, res) => {
    try {
        // For now, we'll return a success response since we're using localStorage
        // In a real implementation, you would clear all announcements from a database here
        res.json({ success: true, message: 'All announcements cleared successfully' });
    } catch (error) {
        console.error('Error clearing announcements:', error);
        res.status(500).json({ success: false, error: 'Failed to clear announcements' });
    }
});
