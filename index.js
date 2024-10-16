// Fetch the token from localStorage (if it was saved after login)
const token = localStorage.getItem('token');

// Check if the user is authenticated (if token exists, proceed)
if (!token) {
  alert('You must be logged in to create an event.');
  window.location.href = '/login.html'; // Redirect to login page if not authenticated
}

// Add an event listener for form submission
document.getElementById('create-event-form').addEventListener('submit', function (e) {
  e.preventDefault(); // Prevent the form from submitting the default way

  // Get form values
  const eventName = document.getElementById('event-name').value;
  const eventDate = document.getElementById('event-date').value;
  const eventLocation = document.getElementById('event-location').value;
  const sport = document.getElementById('sport').value;

  // Input validation
  if (!eventName || !eventDate || !eventLocation || !sport) {
    alert('Please fill in all fields.');
    return;
  }

  // Send a POST request to create the event
  fetch('http://localhost:3000/create-event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Ensure token is sent as "Bearer <token>"
    },
    body: JSON.stringify({
      event_name: eventName,
      event_date: eventDate,
      location: eventLocation,
      sport: sport
    })
  })
    .then(response => {
      // Check if the response status is OK (success)
      if (response.ok) {
        return response.json(); // Parse the response as JSON
      } else {
        // Throw an error if the response status is not 2xx (e.g., 400, 500)
        return response.text().then(text => {
          throw new Error(`Failed to create event: ${text}`);
        });
      }
    })
    .then(data => {
      console.log('Server response:', data); // Log the server response

      // Show a success message if the event is created
      if (data.message === 'Event created successfully.') {
        alert('Event created successfully!');
        document.getElementById('create-event-form').reset(); // Clear the form fields
        window.location.href = 'viewevents.html'; // Redirect to view events page
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while creating the event.'); // Show the error message
    });
});
