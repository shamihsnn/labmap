// Rating system state
const ratingsDB = {
    ratings: {},
    reviews: {}
};

// Initialize ratings from localStorage
function initializeRatings() {
    const savedRatings = localStorage.getItem('labRatings');
    const savedReviews = localStorage.getItem('labReviews');
    if (savedRatings) ratingsDB.ratings = JSON.parse(savedRatings);
    if (savedReviews) ratingsDB.reviews = JSON.parse(savedReviews);
}

// Save ratings to localStorage
function saveRatings() {
    localStorage.setItem('labRatings', JSON.stringify(ratingsDB.ratings));
    localStorage.setItem('labReviews', JSON.stringify(ratingsDB.reviews));
}

// Add or update a rating
function addRating(labName, rating, review = '') {
    if (!ratingsDB.ratings[labName]) {
        ratingsDB.ratings[labName] = [];
    }
    ratingsDB.ratings[labName].push(rating);
    
    if (review) {
        if (!ratingsDB.reviews[labName]) {
            ratingsDB.reviews[labName] = [];
        }
        ratingsDB.reviews[labName].push({
            rating,
            review,
            date: new Date().toISOString()
        });
    }
    
    saveRatings();
    updateLabPopup(labName);
}

// Get average rating for a lab
function getAverageRating(labName) {
    const ratings = ratingsDB.ratings[labName];
    if (!ratings || !ratings.length) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

// Get all reviews for a lab
function getLabReviews(labName) {
    return ratingsDB.reviews[labName] || [];
}

function submitReview(labName) {
    const ratingSelect = document.getElementById(`rating-${labName}`);
    const reviewText = document.getElementById(`review-${labName}`);
    
    if (!ratingSelect || !ratingSelect.value) {
        alert('Please select a rating');
        return;
    }
    
    const rating = parseInt(ratingSelect.value);
    const review = reviewText ? reviewText.value : '';
    
    addRating(labName, rating, review);
    
    // Find and update the marker popup
    const marker = state.markers.find(m => m.lab.name === labName);
    if (marker) {
        marker.marker.getPopup().setContent(createLabPopupContent(marker.lab));
    }
    
    // Show success message
    alert('Thank you for your review!');
}

// Update the lab list item with new rating
function updateLabFinderList(labName, rating) {
    const reviewCount = ratingsDB.ratings[labName] ? ratingsDB.ratings[labName].length : 0;
    
    // Update any filtered lab list items
    const labListElement = document.getElementById('filtered-lab-list');
    if (labListElement) {
        const labItems = labListElement.querySelectorAll('.lab-item');
        labItems.forEach(item => {
            const itemName = item.querySelector('h3')?.textContent;
            if (itemName === labName) {
                const starsElement = item.querySelector('.stars');
                if (starsElement) {
                    starsElement.innerHTML = createStarRating(rating);
                }
                
                const ratingText = item.querySelector('.lab-rating');
                if (ratingText) {
                    ratingText.innerHTML = `
                        ${rating.toFixed(1)} out of 5
                        <span class="review-count">(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})</span>
                    `;
                }
            }
        });
    }
    
    // Update any standalone lab items in the main list
    const labListItems = document.querySelectorAll(`.lab-item[data-name="${labName}"]`);
    if (labListItems.length > 0) {
        labListItems.forEach(item => {
            const starsElement = item.querySelector('.stars');
            if (starsElement) {
                starsElement.innerHTML = createStarRating(rating);
            }
            
            const ratingText = item.querySelector('.lab-rating');
            if (ratingText) {
                ratingText.innerHTML = `
                    ${rating.toFixed(1)} out of 5
                    <span class="review-count">(${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})</span>
                `;
            }
        });
    }
}
