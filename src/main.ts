import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

import Amplify, { API, Auth } from 'aws-amplify';
export const production = false

export function getBaseApiPath(): string {
    if(production) return "cm-backend-dev"
    else return "cm-backend-test"
}

const AmplifyCFGProd = {
    //  // OPTIONAL - if your API requires authentication 
    //  Auth: {
    //     identityPoolId: 'eu-central-1:841467ff-737c-4595-adb2-47b2f9b8df32',
    //     // REQUIRED - Amazon Cognito Region
    //     region: 'eu-central-1',
    //     // OPTIONAL - Amazon Cognito User Pool ID
    //     userPoolId: 'eu-central-1_cUzvIpcuW',
    //     // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
    //     userPoolWebClientId: '2uqjafq2u1kf6f8mce741s0tcv',
    //     serviceName:'s3'        
    // },
    // API: {
    //     endpoints: [
    //         {
    //             name: 'cm-backend-test',
    //             endpoint: 'https://9miv6qq1r8.execute-api.eu-central-1.amazonaws.com/test/',
    //             region: 'eu-central-1'
    //         }
    //     ]
    // }
};

const AmplifyCFGTest = {
    // OPTIONAL - if your API requires authentication 
    Auth: {
        identityPoolId: 'eu-central-1:841467ff-737c-4595-adb2-47b2f9b8df32',
        // REQUIRED - Amazon Cognito Region
        region: 'eu-central-1',
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'eu-central-1_cUzvIpcuW',
        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '2uqjafq2u1kf6f8mce741s0tcv',
        serviceName:'s3'        
    },
    API: {
        endpoints: [
            {
                name: 'cm-backend-test',
                endpoint: 'https://9miv6qq1r8.execute-api.eu-central-1.amazonaws.com/test/',
                region: 'eu-central-1'
            }
        ]
    }
};

//do it anyway.
enableProdMode()

if(production) 
    Amplify.configure(AmplifyCFGProd);
else
    Amplify.configure(AmplifyCFGTest);

Amplify.register(Auth);
Amplify.register(API);