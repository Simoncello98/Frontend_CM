import { TreoNavigationItem } from '@treo/components/navigation';

export interface AuthorizedComponents {
    Navigation : TreoNavigationItem[],
    Homepage : string,
    Functionalities : AuthorizedFunctionalities[]
}

export interface AuthorizedFunctionalities {
    APIPath: string,
    APIMethod: string,
    GroupName: string,
    Functionality: string,
    AdditionalData: FunctionalityMetadata
}

export interface FunctionalityMetadata {
    DeniedOperations?: string[],
    Specifications? : string[],
    Other?: Object;
}

export interface CognitoError {
    code: string,
    name: string, 
    message: string
}

//"selectEndDate"