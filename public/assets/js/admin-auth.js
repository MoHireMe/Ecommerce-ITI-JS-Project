// Admin authentication script - runs immediately when imported
import { isLoggedIn, checkUserRole } from './auth.js';

// Immediately check if user is logged in
if (!isLoggedIn()) {
  // Stop any further page loading
  document.documentElement.innerHTML = '';
  document.body.innerHTML = '';
  
  // Show alert and redirect
  alert('You need to be logged in to access the admin area.');
  window.location.href = '/login.html';
  throw new Error('Authentication required');
}

// Immediately check if user has admin role
if (!checkUserRole('admin')) {
  // Stop any further page loading
  document.documentElement.innerHTML = '';
  document.body.innerHTML = '';
  
  // Show alert and redirect
  alert('You do not have permission to access the admin area.');
  window.location.href = '/index.html';
  throw new Error('Admin access required');
}

// If execution reaches here, user is authenticated as admin
export default true;
