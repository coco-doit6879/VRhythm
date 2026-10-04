import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import './theme.css';
import './ui-refinements.css';
import './components/landing/landing.css';
import './components/explore-editorial.css';
import './components/instrument-story.css';
import './components/learning-editorial.css';
import './components/support-editorial.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
