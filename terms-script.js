// terms-script.js

// Function to handle terms acceptance
function acceptTerms() {
    const checkbox = document.getElementById('acceptTerms');
    if (!checkbox.checked) {
        alert('Please read and check the box to accept the terms and conditions.');
        return;
    }

    // Store acceptance in localStorage
    localStorage.setItem('termsAccepted', 'true');

    // Get the return URL from localStorage or default to signup page
    const returnUrl = localStorage.getItem('returnUrl') || 'signup.html';

    // Redirect back to the signup page
    window.location.href = returnUrl;
}

// Function to handle terms decline
function declineTerms() {
    const confirmed = confirm('Are you sure you want to decline the terms? You won\'t be able to create an account without accepting the terms and conditions.');

    if (confirmed) {
        // Get the return URL from localStorage or default to signup page
        const returnUrl = localStorage.getItem('returnUrl') || 'signup.html';

        // Clear any stored acceptance
        localStorage.removeItem('termsAccepted');

        // Redirect back to the signup page
        window.location.href = returnUrl;
    }
}

// Function to check if terms were accepted when returning to signup
function checkTermsAcceptance() {
    return localStorage.getItem('termsAccepted') === 'true';
}

// Add smooth scrolling for better user experience
document.addEventListener('DOMContentLoaded', function () {
    // Smooth scroll to sections when clicking on links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});