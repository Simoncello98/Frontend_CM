import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DATE_FORMATS, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import * as moment from 'moment';
import { TreoAutogrowModule } from '@treo/directives/autogrow';
import { TreoFindByKeyPipeModule } from '@treo/pipes/find-by-key';
import { SharedModule } from 'app/shared/shared.module';
import { usersRoutes } from 'app/modules/sections/users/users.routing';
import { UsersComponent } from 'app/modules/sections/users/users.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { UsersDetailsComponent } from 'app/modules/sections/users/details/details.component';
import { UsersListComponent } from 'app/modules/sections/users/list/list.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import { MatSortModule } from '@angular/material/sort';
import { VisitorsRequestsDetailsComponent } from './visitorsRequestsDetails/details.component';
import { S3UrlAppendSignatureModule } from '@treo/pipes/s3-url-append-signature';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AmazingTimePickerModule } from 'amazing-time-picker';

@NgModule({
    declarations: [
        UsersComponent,
        UsersListComponent,
        UsersDetailsComponent,
        VisitorsRequestsDetailsComponent
    ],
    imports: [
        RouterModule.forChild(usersRoutes),
        MatButtonModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDividerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatMomentDateModule,
        MatProgressBarModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatTableModule,
        MatTooltipModule,
        TreoAutogrowModule,
        TreoFindByKeyPipeModule,
        SharedModule,
        MatDialogModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        S3UrlAppendSignatureModule,
        MatSortModule,
        MatButtonToggleModule,
        MatPaginatorModule,
        AmazingTimePickerModule
    ],
    providers: [
        {
            provide: MAT_DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: moment.ISO_8601
                },
                display: {
                    dateInput: 'LL',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY'
                }
            }
        }
    ],
    exports: [
        MatDialogModule
    ]
})
export class UsersModule {
}
