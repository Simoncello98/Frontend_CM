import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ErrorManagerComponent } from './HTTPErrorsManager/error-manager.component';
import { FilterChipsComponent } from './filterChips/filter-chips';

// External Components
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';

// Components
import { DeleteDialogComponent } from './deleteDialog/delete-dialog.component';
import { UpdateDialogComponent } from './updateDialog/update-dialog.component';
import { CustomDialogComponent } from './customDialog/custom-dialog.component';
import { SelectFromApiComponent } from './selectfromapi/select-from-api.component';
import { ImageCropperDialogComponent } from './ImageCropperDialog/image-cropper-dialog.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { UniqueCoursesModule } from './uniqueCourses/unique-courses.module';
import { DebounceClickDirective } from './debounce-click.directive';
import { SafePipe } from './safe.pipe';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessageDialogComponent } from './dialog/dialog.component';

const sharedComponents = [
    DeleteDialogComponent,
    UpdateDialogComponent,
    SelectFromApiComponent,
    ErrorManagerComponent,
    ImageCropperDialogComponent,
    FilterChipsComponent,
    CustomDialogComponent,
    MessageDialogComponent
];

@NgModule({
    declarations: [
        ...sharedComponents,
        DebounceClickDirective,
        SafePipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        NgxMatSelectSearchModule,
        ImageCropperModule,
        MatChipsModule,
        MatAutocompleteModule,
        UniqueCoursesModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatProgressSpinnerModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        NgxMatSelectSearchModule,
        ImageCropperModule,
        UniqueCoursesModule,
        ...sharedComponents,
        DebounceClickDirective,
        SafePipe
    ]
})
export class SharedModule {
}
