// profile-auth.js - Authentication for profile pages
import { isLoggedIn, getCurrentUser, checkUserRole } from '../auth.js';

// Function to check if user is authenticated and is a customer
export function authenticateCustomer() {
  // Check if user is logged in
  if (!isLoggedIn()) {
    alert('Authentication Status: Not logged in. You need to be logged in to access this page');
    window.location.href = '../../login.html';
    return false;
  }
  
  // Check if user is a customer
  const user = getCurrentUser();
  if (!checkUserRole('customer')) {
    alert('Authentication Status: Logged in but not a customer. Only customers can access this page');
    window.location.href = '../../index.html';
    return false;
  }
  
  // User is logged in and is a customer
 
  return true;
}

// Run authentication check when script is loaded
document.addEventListener('DOMContentLoaded', () => {
  authenticateCustomer();
});
