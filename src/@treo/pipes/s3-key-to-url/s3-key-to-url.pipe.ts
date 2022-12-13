import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { API } from 'aws-amplify';
import { getBaseApiPath } from 'main';

/**
 * Converts bucket key to a presiged URL
 */
@Pipe({
    name: 'S3KeyToUrl',
    pure: true
})
export class S3KeyToUrlPipe implements PipeTransform, OnDestroy {
    constructor() { }

    ngOnDestroy(): void { }

    transform(bucketKey: string, endPoint: string): Promise<string> {
        return API.get(getBaseApiPath(), endPoint, {
            queryStringParameters: {
                key: bucketKey
            }
        }).then((photoData) => {
            return photoData.presignedUrl;
        });
    }
}



