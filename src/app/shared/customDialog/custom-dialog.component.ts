import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'custom-user-dialog',
    templateUrl: './custom-dialog.component.html',
    styleUrls: ['./custom-dialog.component.scss'],
})
export class CustomDialogComponent {

    title: string;
    message: string;
    positiveButton: string;
    negativeButton: string;
    singleButton: boolean;


    constructor(
        public dialogRef: MatDialogRef<CustomDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.title = data.title ? data.title : "";
        this.message = data.message ? data.message : "";
        this.positiveButton = data.positiveButton ? data.positiveButton : "Confirm";
        this.negativeButton = data.negativeButton ? data.negativeButton : "Cancel";
        this.singleButton = data.singleButton ? data.singleButton : false;
    }

    closeDialog(confirm: boolean): void {
        this.dialogRef.close(confirm);
    }
}
