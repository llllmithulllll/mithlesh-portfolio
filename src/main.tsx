import React from 'react';
import { createRoot } from 'react-dom/client';
import Desktop from './ui/Desktop';
import PortfolioAdmin from './ui/PortfolioAdmin';
import './style.css';
import './scroll.css';
import './taskbar.css';
import './desktop-theme.css';
import './xp-theme.css';
import './content-editor.css';
import './admin.css';

createRoot(document.getElementById('root')!).render(<React.StrictMode>{window.location.pathname.replace(/\/$/,'')==='/admin'?<PortfolioAdmin/>:<Desktop/>}</React.StrictMode>);
