/*!
* Contentstack DataSync Manager
* Centralized Messages and Logging Constants
* Copyright (c) 2025 Contentstack LLC
* MIT Licensed
*/

/**
 * @description Centralized messages for logging and error handling
 * This file contains all user-facing messages, debug logs, and error messages
 * for consistency and easier maintenance.
 */

export const MESSAGES = {
  // Network connectivity messages (inet.ts)
  INET: {
    INITIATED: (timeout: number) => `inet initiated. Waiting ${timeout} ms before checking connectivity.`,
    CHECKING: 'Checking network connectivity...',
    CHECK_FAILED: (err: any) => `Network connectivity check failed: ${err}`,
    CLEANUP_SUCCESS: 'Network check successful. Cleaning up connection.',
    CLEANUP_ERROR: 'Network check failed. Cleaning up connection.',
    PINGING: (host: string, timeout: number) => `Pinging ${host} in ${timeout} ms`,
    DISCONNECTED: 'The network connection was lost.',
  },

  // Process management messages (process.ts)
  PROCESS: {
    SHUTDOWN: (signal: string, duration: number) => `Received ${signal}. Shutting down the process in ${duration} ms.`,
    UNHANDLED_ERROR: 'An unexpected error occurred. Locking the process for 10 seconds to recover.',
  },

  // API messages (api.ts)
  API: {
    REQUEST: (method: string, path: string) => `${method.toUpperCase()}: ${path}`,
    STATUS: (code: number) => `Status: ${code}.`,
    RATE_LIMIT: (path: string, delay: number) => `API rate limit exceeded. Retrying ${path} after a ${delay} ms delay.`,
    RETRY: (path: string, delay: number) => `Retrying ${path} after a ${delay} ms delay.`,
    REQUEST_FAILED: (options: any) => `Request failed.\n${JSON.stringify(options)}`,
    REQUEST_TIMEOUT: (path: string) => `Request timeout for ${path || 'unknown'}`,
    REQUEST_ERROR: (path: string, message: string, code: string) => 
      `Request error for ${path || 'unknown'}: ${message || 'Unknown error'} (${code || 'NO_CODE'})`,
    SOCKET_HANGUP_RETRY: (path: string, delay: number, attempt: number, max: number) => 
      `Socket hang up detected. Retrying ${path || 'unknown'} with ${delay} ms delay (attempt ${attempt}/${max})`,
  },

  // Plugin messages (plugins.ts)
  PLUGINS: {
    LOAD_CALLED: 'Initializing plugin load...',
    METHOD_LOADED: (method: string, name: string) => `${method} loaded from ${name} successfully!`,
    METHOD_NOT_FOUND: (method: string, name: string) => `${method} not found in ${name}.`,
    LOAD_SUCCESS: 'All plugins loaded successfully.',
    LOAD_ERROR: 'An error occurred while loading plugins.',
    LOAD_ERROR_DETAIL: (message: string) => `Failed to load plugins: ${message}`,
  },

  // Sync core messages (core/index.ts)
  SYNC_CORE: {
    START: 'Sync core: Start invoked.',
    ENVIRONMENT: (env: string) => `Current environment: ${env}`,
    TOKEN_FOUND: 'Sync token found in the checkpoint file:',
    TOKEN_USING: 'Using sync token:',
    FILE_NOT_FOUND: (path: string) => `File not found: ${path}`,
    FILE_READ_ERROR: (err: any) => `An error occurred while reading the file: ${err}`,
    POKE_INVOKED: 'Poke command invoked.',
    POKE_NOTIFICATION: 'Received "contentstack sync" notification.',
    POKE_ERROR: 'Error during poke operation.',
    CHECK_CALLED: (sqStatus: boolean, wqStatus: boolean) => 
      `Check initiated. SQ status: ${sqStatus}, WQ status: ${wqStatus}.`,
    CHECK_COMPLETE: (cooloff: number) => 
      `Sync completed. SQ flag updated. Cooloff duration: ${cooloff}.`,
    CHECK_ERROR: 'Error during check operation.',
    CHECK_RECOVERED: 'Check recovered from errors.',
    CHECK_FAILED: 'Check failed due to an error.',
    SYNC_STARTED: 'Sync process started.',
    SYNC_TOKEN_OBJECT: 'Token object received for sync.',
    SYNC_ERROR: 'Error during sync operation.',
    SYNC_LOCKED: 'Contentstack sync is locked.',
    SYNC_UNLOCKED: 'Contentstack sync is unlocked.',
    FIRE_CALLED: (req: any) => `Fire operation triggered with: ${JSON.stringify(req)}`,
    FIRE_COMPLETE: (itemCount: number) => `Fire operation completed. Items received: ${itemCount}.`,
    API_CALL_CT: (uid: string) => `API call initiated for content type: ${uid}.`,
    ERROR_MAP: 'Debug [map]: Failed to fetch content type schema.',
    ERROR_MAP_RESOLVE: 'Debug [mapResolve]: Unable to resolve mapping.',
    ERROR_FILTER_ITEMS: 'Debug [filterItems]: Unable to filter items.',
    ERROR_FIRE: 'Debug during fire operation.',
    REFIRE_CALLED: (req: any) => `Re-fire operation triggered with: ${JSON.stringify(req)}`,
    CHECKPOINT_LOCKDOWN: 'Checkpoint: lockdown has been invoked',
  },

  // Main index messages (index.ts)
  INDEX: {
    ASSET_STORE_INIT: 'Asset store instance initialized successfully.',
    CONTENT_STORE_INIT: 'Content store instance initialized successfully.',
    SYNC_MANAGER_INIT: 'Sync manager initialized successfully.',
    SYNC_UTILITY_STARTED: 'Contentstack sync utility started successfully.',
    NOTIFICATION: (action: string, item: any) => `Notification received: ${action} – ${JSON.stringify(item)}`,
  },

  // Token management messages (token-management.ts)
  TOKEN: {
    CHECKPOINT_READ: (path: string) => `Checkpoint read from file: ${path}`,
    TOKEN_READ: (path: string) => `Token retrieved: ${path}`,
    SAVE_TOKEN: (name: string) => `Saving token with name: ${name}`,
    SAVE_CHECKPOINT: (name: string) => `Saving checkpoint token with name: ${name}`,
    LEDGER_CHECK: (file: string, exists: boolean) => `Ledger file check: ${file} exists? → ${exists}`,
  },

  // Queue messages (q.ts)
  QUEUE: {
    CONSTRUCTOR: 'Core \'Q\' constructor initiated.',
    CONTENT_TYPE_RECEIVED: (ctUid: string, type: string) => 
      `Received content type '${ctUid}' for '${type}'`,
    ERROR_HANDLER_CALLED: (obj: any) => `Error handler invoked with: ${JSON.stringify(obj)}`,
    ERROR_IN_HANDLER: 'An error occurred in the error handler.',
    NEXT_CALLED: (inProgress: boolean, qLength: number) => 
      `Calling 'next'. Current progress status: ${inProgress}, Queue length: ${qLength}.`,
    EXECUTING: (data: any) => `Executing queue item: ${JSON.stringify(data)}`,
    BEFORE_PLUGINS: 'Before-action plugins executed successfully.',
    ACTION_COMPLETE: (action: string) => `Completed '${action}' on connector successfully.`,
    CONNECTOR_CALLED: 'Connector instance invoked successfully.',
    AFTER_PLUGINS: 'After-action plugins executed successfully.',
  },

  // File system messages (fs.ts)
  FS: {
    WRITE_FILE: (path: string) => `Writing file to: ${path}`,
    READ_FILE: (path: string) => `Reading file from: ${path}`,
    READ_FILE_SYNC: (path: string) => `Reading file synchronously from: ${path}`,
    MKDIR: (path: string) => `Creating directory: ${path}`,
    INVALID_READ: (path: string) => `Invalid 'read' operation on file. Expected ${path} to be of type 'file'!`,
  },

  // Utility messages (util/index.ts)
  UTIL: {
    ITEM_TYPE_MISMATCH: 'The item\'s type did not match any expected case.',
    ITEM_SERIALIZED: (item: any) => `Serialized item: ${JSON.stringify(item)}`,
    ONLY_ASSETS: (lastCt: string) => 
      `Only assets were found in the SYNC API response. Last content type: ${lastCt}.`,
    ONLY_CT_EVENTS: (lastCt: string) => 
      `Only content type events were found in the SYNC API response. Last content type: ${lastCt}.`,
    ASSETS_AND_CT: (lastCt: string) => 
      `Assets and content types were found in the SYNC API response. Last content type: ${lastCt}.`,
    MIXED_CT: (lastCt: string) => 
      `Mixed content types were found in the SYNC API response. Last content type: ${lastCt}.`,
    FILE_NOT_TYPE: (file: string) => `${file} is not of type file`,
    UNABLE_TO_FIND_PLUGIN: (plugin: any) => `Unable to find plugin: ${JSON.stringify(plugin)}`,
    PLUGIN_PATH_NOT_EXIST: (path: string) => `${path} does not exist!`,
  },

  // Unprocessible items messages (unprocessible.ts)
  UNPROCESSIBLE: {
    WRITE_FAILED: (data: any, file: string, error: any) => 
      `Failed to write data to ${file}: ${JSON.stringify(data)}. Error: ${error}`,
    READ_FAILED: (path: string) => `Failed to read file from: ${path}`,
    WRITE_OBJECT_FAILED: (file: string, data: any, error: any) => 
      `Failed to write object to ${file}: ${JSON.stringify(data)}. Error: ${error}`,
  },
}

/**
 * @description Logger level constants
 */
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  LOG: 'log',
}

/**
 * @description Error codes
 */
export const ERROR_CODES = {
  ILLEGAL_CONTENT_TYPE_CALL: 'ICTC',
  INVALID_OPERATION_ON_READ_FILE: 'IOORF',
  INVALID_OPERATION_ON_READ_FILE_SYNC: 'IOORFS',
  MAX_RETRY_LIMIT_EXCEEDED: 'Max retry limit exceeded!',
  REQUEST_TIMEOUT: 'Request timeout',
}

