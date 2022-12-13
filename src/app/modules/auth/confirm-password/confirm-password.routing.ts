import { Route } from '@angular/router';
import { AuthConfirmPasswordComponent } from 'app/modules/auth/confirm-password/confirm-password.component';

export const authConfirmPasswordRoutes: Route[] = [
    {
        path     : '',
        component: AuthConfirmPasswordComponent
    }
];
