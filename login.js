// Add an event listener to the login form
document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  // Clear any previous error messages
  errorMessage.style.display = 'none';
  errorMessage.textContent = '';

  // Simple client-side validation
  if (!email || !password) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Please enter both email and password.';
    return;
  }

  // Make the POST request to the login API
  fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }), // Send the email and password as JSON
  })
    .then((response) => response.json()) // Parse the response as JSON
    .then((data) => {
      // If login is successful (auth is true), store the token and redirect
      if (data.auth) {
        // Store the JWT token in localStorage
        localStorage.setItem('token', data.token);

        // Display a success message
        alert('Login successful! Redirecting to dashboard...');

        // Redirect to the dashboard page (or whichever page you want)
        window.location.href = 'index.html'; // Replace with your dashboard or home page
      } else {
        // If login fails, display the error message from the server
        errorMessage.style.display = 'block';
        errorMessage.textContent = data.message || 'Invalid email or password';
      }
    })
    .catch((error) => {
      // Handle errors that occur during fetch
      console.error('Error:', error);
      errorMessage.style.display = 'block';
      errorMessage.textContent = 'An error occurred. Please try again.';
    });
});
