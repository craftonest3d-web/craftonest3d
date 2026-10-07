import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Global styles
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/globals.css';
import './styles/responsive.css';

// Auth context
import { AuthProvider } from './contexts/AuthContext';

// Cart context
import { CartProvider } from './contexts/CartContext';

// Root App component
import App from './App';

// ── Firebase config guard ──────────────────────────────────────────────────
// If .env is missing, show a helpful setup screen instead of crashing.
const REQUIRED_ENV = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

const missingVars = REQUIRED_ENV.filter((key) => {
  const val = import.meta.env[key] as string | undefined;
  return !val || val.startsWith('your_') || val === 'PLACEHOLDER';
});

if (missingVars.length > 0) {
  document.getElementById('root')!.innerHTML = `
    <div style="font-family:monospace;max-width:680px;margin:60px auto;padding:32px;border:2px solid #ff4f7a;border-radius:12px;background:#fff0f3">
      <h2 style="color:#ff4f7a;margin-top:0">⚠️ PaperNest – Firebase Setup Required</h2>
      <p>The following environment variables are missing or contain placeholder values:</p>
      <ul style="color:#c62828">
        ${missingVars.map((v) => `<li><code>${v}</code></li>`).join('')}
      </ul>
      <hr style="border-color:#ffb3c1">
      <h3 style="color:#0a1128">How to fix:</h3>
      <ol>
        <li>Open <strong>Firebase Console</strong> → <a href="https://console.firebase.google.com/project/papernest-a7ff4/settings/general" target="_blank">Project Settings → Your Apps</a></li>
        <li>Select your Web App (or add one if none exists)</li>
        <li>Copy the <code>firebaseConfig</code> values</li>
        <li>Create a file called <code>.env</code> in the project root with:<br>
          <pre style="background:#fff;padding:12px;border-radius:6px;border:1px solid #ffb3c1;font-size:0.85rem">VITE_FIREBASE_API_KEY=your_actual_key
VITE_FIREBASE_AUTH_DOMAIN=papernest-a7ff4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=papernest-a7ff4
VITE_FIREBASE_STORAGE_BUCKET=papernest-a7ff4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX</pre>
        </li>
        <li>Restart the dev server: <code>npm run dev</code></li>
      </ol>
      <p style="color:#5c677d;font-size:0.85rem">The project ID is <strong>papernest-a7ff4</strong>. Only the API key and sender/app IDs are unique — get them from the Firebase Console link above.</p>
    </div>
  `;
} else {
  // Config looks good — mount the app.
  // NOTE: seeding is now manual via Admin Dashboard "Load Sample Data" button
  // to prevent accidental duplicates on every reload.
// Apply saved theme before render
const savedTheme = localStorage.getItem('pn-theme') ?? 'pink';
document.documentElement.setAttribute('data-theme', savedTheme);

createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </StrictMode>
  );
}
