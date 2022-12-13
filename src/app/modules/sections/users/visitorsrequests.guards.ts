import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { VisitorsRequestsDetailsComponent } from './visitorsRequestsDetails/details.component';

@Injectable({
    providedIn: 'root'
})
export class CanDeactivateVisitorsRequestsDetails implements CanDeactivate<VisitorsRequestsDetailsComponent>
{
    canDeactivate(
        component: VisitorsRequestsDetailsComponent,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree
    {
        // Get the next route
        let nextRoute: ActivatedRouteSnapshot = nextState.root;
        while ( nextRoute.firstChild )
        {
            nextRoute = nextRoute.firstChild;
        }

        // If the next state doesn't contain '/visitorsrequests'
        // it means we are navigating away from the
        // visitorsrequests app
        /*if ( !nextState.url.includes('/visitorsrequests') )
        {
            // Let it navigate
            return true;
        }*/

        // If we are navigating to another visitorsrequest...
       /* if ( nextRoute.paramMap.get('id') )
        {
            // Just navigate
            return true;
        }*/
        // Otherwise...
        //else
        //{
            // Close the drawer first, and then navigate
            return component.closeDrawer().then(() => {
                return true;
            });
        //}
    }
}
