// Rating system state
const ratingsDB = {
    ratings: {},
    reviews: {}
};

// Initialize ratings from localStorage
function initializeRatings() {
    const savedRatings = localStorage.getItem('labRatings');
    const savedReviews = localStorage.getItem('labReviews');
    
    console.log('Loading ratings from localStorage');
    
    if (savedRatings) {
        try {
            ratingsDB.ratings = JSON.parse(savedRatings);
            console.log('Loaded ratings:', ratingsDB.ratings);
        } catch (e) {
            console.error('Error parsing ratings:', e);
            ratingsDB.ratings = {};
        }
    }
    
    if (savedReviews) {
        try {
            ratingsDB.reviews = JSON.parse(savedReviews);
            console.log('Loaded reviews:', ratingsDB.reviews);
        } catch (e) {
            console.error('Error parsing reviews:', e);
            ratingsDB.reviews = {};
        }
    }
}

// Save ratings to localStorage
function saveRatings() {
    try {
        localStorage.setItem('labRatings', JSON.stringify(ratingsDB.ratings));
        localStorage.setItem('labReviews', JSON.stringify(ratingsDB.reviews));
        console.log('Saved ratings to localStorage');
    } catch (e) {
        console.error('Error saving ratings:', e);
    }
}

// Add or update a rating
function addRating(labName, rating, review = '') {
    console.log('Adding rating for:', labName, 'rating:', rating, 'review:', review);
    
    if (!ratingsDB.ratings[labName]) {
        ratingsDB.ratings[labName] = [];
    }
    ratingsDB.ratings[labName].push(rating);
    
    // Always create a review entry even if review is empty
    if (!ratingsDB.reviews[labName]) {
        ratingsDB.reviews[labName] = [];
    }
    
    // Make sure review is a string and handle properly
    const reviewText = review ? String(review).trim() : '';
    console.log('Review text to be stored:', reviewText);
    
    // Create the review object with the review text
    const reviewObj = {
        rating,
        review: reviewText,
        date: new Date().toISOString()
    };
    
    // Add the review to the array
    ratingsDB.reviews[labName].push(reviewObj);
    
    console.log('Updated ratings:', ratingsDB.ratings[labName]);
    console.log('Updated reviews:', ratingsDB.reviews[labName]);
    console.log('Latest review added:', reviewObj);
    
    saveRatings();
    
    // Call updateLabPopup if it exists in the global scope
    if (typeof updateLabPopup === 'function') {
        updateLabPopup(labName);
    }
}

// Get average rating for a lab
function getAverageRating(labName) {
    const ratings = ratingsDB.ratings[labName];
    if (!ratings || !ratings.length) return 0;
    return ratings.reduce((a, b) => a + b, 0) / ratings.length;
}

// Get all reviews for a lab
function getLabReviews(labName) {
    // Make sure we have the latest data from localStorage
    const savedReviews = localStorage.getItem('labReviews');
    if (savedReviews) {
        try {
            const parsedReviews = JSON.parse(savedReviews);
            ratingsDB.reviews = parsedReviews;
        } catch (e) {
            console.error('Error parsing reviews in getLabReviews:', e);
        }
    }
    
    // Debug the reviews
    const reviews = ratingsDB.reviews[labName] || [];
    console.log('Getting reviews for:', labName, 'Found:', reviews);
    
    // Ensure each review has all needed properties
    return reviews.map(review => {
        // Make sure the review object has all properties
        return {
            rating: review.rating || 0,
            review: review.review || '',
            date: review.date || new Date().toISOString()
        };
    });
}

function submitReview(labName) {
    const popup = document.querySelector('.leaflet-popup-content');
    if (!popup) {
        alert('Could not find the review form. Please try again.');
        return;
    }
    
    // Use more reliable class selectors to find the elements
    const ratingSelect = popup.querySelector('select.rating-input');
    const reviewText = popup.querySelector('textarea.review-input');
    
    console.log('Rating submission attempt for:', labName);
    console.log('Rating select element:', ratingSelect);
    console.log('Selected value:', ratingSelect ? ratingSelect.value : 'not found');
    
    if (!ratingSelect) {
        alert('Could not find the rating selector. Please try again.');
        return;
    }
    
    if (ratingSelect.value === '' || ratingSelect.value === null) {
        alert('Please select a rating');
        return;
    }
    
    const rating = parseInt(ratingSelect.value);
    const review = reviewText ? reviewText.value : '';
    
    addRating(labName, rating, review);
    
    // Use showAlert function if it exists in global scope
    if (typeof showAlert === 'function') {
        showAlert('Thank you for your review!', 'success');
    } else {
        alert('Thank you for your review!');
    }
    
    // Update the UI if marker exists
    if (typeof state !== 'undefined' && state.markers) {
        const marker = state.markers.find(m => m.lab.name === labName);
        if (marker) {
            marker.marker.getPopup().setContent(createLabPopupContent(marker.lab));
        }
    }
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
