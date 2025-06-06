import React from 'react';
import { createRoot } from 'react-dom/client';
import { initAnonUser } from './auth';
import { ObjectivesPage } from './ObjectivesPage';
import './style.css';

initAnonUser();

const root = createRoot(document.getElementById('root')!);
root.render(<ObjectivesPage />);
