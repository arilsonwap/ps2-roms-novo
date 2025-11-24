// ✅ metro.config.js — compatível com Node.js e Expo SDK 54
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = config;
