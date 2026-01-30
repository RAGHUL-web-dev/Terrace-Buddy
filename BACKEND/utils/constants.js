module.exports = {
  // User roles
  ROLES: {
    USER: 'user',
    COMMUNITY_ADMIN: 'community_admin',
    PLATFORM_ADMIN: 'platform_admin'
  },

  // Plant statuses
  PLANT_STATUS: {
    SEED: 'seed',
    SEEDLING: 'seedling',
    GROWING: 'growing',
    FLOWERING: 'flowering',
    FRUITING: 'fruiting',
    HARVESTED: 'harvested',
    DORMANT: 'dormant',
    DECEASED: 'deceased'
  },

  // Marketplace item status
  ITEM_STATUS: {
    AVAILABLE: 'available',
    PENDING: 'pending',
    SOLD: 'sold',
    EXCHANGED: 'exchanged'
  },

  // Community visibility
  COMMUNITY_VISIBILITY: {
    PUBLIC: 'public',
    PRIVATE: 'private'
  },

  // Channel types
  CHANNEL_TYPES: {
    TEXT: 'text',
    ANNOUNCEMENTS: 'announcements',
    HELP: 'help',
    GENERAL: 'general'
  },

  // Notification types
  NOTIFICATION_TYPES: {
    COMMUNITY_JOIN_REQUEST: 'community_join_request',
    COMMUNITY_APPROVED: 'community_approved',
    NEW_MESSAGE: 'new_message',
    MARKETPLACE_INTEREST: 'marketplace_interest',
    WEATHER_ALERT: 'weather_alert'
  },

  // Knowledge categories
  KNOWLEDGE_CATEGORIES: {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced'
  },

  // FAQ categories
  FAQ_CATEGORIES: {
    WATERING: 'watering',
    PESTS: 'pests',
    SOIL: 'soil',
    GROWTH: 'growth',
    SEEDS: 'seeds',
    TOOLS: 'tools',
    GENERAL: 'general'
  },

  // Marketplace categories
  MARKETPLACE_CATEGORIES: {
    PLANTS: 'plants',
    SEEDS: 'seeds',
    TOOLS: 'tools',
    COMPOST: 'compost',
    SOIL: 'soil',
    POTS: 'pots',
    OTHER: 'other'
  },

  // Plant locations
  PLANT_LOCATIONS: {
    TERRACE: 'terrace',
    BALCONY: 'balcony',
    INDOOR: 'indoor',
    WINDOW: 'window',
    GARDEN: 'garden'
  },

  // Sunlight requirements
  SUNLIGHT: {
    FULL: 'full',
    PARTIAL: 'partial',
    SHADE: 'shade'
  },

  // Seasons
  SEASONS: {
    SPRING: 'spring',
    SUMMER: 'summer',
    MONSOON: 'monsoon',
    WINTER: 'winter',
    ALL: 'all'
  },

  // Difficulty levels
  DIFFICULTY: {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
  },

  // Default values
  DEFAULTS: {
    PAGE_LIMIT: 10,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    CACHE_TTL: 3600 // 1 hour in seconds
  },

  // Error messages
  ERRORS: {
    UNAUTHORIZED: 'Unauthorized access',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    DUPLICATE_ENTRY: 'Duplicate entry found',
    INVALID_CREDENTIALS: 'Invalid credentials'
  },

  // Success messages
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    OPERATION_SUCCESS: 'Operation completed successfully'
  }
};