document.addEventListener('DOMContentLoaded', () => {
    // Simple static form handler
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Collect form data
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const message = document.getElementById('message').value.trim();

            // Validate all fields
            if (name && email && message) {
                // Prepare form data for Google Form submission
                const formData = new FormData();
                formData.append('entry.1234567890', name); // Replace with actual field ID for "Name"
                formData.append('entry.0987654321', email); // Replace with actual field ID for "Email"
                formData.append('entry.1122334455', message); // Replace with actual field ID for "Message"

                // Submit data to Google Form
                fetch('https://docs.google.com/forms/d/e/YOUR_GOOGLE_FORM_ID/formResponse', {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData,
                })
                    .then(() => {
                        formMessage.textContent = 'Thank you for contacting us! We will get back to you soon.';
                        form.reset();
                    })
                    .catch(() => {
                        formMessage.textContent = 'There was an error submitting your message. Please try again later.';
                    });
            } else {
                formMessage.textContent = 'Please fill in all fields.';
            }
        });
    }

    // Review form handler (Google Forms integration)
    const reviewForm = document.getElementById('review-form');
    const reviewMessage = document.getElementById('review-message');
    const reviewsList = document.getElementById('reviews');

    // Fetch and display reviews from Google Sheets CSV
    function fetchReviewsFromCSV() {
        fetch('https://sheetdb.io/api/v1/1b0can2pr0h1a')
            .then(response => response.json())
            .then(data => {
                reviewsList.innerHTML = '';
                let found = false;
                // Show latest first
                for (let i = data.length - 1; i >= 0; i--) {
                    const row = data[i];
                    if (row.Name && row.Review) {
                        // Star rating (1-5)
                        let stars = '';
                        if (row.Rating) {
                            const rating = Math.max(1, Math.min(5, parseInt(row.Rating)));
                            stars = '<span class="review-stars">' + '★'.repeat(rating) + '☆'.repeat(5 - rating) + '</span>';
                        }
                        // Date (optional)
                        let date = '';
                        if (row.Timestamp) {
                            date = `<div class="review-date">${row.Timestamp}</div>`;
                        }
                        const card = document.createElement('div');
                        card.className = 'review-card';
                        card.innerHTML = `
                            <div class="review-name">${row.Name}</div>
                            ${date}
                            <div class="review-text">${row.Review}</div>
                            ${stars}
                        `;
                        reviewsList.appendChild(card);
                        found = true;
                    }
                }
                if (!found) {
                    const card = document.createElement('div');
                    card.className = 'review-card';
                    card.textContent = 'No reviews found.';
                    reviewsList.appendChild(card);
                }
            })
            .catch(error => {
                console.error('Error fetching reviews:', error);
            });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Collect form data
            const reviewer = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const review = document.getElementById('review').value.trim();
            const rating = document.querySelector('input[name="rating"]:checked')?.value;

            // Validate all fields
            if (reviewer && email && phone && review && rating) {
                // Prepare data for SheetDB
                const data = {
                    Name: reviewer,
                    Email: email,
                    Phone: phone,
                    Review: review,
                    Rating: rating
                };

                fetch('https://sheetdb.io/api/v1/1b0can2pr0h1a', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ data })
                })
                    .then(response => {
                        if (response.ok) {
                            reviewMessage.textContent = 'Thank you for your review!';
                            reviewForm.reset();
                            setTimeout(fetchReviewsFromCSV, 2000);
                        } else {
                            reviewMessage.textContent = 'There was an error submitting your review. Please try again later.';
                        }
                    })
                    .catch(() => {
                        reviewMessage.textContent = 'There was an error submitting your review. Please try again later.';
                    });
            } else {
                reviewMessage.textContent = 'Please fill in all fields.';
            }
        });

        fetchReviewsFromCSV();
    }
});
