import React from 'react';

const GoogleCalendar = () => {
  return (
    <div style={{marginTop: '2rem'}}>
      <h2>Google Calendar Integration</h2>
      {/* Embed Google Calendar or use API here */}
      <iframe
        src="https://calendar.google.com/calendar/embed?src=your_calendar_id&ctz=UTC"
        style={{border: 0, width: '100%', height: '600px'}}
        frameBorder="0"
        scrolling="no"
        title="Google Calendar"
      />
    </div>
  );
};

export default GoogleCalendar;
