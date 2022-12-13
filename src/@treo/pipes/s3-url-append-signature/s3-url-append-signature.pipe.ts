import { OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { ImageCacheService } from 'app/shared/image.cache.service';
import { API } from 'aws-amplify';
import { Subject } from 'rxjs';
import { S3ApiService } from '../../../app/core/s3ApiAdapter/s3-api.service';

/**
 * 
 */
@Pipe({
    name: 'S3UrlAppendSignature',
    pure: true
})
export class S3UrlAppendSignature implements PipeTransform, OnDestroy {
    constructor(private ics: ImageCacheService) { }

    ngOnDestroy(): void { }

    private blobToDataURL(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {return callback(e.target.result);}
        a.readAsDataURL(blob);
    }

    private getResult(blob: Blob, startURL: string, from: string): Promise<any> {
        let result = new Subject();
        this.blobToDataURL(blob , (url) => {
            result.next(url);
            result.complete();
            this.ics.setCachedImage(startURL, blob)
        })
        return result.toPromise().then((url) => {
            return url;
        });
    }

    // transform(startURL: string): Promise<any> {
    //     if(!startURL) return "" as any;
    //     let url = startURL;

    //     const cachedBlob = this.ics.getCachedImage(startURL)
    //     if(cachedBlob != null) return this.getResult(cachedBlob, startURL, 'cache')
    //     else return S3ApiService.s3.fetch(url, {
    //         //it uses crypto, so if you are not in localhost it will not works!!
    //         method: 'GET',  // if not supplied, will default to 'POST' if there's a body, otherwise 'GET'
    //         headers: {}, // standard JS object literal, or Headers instance
    //         body: null,    // optional, String or ArrayBuffer/ArrayBufferView – ie, remember to stringify your JSON
    //     }).then(async r => {
    //         return this.getResult(await r.blob(), startURL, 's3')
    //     })
    //     // return API.get(getBaseApiPath(), endPoint, {
    //     //     queryStringParameters: {
    //     //         key: bucketKey
    //     //     }
    //     // }).then((photoData) => {
    //     //     return photoData.presignedUrl;
    //     // });
    // }

    transform(startURL: string): Promise<any> {
        if(!startURL) return "" as any;
        //let url = startURL;

        const cachedBlob = this.ics.getCachedImage(startURL)
        if(cachedBlob != null) return this.getResult(cachedBlob, startURL, 'cache')
        else return this.getFetchedImage(startURL,0);
        // return API.get(getBaseApiPath(), endPoint, {
        //     queryStringParameters: {
        //         key: bucketKey
        //     }
        // }).then((photoData) => {
        //     return photoData.presignedUrl;
        // });
    }


    private getFetchedImage(url: string, rCount: number): Promise<any>{
      //  let result = new Subject<Promise<any>>();
        return S3ApiService.s3.fetch(url, {
            //it uses crypto, so if you are not in localhost it will not works!!
            method: 'GET',  // if not supplied, will default to 'POST' if there's a body, otherwise 'GET'
            headers: {}, // standard JS object literal, or Headers instance
            body: null,    // optional, String or ArrayBuffer/ArrayBufferView – ie, remember to stringify your JSON
        }).catch(error => {
            //if error then resign and download again.
            if(rCount < 1) { //try just for two times. no loops
                S3ApiService.sign();
                return this.getFetchedImage(url,rCount+1);
            }
        }).then(async r => {
            return this.getResult(await r.blob(), url, 's3');
             //result.next(this.getResult(await r.blob(), url, 's3'))
        })
    
    }
}



