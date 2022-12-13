import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { forkJoin, from, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './core/auth/auth.service';
import { API, Auth } from 'aws-amplify';
import { AuthorizationService } from './core/navigation/navigation.service';
import { TreoNavigationItem } from '@treo/components/navigation';
import { SharedService } from './shared/shared.service';
import { S3ApiService } from './core/s3ApiAdapter/s3-api.service';
import { AppService } from './app.service';
import moment from 'moment';
import { getBaseApiPath } from 'main';

@Injectable({
    providedIn: 'root'
})
export class InitialDataResolver implements Resolve<any>
{
    /**
     * Constructor
     *
     * @param {HttpClient} _httpClient
     */

    constructor(
        private authorizationService: AuthorizationService,
        private authService: AuthService,
        private appService: AppService,
        private _sharedService: SharedService,
        private _router: Router

        //TODO: is not the correct way 

    ) {
        authService.authorizationService = authorizationService;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Load navigation data From new service not mockup.
     *
     * @private
     */
    private _loadNavigation(): Observable<TreoNavigationItem[]> {
        //TODO: call api that returns navigation paths.
        return from(this.authorizationService.getNavigation());
    }


    private loadCredentials(): Observable<any> {
        return from(Auth.currentCredentials()
            .then(credentials => {
                return Auth.essentialCredentials(credentials)
            })
        )
    }



    /**
     * Load user
     *
     * @private
     */

    private _loadUser(): Observable<any> {
        const result = new Subject();
        this.authService.currentUserInfo.then((userInfo) => {
            this.authService.setCurrentUserEmail(userInfo.attributes.email);
            API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUser"), {
                queryStringParameters: {
                    Email: userInfo.attributes.email
                },
            }).then((user) => {
                //save the currentUser in the authService(this is not a good solution but works for now..)
                this.authService.setCurrentUserInfo(user);
                result.next({
                    user
                });
                result.complete();
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            });
        });
        return result;
    }

    
    /**
     * Resolver
     *
     * @param route
     * @param state
     */

    //sta cazz di funzinoe viene chiamata durante il routing (in questo caso essendo il resolver del componente app già quando viene istanziata l'app viene chiamato. poi l0interceptor rimanda al login)
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        return forkJoin([
            // Navigation data
            this._loadNavigation(),
            this._loadUser(),
            this.loadCredentials(),
        ]).pipe(
            map((data) => {
                //setup aws signature 4 
                let creds = data[2];
                S3ApiService.sign(creds);                

                return {
                    //messages: data[0].messages,
                    navigation: {
                        compact: data[0],
                        default: data[0],
                        futuristic: data[0],
                        horizontal: data[0]
                    },
                    //notifications: data[2].notifications,
                    //shortcuts: data[3].shortcuts,
                    user: data[1].user,
                };
            })
        );
    }

    /**
     * Load shortcuts
     *
     * @private
     */
    /*private _loadShortcuts(): Observable<any> {
        return this._httpClient.get('api/common/shortcuts');
    }*/
}
