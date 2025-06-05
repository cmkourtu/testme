import React from 'react';
import { createRoot } from 'react-dom/client';
import { initAnonUser } from './auth';
import { UploadWizard } from './UploadWizard';

initAnonUser();

const root = createRoot(document.getElementById('root')!);
root.render(<UploadWizard />);
