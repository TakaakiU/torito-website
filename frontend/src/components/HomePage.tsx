// src/components/HomePage.tsx

import { useEffect, useState } from 'react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { FetchUserAttributesOutput } from 'aws-amplify/auth';

interface HomePageProps {
  signOut: (() => void) | undefined;
}

export function HomePage({ signOut }: HomePageProps) {
  const [userAttributes, setUserAttributes] = useState<FetchUserAttributesOutput | null>(null);

  useEffect(() => {
    const handleFetchUserAttributes = async () => {
      try {
        const attributes = await fetchUserAttributes();
        setUserAttributes(attributes);
      } catch (e) {
        console.error('Failed to fetch user attributes:', e);
      }
    };
    handleFetchUserAttributes();
  }, []);

  return (
    <div className="homepage-container">
      <h1 className="homepage-heading">
        Welcome Back
      </h1>
      <p className="homepage-subheading">
        {userAttributes?.email || '...'}
      </p>
      
      <button className="signout-button" onClick={signOut}>
        Sign Out
      </button>
    </div>
  );
}