const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add 'ogg' to the list of supported asset extensions so Metro can bundle them
config.resolver.assetExts.push('ogg');

module.exports = config;
