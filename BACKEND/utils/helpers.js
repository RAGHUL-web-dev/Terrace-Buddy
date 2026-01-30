const path = require('path');
const fs = require('fs');

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format date
const formatDate = (date, format = 'DD/MM/YYYY') => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  switch (format) {
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY HH:mm':
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    case 'relative':
      const now = new Date();
      const diffMs = now - d;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
      return `${day}/${month}/${year}`;
    default:
      return d.toISOString();
  }
};

// Calculate plant age in days
const calculatePlantAge = (plantDate) => {
  const planted = new Date(plantDate);
  const now = new Date();
  const diffTime = Math.abs(now - planted);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Get watering schedule based on plant type and conditions
const getWateringSchedule = (plantType, sunlight, season) => {
  const schedules = {
    'succulent': {
      summer: 'Every 2-3 weeks',
      monsoon: 'Every 4 weeks',
      winter: 'Every 3-4 weeks',
      spring: 'Every 2-3 weeks'
    },
    'herb': {
      summer: 'Every 2-3 days',
      monsoon: 'Every 4-5 days',
      winter: 'Every 5-7 days',
      spring: 'Every 3-4 days'
    },
    'vegetable': {
      summer: 'Daily',
      monsoon: 'Every 2-3 days',
      winter: 'Every 3-4 days',
      spring: 'Every 1-2 days'
    },
    'flower': {
      summer: 'Every 1-2 days',
      monsoon: 'Every 3-4 days',
      winter: 'Every 4-5 days',
      spring: 'Every 2-3 days'
    },
    'default': {
      summer: 'Every 3-4 days',
      monsoon: 'Every 5-6 days',
      winter: 'Every 7-10 days',
      spring: 'Every 4-5 days'
    }
  };

  const plantCategory = plantType.toLowerCase();
  let category = 'default';

  if (plantCategory.includes('succulent') || plantCategory.includes('cactus')) {
    category = 'succulent';
  } else if (plantCategory.includes('basil') || plantCategory.includes('mint') || 
             plantCategory.includes('coriander') || plantCategory.includes('herb')) {
    category = 'herb';
  } else if (plantCategory.includes('tomato') || plantCategory.includes('chili') || 
             plantCategory.includes('brinjal') || plantCategory.includes('vegetable')) {
    category = 'vegetable';
  } else if (plantCategory.includes('rose') || plantCategory.includes('flower') || 
             plantCategory.includes('marigold')) {
    category = 'flower';
  }

  // Adjust based on sunlight
  let adjustment = '';
  if (sunlight === 'full') {
    adjustment = ' (increase frequency in hot weather)';
  } else if (sunlight === 'shade') {
    adjustment = ' (reduce frequency)';
  }

  return (schedules[category]?.[season] || schedules.default[season]) + adjustment;
};

// Sanitize user input
const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .trim();
  }
  return input;
};

// Validate image file
const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Only JPEG, PNG, and GIF images are allowed' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 5MB' };
  }

  return { valid: true };
};

// Delete file from filesystem
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(__dirname, '..', filePath);
    
    fs.unlink(fullPath, (err) => {
      if (err) {
        // If file doesn't exist, that's okay
        if (err.code === 'ENOENT') {
          resolve(true);
        } else {
          reject(err);
        }
      } else {
        resolve(true);
      }
    });
  });
};

// Calculate distance between two locations (simple approximation)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (value) => {
  return value * Math.PI / 180;
};

// Generate unique slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

// Paginate results
const paginate = (array, page = 1, limit = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const results = {
    data: array.slice(startIndex, endIndex),
    page: parseInt(page),
    limit: parseInt(limit),
    total: array.length,
    totalPages: Math.ceil(array.length / limit)
  };

  if (endIndex < array.length) {
    results.next = {
      page: page + 1,
      limit: limit
    };
  }

  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit
    };
  }

  return results;
};

module.exports = {
  generateRandomString,
  formatDate,
  calculatePlantAge,
  getWateringSchedule,
  sanitizeInput,
  validateImageFile,
  deleteFile,
  calculateDistance,
  generateSlug,
  paginate
};