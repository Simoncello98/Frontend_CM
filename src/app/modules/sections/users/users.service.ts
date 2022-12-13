import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppService } from 'app/app.service';
import { AuthService } from 'app/core/auth/auth.service';
import { AuthorizationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/layout/common/user/user.service';
import {  CampusXCompanyXUser, CampusXCompanyXUserCompaniesGrouped, Operation, RegulationDoc, User } from 'app/modules/sections/users/users.types';
import { SharedService } from 'app/shared/shared.service';
import Amplify, { API } from 'aws-amplify';
import _ from 'lodash';
import { getBaseApiPath } from 'main';
import { BehaviorSubject, from, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WSActions } from './users.enums';


@Injectable({
    providedIn: 'root'
})
export class UsersService {
    // Private
    private _user: BehaviorSubject<User | null>;
    private _userCompanies: BehaviorSubject<Array<CampusXCompanyXUser> | null>;
    public _CampusXCompanyXUserRels: BehaviorSubject<CampusXCompanyXUser[] | null>;
    public campusRegulationDocs: RegulationDoc[] = [];

    public userUpdateEmail$: BehaviorSubject<{ oldEmail: string, newEmail: string }>;

    public static getCompanyToBill(companies: CampusXCompanyXUser[]): CampusXCompanyXUser {
        let companiesToBill = companies.filter(comp => comp.UserSerialID);
        return companiesToBill.length > 0
            ? companiesToBill[0]
            : companies[0];
    }

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        public authorizationService: AuthorizationService,
        private _userService: UserService,
        private _sharedService: SharedService,
        private authService: AuthService,
        private _appService: AppService
    ) {
        // Set the private defaults
        this._user = new BehaviorSubject(null);
        this._userCompanies = new BehaviorSubject(null);
        this._CampusXCompanyXUserRels = new BehaviorSubject(null);
        this.userUpdateEmail$ = new BehaviorSubject(null);



        this.authService.logoutEmitter.subscribe(loggedOut => {
            if (loggedOut) {
                this._user.complete()
                this._CampusXCompanyXUserRels.complete();


                this._user = new BehaviorSubject(null);
                this._CampusXCompanyXUserRels = new BehaviorSubject(null);

            }
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for user
     */
    get user$(): Observable<User> {
        return this._user.asObservable().pipe();
    }



    get userCompanies$(): Observable<Array<CampusXCompanyXUser>> {
        return this._userCompanies.asObservable().pipe();
    }


    /**
     * Getter for filtered relationships
     */
    //TODO: filter in some manner
    get campusXCompanyXUserRels$(): Observable<CampusXCompanyXUser[]> {
        return this._CampusXCompanyXUserRels.asObservable().pipe(switchMap((rels) => {
            let emails = [...new Set(rels?.map(item => item.Email))]  //get distinct emails
            var grouped = _.mapValues(_.groupBy(rels, 'Email'),
                clist => clist.map(rels => _.omit(rels, 'Email'))); //get Maps like :  [scionti@bax : {info}, ...]
            let resultingList: CampusXCompanyXUserCompaniesGrouped[] = [];
            emails.forEach(email => { //foreach Email
                let records = grouped[email]; //get the Map of that user
                let firstRecord: CampusXCompanyXUserCompaniesGrouped = { //put  Email and info object in an object
                    Email: email,
                    ...records[0]
                }
                delete firstRecord.CompanyName; //delete the company name of that info
                firstRecord.Companies = [];
                records.forEach(r => { //add companies of each info of that user.
                    firstRecord.Companies.push(r.CompanyName)
                })
                resultingList.push(firstRecord);
            })
            //[...new Map<string, any>(rels.map(item => [item.Email, item])).values()]
            return of(resultingList);
        }));

    }

    /**
     * Getter for filtered relationships
     */
    get campusXCompanyXUserRawRels$(): Observable<CampusXCompanyXUser[]> {
        return this._CampusXCompanyXUserRels.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    /**
     * Get users
     *
     * @param sortField
     */
    getUsers(): Observable<any[]> {
        if (this.authorizationService.isAuthorized("GetUsers")) {
            return from(API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUsers"), {
                queryStringParameters: {
                    CampusName: this._appService.getCurrentCampusName()
                },
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            })

            ).pipe(
                tap((users) => {

                    this._CampusXCompanyXUserRels.next(users);

                })
            );
        }
        else {
            return of([]);
        }
    }

    /**
     * Search users with given query
     * TODO: CHANGE ME
     * @param query
     */
    searchUsers(query: string): any {
        return this._CampusXCompanyXUserRels.asObservable().pipe(
            switchMap((rels) => {
                return of(
                    [...new Map<string, any>(rels.map(item => [item.Email, item])).values()]
                        .filter(user => Object.values(user).toString().toLocaleLowerCase().includes(query))
                );
            }),

        );
    }


    createNewEmptyUser(): Observable<User> {
        this._user.next({} as any);
        return of({} as any);
    }

    /**
     * Get user by id
     */
    getUserById(id: string): Observable<User> {
        return from(API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUser"), {
            queryStringParameters: {
                Email: id
            },
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        })).pipe(switchMap((user) => {
            // Update the user
            this._user.next(user);

            if (!user) {
                return throwError('Could not found user with id of ' + id + '!');
            }
            return of(user);
        }));
    }

    getCompaniesForUser(email: string): Observable<CampusXCompanyXUser[]> {
        return from(API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUserParentCompaniesAndCampuses"), {
            queryStringParameters: {
                Email: email
            },
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        })).pipe(switchMap((userCompanies) => {
            // Update the user
            this._userCompanies.next(userCompanies);

            if (!userCompanies) {
                return throwError('Could not found user companies with id of ' + email + '!');
            }
            return of(userCompanies);
        }));
    }

    

    //if we have companies in relationships that we downloaded we does not need to download it agatin. 
    getRelationshipsById(id: string): Observable<Array<CampusXCompanyXUser>> {
        return this._CampusXCompanyXUserRels.pipe(
            take(1),
            map((relationships) => {
                // Find the user
                const filteredRel = relationships?.filter(item => item.Email === id) || null;
                // Return the user
                return filteredRel;
            }),
            switchMap((relationships) => {
                if (!relationships) {
                    //download it 
                    return this.getCompaniesForUser(id).pipe(switchMap((companies) => {
                        // Update the user
                        this._userCompanies.next(companies);
                        if (!companies) {
                            return throwError('Could not companies of user with id of ' + id + '!');
                        }
                        return of(companies);
                    }));
                }
                this._userCompanies.next(relationships);
                return of(relationships);
            })
        );
    }

    /**
     * Update user
     * TODO
     * @param id
     * @param user
     */
    updateUser(user?: User, relationships?: CampusXCompanyXUser[], ): Observable<any> {
        const promises = [];
        const updateUserInfo = user ? API.put(getBaseApiPath(), this.authorizationService.getApiPath("UpdateUser"), {
            body: {
                ...user
            }
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        }) : null;
        if (user) promises.push(updateUserInfo);
        if (relationships) promises.push(this.handleUpdateCampusXCompanyXUserUpdate(relationships));

        return from(Promise.all(promises))/*.pipe(
            switchMap(() => this.getUsers()),
            switchMap(() => this.getUserById(user.Email)),
            switchMap(() => this.getBagdesByUserId(user.Email))
        );*/
    }

    updateLocalEmail(oldEmail: string, newEmail: string) {
        this.userUpdateEmail$.next({ oldEmail: oldEmail, newEmail: newEmail })
    }

    //TODO: change the mechanism to hanleit with authorizationService
    //TODO: use getApiPAth
    handleUpdateCampusXCompanyXUserUpdate(relationships: CampusXCompanyXUser[]): Promise<any> {
        const promises = [];
        relationships.forEach((relationship) => {
            if (relationship._operation == Operation.CREATE) {
                let promise = API.post(getBaseApiPath(), this.authorizationService.getApiPath('CreateCampusCompanyUserRelationship'), {
                    body:
                    {
                        ...relationship,
                        CampusName: this._appService.getCurrentCampusName()
                    }
                });
                promises.push(promise);
            }
            else {
                let promise = API.put(getBaseApiPath(), this.authorizationService.getApiPath('UpdateCampusCompanyUserRelationship'), {
                    body:
                    {
                        ...relationship,
                        CampusName: this._appService.getCurrentCampusName()
                    }
                });
                promises.push(promise);
            }
        });
        return Promise.all(promises).then(() => {
            return true;
        });
    }

    deleteCompanyRelationship(companyName: string, email: string): Observable<any> {
        const resultSubject = new Subject();
        API.del(getBaseApiPath(), this.authorizationService.getApiPath("DeleteCampusCompanyUserRelationship"), {
            body: {
                CompanyName: companyName,
                CampusName: this._appService.getCurrentCampusName(),
                Email: email
            }
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        }).then(resp => {
            resultSubject.next(true);

        });
        return resultSubject;
    }

    




    /**
     * Create user
     */
    //TODO: add  creation handling
    createUser(user: User, relationships: CampusXCompanyXUser[]): Observable<any> {
        const resultSubject = new Subject();
        const createUserInfo = API.post(getBaseApiPath(), this.authorizationService.getApiPath("CreateUser"), {
            body: {
                ...user,
                CognitoClientID: Amplify.Auth.userPool.clientId
            }
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log(error);
        });
        createUserInfo.then(newUser => {
            const promises = [];
            relationships.forEach((relationship) => {
                const updateRelationship = API.post(getBaseApiPath(), this.authorizationService.getApiPath("CreateCampusCompanyUserRelationship"), {
                    body: {
                        ...relationship,
                        Email: newUser.Email
                    }
                }).catch((error) => {
                    this._sharedService.openErrorDialog(error);
                    console.log(error);
                });
                promises.push(updateRelationship);
            });
            Promise.all(promises).then(() => {
                //this.getUsers().subscribe(() => {
                resultSubject.next(newUser);
                // });
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log(error);

            });
        });

        return resultSubject;
    }


    /**
     * Delete the user
     *
     * @param id
     */
    deleteUserById(email: string): Observable<any> {
        const resultSubject = new Subject();
        API.del(getBaseApiPath(), this.authorizationService.getApiPath("DeleteUser"), {
            body: {
                Email: email
            }
        }).catch((error) => {
            this._sharedService.openErrorDialog(error);
            console.log("rejected:  " + error);
        }).then(resp => {
            resultSubject.next(true);

        });
        return resultSubject;
    }

    /*getAvatar(userPhotoKey): Promise<{ presignedUrl: string }> {
        if (userPhotoKey) {
            return API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUserPhoto"), {
                queryStringParameters: {
                    key: userPhotoKey
                }
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            });
        } else {
            return Promise.resolve({ presignedUrl: null });
        }

    }*/

    /**
     * Update the avatar of the given user
     *
     * @param id
     * @param avatar
     */
    uploadAvatar(id: string, base64: string, type: string): Subject<{ Url: string }> {
        const resultSubject = new Subject<{ Url: string }>();
        API.post(getBaseApiPath(), this.authorizationService.getApiPath("AddUserPhoto"), {
            body: {
                Email: id,
                ContentType: type,
                Data: base64
            }
        }).then((result: { Url: string }) => {
            resultSubject.next(result);
        });
        return resultSubject;
    }



}

