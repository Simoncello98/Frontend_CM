import { NgModule } from '@angular/core';
import { S3KeyToUrlPipe } from '@treo/pipes/s3-key-to-url/s3-key-to-url.pipe';

@NgModule({
    declarations: [
        S3KeyToUrlPipe
    ],
    exports     : [
        S3KeyToUrlPipe
    ]
})
export class S3KeyToUrlPipeModule
{
}
