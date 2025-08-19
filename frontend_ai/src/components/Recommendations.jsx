import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000';

const Recommendations = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/frontend_ai/login');
          return;
        }
        const [profileResponse, eventsResponse, recommendationsResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/auth/profile/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`${BASE_URL}/api/auth/events/`, {
            headers: { Authorization: `Token ${token}` },
          }),
          axios.get(`${BASE_URL}/api/auth/recommendations/`, {
            headers: { Authorization: `Token ${token}` },
          }),
        ]);
        setProfile(profileResponse.data);
        setEvents(eventsResponse.data);
        setRecommendations(recommendationsResponse.data);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data. Please ensure you are logged in.');
      }
    };

    fetchProfileAndEvents();
  }, [navigate]);

  const handleGenerateRecommendation = async () => {
    if (!selectedEvent) {
      setError('Please select an event.');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      const response = await axios.post(
        `${BASE_URL}/api/auth/recommendations/`,
        { event_id: selectedEvent },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setRecommendations([...recommendations, response.data]);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to generate recommendation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in.');
      }
      await axios.delete(`${BASE_URL}/api/auth/recommendations/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setRecommendations(recommendations.filter((rec) => rec.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete recommendation.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/frontend_ai/login');
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const profilePictureUrl = profile?.profile?.profile_picture
    ? profile.profile.profile_picture.startsWith('http')
      ? profile.profile.profile_picture
      : `${BASE_URL}${profile.profile.profile_picture}`
    : null;

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Mobile Sidebar Toggle */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md transition-all ${
          isOpen ? 'transform rotate-90' : ''
        }`}
        onClick={toggleSidebar}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100 md:opacity-0' : 'opacity-0 pointer-events-none'
        } md:hidden`}
        onClick={toggleSidebar}
      ></div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`fixed md:relative inset-y-0 left-0 w-64 bg-white shadow-lg z-40 transform ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          <div className="flex flex-col h-full p-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/src/assets/closetai-logo.jpg"
                alt="ClosetAI Logo"
                className="h-12 w-auto transition-opacity hover:opacity-90"
              />
            </div>

            {/* User Profile */}
            <div className="flex items-center mb-8 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full object-cover mr-3 border-2 border-indigo-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-medium text-xl mr-3">
                  {profile?.profile?.full_name?.[0] || 'U'}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800 truncate max-w-[150px]">
                  {profile?.profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500">View profile</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
              <a
                href="/frontend_ai/dashboard"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                <span>Dashboard</span>
              </a>
              <a
                href="/frontend_ai/closet"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path>
                </svg>
                <span>My Closet</span>
              </a>
              <a
                href="/frontend_ai/events"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span>Events</span>
                <span className="ml-auto bg-indigo-100 text-indigo-800 text-xs font-semibold px-2 py-1 rounded-full">
                  {events.length}
                </span>
              </a>
              <a
                href="/frontend_ai/recommendations"
                className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 text-indigo-700 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 9.143l-5.714 2.714L13 21l-2.286-6.857L5 11.857l5.714-2.714L13 3z"
                  ></path>
                </svg>
                <span>Recommendations</span>
              </a>
              <a
                href="/frontend_ai/profile"
                className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                <span>Profile</span>
              </a>
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="mt-auto flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Outfit Recommendations</h1>
              <p className="text-gray-600">Get AI-powered outfit suggestions for your events</p>
            </div>

            {/* Generate Recommendation Form */}
            <div className="bg-white p-8 rounded-xl shadow-md mb-12 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                Generate New Recommendation
              </h2>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Event
                  </label>
                  <select
                    id="event"
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select an event</option>
                    {events.map((event) => (
                      <option key={event.id} value={event.id}>
                        {event.name} - {event.date}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleGenerateRecommendation}
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Generating...' : 'Generate Recommendation'}
                </button>
              </div>
            </div>

            {/* Recommendations List */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">
                Your Recommendations
              </h2>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                </div>
              ) : recommendations.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    ></path>
                  </svg>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No recommendations yet</h3>
                  <p className="mt-1 text-gray-500">Generate a recommendation for an event to get started</p>
                </div>
              ) : (
                recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className="bg-white p-6 rounded-xl shadow-sm mb-6 border border-gray-100 relative group"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {recommendation.event.name} - {recommendation.event.date}
                    </h3>
                    <p className="text-gray-600 mb-4">{recommendation.description}</p>
                    <p className="text-sm text-gray-500 mb-4">Weather: {recommendation.weather_info}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recommendation.clothing_items.map((item) => {
                        const itemImageUrl = item.image
                          ? item.image.startsWith('http')
                            ? item.image
                            : `${BASE_URL}${item.image}`
                          : null;

                        return (
                          <div
                            key={item.id}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-100"
                          >
                            {itemImageUrl ? (
                              <div className="overflow-hidden rounded-lg mb-4">
                                <img
                                  src={itemImageUrl}
                                  alt={item.name}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                                <svg
                                  className="w-8 h-8"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  ></path>
                                </svg>
                              </div>
                            )}
                            <h4 className="text-sm font-medium text-gray-900 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.get_category_display}</p>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => handleDelete(recommendation.id)}
                      className="absolute top-3 right-3 bg-white rounded-full p-1.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-50"
                      aria-label="Delete recommendation"
                    >
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Recommendations;