
import { AwsClient } from 'aws4fetch'

export class S3ApiService {
    static s3 : AwsClient | null = null; //will be filled after login with amplify
    static creds : any;
    static sign(creds? : any){
        if(creds) S3ApiService.creds = creds;
        S3ApiService.s3 = new AwsClient({
            accessKeyId: S3ApiService.creds.accessKeyId,     //˘ required, akin to AWS_ACCESS_KEY_ID
            secretAccessKey: S3ApiService.creds.secretAccessKey, // required, akin to AWS_SECRET_ACCESS_KEY
            sessionToken: S3ApiService.creds.sessionToken,    // akin to AWS_SESSION_TOKEN if using temp credentials
            service: 's3',         // AWS service, by default parsed at fetch time
            region: 'eu-central-1',          // AWS region, by default parsed at fetch time
        })
    }
}