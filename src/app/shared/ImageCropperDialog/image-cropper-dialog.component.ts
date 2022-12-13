import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

@Component({
    selector: 'image-cropper-dialog',
    templateUrl: './image-cropper-dialog.component.html',
    styleUrls: ['./image-cropper-dialog.component.scss'],
})
export class ImageCropperDialogComponent implements OnInit {

    imageChangedEvent: any = '';
    croppedImage: any = '';

    @ViewChild(ImageCropperComponent) imageCropper: ImageCropperComponent;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {
            imgChangedEvent: any
            aspectRatio?: number
            resolution?: number
        },
        public dialogRef: MatDialogRef<ImageCropperDialogComponent>
    ) { }


    ngOnInit(): void {
        this.imageChangedEvent = this.data.imgChangedEvent;
        if (!this.data.aspectRatio) this.data.aspectRatio = 1 / 1;
        if (!this.data.resolution) this.data.resolution = 512; //profile pictures
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }
    cropIt() {
        var dataBase64 = this.croppedImage.replace(/^data:image\/\w+;base64,/, "");
        let blob = this.dataURItoBlob(dataBase64);
        this.closeDialog(blob, dataBase64);
    }

    dataURItoBlob(data): File {

        const byteString = atob(data);
        const arrayBuffer = new ArrayBuffer(byteString.length);
        const int8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([int8Array], { type: 'image/png' });
        var file = new File([blob], "cropped.png", {
            type: "image/png"
        });
        return file;
    }

    imageLoaded() {}

    loadImageFailed() {}

    cropperReady() {}

    closeDialog(file?: File, base64?: string): void {
        if (base64) {
            var dataBase64 = base64.replace(/^data:text\/\w+;base64,/, "");
            let prefix = "data:" + file.type + ";base64,";
            let url = prefix + dataBase64;
            this.dialogRef.close({ file: file, base64: base64, instantURL: url });
        }
        else{
            this.dialogRef.close();
        }

    }

}





