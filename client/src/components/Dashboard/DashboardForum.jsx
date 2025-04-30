import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchThreads } from '../../services/api';

const DashboardForum = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadThreads();

    // Add a focus event listener to refresh threads when returning to this page
    const handleFocus = () => {
      console.log('Window focused, refreshing dashboard threads');
      loadThreads();
    };

    window.addEventListener('focus', handleFocus);

    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const data = await fetchThreads();
      setThreads(data || []);
      setError('');
    } catch (err) {
      console.error('Error loading threads in dashboard:', err);
      setError('Failed to load discussion threads');
      setThreads([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800">Recent Discussions</h2>
        <div className="flex space-x-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            onClick={loadThreads}
            title="Refresh threads"
          >
            ↻ Refresh
          </button>
          <Link
            to="/forum"
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
          >
            View All
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500">
          Loading threads...
        </div>
      ) : (
        <>
          {threads.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">No discussions available.</p>
              <Link
                to="/forum/new"
                className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Start a New Discussion
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {threads.slice(0, 5).map(thread => {
                // Use _id instead of id, and add a fallback
                const threadId = thread._id || thread.id;
                // Get the username from the user object or use a fallback
                const authorName = thread.user?.username || thread.author || 'Unknown';

                return (
                  <div key={threadId} className="p-4 hover:bg-gray-50 transition-colors">
                    <Link
                      to={`/forum/thread/${threadId}`}
                      className="block font-medium text-gray-900 hover:text-blue-600 mb-1 transition-colors"
                    >
                      {thread.title}
                    </Link>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-gray-100 rounded-full">{thread.category}</span>
                      <span>By {authorName}</span>
                      <span>{formatDate(thread.createdAt)}</span>
                      <span>
                        {typeof thread.postCount === 'number' ? thread.postCount : (thread.posts?.length || 0)} comments
                      </span>
                    </div>
                  </div>
                );
              })}
              <div className="p-3 text-center border-t border-gray-100">
                <Link
                  to="/forum"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  View All Discussions →
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DashboardForum;
