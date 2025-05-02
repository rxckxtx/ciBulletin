import React, { useState } from 'react';

// Helper function to get theme color
const getThemeColor = (theme) => {
  const themeColors = {
    asi: 'border-red-500',
    stem: 'border-green-500',
    arts: 'border-purple-500',
    business: 'border-blue-500',
    cs: 'border-yellow-500',
    default: 'border-gray-300'
  };
  return themeColors[theme] || themeColors.default;
};

const PosterTile = ({ announcement, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expandedImage, setExpandedImage] = useState(false);

  // For simplicity, always allow delete button to show
  // The server will handle the authorization check
  const canDelete = true;

  // No debug info needed in production

  // Determine if event is archived (past date)
  const isArchived = announcement.isArchived;

  // Format the date if it exists
  const formattedDate = announcement.date ? new Date(announcement.date).toLocaleDateString() : '';

  // Handle image path - if it starts with /uploads, prepend the server URL
  const imageSrc = announcement.image && announcement.image.startsWith('/uploads')
    ? `${window.location.origin}${announcement.image}`
    : announcement.image;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(announcement._id);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const toggleExpandImage = () => {
    setExpandedImage(!expandedImage);
  };

  // Define the pulsing animation class for urgent events
  const urgentPulseClass = announcement.urgent
    ? 'animate-pulse-red shadow-red-500/50'
    : '';

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${getThemeColor(announcement.theme)}
        ${urgentPulseClass}
        ${isArchived ? 'opacity-75' : ''}
        hover:shadow-md`}
      data-can-delete={String(!!canDelete)}
    >
      {isArchived && (
        <div className="bg-gray-600 text-white text-xs font-medium py-1 px-2 text-center">
          Past Event
        </div>
      )}

      {imageSrc && (
        <div
          className="w-full h-40 overflow-hidden cursor-pointer"
          onClick={toggleExpandImage}
        >
          <img
            src={imageSrc}
            alt={announcement.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{announcement.title}</h3>

        <div className="space-y-2 text-sm text-gray-600">
          {announcement.location && (
            <div className="flex items-center">
              <span className="mr-2">📍</span> {announcement.location}
            </div>
          )}

          {formattedDate && (
            <div className="flex items-center">
              <span className="mr-2">📅</span> {formattedDate}
            </div>
          )}

          {announcement.group && (
            <div className="flex items-center">
              <span className="mr-2">👥</span> {announcement.group}
            </div>
          )}

          {announcement.type && (
            <div className="inline-block px-2 py-1 bg-gray-100 rounded-full text-xs font-medium mt-2">
              {announcement.type}
            </div>
          )}

          {/* Display who posted the event */}
          <div className="flex items-center mt-2 pt-2 border-t border-gray-100">
            <span className="mr-2">👤</span> Posted by {
              announcement.user && typeof announcement.user === 'object'
                ? (announcement.user.name || announcement.user.username || 'Unknown')
                : 'Unknown'
            }
          </div>
        </div>

        {/* Always render the delete section, but conditionally show the button */}
        <div className="mt-4 border-t pt-3 border-gray-100">
          {canDelete ? (
            !showDeleteConfirm ? (
              <button
                className="text-red-500 hover:text-red-700 transition-colors"
                onClick={handleDeleteClick}
                aria-label="Delete event"
              >
                🗑️ Delete
              </button>
            ) : (
              <div className="text-sm">
                <p className="mb-2 font-medium">Delete this event?</p>
                <div className="flex space-x-2">
                  <button
                    onClick={confirmDelete}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                  >
                    No
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="text-xs text-gray-400">
              {/* Spacer div */}
              &nbsp;
            </div>
          )}
        </div>
      </div>

      {/* Expanded image modal */}
      {expandedImage && imageSrc && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={toggleExpandImage}
        >
          <div
            className="relative max-w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center text-gray-800 hover:bg-gray-200 z-10"
              onClick={toggleExpandImage}
            >
              ✕
            </button>
            <img
              src={imageSrc}
              alt={announcement.title}
              className="max-w-[90vw] max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PosterTile;