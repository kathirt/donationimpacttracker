/**
 * Environment configuration validation utilities
 */

interface EnvironmentConfig {
  azureMapsClientId?: string;
  azureOpenAIEndpoint?: string;
  azureOpenAIKey?: string;
  azureOpenAIDeployment?: string;
  apiBaseUrl?: string;
  environment?: string;
}

/**
 * Validates environment configuration
 */
export const validateEnvironment = (): EnvironmentConfig => {
  const config: EnvironmentConfig = {
    azureMapsClientId: process.env.REACT_APP_AZURE_MAPS_CLIENT_ID,
    azureOpenAIEndpoint: process.env.REACT_APP_AZURE_OPENAI_ENDPOINT,
    azureOpenAIKey: process.env.REACT_APP_AZURE_OPENAI_KEY,
    azureOpenAIDeployment: process.env.REACT_APP_AZURE_OPENAI_DEPLOYMENT,
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL,
    environment: process.env.REACT_APP_ENVIRONMENT || 'development'
  };

  // Log warnings for missing configurations
  const warnings: string[] = [];

  if (!config.azureMapsClientId) {
    warnings.push('REACT_APP_AZURE_MAPS_CLIENT_ID is not set - Map features may be limited');
  }

  if (!config.azureOpenAIEndpoint) {
    warnings.push('REACT_APP_AZURE_OPENAI_ENDPOINT is not set - AI features will use mock data');
  }

  if (!config.azureOpenAIKey) {
    warnings.push('REACT_APP_AZURE_OPENAI_KEY is not set - AI features will use mock data');
  }

  if (!config.apiBaseUrl) {
    warnings.push('REACT_APP_API_BASE_URL is not set - Using default /api endpoint');
  }

  if (warnings.length > 0 && config.environment !== 'development') {
    console.warn('Environment configuration warnings:', warnings);
  }

  return config;
};

/**
 * Checks if the application is running in development mode
 */
export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

/**
 * Checks if the application is running in production mode
 */
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Gets the API base URL with fallback
 */
export const getApiBaseUrl = (): string => {
  return process.env.REACT_APP_API_BASE_URL || '/api';
};
