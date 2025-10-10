import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('Starting main app...');

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
