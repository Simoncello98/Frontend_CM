import { Route } from '@angular/router';
import { PrimaryAuthGuard } from '../app/core/auth/guards/primary.auth.guard';
import { AuthGuard } from '../app/core/auth/guards/auth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { InitialDataResolver } from 'app/app.resolvers';



// @formatter:off
// tslint:disable:max-line-length
export const appRoutes: Route[] = [

    {
        path: '',
        pathMatch: 'full',
        canActivate: [PrimaryAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        }
    },
    { path: 'default-signed-in-redirect', pathMatch: 'full', redirectTo: 'users' },

    // Auth routes (guest)
    {
        path: '',
        //TODO: NoAuthGHuard has to check if the user is authenticated and deautenticate it in that case.
        //canActivate: [NoAuthGuard],
        //canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.module').then(m => m.AuthConfirmationRequiredModule) },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.module').then(m => m.AuthForgotPasswordModule) },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.module').then(m => m.AuthResetPasswordModule) },
            { path: 'confirm-password', loadChildren: () => import('app/modules/auth/confirm-password/confirm-password.module').then(m => m.AuthConfirmPasswordModule) },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.module').then(m => m.AuthSignInModule) },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.module').then(m => m.AuthSignUpModule) }
        ]
    },

    // Auth routes (logged in)
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.module').then(m => m.AuthSignOutModule) },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.module').then(m => m.AuthUnlockSessionModule) }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.module').then(m => m.LandingHomeModule) },
        ]
    },

    //App routes
    //Simone: uses initial data resolver defined in app.resolver
    {
        path: '',
        canActivate: [AuthGuard],
        //canActivateChild: [AuthChildGuard], //Simone: uses authChildGuard to activate different modules.
        component: LayoutComponent,
        resolve: {
            initialData: InitialDataResolver
        },
        children: [
            { path: 'users', loadChildren: () => import('app/modules/sections/users/users.module').then(m => m.UsersModule) },
            { path: 'companies', loadChildren: () => import('app/modules/sections/companies/companies.module').then(m => m.CompaniesModule) },
        ]
    },
    //404 url errors
    {
        path: '**',
        pathMatch: 'full',
        canActivate: [PrimaryAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        }
    }
];
