// Constants and Configuration
const CONFIG = {
    DEFAULT_CENTER: [33.7500, 72.7700],
    MAX_RECENT_SEARCHES: 5,
    DEFAULT_ZOOM: 13,
    MIN_ZOOM: 3,
    MAX_ZOOM: 19,
    TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    ATTRIBUTION: '©usama-hsnn 2025'
};

// Lab Data
const labs = [
    {
        name: "Capital Diagnostic Centre",
        lat: 33.78895628970263,
        lng: 72.72671488011703,
        contact: "051-123-4567",
        info: "Full service medical laboratory with state-of-the-art equipment",
        services: ["Blood Tests", "X-Ray", "MRI", "CT Scan", "Ultrasound"],
        timings: "24/7",
        address: "gudwal morr, Wah Cantt"
    },
    {
        name: "university of haripur",
        lat: 33.978206220450126, 
        lng: 72.91292367017417,
        contact: "051-123-4567",
        info: "university ",
        services: ["education,MLT"],
        timings: "24/7",
        address: "haripur"
    },
    {
        name: "POF Hospital Labs",
        lat: 33.75014826546548,
        lng: 72.78497798750843,
        contact: "051-234-5678",
        info: "Specialized diagnostic center serving POF employees and general public",
        services: ["Pathology", "Radiology", "Microbiology", "Biochemistry"],
        timings: "8:00 AM - 10:00 PM",
        address: "POF Hospital Complex, Wah Cantt"
    },
    {
        name: "IDC Labs Barrier 3",
        lat: 33.74675630883451,
        lng: 72.77142146406703,
        contact: "051-345-6789",
        info: "Hospital laboratory services with quick reporting",
        services: ["Emergency Tests", "COVID Testing", "Blood Banking"],
        timings: "24/7",
        address: "Near Barrier 3, Wah Cantt"
    },
    {
        name: "Wah Medical Complex Lab",
        lat: 33.76234567890123,
        lng: 72.77567890123456,
        contact: "051-905-1234",
        info: "Modern diagnostic facility with latest equipment",
        services: ["Clinical Laboratory", "Molecular Diagnostics", "Histopathology"],
        timings: "8:00 AM - 11:00 PM",
        address: "Main GT Road, Wah Cantt"
    },
    {
        name: "Taxila Diagnostic Center",
        lat: 33.74567890123456,
        lng: 72.79123456789012,
        contact: "051-876-5432",
        info: "Comprehensive diagnostic services with home sample collection",
        services: ["Blood Tests", "X-Ray", "ECG", "Ultrasound"],
        timings: "24/7",
        address: "Near Heavy Industries, Taxila"
    },
    {
        name: "Al-Shifa Laboratory",
        lat: 33.77890123456789,
        lng: 72.76234567890123,
        contact: "051-442-8899",
        info: "Reliable testing services with quick turnaround time",
        services: ["Clinical Pathology", "Biochemistry", "Serology"],
        timings: "8:00 AM - 10:00 PM",
        address: "Kashmir Road, Wah Cantt"
    },
    {
        name: "Wah General Hospital Lab",
        lat: 33.75567890123456,
        lng: 72.78234567890123,
        contact: "051-987-6543",
        info: "Hospital-based laboratory with emergency services",
        services: ["Emergency Tests", "Routine Lab Tests", "Specialized Tests"],
        timings: "24/7",
        address: "Hospital Road, Wah Cantt"
    },
    {
        name: "Medicare Diagnostic Lab",
        lat: 33.76789012345678,
        lng: 72.75345678901234,
        contact: "051-333-4455",
        info: "Modern lab facility with home sampling services",
        services: ["Blood Tests", "Urine Tests", "Stool Tests", "Hormone Tests"],
        timings: "7:00 AM - 11:00 PM",
        address: "Lala Rukh, Wah Cantt"
    },

    // Add these to your existing labs array
{
    name: "Citi Lab & Blood Bank",
    lat: 33.77456789012345,
    lng: 72.76123456789012,
    contact: "051-4911177",
    info: "24/7 blood bank and diagnostic services",
    services: ["Blood Bank", "Clinical Lab", "PCR Testing", "Biochemistry"],
    timings: "24/7",
    address: "Block D, Commercial Area, Wah Cantt"
},
{
    name: "Islamabad Diagnostic Centre (IDC) Wah",
    lat: 33.75678901234567,
    lng: 72.77234567890123,
    contact: "051-4545777",
    info: "Branch of renowned IDC with complete diagnostic facilities",
    services: ["MRI", "CT Scan", "X-Ray", "Ultrasound", "Laboratory Tests"],
    timings: "24/7",
    address: "Main GT Road, Near PSO Pump, Wah Cantt"
},
{
    name: "Rehman Medical Complex Lab",
    lat: 33.76345678901234,
    lng: 72.75678901234567,
    contact: "051-4431234",
    info: "Hospital laboratory with advanced testing facilities",
    services: ["Emergency Tests", "Routine Lab Tests", "COVID Testing"],
    timings: "24/7",
    address: "Near Wah Railway Station, Wah Cantt"
},
{
    name: "Chughtai Lab Wah Branch",
    lat: 33.78123456789012,
    lng: 72.76789012345678,
    contact: "051-4557890",
    info: "Branch of Chughtai Lab network with international standards",
    services: ["Blood Tests", "Molecular Testing", "Histopathology", "Microbiology"],
    timings: "7:00 AM - 11:00 PM",
    address: "Mall Road, Wah Cantt"
},
{
    name: "Wah Medical Center Laboratory",
    lat: 33.75890123456789,
    lng: 72.77901234567890,
    contact: "051-4526677",
    info: "Complete diagnostic center with home sampling",
    services: ["Clinical Pathology", "Radiology", "ECG", "Ultrasound"],
    timings: "8:00 AM - 10:00 PM",
    address: "Saddar Road, Wah Cantt"
},
{
    name: "Al-Shifa Diagnostic Complex",
    lat: 33.77234567890123,
    lng: 72.78012345678901,
    contact: "051-4538899",
    info: "Modern diagnostic facility with latest equipment",
    services: ["CT Scan", "MRI", "X-Ray", "Laboratory Tests"],
    timings: "24/7",
    address: "Near Wah General Hospital, Wah Cantt"
},
{
    name: "Fauji Foundation Laboratory",
    lat: 33.76012345678901,
    lng: 72.77123456789012,
    contact: "051-4511122",
    info: "Hospital laboratory serving military personnel and civilians",
    services: ["Blood Tests", "Urine Tests", "Biochemistry", "Serology"],
    timings: "8:00 AM - 9:00 PM",
    address: "Fauji Foundation Hospital, Wah Cantt"
},
{
    name: "Wah International Laboratory",
    lat: 33.75123456789012,
    lng: 72.76234567890123,
    contact: "051-4533344",
    info: "International standard testing facility",
    services: ["Molecular Biology", "Genetic Testing", "Specialized Tests"],
    timings: "24/7",
    address: "Block B, Commercial Area, Wah Cantt"
},
{
    name: "Care Laboratory & Diagnostic Center",
    lat: 33.77901234567890,
    lng: 72.75345678901234,
    contact: "051-4566677",
    info: "Complete care diagnostic facility with home services",
    services: ["Blood Tests", "X-Ray", "ECG", "Ultrasound"],
    timings: "8:00 AM - 11:00 PM",
    address: "Near Police Station, Wah Cantt"
},
{
    name: "Prime Care Diagnostic Center",
    lat: 33.76567890123456,
    lng: 72.78123456789012,
    contact: "051-4544433",
    info: "Premium diagnostic services with quick reporting",
    services: ["Pathology", "Radiology", "Cardiac Tests", "Ultrasound"],
    timings: "24/7",
    address: "Main Market, Lala Rukh, Wah Cantt"
}
,
    {
        name: "City Medical Lab",
        lat: 33.74123456789012,
        lng: 72.76789012345678,
        contact: "051-665-5577",
        info: "Affordable and reliable diagnostic services",
        services: ["Basic Lab Tests", "X-Ray", "Ultrasound"],
        timings: "8:00 AM - 10:00 PM",
        address: "Near Barrier 4, Wah Cantt"
    },
    {
        name: "Shifa Medical Laboratory",
        lat: 33.77234567123456,
        lng: 72.76345678234567,
        contact: "051-4577890",
        info: "State-of-the-art diagnostic center with digital reporting system",
        services: ["Molecular Testing", "Hormone Analysis", "Drug Testing", "Allergy Tests"],
        timings: "24/7",
        address: "Plaza Road, Near UBL Bank, Wah Cantt"
    },
    {
        name: "Medix Diagnostic Center",
        lat: 33.75678912345678,
        lng: 72.77456789123456,
        contact: "051-4533221",
        info: "Modern lab with automated testing equipment",
        services: ["Blood Banking", "Microbiology", "Clinical Chemistry", "Immunology"],
        timings: "8:00 AM - 11:00 PM",
        address: "Main Market, Block C, Wah Cantt"
    },
    {
        name: "LifeCare Laboratory",
        lat: 33.76789123456789,
        lng: 72.75567891234567,
        contact: "051-4566789",
        info: "Specialized in genetic testing and molecular diagnostics",
        services: ["Genetic Testing", "Cancer Markers", "Prenatal Testing", "PCR Tests"],
        timings: "24/7",
        address: "Near Wah Medical College, Wah Cantt"
    },
    {
        name: "Doctors Laboratory & Diagnostic",
        lat: 33.78012345678912,
        lng: 72.76678912345678,
        contact: "051-4544567",
        info: "Complete diagnostic solution with home sampling",
        services: ["Clinical Pathology", "Radiology", "Ultrasound", "ECG"],
        timings: "7:00 AM - 10:00 PM",
        address: "Kashmir Road, Near PSO Pump, Wah Cantt"
    },
    {
        name: "Smart Lab Diagnostics",
        lat: 33.75345678912345,
        lng: 72.77789123456789,
        contact: "051-4588999",
        info: "Digital lab with online report delivery system",
        services: ["Blood Tests", "COVID Testing", "Hormone Tests", "Liver Function Tests"],
        timings: "24/7",
        address: "Commercial Area, Block B, Wah Cantt"
    },
    
    {
        name: "Advanced Diagnostic Center",
        lat: 33.77123456789012,
        lng: 72.77890123456789,
        contact: "051-908-7654",
        info: "State-of-the-art diagnostic facility with expert staff",
        services: ["MRI", "CT Scan", "Ultrasound", "X-Ray", "Laboratory Tests"],
        timings: "24/7",
        address: "Main Market, Wah Cantt"
    }
];

// Cache DOM elements
const DOM = {
    map: null,
    searchInput: null,
    labList: null,
    recentSearches: null,
    labFinderContainer: null
};

// Global state
let state = {
    searchMarker: null,
    recentSearches: [],
    map: null,
    markers: [],
    currentFilters: {
        service: '',
        timing: '',
        distance: 5,
        rating:''
        
    }
};

const IconFactory = {
    createIcon(color) {
        return L.icon({
            iconUrl: `https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-${color}.png`,
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    },
    get labIcon() {
        return this.createIcon('red');
    },
    get searchIcon() {
        return this.createIcon('blue');
    },
    get userIcon() {
        return this.createIcon('green');
    }
};




// Map Initialization
function initializeMap() {
    state.map = L.map('map', {
        center: CONFIG.DEFAULT_CENTER,
        zoom: CONFIG.DEFAULT_ZOOM,
        minZoom: CONFIG.MIN_ZOOM,
        maxZoom: CONFIG.MAX_ZOOM
    });

    L.tileLayer(CONFIG.TILE_LAYER, {
        attribution: CONFIG.ATTRIBUTION,
        maxZoom: CONFIG.MAX_ZOOM
    }).addTo(state.map);

    initializeLabMarkers();
}

// Lab Markers
function initializeLabMarkers() {
    state.markers = labs.map(lab => {
        const marker = L.marker([lab.lat, lab.lng], { 
            icon: IconFactory.labIcon
        })
        .addTo(state.map);
        
        // Create popup with a wrapper div to handle events
        const popupContent = document.createElement('div');
        popupContent.innerHTML = createLabPopupContent(lab);
        
        // Add popup
        const popup = L.popup({
            maxWidth: 300
        }).setContent(popupContent);
        
        marker.bindPopup(popup);
        
        // Add click handler after popup is opened
        marker.on('popupopen', () => {
            // Initialize tabs
            const tabBtns = popupContent.querySelectorAll('.tab-btn');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove active class from all buttons and panes
                    popupContent.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    popupContent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                    
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    // Show corresponding tab
                    const tabId = this.getAttribute('data-tab');
                    popupContent.querySelector('#' + tabId).classList.add('active');
                });
            });
            
            // Enable book appointment button
            const bookBtn = popupContent.querySelector('#book-appointment-btn');
            if (bookBtn) {
                bookBtn.onclick = () => createAppointmentModal(lab);
            }
        });
        
        return { lab, marker };
    });
}

function addUserMarker(userLocation) {
    const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: IconFactory.userIcon,
        zIndexOffset: 1000
    })
    .addTo(state.map)
    .bindPopup('Your Location 📍 from nearby lab');
    
    return userMarker;
}


// 1. Add this function to create the appointment modal HTML
window.createAppointmentModal = function(lab) {
    // Remove any existing modal first
    const existingModal = document.getElementById('appointment-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'appointment-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content appointment-modal">
            <span class="close">&times;</span>
            <h2>Book Appointment at ${lab.name}</h2>
            <form id="appointment-form" class="appointment-form">
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" id="name" name="name" required placeholder="Enter your full name">
                </div>
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" required placeholder="Enter your phone number">
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label for="service">Select Service</label>
                    <select id="service" name="service" required>
                        <option value="">Choose a service</option>
                        ${lab.services.map(service => `<option value="${service}">${service}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="date">Preferred Date</label>
                    <input type="date" id="date" name="date" required min="${new Date().toISOString().split('T')[0]}">
                </div>
                <div class="form-group">
                    <label for="time">Preferred Time</label>
                    <select id="time" name="time" required>
                        <option value="">Select time slot</option>
                        ${generateTimeSlots()}
                    </select>
                </div>
                <div class="form-group">
                    <label for="notes">Additional Notes</label>
                    <textarea id="notes" name="notes" placeholder="Any specific requirements or medical conditions..."></textarea>
                </div>
                <button type="submit" class="submit-btn">Book Appointment</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    
    // Show modal with animation
    requestAnimationFrame(() => {
        modal.style.display = 'flex';
        modal.classList.add('show');
    });

    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.remove();
        }, 300);
    };

    window.onclick = (event) => {
        if (event.target === modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.remove();
            }, 300);
        }
    };

    const form = modal.querySelector('#appointment-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = {
            labName: lab.name,
            labContact: lab.contact,
            name: form.name.value,
            phone: form.phone.value,
            email: form.email.value,
            service: form.service.value,
            date: form.date.value,
            time: form.time.value,
            notes: form.notes.value,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments.push(formData);
        localStorage.setItem('appointments', JSON.stringify(appointments));

        // Show success message with appointment details
        const successMessage = `
            Appointment booked successfully!
            
            Details:
            Lab: ${formData.labName}
            Date: ${formatDate(formData.date)}
            Time: ${formData.time}
            Service: ${formData.service}
            
            We'll send a confirmation to ${formData.email}
            Lab will contact you at ${formData.phone}
        `;

        showAlert(successMessage);
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.remove();
        }, 300);
    };
};

// Helper function to generate time slots
function generateTimeSlots() {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
        const time24 = `${hour.toString().padStart(2, '0')}:00`;
        const time12 = convertTo12Hour(time24);
        slots.push(`<option value="${time24}">${time12}</option>`);
        
        const time24Half = `${hour.toString().padStart(2, '0')}:30`;
        const time12Half = convertTo12Hour(time24Half);
        slots.push(`<option value="${time24Half}">${time12Half}</option>`);
    }
    return slots.join('');
}

// Helper function to convert 24h to 12h format
function convertTo12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
}

// Helper function to format date
function formatDate(dateStr) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
}

// Format review date to a friendly format
function formatReviewDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }
}

// Enhanced alert function
function showAlert(message, type = 'success') {
    // Remove any existing alerts
    const existingAlerts = document.querySelectorAll('.notification');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert element
    const alertElement = document.createElement('div');
    alertElement.className = `notification ${type}`;
    alertElement.textContent = message;
    
    // Add to document
    document.body.appendChild(alertElement);
    
    // Make visible after a small delay (for animation)
    setTimeout(() => {
        alertElement.classList.add('visible');
    }, 10);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('visible');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            alertElement.remove();
        }, 300);
    }, 5000);
}

// 2. Update the createLabPopupContent function to properly stringify the lab object
function createLabPopupContent(lab) {
    // Get the average rating for this lab
    const avgRating = getAverageRating(lab.name) || 0;
    const reviews = getLabReviews(lab.name) || [];
    const reviewCount = ratingsDB.ratings[lab.name] ? ratingsDB.ratings[lab.name].length : 0;
    
    return `
        <div class="lab-popup">
            <h3 class="lab-name">${lab.name}</h3>
            <div class="lab-info">
                <p><i class="fas fa-info-circle"></i> ${lab.info}</p>
                <p><i class="fas fa-phone"></i> ${lab.contact}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${lab.address}</p>
                <p><i class="fas fa-clock"></i> ${lab.timings}</p>
            </div>
            <div class="popup-buttons">
                <button class="map-btn" onclick="getDirections(${lab.lat}, ${lab.lng})">Get Directions</button>
                <button class="map-btn" id="book-appointment-btn">Book Appointment</button>
            </div>
            <div class="rating-container">
                <div class="current-rating">
                    <div class="stars">${createStarRating(avgRating)}</div>
                    <span>${avgRating.toFixed(1)} / 5</span>
                    <span class="review-count">(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})</span>
                </div>
                <div class="rating-tabs">
                    <div class="tab-buttons">
                        <button class="tab-btn active" data-tab="rate-tab">Rate</button>
                        <button class="tab-btn" data-tab="reviews-tab">Read Reviews</button>
                    </div>
                    <div class="tab-content">
                        <div id="rate-tab" class="tab-pane active">
                            <div class="review-form">
                                <select id="rating-${lab.name}" class="rating-input">
                                    <option value="">Select rating</option>
                                    <option value="5">5 stars - Excellent</option>
                                    <option value="4">4 stars - Very Good</option>
                                    <option value="3">3 stars - Good</option>
                                    <option value="2">2 stars - Fair</option>
                                    <option value="1">1 star - Poor</option>
                                </select>
                                <textarea id="review-${lab.name}" class="review-input" placeholder="Write your review here (optional)"></textarea>
                                <button class="review-submit" onclick="submitReview('${lab.name}')">Submit Review</button>
                            </div>
                        </div>
                        <div id="reviews-tab" class="tab-pane">
                            <div class="reviews-list">
                                ${reviews.length > 0 ? 
                                    reviews.map(r => `
                                        <div class="review-item">
                                            <div class="review-stars">${createStarRating(r.rating)}</div>
                                            <div class="review-text">${r.review || 'No comment'}</div>
                                            <small>${formatReviewDate(r.date)}</small>
                                        </div>
                                    `).join('') : 
                                    '<p class="no-reviews">No reviews yet. Be the first to review!</p>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function createStarRating(rating) {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
}

function submitReview(labName) {
    const ratingSelect = document.getElementById(`rating-${labName}`);
    const reviewText = document.getElementById(`review-${labName}`);
    
    if (!ratingSelect || !ratingSelect.value) {
        showAlert('Please select a rating', 'error');
        return;
    }
    
    const rating = parseInt(ratingSelect.value);
    const review = reviewText ? reviewText.value : '';
    
    // Add the rating and review
    addRating(labName, rating, review);
    
    // Find and update the marker popup
    const marker = state.markers.find(m => m.lab.name === labName);
    if (marker) {
        marker.marker.getPopup().setContent(createLabPopupContent(marker.lab));
    }
    
    // Show success message
    showAlert('Thank you for your review!', 'success');
    
    // Update any lab list items that show this lab
    updateLabFinderList(labName, getAverageRating(labName));
}

// Function to update lab popup when ratings change
function updateLabPopup(labName) {
    // Find the marker for this lab
    const marker = state.markers.find(m => m.lab.name === labName);
    if (marker) {
        // Update popup content
        marker.marker.getPopup().setContent(createLabPopupContent(marker.lab));
    }
    
    // Update lab list if it's visible
    updateLabFinderList(labName, getAverageRating(labName));
}

// Add rating filter to your existing filter system
function addRatingFilter() {
    const filterContainer = document.querySelector('.lab-finder-filters');
    if (!filterContainer) return;
    
    const ratingFilter = document.createElement('select');
    ratingFilter.className = 'rating-filter';
    ratingFilter.innerHTML = `
        <option value="">All Ratings</option>
        <option value="4">4+ Stars</option>
        <option value="3">3+ Stars</option>
        <option value="2">2+ Stars</option>
    `;
    
    filterContainer.appendChild(ratingFilter);
    
    ratingFilter.addEventListener('change', () => {
        state.currentFilters.rating = ratingFilter.value;
        updateFilteredLabs();
    });
}


// Search Functionality
async function searchLabs() {
    const searchInput = DOM.searchInput.value.trim();
    
    if (!searchInput) {
        showAlert('Please enter a location');
        return;
    }

    try {
        const location = await fetchLocation(searchInput);
        if (!location) {
            showAlert('Location not found. Please try a different search term.');
            return;
        }

        updateMapForSearch(location, searchInput);
        const nearbyLabs = nearbyLabs(location.lat, location.lon);
        updateLabList(nearbyLabs);
        addToRecentSearches(searchInput);
    } catch (error) {
        console.error('Search error:', error);
        showAlert('press OK ad we"ll take you there');
    }
}

async function fetchLocation(searchQuery) {
    const encodedQuery = encodeURIComponent(searchQuery);
    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedQuery}&limit=1&addressdetails=1`
    );

    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
}

function updateMapForSearch(location, searchInput) {
    const { lat, lon, display_name } = location;

    if (state.searchMarker) {
        state.map.removeLayer(state.searchMarker);
    }

    const searchIcon = IconFactory.searchIcon || L.Marker.prototype.options.icon;
    
    state.searchMarker = L.marker([lat, lon], { 
        icon: searchIcon,
        zIndexOffset: 500 
    })
    .addTo(state.map)
    .bindPopup(createLabPopupContent(searchInput, display_name))
    .openPopup();

    state.map.setView([lat, lon], 15);
}


function createLabFinderUI() {
    const container = document.createElement('div');
    container.className = 'lab-finder-overlay';
    container.innerHTML = `
        <div class="lab-finder-container">
            <div class="lab-finder-header">
                <h2>Find Nearby Labs</h2>
                <button id="close-lab-finder" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="lab-finder-filters">
                <select id="service-filter" class="filter-select">
                    <option value="">All Services</option>
                    ${getUniqueServices().map(service => 
                        `<option value="${service}">${service}</option>`
                    ).join('')}
                </select>
                <select id="rating-filter" class="filter-select">
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Star</option>
                </select>
                <select id="timing-filter" class="filter-select">
                    <option value="">All Timings</option>
                    <option value="24/7">24/7</option>
                    <option value="day">Day Time Only</option>
                </select>
             <div class="range-filter">
    <label>Distance Range:</label>
    <select id="distance-range-type" class="filter-select">
        <option value="nearby">Nearby (up to 20km)</option>
        <option value="extended">Extended (up to 100km)</option>
    </select>
    <div class="range-slider">
        <label>Max Distance: <span id="distance-value">5</span> km</label>
        <input type="range" id="distance-filter" 
               min="1" 
               max="20" 
               value="5" 
               class="range-input">
    </div>
</div>
   
            </div>
            <div id="filtered-lab-list" class="lab-list"></div>
        </div>
    `;
    return container;
}

// Filter Functionality
function initializeFilters() {
    const filters = {
        service: document.getElementById('service-filter'),
        timing: document.getElementById('timing-filter'),
        distance: document.getElementById('distance-filter')
    };

    Object.entries(filters).forEach(([key, element]) => {
        if (element) {
            element.addEventListener('change', () => {
                state.currentFilters[key] = element.value;
                if (key === 'distance') {
                    document.getElementById('distance-value').textContent = element.value;
                }
                updateFilteredLabs();
            });
        }
    });
    initializeDistanceRangeFilter();
}

function updateFilteredLabs() {
    getUserLocation()
        .then(userLocation => {
            const filteredLabs = filterLabs(userLocation);
            displayFilteredLabs(filteredLabs);
        })
        .catch(error => {
            // Fallback to map center if geolocation fails
            const mapCenter = state.map.getCenter();
            const filteredLabs = filterLabs({
                lat: mapCenter.lat,
                lng: mapCenter.lng
            });
            displayFilteredLabs(filteredLabs);
        });
}

function filterLabs(userLocation) {
    return labs.filter(lab => {
        const distance = getDistance(
            userLocation.lat, 
            userLocation.lng, 
            lab.lat, 
            lab.lng
        );
        
        const labRating = getAverageRating(lab.name);
        const meetsRatingCriteria = !state.currentFilters.rating || 
            labRating >= parseFloat(state.currentFilters.rating);
        
        return (
            (!state.currentFilters.service || lab.services.includes(state.currentFilters.service)) &&
            (!state.currentFilters.timing || matchesTiming(lab.timings, state.currentFilters.timing)) &&
            (distance <= parseFloat(state.currentFilters.distance)) &&
            meetsRatingCriteria
        );
    }).map(lab => ({
        ...lab,
        distance: getDistance(userLocation.lat, userLocation.lng, lab.lat, lab.lng),
        rating: getAverageRating(lab.name)
    })).sort((a, b) => a.distance - b.distance);
}
// Add this to your existing filter options in createLabFinderUI function
function createLabFinderUI() {
    const container = document.createElement('div');
    container.className = 'lab-finder-overlay';
    container.innerHTML = `
        <div class="lab-finder-container">
            <div class="lab-finder-header">
                <h2>Find Nearby Labs</h2>
                <button id="close-lab-finder" class="close-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="lab-finder-filters">
                <select id="service-filter" class="filter-select">
                    <option value="">All Services</option>
                    ${getUniqueServices().map(service => 
                        `<option value="${service}">${service}</option>`
                    ).join('')}
                </select>
                <select id="rating-filter" class="filter-select">
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="1">1+ Star</option>
                </select>
                <select id="timing-filter" class="filter-select">
                    <option value="">All Timings</option>
                    <option value="24/7">24/7</option>
                    <option value="day">Day Time Only</option>
                </select>
                <div class="range-filter">
                    <label>Distance Range:</label>
                    <select id="distance-range-type" class="filter-select">
                        <option value="nearby">Nearby (up to 20km)</option>
                        <option value="extended">Extended (up to 100km)</option>
                    </select>
                    <div class="range-slider">
                        <label>Max Distance: <span id="distance-value">5</span> km</label>
                        <input type="range" id="distance-filter" 
                               min="1" 
                               max="20" 
                               value="5" 
                               class="range-input">
                    </div>
                </div>
            </div>
            <div id="filtered-lab-list" class="lab-list"></div>
        </div>
    `;
    return container;
}

function initializeDistanceRangeFilter() {
    const rangeTypeSelect = document.getElementById('distance-range-type');
    const distanceSlider = document.getElementById('distance-filter');
    const distanceValue = document.getElementById('distance-value');

    if (rangeTypeSelect && distanceSlider) {
        rangeTypeSelect.addEventListener('change', function() {
            const isExtended = this.value === 'extended';
            distanceSlider.max = isExtended ? '100' : '20';
            
            // Adjust current value if needed
            if (isExtended && distanceSlider.value > 20) {
                distanceSlider.value = 20;
            }
            distanceValue.textContent = distanceSlider.value;
            
            // Trigger filter update
            state.currentFilters.distance = parseFloat(distanceSlider.value);
            updateFilteredLabs();
        });
    }
}

// Update your state to include rating filter
state.currentFilters.rating = '';

// Modify your filterLabs function to include rating filtering
function filterLabs(userLocation) {
    return labs.filter(lab => {
        const distance = getDistance(
            userLocation.lat, 
            userLocation.lng, 
            lab.lat, 
            lab.lng
        );
        
        const labRating = getAverageRating(lab.name);
        const meetsRatingCriteria = !state.currentFilters.rating || 
            labRating >= parseFloat(state.currentFilters.rating);
        
        return (
            (!state.currentFilters.service || lab.services.includes(state.currentFilters.service)) &&
            (!state.currentFilters.timing || matchesTiming(lab.timings, state.currentFilters.timing)) &&
            (distance <= parseFloat(state.currentFilters.distance)) &&
            meetsRatingCriteria
        );
    }).map(lab => ({
        ...lab,
        distance: getDistance(userLocation.lat, userLocation.lng, lab.lat, lab.lng),
        rating: getAverageRating(lab.name)
    })).sort((a, b) => a.distance - b.distance);
}

// Update the display of filtered labs to show ratings
function displayFilteredLabs(filteredLabs) {
    const labListElement = document.getElementById('filtered-lab-list');
    if (!labListElement) return;

    labListElement.innerHTML = filteredLabs.length ? 
        filteredLabs.map(lab => {
            // Get the rating - either from the filtered lab object or from the ratings DB
            const avgRating = lab.rating || getAverageRating(lab.name) || 0;
            const reviewCount = ratingsDB.ratings[lab.name] ? ratingsDB.ratings[lab.name].length : 0;
            
            return `
            <div class="lab-item" data-name="${lab.name}">
                <div class="lab-header">
                    <h3>${lab.name}</h3>
                    <span class="distance">${lab.distance.toFixed(1)} km</span>
                </div>
                <div class="lab-info">
                    <p><i class="fas fa-info-circle"></i> ${lab.info}</p>
                    <p><i class="fas fa-phone"></i> ${lab.contact}</p>
                    <p><i class="fas fa-map-marker-alt"></i> ${lab.address}</p>
                    <p><i class="fas fa-clock"></i> ${lab.timings}</p>
                </div>
                <div class="rating-summary">
                    <div class="stars">${createStarRating(avgRating)}</div>
                    <p class="lab-rating">
                        ${avgRating.toFixed(1)} out of 5
                        <span class="review-count">(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})</span>
                    </p>
                </div>
                <div class="lab-actions">
                    <button class="map-btn directions-btn" data-lat="${lab.lat}" data-lng="${lab.lng}">
                        Get Directions
                    </button>
                    <button class="map-btn appointment-btn" data-lab='${JSON.stringify(lab)}'>
                        Book Appointment
                    </button>
                </div>
            </div>
        `}).join('') :
        '<div class="no-results">No labs found matching your criteria</div>';

    // Add event listeners after creating the elements
    const directionBtns = labListElement.querySelectorAll('.directions-btn');
    const appointmentBtns = labListElement.querySelectorAll('.appointment-btn');

    directionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lat = parseFloat(btn.dataset.lat);
            const lng = parseFloat(btn.dataset.lng);
            getDirections(lat, lng);
        });
    });

    appointmentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lab = JSON.parse(btn.dataset.lab);
            createAppointmentModal(lab);
        });
    });
}






// Recent Searches
function addToRecentSearches(searchInput) {
    state.recentSearches = state.recentSearches.filter(search => search !== searchInput);
    state.recentSearches.unshift(searchInput);
    
    if (state.recentSearches.length > CONFIG.MAX_RECENT_SEARCHES) {
        state.recentSearches.pop();
    }
    
    localStorage.setItem('recentSearches', JSON.stringify(state.recentSearches));
    updateRecentSearchesUI();
}

function updateRecentSearchesUI() {
    if (!DOM.recentSearches) return;

    DOM.recentSearches.innerHTML = state.recentSearches
        .map(search => `
            <div class="recent-search-item p-2 hover:bg-gray-100 cursor-pointer" 
                onclick="document.getElementById('search').value='${search}'; searchLabs();">
                ${search}
            </div>
        `)
        .join('');
}

// Screenshot Functionality
async function takeScreenshot() {
    const loadingIndicator = showLoadingIndicator();
    const controls = document.querySelectorAll('.leaflet-control');
    hideElements(controls);

    try {
        const canvas = await html2canvas(DOM.map, {
            useCORS: true,
            allowTaint: true,
            logging: true,
            windowWidth: DOM.map.scrollWidth,
            windowHeight: DOM.map.scrollHeight
        });

        const screenshot = canvas.toDataURL('image/png');
        saveImage(screenshot);
    } catch (error) {
        console.error('Screenshot error:', error);
        showAlert('Failed to take screenshot. Please try again.');
    } finally {
        showElements(controls);
        removeLoadingIndicator(loadingIndicator);
    }
}

// Utility Functions
function getUniqueServices() {
    const services = new Set();
    labs.forEach(lab => {
        lab.services.forEach(service => services.add(service));
    });
    return Array.from(services);
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees) {
    return degrees * (Math.PI / 180);
}

function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = 'Loading...';
    loadingDiv.className = 'loading-indicator';
    document.body.appendChild(loadingDiv);
    return loadingDiv;
}

function hideElements(elements) {
    elements.forEach(element => element.style.display = 'none');
}

function showElements(elements) {
    elements.forEach(element => element.style.display = '');
}

function removeLoadingIndicator(indicator) {
    if (document.body.contains(indicator)) {
        document.body.removeChild(indicator);
    }
}

function saveImage(dataUrl) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `map-screenshot-${new Date().toISOString()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Geolocation
// Get user's live location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        };

        // Try HTML5 geolocation
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                // Fallback for Edge browser
                if (error.code === error.PERMISSION_DENIED) {
                    fetch('https://ipapi.co/json/')
                        .then(response => response.json())
                        .then(data => {
                            resolve({
                                lat: parseFloat(data.latitude),
                                lng: parseFloat(data.longitude)
                            });
                        })
                        .catch(() => reject('Location services unavailable'));
                } else {
                    reject('Location services unavailable');
                }
            },
            options
        );
    });
}



// Filter labs based on distance from user
function filterLabsByDistance(userLocation, maxDistance = 5) {
    return labs.map(lab => {
        const distance = getDistance(
            userLocation.lat,
            userLocation.lng,
            lab.lat,
            lab.lng
        );
        return { ...lab, distance };
    })
    .filter(lab => lab.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);
}

// Update lab list UI with distance info
function updateLabList(filteredLabs) {
    // Only update lab list if lab finder is active
    const labListElement = document.getElementById('filtered-lab-list');
    if (!labListElement) return;
    
    labListElement.innerHTML = filteredLabs.map(lab => {
        // Get the average rating for this lab
        const avgRating = getAverageRating(lab.name) || 0;
        const reviewCount = ratingsDB.ratings[lab.name] ? ratingsDB.ratings[lab.name].length : 0;
        
        return `
        <div class="lab-item" data-name="${lab.name}">
            <h3>${lab.name}</h3>
            <p>Distance: ${lab.distance.toFixed(1)} km</p>
            <p>Timings: ${lab.timings}</p>
            <div class="rating-summary">
                <div class="stars">${createStarRating(avgRating)}</div>
                <p class="lab-rating">
                    ${avgRating.toFixed(1)} out of 5
                    <span class="review-count">(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})</span>
                </p>
            </div>
            <div class="lab-actions">
                <button onclick="showOnMap(${lab.lat}, ${lab.lng})" 
                    class="btn-primary">See on Map</button>
                <button onclick="getDirections(${lab.lat}, ${lab.lng})" 
                    class="btn-secondary">Get Directions</button>
            </div>
        </div>
    `}).join('');
}



// Get directions using Google Maps
function getDirections(destLat, destLng) {
    getUserLocation().then(userLocation => {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}`;
        window.open(url, '_blank');
    });
}

// Center map on specific lab
function showOnMap(lat, lng) {
    state.map.setView([lat, lng], 16);
    const marker = state.markers.find(m => 
        m.lab.lat === lat && m.lab.lng === lng
    );
    if (marker) {
        marker.marker.openPopup();
    }
}


// Event Listeners and Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Add loader first
    const loaderHTML = `
    <div class="app-loader">
        <div class="logo-container">
            <h1 class="app-logo">MediMap</h1>
            <i class="fas fa-mobile-alt mobile-icon"></i>
        </div>
        <div class="ambulance-container">
            <img src="/ambulance-loader.svg" alt="Loading..." class="ambulance-loader">
        </div>
        <p id="robotText" class="loading-text"></p>
    </div>
    `;
    
    

    
    document.body.insertAdjacentHTML('beforeend', loaderHTML);
    
    const loader = document.querySelector('.app-loader');
    const robotText = document.getElementById('robotText');
    const loadingMessages = [
        "Initializing MediMap...",
        "loading the MAP database...",
        "Almost Ready..."
        
    ];
    

    let messageIndex = 0;

    // Show messages sequentially
    function showMessages() {
        if (messageIndex < loadingMessages.length) {
            robotText.textContent = loadingMessages[messageIndex];
            messageIndex++;
            setTimeout(showMessages, 1500);
        }else {
            // Only start fade out after all messages are shown
            loader.style.transition = 'opacity 0.8s';
            loader.style.opacity = '0';
            
            setTimeout(() => {
                loader.remove();
                
                // Cache DOM elements
                DOM.map = document.getElementById('map');
                DOM.searchInput = document.getElementById('search');
                DOM.labList = document.getElementById('labList');
                DOM.recentSearches = document.getElementById('recentSearches');

                // Load saved data
                state.recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');

                // Initialize features
                initializeRatings();
                addRatingFilter();
                initializeMap();
                
                getUserLocation()
                    .then(userLocation => {
                        const nearbyLabs = filterLabsByDistance(userLocation);
                        updateLabList(nearbyLabs);
                        
                        L.marker([userLocation.lat, userLocation.lng], {
                            icon: IconFactory.createIcon('green')
                        })
                        .addTo(state.map)
                        .bindPopup('Your Location 📍 from nearby lab');
                        
                        state.map.setView([userLocation.lat, userLocation.lng], 13);
                    })
                    .catch(error => {
                        console.error('Location error:', error);
                        state.map.setView(CONFIG.DEFAULT_CENTER, CONFIG.DEFAULT_ZOOM);
                        const nearbyLabs = filterLabsByDistance(CONFIG.DEFAULT_CENTER);
                        updateLabList(nearbyLabs);
                        showAlert('Unable to get your location. Please enable location services.');
                    });

                if (DOM.searchInput) {
                    DOM.searchInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') searchLabs();
                    });
                }

                // Screenshot functionality
                const screenshotButton = document.querySelector('.action-button:has(i.fa-camera)');
                if (screenshotButton) {
                    screenshotButton.addEventListener('click', takeScreenshot);
                }

                // Lab finder initialization
                const labFinderButton = document.querySelector('[data-action="lab-finder"]');
                if (labFinderButton) {
                    labFinderButton.addEventListener('click', () => {
                        const labFinderUI = createLabFinderUI();
                        document.body.appendChild(labFinderUI);
                        
                        setTimeout(() => {
                            labFinderUI.classList.add('active');
                        }, 10);
                        
                        initializeFilters();
                        updateFilteredLabs();
                        
                        document.getElementById('close-lab-finder').addEventListener('click', () => {
                            labFinderUI.classList.remove('active');
                            setTimeout(() => {
                                document.body.removeChild(labFinderUI);
                            }, 300);
                        });
                    });
                }

                // Update UI
                updateRecentSearchesUI();
            }, 1000);
        }
    }

    // Start showing messages
    showMessages();
});

// Remove the appointment button from the bottom navigation
document.addEventListener('DOMContentLoaded', () => {
    const appointmentNavBtn = document.getElementById('appointment-nav-btn');
    if (appointmentNavBtn) {
        appointmentNavBtn.remove();
    }
});

// Add admin route handler
window.addEventListener('DOMContentLoaded', () => {
    // Check if this is the admin route
    const adminHash = '#admin';
    const adminKey = 'lab_finder_admin';
    
    if (window.location.hash === adminHash) {
        // Simple password protection
        const password = prompt('Enter admin password:');
        if (password === 'admin123') { // You should change this password
            localStorage.setItem(adminKey, 'true');
            showAdminPanel();
        } else {
            alert('Invalid password');
            window.location.hash = '';
        }
    }
});

// Admin panel function
function showAdminPanel() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    // Create admin panel container
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel';
    adminPanel.innerHTML = `
        <div class="admin-header">
            <h2>Admin Panel - Appointments</h2>
            <button onclick="window.location.hash = ''" class="close-admin">×</button>
        </div>
        <div class="appointments-list">
            ${appointments.map((apt, index) => `
                <div class="appointment-item ${apt.status}">
                    <div class="appointment-header">
                        <h3>Appointment #${index + 1}</h3>
                        <span class="status ${apt.status}">${apt.status}</span>
                    </div>
                    <div class="appointment-details">
                        <p><strong>Lab:</strong> ${apt.labName}</p>
                        <p><strong>Patient:</strong> ${apt.name}</p>
                        <p><strong>Date:</strong> ${formatDate(apt.date)}</p>
                        <p><strong>Time:</strong> ${apt.time}</p>
                        <p><strong>Service:</strong> ${apt.service}</p>
                        <p><strong>Contact:</strong> ${apt.phone}</p>
                        <p><strong>Email:</strong> ${apt.email}</p>
                        ${apt.notes ? `<p><strong>Notes:</strong> ${apt.notes}</p>` : ''}
                    </div>
                    <div class="appointment-actions">
                        ${apt.status === 'pending' ? `
                            <button onclick="updateAppointment(${index}, 'approved')" class="approve-btn">
                                Approve
                            </button>
                            <button onclick="updateAppointment(${index}, 'rejected')" class="reject-btn">
                                Reject
                            </button>
                        ` : ''}
                    </div>
                </div>
            `).join('') || '<p class="no-appointments">No appointments found</p>'}
        </div>
    `;
    
    document.body.appendChild(adminPanel);
}

// Function to update appointment status
window.updateAppointment = function(index, status) {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    if (appointments[index]) {
        appointments[index].status = status;
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Refresh admin panel
        document.querySelector('.admin-panel').remove();
        showAdminPanel();
        
        showAlert(`Appointment ${status} successfully!`);
    }
};

// Initialize ratings when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (typeof initializeRatings === 'function') {
        initializeRatings();
    }
});


