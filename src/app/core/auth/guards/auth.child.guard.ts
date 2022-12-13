import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { Auth } from 'aws-amplify';
import { AuthorizationService } from 'app/core/navigation/navigation.service';

@Injectable({
    providedIn: 'root'
})
export class AuthChildGuard implements CanActivate, CanActivateChild, CanLoad {

    /**
     * Constructor
     * @param {AuthService} _authService
     * @param {Router} _router
     */
    constructor(
        private _authService: AuthService,
        private _authorizationService: AuthorizationService,
        private _router: Router
    ) {
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

    private async _check(redirectURL: string): Promise<boolean> {
        
        let authResult = await Auth.currentSession();
        
        if (!authResult) {
            return false;
        } 
        
        let authRoutes = await this._authorizationService.getAuthorizedRoutes(); 
        
        //Check if directives are avaible and redirect to reservation if user is in a differente route
        if((authRoutes.length > 0 && authRoutes.map(e => e.toLowerCase()).includes(redirectURL.toLowerCase()))) { 
            return true;
        }
        else if (redirectURL == "/reservation") {
            return true;
        }
        
        return false;
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
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        //todo: use this url better than this. 
        let redirectUrl = "/" + state.url.split("/")[1];
        if (redirectUrl === '/sign-out') redirectUrl = '/';
        else if (redirectUrl === '/map') redirectUrl = 'map/campus'

        return this._check(redirectUrl);
    }

    /**
     * Can activate child
     *
     * @param childRoute
     * @param state
     */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        let redirectUrl = state.url;
        if (redirectUrl === '/sign-out') {
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
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> //| boolean
    {
        return this._check('/');
    }
}
