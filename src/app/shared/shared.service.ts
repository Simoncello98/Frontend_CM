import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Injectable } from '@angular/core';
import { ErrorManagerComponent } from './HTTPErrorsManager/error-manager.component';

@Injectable({
    providedIn: 'root'
})
export class SharedService {

    dialogRef: MatDialogRef<ErrorManagerComponent>;

    constructor(private dialog: MatDialog) { }
    
    public openErrorDialog(response : any): Observable<any> {
        this.dialogRef = this.dialog.open(ErrorManagerComponent);
        this.dialogRef.componentInstance.error = response;
        return this.dialogRef.afterClosed();
        // Nothing can live after afterClosed.
      }
}