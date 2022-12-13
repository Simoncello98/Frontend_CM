import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { TreoNavigationItem } from '@treo/components/navigation';
import { compactNavigation, defaultNavigation, futuristicNavigation, horizontalNavigation } from './data';
import { AuthorizedComponents, AuthorizedFunctionalities, FunctionalityMetadata } from 'app/core/auth/auth.types';
import { Observable, of } from 'rxjs';
import { API } from 'aws-amplify';
import { SharedService } from 'app/shared/shared.service';
import { getBaseApiPath } from 'main';

@Injectable({
    providedIn: 'root'
})
export class AuthorizationService {
    private _authorizedComponents: AuthorizedComponents;
    private _authorizedRoutes: string[];

    // Private Readonly
    private readonly _compactNavigation: TreoNavigationItem[];
    private readonly _defaultNavigation: TreoNavigationItem[];
    private readonly _futuristicNavigation: TreoNavigationItem[];
    private readonly _horizontalNavigation: TreoNavigationItem[];


    constructor(
        private _sharedService: SharedService
    ) {
        // Set the data
        this._compactNavigation = compactNavigation;
        this._defaultNavigation = defaultNavigation;
        this._futuristicNavigation = futuristicNavigation;
        this._horizontalNavigation = horizontalNavigation;

        //set an observer to the authenticated var of the authService
    }

    public invalidateCache(): void {
        this._authorizedComponents = null;
        this._authorizedRoutes = null;
    }

    public getFunctionalityMetadata(functionality: string): FunctionalityMetadata {
        if (!this._authorizedComponents) return { DeniedOperations: [] };
        let funcRecords: AuthorizedFunctionalities[] = this._authorizedComponents.Functionalities.filter((r) => { return r.Functionality.toLowerCase() == functionality.toLowerCase() });
        if (funcRecords[0]?.AdditionalData) return funcRecords[0].AdditionalData;
        return { DeniedOperations: [] };
    }

    public getApiPath(functionality: string): string {
        if (!this._authorizedComponents) return "";
        let funcRecords: AuthorizedFunctionalities[] = this._authorizedComponents.Functionalities.filter((r) => { return r.Functionality.toLowerCase() == functionality.toLowerCase() });
        let apiPath = "";
        if (funcRecords.length != 0) apiPath = funcRecords[0].APIPath;
        else{
            console.warn("Cannot find apiPath for funcitonality: " + functionality);
        }
        return apiPath;
    }

    public areAllAuthorized(functionalities: string[]) {
        let result = true;
        functionalities.forEach(f => {
            result = result && this.isAuthorized(f);
        })
        return result;
    }

    public atLeastOneAuthorized(functionalities: string[]) {
        let result = false;
        functionalities.forEach(f => {
            result = result || this.isAuthorized(f);
        })
        return result;
    }

    public isAuthorized(functionality: string): boolean {
        return this.getApiPath(functionality) != "";
    }

    public async getAuthorizedRoutes(): Promise<string[]> {
        if (this._authorizedRoutes) return this._authorizedRoutes;
        if (!this._authorizedComponents) {
            this._authorizedComponents = await this._getAuthorizedComponents();
        }

        this._authorizedRoutes = this._getAuthorizedRoutes(this._authorizedComponents.Navigation);
        return this._authorizedRoutes;
    }

    private async _getAuthorizedComponents(): Promise<AuthorizedComponents> {
        let data: AuthorizedComponents;
        try {
            data = await API.get(getBaseApiPath(), 'Authorization', {})
        }
        catch (error) {
            this._sharedService.openErrorDialog(error);
        }
        return data;
    }

    public async getNavigation(): Promise<TreoNavigationItem[]> {
        if (this._authorizedComponents) return this._authorizedComponents.Navigation;
        let authorizedComponents = await this._getAuthorizedComponents();

        this._authorizedComponents = authorizedComponents;
        return this._authorizedComponents.Navigation;
    }

    //TODO: make it recursive and allow to go down to the last child to check if the children are inside our db paths.
    private _getAuthorizedRoutes(navigation: TreoNavigationItem[]): string[] {
        //do the algoritm that remove the other paths
        let paths: string[] = [];
        for (let group of navigation) {
            for (let child of group.children) {
                if (child.children) {
                    for (let subchild of child.children) {
                        //take the link
                        let path = subchild.link;
                        if (path) paths.push(path);
                    }
                }
                //take the link
                let path = child.link;
                if (path) paths.push(path);
            }
        }
        return paths;
    }

    public async getHomepagePath(): Promise<string> {
        if (this._authorizedComponents) return this._authorizedComponents.Homepage;
        let authorizedComponents = await this._getAuthorizedComponents();
        this._authorizedComponents = authorizedComponents;
        return this._authorizedComponents.Homepage;
    }

}
