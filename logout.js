// Step 1: Get the logout button element
const logoutBtn = document.getElementById('logoutBtn');

// Step 2: Add an event listener for the 'click' event
logoutBtn.addEventListener('click', handleLogout);

// Step 3: Define the logout function
async function handleLogout() {
  // Get the user token from localStorage
  const authToken = localStorage.getItem('authToken');

  // Check if the token exists
  if (!authToken) {
    console.log('No auth token found, redirecting to login...');
    window.location.href = 'login page.html'; // Redirect to login page if not logged in
    return;
  }

  try {
    // Send a POST request to the logout endpoint with the token
    const formData = new FormData();
    formData.append('user_token', authToken);

    const response = await fetch('http://localhost:5000/superadmin/logout', {
      method: 'POST',
      body: formData,
    });

    // Check if the response is okay
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Logout response:', data);

    // Check if the logout was successful based on 'errflag'
    if (data.errflag === 0) {
      // Clear localStorage and redirect to login page
      localStorage.removeItem('authToken');
      localStorage.removeItem('userEmail');
      window.location.href = 'login page.html'; // Redirect to the login page
    } else {
      // Display an error message if logout failed
      console.log('Logout failed:', data.message || 'An error occurred during logout.');
      alert(data.message || 'Logout failed. Please try again.');
    }
  } catch (error) {
    console.error('Error during logout:', error);
    alert('An error occurred during logout. Please try again.');
  }
}
