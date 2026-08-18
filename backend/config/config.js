require('dotenv').config();

const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    apiPrefix: '/api'
  },

  // Database Configuration
  database: {
    uri: (process.env.MONGODB_URI || 'mongodb://localhost:27017/agro_rakshak').replace(/^"|"$|^'|'$/g, ''),
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'agro_rakshak_secret_key_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    algorithm: 'HS256'
  },

  // API Keys
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY || '',
    accuweather: process.env.ACCUWEATHER_API_KEY || '',
    agmarknet: process.env.AGMARKNET_API_KEY || ''
  },

  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:3001','https://agro-rakshak.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // File Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    tempDir: process.env.TEMP_DIR || './temp'
  },

  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },

  // Session Configuration
  session: {
    secret: process.env.SESSION_SECRET || 'agro_rakshak_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Email Configuration (for future use)
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASSWORD || ''
    },
    from: process.env.EMAIL_FROM || 'noreply@agrorakshak.com'
  },

  // SMS Configuration (for future use)
  sms: {
    provider: process.env.SMS_PROVIDER || 'twilio',
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    fileLog: process.env.FILE_LOG === 'true',
    logDir: process.env.LOG_DIR || './logs'
  },

  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL) || 3600, // 1 hour in seconds
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD) || 600 // 10 minutes
  },

  // Weather API Configuration
  weather: {
    provider: 'accuweather',
    baseUrl: 'https://dataservice.accuweather.com',
    apiKey: process.env.ACCUWEATHER_API_KEY || '',
    defaultLocation: '202396', // Delhi
    cacheTime: 30 * 60 * 1000 // 30 minutes
  },

   // AI/ML Configuration
   ai: {
     gemini: {
       baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
       model: 'gemini-2.5-flash',
       apiKey: process.env.GEMINI_API_KEY || '',
       maxTokens: 1000,
       temperature: 0.7
     },
     groq: {
       apiKey: process.env.GROQ_API_KEY || '',
       model: 'llama-2-11b-vision',
       maxTokens: 2048,
       temperature: 0.7
     },
    tensorflow: {
      modelPath: process.env.TF_MODEL_PATH || './models/crop_disease_model',
      confidenceThreshold: 0.7
    }
  },

  // Supported Languages
  languages: {
    supported: ['en', 'hi', 'mr', 'ta', 'te', 'gu', 'kn', 'bn', 'pa'],
    default: 'hi',
    codes: {
      en: 'en-US',
      hi: 'hi-IN',
      mr: 'mr-IN',
      ta: 'ta-IN',
      te: 'te-IN',
      gu: 'gu-IN',
      kn: 'kn-IN',
      bn: 'bn-IN',
      pa: 'pa-IN'
    }
  },

  // Crop Categories
  crops: {
    categories: ['Cereal', 'Pulse', 'Vegetable', 'Fruit', 'Cash Crop', 'Spice'],
    seasons: ['Kharif', 'Rabi', 'Zaid']
  },

  // Soil Types
  soil: {
    types: [
      'Alluvial Soil',
      'Black Soil',
      'Red Soil',
      'Laterite Soil',
      'Desert Soil',
      'Mountain Soil',
      'Forest Soil',
      'Peaty Soil'
    ]
  },

  // Pagination
  pagination: {
    defaultLimit: 10,
    maxLimit: 100
  },

  // Security Headers
  security: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  // Feature Flags
  features: {
    weatherForecast: true,
    cropDiagnosis: true,
    soilAnalysis: true,
    marketplace: true,
    voiceAssistant: true,
    multiLanguage: true,
    chatbot: false, // Coming soon
    videoCall: false, // Coming soon
    iotIntegration: false // Coming soon
  },

  // External Services URLs
  externalServices: {
    agmarknet: 'https://agmarknet.gov.in/PriceAndArrivals/DatewiseCommodityReport.aspx',
    weatherApi: 'https://dataservice.accuweather.com',
    geminiApi: 'https://generativelanguage.googleapis.com',
    paymentGateway: process.env.PAYMENT_GATEWAY_URL || ''
  },

  // Error Messages
  errorMessages: {
    serverError: 'Internal server error occurred',
    notFound: 'Resource not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    badRequest: 'Bad request',
    validation: 'Validation error',
    duplicate: 'Resource already exists'
  },

  // Success Messages
  successMessages: {
    created: 'Resource created successfully',
    updated: 'Resource updated successfully',
    deleted: 'Resource deleted successfully',
    fetched: 'Data fetched successfully'
  }
};

// Validation function to check required environment variables
const validateConfig = () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.warn('⚠️  Warning: Missing environment variables:', missingVars.join(', '));
    console.warn('⚠️  Using default values. Please set them in .env file for production.');
  }

  // Warn about missing API keys
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  Warning: GEMINI_API_KEY not set. AI features will not work.');
  }

  if (!process.env.ACCUWEATHER_API_KEY) {
    console.warn('⚠️  Warning: ACCUWEATHER_API_KEY not set. Weather features will use mock data.');
  }
};

// Run validation
if (config.env !== 'test') {
  validateConfig();
}

// Helper function to check if running in production
config.isProduction = () => config.env === 'production';

// Helper function to check if running in development
config.isDevelopment = () => config.env === 'development';

// Helper function to check if running in test
config.isTest = () => config.env === 'test';

// Export configuration
module.exports = config;