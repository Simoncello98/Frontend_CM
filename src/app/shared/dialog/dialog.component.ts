import { Component, Inject, ViewEncapsulation, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { SharedService } from 'app/shared/shared.service';
import { S3UrlAppendSignature } from '@treo/pipes/s3-url-append-signature';
import FileSaver from 'file-saver';


@Component({
    selector: "message-dialog",
    templateUrl: "./dialog.component.html",
    styleUrls: ["./dialog.component.scss"],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class MessageDialogComponent implements OnInit {
    @ViewChild("dialogContent") dialogContent : any;

    private dialogType: string;
    isChecked: boolean = false;

    actualNumber = 0;
    poolSize = 0;

    constructor(
        private dialogRef: MatDialogRef<MessageDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private sharedService: SharedService,
        private s3Signature: S3UrlAppendSignature,
    ) {
        this.setType(data);

        this.actualNumber = data?.actualDirectiveNum;
        this.poolSize = data?.sizeDirectives;
    }

    /*
        HOOKS
    */


    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.dialogContent.nativeElement.innerHTML = this.data.message.Content;
    }

    onCheckChange(event : MatCheckboxChange): void {
        this.isChecked = event.checked;
    }

    close(): void {
        this.dialogRef.close();   
    }

    setType(data: any) : void {
        (!data.type) ? this.dialogType = "default" : this.dialogType = data.type; 
        (this.dialogType == "boot" && data.message.MandatoryAck) ? this.dialogRef.disableClose = true : this.dialogRef.disableClose = false;
    }

    getType() : string {
        return this.dialogType;
    }

    sendConfirmation(message: any): void {
    }

    downloadAllFile(files: File[]): void {
    
    }

    downloadFile(name: string, url: string) : void {
    }
}