import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { CompaniesDetailsComponent } from 'app/modules/sections/companies/details/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateCompaniesDetails implements CanDeactivate<CompaniesDetailsComponent>
{
    canDeactivate(
        component: CompaniesDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while (nextRoute.firstChild) {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/companies'
        // it means we are navigating away from the
        // companies app
        if (!nextState.url.includes('/companies')) {
            // Let it navigate
            return true;
        }

        // If we are navigating to another company...
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
