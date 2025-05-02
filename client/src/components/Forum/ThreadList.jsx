import React from 'react';
import { Link } from 'react-router-dom';
import './ThreadList.css';

const ThreadList = ({ threads }) => {
  // Debug log to see the structure of threads
  console.log('Threads in ThreadList:', threads);

  return (
    <div className="thread-list">
      {threads.map(thread => {
        // Use _id instead of id (MongoDB fix)
        const threadId = thread._id || thread.id;
        // Get the username from the user object or use Unknown
        const authorName = thread.user?.name || thread.user?.username || thread.author || 'Unknown';

        return (
          <div key={threadId} className="thread-item">
            <div className="thread-content">
              <Link to={`/forum/thread/${threadId}`} className="thread-title">
                {thread.title}
              </Link>
              <div className="thread-preview">
                {thread.content && thread.content.substring(0, 100)}...
              </div>
              <div className="thread-meta">
                <span className="thread-category">{thread.category}</span>
                <span className="thread-author">By {authorName}</span>
                <span className="thread-date">{new Date(thread.createdAt).toLocaleDateString()}</span>
                <span className="thread-comments">
                  {/* Debug the post count values */}
                  {console.log(`Thread ${threadId} post count:`, {
                    postCount: thread.postCount,
                    postsLength: thread.posts?.length,
                    commentCount: thread.commentCount
                  })}
                  {/* Use postCount as the primary source of truth */}
                  {typeof thread.postCount === 'number' ? thread.postCount : (thread.posts?.length || 0)} comments
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ThreadList;