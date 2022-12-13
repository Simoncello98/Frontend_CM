import { NgModule } from '@angular/core';
import { S3UrlAppendSignature } from './s3-url-append-signature.pipe';

@NgModule({
    declarations: [
        S3UrlAppendSignature
    ],
    exports     : [
        S3UrlAppendSignature
    ]
})
export class S3UrlAppendSignatureModule
{
}
