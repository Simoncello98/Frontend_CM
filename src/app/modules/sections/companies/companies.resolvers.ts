import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CompaniesService } from 'app/modules/sections/companies/companies.service';
import { Company } from 'app/modules/sections/companies/companies.types';
import { Dictionary } from 'lodash';

@Injectable({
    providedIn: 'root'
})
export class CompaniesResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {CompaniesService} _companiesService
     */
    constructor(
        private _companiesService: CompaniesService
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<[Company[]]> {
        return forkJoin([
            this._companiesService.getCompanies()
        ]);
    }
}

@Injectable({
    providedIn: 'root'
})
export class CompaniesCompanyResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {CompaniesService} _companiesService
     * @param {Router} _router
     */
    constructor(
        private _companiesService: CompaniesService,
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Company> {
        return this._companiesService.getCompanyById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested company is not available
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
export class NewCompanyResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {CompaniesService} _companiesService
     * @param {Router} _router
     */
    constructor(
        private _companiesService: CompaniesService    ) {
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
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Company> {
        return this._companiesService.createNewEmptyCompany();
    }
}


@Injectable({
    providedIn: 'root'
})
export class CampusXCompanyXCompanyResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {CompaniesService} _companiesService
     * @param {Router} _router
     */
    constructor(
        private _companiesService: CompaniesService,
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
        return this._companiesService.getRelationshipById(route.paramMap.get('id'))
            .pipe(
                // Error here means the requested company is not available
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