import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ExtraOptions, PreloadAllModules, RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { TreoModule } from '@treo';
import { TreoConfigModule } from '@treo/services/config';
import { CoreModule } from 'app/core/core.module';
import { appConfig } from 'app/core/config/app.config';
import { LayoutModule } from 'app/layout/layout.module';
import { AppComponent } from 'app/app.component';
import { appRoutes } from 'app/app.routing';

/* Add Amplify imports */
import { AmplifyUIAngularModule } from '@aws-amplify/ui-angular';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { ImageCropperModule } from 'ngx-image-cropper';
import { QuillModule } from 'ngx-quill';

const routerConfig: ExtraOptions = {
    scrollPositionRestoration: 'enabled',
    preloadingStrategy: PreloadAllModules
};

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes, routerConfig),

        // Treo & Treo Mock API
        TreoModule,
        TreoConfigModule.forRoot(appConfig),
        //TreoMockApiModule.forRoot(mockDataServices),


        // Core
        CoreModule,

        // Layout
        LayoutModule,

        // 3rd party modules
        MarkdownModule.forRoot({}),

        // Amplify UI Modules
        AmplifyUIAngularModule,

        //timepicker library
        NgxMaterialTimepickerModule,

        ImageCropperModule,
        QuillModule.forRoot()




    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
