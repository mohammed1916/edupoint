"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './GoogleCalendar.module.css';

const GoogleCalendar: React.FC = () => {
  const { accessToken, profile, loading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('@default');

  useEffect(() => {
    if (accessToken) {
      const today = new Date();
      const timeMin = today.toISOString();
      fetch('/api/google/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, timeMin }),
      })
        .then(res => res.json())
        .then(data => {
          setEvents(data.items || []);
          // Upload events to RAG
          if (data.items && data.items.length > 0) {
            const eventTexts = data.items.map(e => `Event: ${e.summary || ''} | Start: ${e.start?.dateTime || e.start?.date || '-'} | End: ${e.end?.dateTime || e.end?.date || '-'} | Location: ${e.location || '-'}`);
            fetch('http://localhost:8000/api/rag/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texts: eventTexts })
            });
          }
        });

      // Fetch Google Task Lists
      fetch('/api/google/tasklists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      })
        .then(res => res.json())
        .then(data => setTaskLists(data.items || []));
    } else {
      console.log('[GoogleCalendar] No accessToken after refresh');
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken && selectedTaskListId) {
      fetch('/api/google/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken, taskListId: selectedTaskListId }),
      })
        .then(res => res.json())
        .then(data => {
          setTasks(data.items || []);
          // Upload tasks to RAG
          if (data.items && data.items.length > 0) {
            const taskTexts = data.items.map(t => `Task: ${t.title || ''} | Status: ${t.status || '-'} | Due: ${t.due || '-'}`);
            fetch('http://localhost:8000/api/rag/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ texts: taskTexts })
            });
          }
        });
    }
  }, [accessToken, selectedTaskListId]);

  if (loading) return <p>Loading...</p>;
  if (!accessToken) return <p>Please sign in with Google to view your calendar.</p>;

  return (
    <div className={styles.container}>
      <h2>Calendar</h2>
      {profile ? (
        <div className={styles.profile}>
          {profile.picture ? (
            <img src={profile.picture} alt="Profile" className={styles.profileImg} />
          ) : (
            <span>No profile picture</span>
          )}
          <span>{profile.name || 'No name available'}</span>
        </div>
      ) : (
        <div className={styles.profile}>
          <span>No profile info available</span>
        </div>
      )}
      <div>
        {events.length > 0 ? (
          <table className={styles.eventsTable}>
            <thead>
              <tr>
                <th>Summary</th>
                <th>Start</th>
                <th>End</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td>{event.summary}</td>
                  <td>{event.start?.dateTime || event.start?.date || '-'}</td>
                  <td>{event.end?.dateTime || event.end?.date || '-'}</td>
                  <td>{event.location || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No events found.</p>
        )}
      </div>
      <div>
        <h3>Google Task Lists</h3>
        {taskLists.length > 0 ? (
          <select
            value={selectedTaskListId}
            onChange={e => setSelectedTaskListId(e.target.value)}
            className={styles.taskListSelect}
          >
            {taskLists.map(list => (
              <option key={list.id} value={list.id}>{list.title}</option>
            ))}
          </select>
        ) : (
          <p>No task lists found.</p>
        )}
      </div>
      <div>
        <h3>Google Tasks</h3>
        {tasks.length > 0 ? (
          <table className={styles.tasksTable}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.status}</td>
                  <td>{task.due || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No tasks found.</p>
        )}
      </div>
    </div>
  );
};

export default GoogleCalendar;
