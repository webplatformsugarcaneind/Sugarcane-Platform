import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n';
import App from './App.jsx'
import { initializeAuthSession } from './utils/authSession.js';

console.log('Starting main app...');

// Initialize authentication session before rendering app
// This restores JWT token headers from localStorage if they exist
// Prevents users from being logged out on page refresh
initializeAuthSession();

// ============================================================================
// FIX FOR REACT + GOOGLE TRANSLATE CRASHES
// Google Translate wraps text nodes in <font> tags. When React tries to update
// or unmount those nodes, it expects the original DOM structure and crashes
// with "Failed to execute 'removeChild' on 'Node'". This intercepts those 
// calls to safely ignore the mismatched DOM structure.
// ============================================================================
if (typeof Node === 'function' && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child.parentNode !== this) {
      if (console) {
        console.warn('Google Translate React Fix: Ignored removeChild on mismatched parent', child, this);
      }
      return child;
    }
    return originalRemoveChild.apply(this, arguments);
  };
  
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console) {
        console.warn('Google Translate React Fix: Ignored insertBefore on mismatched parent', referenceNode, this);
      }
      return newNode;
    }
    return originalInsertBefore.apply(this, arguments);
  };
}

let root;
try {
  root = createRoot(document.getElementById('root'));
  console.log('Root created successfully');

  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error during rendering:', error);
  // Fallback to simple test if main app fails
  import('./SimpleTest.jsx').then(SimpleTest => {
    if (!root) {
      root = createRoot(document.getElementById('root'));
    }
    root.render(<SimpleTest.default />);
  });
}
