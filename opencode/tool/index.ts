/**
 * OpenCode Gemini Tool - Main entry point
 * 
 * This module provides image generation, editing, and analysis capabilities
 * using Google's Gemini AI models, along with environment variable utilities.
 */

// Environment variable utilities
export {
  getApiKey, getEnvVariable,
  getRequiredEnvVariable,
  getRequiredEnvVariables, loadEnvVariables, type EnvLoaderConfig
} from "./env";
