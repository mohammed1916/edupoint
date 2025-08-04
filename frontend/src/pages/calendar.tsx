import React, { useContext } from 'react';
import GoogleCalendar from '../components/GoogleCalendar';
import { AccessTokenContext } from './_app';

const CalendarPage = () => {
  const accessToken = useContext(AccessTokenContext);
  return <GoogleCalendar accessToken={accessToken} />;
};

export default CalendarPage;
