// Use standard CommonJS require so Vercel's bundler doesn't rewrite the extension
const app = require("../dist/vercel.cjs");

// Export the express app for Vercel's serverless runtime
module.exports = app.default || app;
