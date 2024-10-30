// Select DOM elements
const passwordToggleBtn = document.querySelector(".toggle-password");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const loginBtn = document.querySelector(".login-button");
const inputValidationMsg = document.createElement('div');

// Append validation message div to the login box
const loginBox = document.querySelector(".login-card");
loginBox.appendChild(inputValidationMsg);
inputValidationMsg.classList.add("validation-message");
inputValidationMsg.style.display = "none";

// Function to validate email and password inputs
const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  if (!emailInput.value.trim()) {
    validationMsg += "Email cannot be empty.\n";
    valid = false;
    emailInput.style.borderColor = "red";
  } else {
    emailInput.style.borderColor = "";
  }

  if (!passwordInput.value.trim()) {
    validationMsg += "Password cannot be empty.\n";
    valid = false;
    passwordInput.style.borderColor = "red";
  } else {
    passwordInput.style.borderColor = "";
  }

  if (validationMsg) {
    inputValidationMsg.innerText = validationMsg;
    inputValidationMsg.style.display = "block";
  } else {
    inputValidationMsg.style.display = "none";
  }

  return valid;
};

// Clear error messages when typing in input fields
const clearErrorMessages = (event) => {
  const inputField = event.target;
  inputField.style.borderColor = "";
  inputValidationMsg.style.display = "none";
};

// Add event listeners to clear error messages on input
emailInput.addEventListener("input", clearErrorMessages);
passwordInput.addEventListener("input", clearErrorMessages);

// Function to toggle password visibility
passwordToggleBtn.addEventListener("click", function () {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordToggleBtn.innerHTML = '&#128065;';
  } else {
    passwordInput.type = "password";
    passwordToggleBtn.innerHTML = '&#128065;';
  }
});

// Function to handle form submission
async function handleSubmit(event) {
  event.preventDefault();

  // Validate inputs before sending the request
  if (!validateInputs()) {
    return;
  }

  try {
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div> Logging in...`;

    const formData = new FormData();
    formData.append("email", emailInput.value.trim());
    formData.append("password", passwordInput.value.trim());

    // Send a POST request to the login API
    const response = await fetch("http://127.0.0.1:5000/login", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    console.log("Response data:", data); // Log the response for debugging

    // Check for the presence of token to determine if login is successful
    if (data.token) {
      // Successful login, save the token and redirect to the dashboard
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userEmail", emailInput.value.trim());
      window.location.href = "loading.html"; // Redirect to the desired page
    } else {
      // Display error message if token is not present, assuming it's a failure
      const errorMessage = data.message || "An error occurred. Please try again.";
      inputValidationMsg.textContent = errorMessage;
      inputValidationMsg.style.display = "block";
      emailInput.focus();
    }
  } catch (error) {
    console.error("Error during login:", error);
    inputValidationMsg.textContent = "An error occurred during login. Please try again.";
    inputValidationMsg.style.display = "block";
  } finally {
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Login";
  }
}

// Add the event listener for form submission
document.querySelector(".login-form").addEventListener("submit", handleSubmit);