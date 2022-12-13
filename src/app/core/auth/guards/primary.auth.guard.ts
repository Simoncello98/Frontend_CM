import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from '../auth.service';
import { switchMap } from 'rxjs/operators';
import { AuthorizationService } from '../../navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class PrimaryAuthGuard implements CanActivate, CanActivateChild, CanLoad
{
    /**
     * Constructor
     *
     * @param {AuthService} _authService
     * @param {Router} _router
     */
    constructor(
        private _authService: AuthService,
        private _authorizationService: AuthorizationService,
        private _router: Router
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check the authenticated status
     *
     * @param redirectURL
     * @private
     */
    private _check(redirectURL): Observable<boolean>
    {
        // Check the authentication status
        return this._authService.check()
                   .pipe(
                       switchMap((authenticated) => {

                        console.log(authenticated)

                           // If the user is not authenticated...
                           if ( !authenticated )
                           {
                               // Redirect to the sign-in page
                               this._router.navigate(['sign-in']);

                               // Prevent the access
                               return of(false);
                           } 
                           else
                           {
                                // Redirect to the main page
                                this._authorizationService.getHomepagePath().then(homepage => {
                                    if (homepage) this._router.navigateByUrl("/" + homepage);
                                    else {
                                        const redirectURL = '/default-signed-in-redirect';
                                        // Navigate to the redirect url
                                        this._router.navigateByUrl(redirectURL);
                                    }
                                })
        
                                // Allow the access
                                return of(true);
                           }
                       })
                   );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can activate
     *
     * @param route
     * @param state
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean
    {
        console.log(state.url)

        let redirectUrl = state.url;

        if ( redirectUrl === '/sign-out' )
        {
            redirectUrl = '/';
        }

        return this._check(redirectUrl)
    }

    /**
     * Can activate child
     *
     * @param childRoute
     * @param state
     */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        let redirectUrl = state.url;

        if ( redirectUrl === '/sign-out' )
        {
            redirectUrl = '/';
        }

        return this._check(redirectUrl);
    }

    /**
     * Can load
     *
     * @param route
     * @param segments
     */
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean
    {
        return this._check('/');
    }
}
