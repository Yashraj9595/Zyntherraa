#!/usr/bin/env node

// Simple build script for deployment environments
// This script installs TypeScript if not available and then runs the build

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Check if tsc is available
  execSync('tsc --version', { stdio: 'pipe' });
  console.log('TypeScript compiler found, running build...');
} catch (error) {
  console.log('TypeScript compiler not found, installing...');
  // Install TypeScript locally
  execSync('npm install typescript ts-node', { stdio: 'inherit' });
}

// Run the TypeScript build
console.log('Building TypeScript files...');
execSync('tsc', { stdio: 'inherit' });

console.log('Build completed successfully!');