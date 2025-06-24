// src/amplify-config.ts

export const amplifyConfig = {
    Auth: {
        Cognito: {
            //  CDKのOutputから取得した値に置き換える
            userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID, 
            userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        }
    }
};
