import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'error-banner',
    templateUrl: './error-manager.component.html',
    styleUrls: ['./error-manager.component.scss'],
})
export class ErrorManagerComponent {

    public error : any;

    constructor(
        public dialogRef: MatDialogRef<ErrorManagerComponent>
    ) { }

    closeDialog(): void {
        this.dialogRef.close();
    }

}





