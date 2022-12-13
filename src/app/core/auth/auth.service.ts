import { Injectable } from '@angular/core';
import { Observable, throwError, from, of, Subject } from 'rxjs';
import Amplify, { API, Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { CognitoError } from './auth.types';
import { AuthorizationService } from '../navigation/navigation.service';
import { User } from 'app/layout/common/user/user.types';
import { S3ApiService } from '../s3ApiAdapter/s3-api.service';
import { SharedService } from 'app/shared/shared.service';

@Injectable()
export class AuthService {
    // Private
    private _authenticated: boolean;
    private user: CognitoUser | any;
    public userInfo: User;
    public authorizationService: AuthorizationService;
    currentUserEmail: string;

    public logoutEmitter: Subject<boolean>;
    //private _authorizedComponents : AuthorizedComponents;

    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */
    constructor(
        private _authorizationService: AuthorizationService,
        private _sharedService: SharedService
        //private _httpClient: HttpClient
    ) {
        // Set the defaults
        this._authenticated = false;
        //if the user reload a page, this service will be init again without passing rom login
        this.logoutEmitter = new Subject();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    /*set accessToken(token: string) {
        localStorage.setItem('access_token', token);
    }

    get accessToken(): string {
        return localStorage.getItem('access_token');
    }*/

    get currentUserInfo(): Promise<any> {
        return Auth.currentUserInfo();
    }



    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public getCurrentUserEmail(): string {
        return this.currentUserEmail;
    }
    public getCurrentUserInfo(): User {
        return this.userInfo;
    }

    public setCurrentUserEmail(email: string) {
        this.currentUserEmail = email;
    }
    public setCurrentUserInfo(user: User) {
        this.userInfo = user;
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string, password: string }): Observable<AuthStates | CognitoError> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        const auth = Auth.signIn(credentials.email, credentials.password).then((result: CognitoUser | any) => {
            this.user = result;
            if (result.challengeName === 'NEW_PASSWORD_REQUIRED') {
                return AuthStates.NewPasswordRequired;
            } else {
                //
                this.currentUserEmail = result.attributes.email;
                // Set the authenticated flag to true
                this._authenticated = true;
                //if its the first time that the user log in during the session, then we need to init the logoutEmitter.
                if (!this.logoutEmitter) this.logoutEmitter = new Subject();
                return AuthStates.Logged;
            }
        }).catch((error: CognitoError) => {
            // Set the authenticated flag to false
            this._authenticated = false;
            //console.log(error);
            // TODO: send error to UI so you can know what went wrong
            return error;
        });

        return from(auth);
    }

    confirmPassword(password: string): Observable<any> {
        const res = new Subject();
        if (this.user) {
            this.user.completeNewPasswordChallenge(password, null, {
                onSuccess: (session: any) => {
                    // this.confirmEmail(this.user.email).subscribe(result => {
                    //     res.next(result);
                    //     res.complete();
                    // })
                    res.next(true);
                    res.complete();
                },
                onFailure: (err: any) => {
                    res.next(false);
                    res.complete();
                    return throwError('completeNewPassword failed');
                }
            });
            return of(this.user);
        } else {
            return throwError('No stored user to use for the password confirm');
        }
    }


    // confirmEmail(email: string): Observable<any> {
    //     const res = new Subject();
    //     API.post(getBaseApiPath(),"User/ConfirmSignUp", {
    //         body: {
    //             Email: email
    //         }
    //     }).catch((error) => {
    //         // this._sharedService.openErrorDialog(error);
    //         // console.log("rejected:  " + error);
    //         res.next(false);
    //         res.complete();
    //     }).then(resp => {
    //         res.next(true);
    //         res.complete();
    //     })
    //     return res;
    // }
    forgotPassword(email: string){
        let cognitoUser = new CognitoUser({
            Username: email,
            Pool: Amplify.Auth.userPool
        });

        return new Promise((resolve, reject) => {
            cognitoUser.forgotPassword({
                onSuccess: function(result) {
                    let ret = {
                        status: true,
                        result: result,
                    }
                    resolve(ret)
                },
                onFailure: function(err) {
                    console.log(err);
                    let ret = {
                        status: false,
                        error: err                        
                    }
                    resolve(ret)
                    
                }
            });
        });

              

    }
    

    resetConfirmPassword(email: string, code: string, newPassword: string){
        let cognitoUser = new CognitoUser({
            Username: email,
            Pool: Amplify.Auth.userPool
        });

        return new Promise((resolve, reject) => {
            cognitoUser.confirmPassword(code, newPassword, {
                onFailure(err) {
                    let ret = {
                        status: false,
                        error: err,
                    }
                    resolve(ret);
                },
                onSuccess() {
                    let ret = {
                        status: true
                    }
                    resolve(ret);
                },
            });
        });
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        //TODO: unref the authorizedComponents!!!
        this.authorizationService.invalidateCache();
        this.logoutEmitter.next(true);
        //this.logoutEmitter.complete();
        // Set the authenticated flag to false
        this._authenticated = false;
        this.user = null;
        S3ApiService.s3 = null;
        //this._authorizedComponents = null;
        // Return the observable
        return from(Auth.signOut());
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> { //TODO: Simone change it as the new getAuthComponents function using async and await. Use a chache system using a boolean var.
        return from(
            Auth.currentSession()
                .then(data => {
                    //const accessToken = data.getAccessToken();
                    //const jwt = accessToken.getJwtToken();
                    //this.accessToken = jwt;
                    return true;
                })
                .catch(err => {
                    return false;
                })
        );
    }

    /* async getAuthorizedComponents() : Promise<AuthorizedComponents>{ 
         if(this._authorizedComponents) return this._authorizedComponents;
         //let userInfo = await this.currentUserInfo.then();
         //TODO : simone  : get from backend.
         let authorizedComponents : AuthorizedComponents = {
             Routes : defaultNavigation,
             APIs : []
         } 
         // TODO: change it in api call when it will works. await API.get(getBaseApiPath(), 'Authorization', {});
         this._authorizedComponents = authorizedComponents; //cache it
         return authorizedComponents;
     }*/
}


export enum AuthStates {
    Logged,
    Failed,
    NewPasswordRequired
}


