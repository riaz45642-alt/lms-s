import './bootstrap';
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import FrontendApp from './FrontendApp';

const root = document.getElementById('app');

if (!root) {
    throw new Error('React mount element #app was not found.');
}

createRoot(root).render(
    <React.StrictMode>
        <FrontendApp />
    </React.StrictMode>,
);
