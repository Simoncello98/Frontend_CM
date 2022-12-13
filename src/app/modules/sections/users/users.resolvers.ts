import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UsersService } from 'app/modules/sections/users/users.service';
import { User, Badge, CampusXCompanyXUser, RegulationDoc } from 'app/modules/sections/users/users.types';
import { VisitorsRequest } from './visitorsrequests.types';
import { VisitorsRequestsService } from './visitorsrequests.service';

@Injectable({
    providedIn: 'root'
})
export class UsersResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {UsersService} _usersService
     */
    constructor(
        private _usersService: UsersService,
        private _visitorsRequestsService : VisitorsRequestsService
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<[CampusXCompanyXUser[], VisitorsRequest[]]> {
        return forkJoin([this._usersService.getUsers(), this._visitorsRequestsService.getVisitorsRequests()]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class UsersUserResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {UsersService} _usersService
     * @param {Router} _router
     */
    constructor(
        private _usersService: UsersService,
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
    //TODO: add a forkjoin with badges and companies
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        return this._usersService.getUserById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested user is not available
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

@Injectable({
    providedIn: 'root'
})
export class NewUserResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {UsersService} _usersService
     * @param {Router} _router
     */
    constructor(
        private _usersService: UsersService    ) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
        return this._usersService.createNewEmptyUser();
    }
}



@Injectable({
    providedIn: 'root'
})
export class CampusXCompanyXUserResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {UsersService} _usersService
     * @param {Router} _router
     */
    constructor(
        private _usersService: UsersService,
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
        return this._usersService.getRelationshipsById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested user is not available
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