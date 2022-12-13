import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of, Subject, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';;
import Amplify, { API } from 'aws-amplify';
import { AuthorizationService } from 'app/core/navigation/navigation.service';
import { SharedService } from 'app/shared/shared.service';
import { VisitorsRequest } from './visitorsrequests.types';
import { User } from 'app/layout/common/user/user.types';
import { AppService } from 'app/app.service';
import { getBaseApiPath } from 'main';

@Injectable({
    providedIn: 'root'
})
export class VisitorsRequestsService {
    // Private
    private _visitorsrequest: BehaviorSubject<VisitorsRequest | null>;
    public _visitorsrequests: BehaviorSubject<VisitorsRequest[] | null>;

    /**
     * Constructor
     *
     */
    constructor(
        public authorizationService: AuthorizationService,
        private _sharedService: SharedService,
        private _appService : AppService
    ) {
        // Set the private defaults
        this._visitorsrequest = new BehaviorSubject(null);
        this._visitorsrequests = new BehaviorSubject(null);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for visitorsrequest
     */
    get visitorsrequest$(): Observable<VisitorsRequest> {
        return this._visitorsrequest.asObservable().pipe();
    }

    /**
     * Getter for filtered relationships
     */
    get visitorsrequests$(): Observable<VisitorsRequest[]> {
        return this._visitorsrequests.asObservable();
    }

    /**
     * Getter for filtered relationships
     */
    get visitorsrequestsRawRels$(): Observable<VisitorsRequest[]> {
        return this._visitorsrequests.asObservable();
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get visitorsrequests
     *
     * @param sortField
     * @param sortDirection
     */
    getVisitorsRequests(): Observable<Array<VisitorsRequest>> {
        if(this.authorizationService.isAuthorized("GetAllVisitorRequests")) {
            return from(API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetAllVisitorRequests"), {
                queryStringParameters: {
                    CampusName: this._appService.getCurrentCampusName()
                },
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            })).pipe(
                tap((visitorsrequests) => {
                    this._visitorsrequests.next(visitorsrequests);
                })
            );
        }
        else {
            this._visitorsrequests.next([]);
            return of([]);
        } 
       
    }

    getVisitorsRequestsByVisitor(visitorEmail: string): Observable<VisitorsRequest[]> {
        let resultSubject = new Subject<VisitorsRequest[]>();
        if(this.authorizationService.isAuthorized("GetRequestsByVisitor")){
            return from(API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetRequestsByVisitor"), {
                queryStringParameters: {
                    CampusName: this._appService.getCurrentCampusName(),
                    Email: visitorEmail
                },
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            })).pipe(
                tap((visitorsrequests) => {
                    //let filtered = visitorsrequests.filter(e => e.VisitorEmail === visitorEmail);
                    resultSubject.next(visitorsrequests);
                })
            );
        }
        return resultSubject;
    }

    /**
     * Search visitorsrequests with given query
     * TODO: CHANGE ME
     * @param query
     */
    /*searchVisitorsRequests(query: string): Observable<any[] | null> {
        return this._httpClient.get<VisitorsRequest[] | null>('api/apps/contacts/search', {
            params: { query }
        }).pipe(
            tap((visitorsrequests) => {
                this._visitorsrequests.next(visitorsrequests);
            })
        );
    }*/

    createNewEmptyVisitorsRequest(): Observable<VisitorsRequest> {
        this._visitorsrequest.next({} as any);
        return of({} as any);
    }

    public confirmRequest(request: VisitorsRequest, requestHost: User, visitorCreated: boolean, visitor: User, hostToUpdate: boolean): Observable<boolean> {
        return new Observable<boolean>(sub => {

            if (hostToUpdate) { //in order: first update host and create user ( in parallel) and after you can create the visitorRequest
                if (visitorCreated){ 
                    this.createVisitor(visitor, request.UserHostCompanyName).then((newVisitor) => {
                        let newEmail = newVisitor.Email;
                        request.VisitorEmail = newEmail;
                        this.createVisitorRequest(request).then(() => {
                            this.getVisitorsRequests().subscribe(() => {
                                sub.next(true);
                                sub.complete();
                            });
                        })
                    });
                } else {
                    let promises = [];
                    promises.push(this.updateHost(requestHost));
                    promises.push(this.createVisitor(visitor, request.UserHostCompanyName));
                    
                    Promise.all(promises).then(() => {
                        this.createVisitorRequest(request).then(() => {
                            this.getVisitorsRequests().subscribe(() => {
                                sub.next(true);
                                sub.complete();
                            });
                        })
                    });
                }               
            }
            else if (visitorCreated) { //JUST visitorCreated - in order: first create visitor and after create request 
                this.createVisitor(visitor, request.UserHostCompanyName).then((newVisitor) => {
                    let newEmail = newVisitor.Email;
                    request.VisitorEmail = newEmail;
                    this.createVisitorRequest(request).then(() => {
                        this.getVisitorsRequests().subscribe(() => {
                            sub.next(true);
                            sub.complete();
                        });
                    })
                });
            }
            else { //no host updated - no visitorCreated
                this.createVisitorRequest(request).then(() => {
                    this.getVisitorsRequests().subscribe(() => {
                        sub.next(true);
                        sub.complete();
                    });
                })
            }
        })
    }




    private updateHost(requestHost: User): Promise<any> {
        return API.put(getBaseApiPath(), this.authorizationService.getApiPath("UpdateUserTelephoneNumber"), {
            body: {
                Email: requestHost.Email,
                TelephoneNumber: requestHost.TelephoneNumber
            },
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        })
    }

    private createVisitor(visitor: User, companyName: string): Promise<any> {
        return API.post(getBaseApiPath(), this.authorizationService.getApiPath("createVisitor"), {
            body: {
                ...visitor,
                CognitoClientID: Amplify.Auth.userPool.clientId,
                CampusName: this._appService.getCurrentCampusName(),
                CompanyName: companyName
            },
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        }).then((newVisitor) => {
            return newVisitor;
        });
    }

    /**
    * create the vistor request
    */
    private createVisitorRequest(visitorRequest: VisitorsRequest): Promise<any> {
        return API.post(getBaseApiPath(), this.authorizationService.getApiPath("createVisitorRequest"), {
            body: {
                ...visitorRequest
            }
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        })
    }

    /**
     * Get visitorsrequest by id
     */
   /* getVisitorsRequestById(id: string): Observable<VisitorsRequest> {
        return this._visitorsrequests.pipe(
            take(1),
            map((contacts) => {

                // Find the contact
                const visitorsrequest = contacts.find(item => item.VisitorRequestID === id) || null;

                // Update the contact
                this._visitorsrequest.next(visitorsrequest);

                // Return the contact
                return visitorsrequest;
            }),
            switchMap((contact) => {

                if (!contact) {
                    return throwError('Could not found visitorsrequest with id of ' + id + '!');
                }

                return of(contact);
            })
        );
    }*/

    getRelationshipById(id: string): Observable<Array<VisitorsRequest>> {
        return this._visitorsrequests.pipe(
            take(1),
            map((relationships) => {
                // Find the visitorsrequest
                const filteredRel = relationships.filter(item => item.VisitorRequestID === id) || null;
                // Return the visitorsrequest
                return filteredRel;
            }),
            switchMap((relationships) => {
                if (!relationships) {
                    return throwError('Could not found visitorsrequest with id of ' + id + '!');
                }
                return of(relationships);
            })
        );
    }

    /**
     * Update visitorsrequest
     * TODO
     * @param id
     * @param visitorsrequest
     */
    updateVisitorsRequest(visitorsrequest?: VisitorsRequest): Observable<any> {
        //const promises = [];
        const updateVisitorsRequestInfo = API.put(getBaseApiPath(), this.authorizationService.getApiPath("UpdateVisitorRequest"), {
            body: visitorsrequest
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        });
        //promises.push(updateVisitorsRequestInfo);
        return from(updateVisitorsRequestInfo);

        // return from(Promise.all(promises)).pipe(
        //     switchMap(() => this.getVisitorsRequests()),
        //     switchMap(() => this.getVisitorsRequestById(visitorsrequest.VisitorRequestID)),
        // );
    }

    /**
     * Update visitorsrequest
     */
    createVisitorsRequest(visitorsrequest: VisitorsRequest): Observable<any> {
        const resultSubject = new Subject();

        const createACLRuleInfo = API.post(getBaseApiPath(), this.authorizationService.getApiPath("CreateVisitorRequest"), {
            body: visitorsrequest
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        });

        createACLRuleInfo.then(() => {
            this.getVisitorsRequests().subscribe(() => {
                resultSubject.next(true);
            });
        });

        return resultSubject;
    }


    /**
     * Delete the visitorsrequest
     *
     * @param id
     */
    deleteVisitorsRequest(visitorsrequest: VisitorsRequest): Observable<any> {
        const resultSubject = new Subject();

        API.del(getBaseApiPath(), this.authorizationService.getApiPath("DeleteVisitorRequest"), {
            body: visitorsrequest
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        }).then(() => {
            resultSubject.next(true);
        });

        return resultSubject;
    }

}
