document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    const eventSelect = document.getElementById('event-select'); // The dropdown element
  
    // Fetch available events from the backend
    fetch('http://localhost:3000/available-events', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.json())
    .then(events => {
      // Clear current dropdown options
      eventSelect.innerHTML = '<option value="" disabled selected>-- Choose an Event --</option>';
  
      // Populate the dropdown with fetched events
      events.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;  // Use event ID as the value
        option.text = event.event_name;  // Display the event name in the dropdown
        eventSelect.appendChild(option);  // Append option to the select element
      });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
    });
  
    // Event listener for form submission
    document.querySelector('form').addEventListener('submit', function (event) {
      event.preventDefault();  // Prevent form from submitting in the traditional way
  
      const selectedEventId = eventSelect.value;  // Get the selected event ID
  
      // Send registration request
      fetch('http://localhost:3000/register-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ event_id: selectedEventId })  // Send the event ID in the request body
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Registered for event successfully.') {
          alert('You have successfully registered for the event!');
          window.location.href = 'viewevents.html';  // Redirect to the view events page
        } else {
          alert('Registration failed: ' + data.message);
        }
      })
      .catch(error => {
        console.error('Error registering for the event:', error);
      });
    });
  });
  