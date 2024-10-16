document.addEventListener('DOMContentLoaded', function () {
  const token = localStorage.getItem('token'); // Get token from localStorage

  if (!token) {
    alert('You need to be logged in to view events.');
    window.location.href = '/login.html'; // Redirect to login page if not logged in
  }

  // Fetch upcoming events
  fetch('http://localhost:3000/view-events', {
    headers: { 'Authorization': `Bearer ${token}` } // Make sure to send token as "Bearer <token>"
  })
    .then(response => {
      console.log('Upcoming events response:', response); // Log response for debugging
      return response.json(); // Parse response
    })
    .then(events => {
      console.log('Fetched upcoming events:', events); // Log the events data
      const upcomingEventsBody = document.getElementById('upcomingEventsBody'); // Fixed ID
      upcomingEventsBody.innerHTML = ''; // Clear any existing rows

      events.forEach(event => {
        const row = `<tr>
                      <td>${event.event_name}</td>
                      <td>${event.event_date}</td>
                      <td>${event.location}</td>
                      <td>${event.sport}</td>
                    </tr>`;
        upcomingEventsBody.innerHTML += row;
      });
    })
    .catch(error => {
      console.error('Error fetching upcoming events:', error);
    });

  // Fetch registered events for the logged-in user
  fetch('http://localhost:3000/my-events', {
    headers: { 'Authorization': `Bearer ${token}` } // Ensure the token is passed as "Bearer <token>"
  })
    .then(response => {
      console.log('Registered events response:', response); // Log response for debugging
      return response.json(); // Parse response
    })
    .then(registeredEvents => {
      console.log('Fetched registered events:', registeredEvents); // Log the registered events data
      const registeredEventsBody = document.getElementById('myEventsBody'); // Fixed ID
      registeredEventsBody.innerHTML = ''; // Clear any existing rows

      if (registeredEvents.length === 0) {
        registeredEventsBody.innerHTML = '<tr><td colspan="4">No registered events found.</td></tr>';
      } else {
        registeredEvents.forEach(event => {
          const row = `<tr>
                        <td>${event.event_name}</td>
                        <td>${event.event_date}</td>
                        <td>${event.location}</td>
                        <td>${event.sport}</td>
                      </tr>`;
          registeredEventsBody.innerHTML += row;
        });
      }
    })
    .catch(error => {
      console.error('Error fetching registered events:', error);
    });

});
