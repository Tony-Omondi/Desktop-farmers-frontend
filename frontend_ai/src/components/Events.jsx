import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Events = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState({
    name: '',
    location: '',
    date: '',
    eventNotes: '',
    weatherNotes: '',
  });
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingEvents, setIsFetchingEvents] = useState(true);

  // Fetch all events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view events.');
          navigate('/frontend_ai/login');
          return;
        }
        const response = await axios.get('http://localhost:8000/api/auth/events/', {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setEvents(response.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch events. Please try again.');
      } finally {
        setIsFetchingEvents(false);
      }
    };
    fetchEvents();
  }, [navigate]);

  const handleChange = (e) => {
    setEventData({
      ...eventData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to create an event.');
        navigate('/frontend_ai/login');
        return;
      }
      const response = await axios.post('http://localhost:8000/api/auth/events/', eventData, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setEvents([...events, response.data]);
      setEventData({ name: '', location: '', date: '', eventNotes: '', weatherNotes: '' });
      navigate('/frontend_ai/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to delete an event.');
        navigate('/frontend_ai/login');
        return;
      }
      await axios.delete(`http://localhost:8000/api/auth/events/${eventId}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete event. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Create Event Form */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Plan Your Events</h2>
            <p className="text-indigo-100 mt-1">Create a new event</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            )}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={eventData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Wedding, Birthday Party"
                  required
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  name="location"
                  value={eventData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                >
                  <option value="">Select location</option>
                  <option value="Nairobi">Nairobi</option>
                  <option value="Mombasa">Mombasa</option>
                  <option value="Kisumu">Kisumu</option>
                  <option value="Nakuru">Nakuru</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={eventData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="eventNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Notes
                </label>
                <textarea
                  id="eventNotes"
                  name="eventNotes"
                  value={eventData.eventNotes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Dress code, theme, or other important details"
                  rows="3"
                />
              </div>
              <div>
                <label htmlFor="weatherNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Weather Notes
                </label>
                <textarea
                  id="weatherNotes"
                  name="weatherNotes"
                  value={eventData.weatherNotes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="Any specific weather considerations?"
                  rows="3"
                />
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium text-base hover:shadow-lg transition-all flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Event
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Events List */}
        {isFetchingEvents ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <svg className="animate-spin mx-auto h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-600">Loading events...</p>
          </div>
        ) : events.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Events</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Name</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Location</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Event Notes</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Weather Notes</th>
                      <th className="px-4 py-2 text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-600">{event.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{event.location}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{event.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{event.eventNotes || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{event.weatherNotes || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <p className="text-gray-600">No events found. Create one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;