import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'delete-user-dialog',
    templateUrl: './update-dialog.component.html',
    styleUrls: ['./update-dialog.component.scss'],
})
export class UpdateDialogComponent {
    message: string;
    
    constructor(
        public dialogRef: MatDialogRef<UpdateDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        this.message = data.message ? data.message : '';
    }

    closeDialog(confirm: boolean): void {
        this.dialogRef.close(confirm);
    }
}
