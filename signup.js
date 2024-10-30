// Select DOM elements
const form = document.querySelector('.signup-form');
const firstNameInput = document.getElementById('Name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const termsCheckbox = document.getElementById('terms');
const signupBtn = document.querySelector('.signup-button');

// Create validation message element
const inputValidationMsg = document.createElement('div');
inputValidationMsg.classList.add('validation-message');
inputValidationMsg.style.cssText = `
    display: none;
    color: #e53e3e;
    margin-top: 8px;
    font-size: 0.875rem;
`;
form.insertBefore(inputValidationMsg, signupBtn);

// Function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Function to validate password strength
const isValidPassword = (password) => {
    // Minimum 8 characters, at least one number and one symbol
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    return passwordRegex.test(password);
};

// Function to validate all inputs
const validateInputs = () => {
    let valid = true;
    let validationMsg = "";

    // Reset all border colors
    const inputs = [NameInput, emailInput, passwordInput, confirmPasswordInput];
    inputs.forEach(input => input.style.borderColor = '');

    // Validate First Name
    if (!firstNameInput.value.trim()) {
        validationMsg += "Name is required.\n";
        firstNameInput.style.borderColor = "#e53e3e";
        valid = false;
    }


    // Validate Email
    if (!emailInput.value.trim()) {
        validationMsg += "Email is required.\n";
        emailInput.style.borderColor = "#e53e3e";
        valid = false;
    } else if (!isValidEmail(emailInput.value.trim())) {
        validationMsg += "Please enter a valid email address.\n";
        emailInput.style.borderColor = "#e53e3e";
        valid = false;
    }

    // Validate Password
    if (!passwordInput.value) {
        validationMsg += "Password is required.\n";
        passwordInput.style.borderColor = "#e53e3e";
        valid = false;
    } else if (!isValidPassword(passwordInput.value)) {
        validationMsg += "Password must be at least 8 characters long and contain numbers and symbols.\n";
        passwordInput.style.borderColor = "#e53e3e";
        valid = false;
    }

    // Validate Confirm Password
    if (!confirmPasswordInput.value) {
        validationMsg += "Please confirm your password.\n";
        confirmPasswordInput.style.borderColor = "#e53e3e";
        valid = false;
    } else if (passwordInput.value !== confirmPasswordInput.value) {
        validationMsg += "Passwords do not match.\n";
        confirmPasswordInput.style.borderColor = "#e53e3e";
        valid = false;
    }
    // Add to your signup page's JavaScript
    document.addEventListener('DOMContentLoaded', function () {
        // Check if terms were accepted when returning from terms page
        if (localStorage.getItem('termsAccepted') === 'true') {
            document.getElementById('terms').checked = true;
        }

        // Store the current page URL before going to terms
        document.querySelectorAll('.terms-link').forEach(link => {
            link.addEventListener('click', function () {
                localStorage.setItem('returnUrl', window.location.href);
            });
        });
    });

    // Validate Terms Checkbox
    if (!termsCheckbox.checked) {
        validationMsg += "Please accept the Terms of Service and Privacy Policy.\n";
        valid = false;
    }

    // Display validation message if there are errors
    if (validationMsg) {
        inputValidationMsg.innerText = validationMsg;
        inputValidationMsg.style.display = "block";
    } else {
        inputValidationMsg.style.display = "none";
    }

    return valid;
};

// Clear error messages when typing in input fields
const clearErrorMessage = (event) => {
    const input = event.target;
    input.style.borderColor = "";
    inputValidationMsg.style.display = "none";
};

// Add input event listeners to all form fields
[NameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
    input.addEventListener('input', clearErrorMessage);
});

// Password toggle functionality
const togglePassword = (inputId) => {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);

    // Toggle eye icon
    const svg = button.querySelector('svg');
    if (type === 'password') {
        svg.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    } else {
        svg.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    }
};

// Handle form submission
const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate inputs before sending the request
    if (!validateInputs()) {
        return;
    }

    try {
        // Disable submit button and show loading state
        signupBtn.disabled = true;
        signupBtn.innerHTML = `<div class="spinner-border spinner-border-sm" role="status">
                                <span class="visually-hidden">Loading...</span>
                              </div> Creating Account...`;

        // Create FormData object
        const formData = new FormData();
        formData.append('Name', NameInput.value.trim());
        formData.append('email', emailInput.value.trim());
        formData.append('password', passwordInput.value);

        // Send POST request to signup API
        const response = await fetch('http://localhost:5000/signup', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (response.ok) {
            // Successful signup
            localStorage.setItem('authToken', data.userToken);
            localStorage.setItem('userEmail', emailInput.value.trim());
            window.location.href = 'loading.html'; // Redirect to loading
        } else {
            // Display error message
            inputValidationMsg.textContent = data.message || 'An error occurred during signup. Please try again.';
            inputValidationMsg.style.display = 'block';
        }
    } catch (error) {
        console.error('Error during signup:', error);
        inputValidationMsg.textContent = 'An error occurred during signup. Please try again.';
        inputValidationMsg.style.display = 'block';
    } finally {
        // Reset button state
        signupBtn.disabled = false;
        signupBtn.innerHTML = 'Create Account';
    }
};

// Add form submission event listener
form.addEventListener('submit', handleSubmit);