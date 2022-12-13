import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersDetailsComponent } from 'app/modules/sections/users/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateUsersDetails implements CanDeactivate<UsersDetailsComponent>
{
    canDeactivate(
        component: UsersDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while (nextRoute.firstChild) {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/users'
        // it means we are navigating away from the
        // users app
        if (!nextState.url.includes('/users')) {
            // Let it navigate
            return true;
        }

        // If we are navigating to another user...
        if (nextRoute.paramMap.get('id')) {
            // Just navigate
            return true;
        }
        // Otherwise...
        else {
            // Close the drawer first, and then navigate
            component.closeDrawer().then(() => {

            });
            return true;
        }
    }
}
