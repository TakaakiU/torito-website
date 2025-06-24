// src/App.tsx

import './App.css';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { HomePage } from './components/HomePage';

function App() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <HomePage signOut={signOut} />
      )}
    </Authenticator>
  );
}

export default App;