const { body, validationResult } = require('express-validator');

// User registration validation
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('gardeningLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Invalid gardening level'),
  
  body('phone')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number')
];

// User login validation
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Community creation validation
const communityValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Community name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Community name must be between 3 and 50 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('visibility')
    .optional()
    .isIn(['public', 'private'])
    .withMessage('Invalid visibility setting'),
  
  body('category')
    .optional()
    .isIn(['general', 'vegetables', 'herbs', 'flowers', 'organic', 'tools', 'regional'])
    .withMessage('Invalid category')
];

// Marketplace item validation
const marketplaceItemValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['plants', 'seeds', 'tools', 'compost', 'soil', 'pots', 'other'])
    .withMessage('Invalid category'),
  
  body('type')
    .notEmpty()
    .withMessage('Type is required')
    .isIn(['sell', 'buy', 'exchange'])
    .withMessage('Invalid type'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('contactMethod')
    .optional()
    .isIn(['email', 'phone', 'in-app'])
    .withMessage('Invalid contact method')
];

// Plant validation
const plantValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Plant name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Plant name must be between 2 and 50 characters'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Plant type is required'),
  
  body('datePlanted')
    .notEmpty()
    .withMessage('Planting date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('location')
    .notEmpty()
    .withMessage('Location is required')
    .isIn(['terrace', 'balcony', 'indoor', 'window', 'garden'])
    .withMessage('Invalid location'),
  
  body('sunlight')
    .notEmpty()
    .withMessage('Sunlight requirement is required')
    .isIn(['full', 'partial', 'shade'])
    .withMessage('Invalid sunlight requirement')
];

// Message validation
const messageValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  communityValidation,
  marketplaceItemValidation,
  plantValidation,
  messageValidation,
  validate
};