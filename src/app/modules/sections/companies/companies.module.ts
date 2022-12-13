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
import { companiesRoutes } from 'app/modules/sections/companies/companies.routing';
import { CompaniesComponent } from 'app/modules/sections/companies/companies.component';
import { CompaniesDetailsComponent } from 'app/modules/sections/companies/details/details.component';
import { CompaniesListComponent } from 'app/modules/sections/companies/list/list.component';
import { MatDialogModule } from '@angular/material/dialog';
import { S3UrlAppendSignatureModule } from '@treo/pipes/s3-url-append-signature';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
    declarations: [
        CompaniesComponent,
        CompaniesListComponent,
        CompaniesDetailsComponent,
    ],
    imports: [
        RouterModule.forChild(companiesRoutes),
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
        S3UrlAppendSignatureModule,
        MatSortModule
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
export class CompaniesModule {
}
