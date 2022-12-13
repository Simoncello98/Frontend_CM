import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TreoCardModule } from '@treo/components/card';
import { TreoMessageModule } from '@treo/components/message';
import { SharedModule } from 'app/shared/shared.module';
import { AuthConfirmPasswordComponent } from 'app/modules/auth/confirm-password/confirm-password.component';
import { authConfirmPasswordRoutes } from 'app/modules/auth/confirm-password/confirm-password.routing';

@NgModule({
    declarations: [
        AuthConfirmPasswordComponent
    ],
    imports     : [
        RouterModule.forChild(authConfirmPasswordRoutes),
        MatButtonModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        TreoCardModule,
        TreoMessageModule,
        SharedModule
    ]
})
export class AuthConfirmPasswordModule
{
}
