import './bootstrap';
import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import FrontendApp from './FrontendApp';
import { auth0Config, auth0RedirectUri, AUTH0_REDIRECT_PATH, isAuth0Configured } from './services/auth0Config';

const root = document.getElementById('app');

if (!root) {
    throw new Error('React mount element #app was not found.');
}

// Auth0 appends ?code=&state= to the callback URL; drop them once the SDK has
// consumed them so a refresh does not replay a spent authorization code.
const onRedirectCallback = () => {
    window.history.replaceState({}, '', AUTH0_REDIRECT_PATH);
};

const app = <FrontendApp />;

createRoot(root).render(
    <React.StrictMode>
        {isAuth0Configured ? (
            <Auth0Provider
                domain={auth0Config.domain}
                clientId={auth0Config.clientId}
                authorizationParams={{
                    redirect_uri: auth0RedirectUri(),
                    audience: auth0Config.audience,
                    scope: 'openid profile email',
                }}
                onRedirectCallback={onRedirectCallback}
            >
                {app}
            </Auth0Provider>
        ) : (
            app
        )}
    </React.StrictMode>,
);
