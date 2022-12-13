import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, from, Observable, of, Subject, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { Company, Country, Tag, CampusXCompanyXCompany } from 'app/modules/sections/companies/companies.types';
import { API } from 'aws-amplify';
import { AuthorizationService } from 'app/core/navigation/navigation.service';
import { SharedService } from 'app/shared/shared.service';
import { AppService } from 'app/app.service';
import { Badge } from '../users/users.types';
import { Dictionary } from 'lodash';
import { getBaseApiPath } from 'main';

@Injectable({
    providedIn: 'root'
})
export class CompaniesService {
    // Private
    private _company: BehaviorSubject<Company | null>;
    private _badge: BehaviorSubject<any | null>;
    //private _badgeTemplates: BehaviorSubject<any | null>;
    private _CampusXCompanyRels: BehaviorSubject<CampusXCompanyXCompany[] | null>;
    private _countries: BehaviorSubject<Country[] | null>;
    private _tags: BehaviorSubject<Tag[] | null>;
    private _toggle: BehaviorSubject<boolean | null>;

    private badges: Dictionary<any>;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        public authorizationService: AuthorizationService,
        private _httpClient: HttpClient,
        private _sharedService: SharedService,
        private _appService: AppService
    ) {
        // Set the private defaults
        this._company = new BehaviorSubject(null);
        this._badge = new BehaviorSubject(null);
        this._CampusXCompanyRels = new BehaviorSubject(null);
        this._countries = new BehaviorSubject(null);
        this._tags = new BehaviorSubject(null);
        this._toggle = new BehaviorSubject(null);
        this.badges = {};
        //this._badgeTemplates = new BehaviorSubject(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    get toggle$(): Observable<boolean> {
        return this._toggle.asObservable().pipe();
    }
    /**
     * Getter for company
     */
    get company$(): Observable<Company> {
        return this._company.asObservable().pipe();
    }

    get badges$(): Observable<any> {
        return this._badge.asObservable().pipe();
    }

    /**
     * Getter for filtered relationships
     */
    get campusXCompanyXCompanyRels$(): Observable<CampusXCompanyXCompany[]> {
        return this._CampusXCompanyRels.asObservable().pipe(switchMap((rels) => {
            return of([...new Map<string, any>(rels.map(item => [item.CompanyName, item])).values()]);
        }));
    }

    /**
     * Getter for filtered relationships
     */
    get campusXCompanyXCompanyRawRels$(): Observable<CampusXCompanyXCompany[]> {
        return this._CampusXCompanyRels.asObservable();
    }

    /**
     * Getter for countries
     */
    get countries$(): Observable<Country[]> {
        return this._countries.asObservable();
    }

    /**
     * Getter for tags
     */
    get tags$(): Observable<Tag[]> {
        return this._tags.asObservable();
    }


    /*get badgeTemplates$() : Observable<any> {
        return this._badgeTemplates.asObservable();
    }*/

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get companies
     *
     * @param sortField
     * @param sortDirection
     */
    getCompanies(): Observable<Company[]> {
        return from(API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetCompanies"), {
            queryStringParameters: {
                CampusName: this._appService.getCurrentCampusName()
            },
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        })).pipe(
            tap((companies) => {
                this._CampusXCompanyRels.next(companies);
            })
        );
    }

    /**
     * Search companies with given query
     * TODO: CHANGE ME
     * @param query
     */
    searchCompanies(query: string): Observable<any[] | null> {
        return this._httpClient.get<Company[] | null>('api/apps/contacts/search', {
            params: { query }
        }).pipe(
            tap((companies) => {
                this._CampusXCompanyRels.next(companies);
            })
        );
    }

    createNewEmptyCompany(): Observable<Company> {
        this._company.next({} as any);
        return of({} as any);
    }

    /**
     * Get company by id
     */
    getCompanyById(id: string): Observable<Company> {
        return from(API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetCompany"), {
            queryStringParameters: {
                CompanyName: id
            },
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        })).pipe(switchMap((company) => {
            // Update the company
            this._company.next(company);

            if (!company) {
                return throwError('Could not found company with id of ' + id + '!');
            }
            return of(company);
        }));
    }

    getRelationshipById(id: string): Observable<Array<CampusXCompanyXCompany>> {
        return this._CampusXCompanyRels.pipe(
            take(1),
            map((relationships) => {
                // Find the company
                const filteredRel = relationships.filter(item => item.CompanyName === id) || null;
                // Return the company
                return filteredRel;
            }),
            switchMap((relationships) => {
                if (!relationships) {
                    return throwError('Could not found company with id of ' + id + '!');
                }
                return of(relationships);
            })
        );
    }

    /**
     * Update company
     * TODO
     * @param id
     * @param company
     */
    updateCompany(company?: Company): Observable<any> {
        const promises = [];
        const updateCompanyInfo = API.put(getBaseApiPath(), this.authorizationService.getApiPath("UpdateCompany"), {
            body: company
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        });
        promises.push(updateCompanyInfo);

        return from(Promise.all(promises)).pipe(
            switchMap(() => this.getCompanies()),
            switchMap(() => this.getCompanyById(company.CompanyName))
        );
    }

    /**
     * Update company
     */
    createCompany(company: Company): Observable<any> {
        const resultSubject = new Subject();

        API.post(getBaseApiPath(), this.authorizationService.getApiPath("CreateCompany"), {
            body: company
        }).then(() => {
            API.post(getBaseApiPath(), this.authorizationService.getApiPath("CreateCampusCompanyRelationship"), {
                body: {
                    'CompanyName': company.CompanyName,
                    'CampusName': this._appService.getCurrentCampusName()
                }
            }).then(() => {
                //this.getCompanies().subscribe(() => {
                resultSubject.next(true);
                //});
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            });
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        });

        return resultSubject;
    }


    /**
     * Delete the company
     *
     * @param id
     */
    deleteCompany(company: Company): Observable<Company[]> {
        return from(API.del(getBaseApiPath(), this.authorizationService.getApiPath("DeleteCompany"), {
            body: company
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        })).pipe(
            switchMap(() => this.getCompanies()),
        );
    }





    uploadAvatar(id: string, base64: string, type: string): Subject<{ Url: string }> {
        const resultSubject = new Subject<{ Url: string }>();
        API.post(getBaseApiPath(), this.authorizationService.getApiPath("AddCompanylogo"), {
            body: {
                OrganizationName: id,
                ContentType: type,
                Data: base64
            }
        }).then((result: { Url: string }) => {
            resultSubject.next(result);
            // .key to userPhoto, PUT
        });
        return resultSubject;
    }

    uploadBadgeTemplate(companyName: string, templateImage: string, side: "front" | "back", type: string): Subject<{ Url: string }> {
        const resultSubject = new Subject<{ Url: string }>();
        API.post(getBaseApiPath(), this.authorizationService.getApiPath("AddBadgeTemplate"), {
            body: {
                OrganizationName: companyName,
                Side: side,
                ContentType: type,
                Data: templateImage
            }
        }).then((result: { Url: string }) => {
            resultSubject.next(result);
            // .key to userPhoto, PUT
        });
        return resultSubject;
    }


    toggleEditModeOnDetails(flag: boolean) {
        this._toggle.next(flag);
    }
}
