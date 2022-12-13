import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { VisitorsRequestsService } from './visitorsrequests.service';
import { VisitorsRequest } from './visitorsrequests.types';

@Injectable({
    providedIn: 'root'
})
export class VisitorsRequestsResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {VisitorsRequestsService} _visitorsrequestsService
     */
    constructor(
        private _visitorsrequestsService: VisitorsRequestsService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VisitorsRequest[]> {
        return this._visitorsrequestsService.getVisitorsRequests();
    }
}

// @Injectable({
//     providedIn: 'root'
// })
// export class VisitorsRequestsVisitorRequestsResolver implements Resolve<any>
// {
//     /**
//      * Constructor
//      *
//      * @param {VisitorsRequestsService} _visitorsrequestsService
//      * @param {Router} _router
//      */
//     constructor(
//         private _visitorsrequestsService: VisitorsRequestsService,
//         private _router: Router
//     ) {
//     }

//     // -----------------------------------------------------------------------------------------------------
//     // @ Public methods
//     // -----------------------------------------------------------------------------------------------------

//     /**
//      * Resolver
//      *
//      * @param route
//      * @param state
//      */
//     resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VisitorsRequest[]> {
        
//         return this._visitorsrequestsService.getVisitorsRequestsByVisitor(route.paramMap.get('id'))
//         //todo: do a filter on the requests getting just the requests of the vsitor route.paramMap.get('id')
//             .pipe(
//                 // Error here means the requested visitorsrequest is not available
//                 catchError((error) => {

//                     // Log the error
//                     console.error(error);

//                     // Get the parent url
//                     const parentUrl = state.url.split('/').slice(0, -1).join('/');

//                     // Navigate to there
//                     this._router.navigateByUrl(parentUrl);

//                     // Throw an error
//                     return throwError(error);
//                 })
//             );
//     }
// }

@Injectable({
    providedIn: 'root'
})
export class NewVisitorsRequestResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {VisitorsRequestsService} _visitorsrequestsService
     */
    constructor(
        private _visitorsrequestsService: VisitorsRequestsService,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<VisitorsRequest> {
        return this._visitorsrequestsService.createNewEmptyVisitorsRequest();
    }
}


@Injectable({
    providedIn: 'root'
})
export class CampusXVisitorsRequestXVisitorsRequestResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {VisitorsRequestsService} _visitorsrequestsService
     * @param {Router} _router
     */
    constructor(
        private _visitorsrequestsService: VisitorsRequestsService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Resolver
     *
     * @param route
     * @param state
     */
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return this._visitorsrequestsService.getRelationshipById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested visitorsrequest is not available
                catchError((error) => {

                    // Log the error
                    console.error(error);

                    // Get the parent url
                    const parentUrl = state.url.split('/').slice(0, -1).join('/');

                    // Navigate to there
                    this._router.navigateByUrl(parentUrl);

                    // Throw an error
                    return throwError(error);
                })
            );
    }
}
