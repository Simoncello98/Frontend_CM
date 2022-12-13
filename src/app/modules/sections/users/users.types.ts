import { Observable } from 'rxjs';

export interface User {
    LName: string;
    FName: string;
    Email: string;
    DateOfBirth: string;
    UserPhoto: string;

    CardID: string;
    SocialNumber: string;
    PlaceOfBirth: string;
    TelephoneNumber: string;
    IsVisitor: boolean;
    SignedRegulations?: string[]

    UserStatus: string;
    CognitoGroupName?: string;
    DCCExpirationDate?: string;
}
export interface RegulationDoc {
    DocumentTitle: string,
    Description: string
}
export interface UsersTableGroupedData {
    CampusXCompanyXUserGroup: Observable<CampusXCompanyXUser[]>,
    UsersXBadgesGroup: Observable<CampusXCompanyXUser[]>
}

export interface IBadgePrintResult {
    NumberOfCopies: number,
    BadgeFrontTemplateURL: string,
    BadgeBackTemplateURL: string,
    ConnectionID: string,
    ErrorMessage?: string,
}

export interface Badge {
    CampusName: string; // not visible in UI
    Email: string; // not visible in UI
    CompanyName: string;
    Rfid: string;
    FName: string;
    LName: string;
    Photo?: string;
    isEnabled?: boolean;
    isVisitor?: boolean;
    isTemporary?: boolean;
    Passepartout?: boolean;
    ValidFrom?: string;
    ExpirationDate?: string;
    _operation?: Operation;
}

export interface CampusXCompanyXUserCompaniesGrouped {
    CompanyName: string;
    CampusName: string;
    CompanyRole?: string;
    FName: string;
    LName: string;
    CampusRole?: string;
    CompanyEmailAlias?: string;
    UserSerialID?: string;
    RelationshipStatus?: boolean;
    Email: string;
    EmploymentContractHours: number;
    TeamName: string;
    IsVisitor?: boolean;
    Companies?: string[]
    _operation?: Operation;
}

export interface CampusXCompanyXUser {
    CompanyName: string;
    Companies?: string[];
    CampusName: string;
    CompanyRole?: string;
    FName: string;
    LName: string;
    CampusRole?: string;
    CompanyEmailAlias?: string;
    UserSerialID?: string;
    RelationshipStatus?: boolean;
    Email: string;
    EmploymentContractHours: number;
    TeamName: string;
    IsVisitor?: boolean;
    _operation?: Operation;
}

// export interface CampusXCompanyXUserUpdate extends CampusXCompanyXUser {
//     _operation: RelationshipStatus;
// }

export enum Operation {
    CREATE,
    DELETE,
    UPDATE
}

export interface Country {
    id: string;
    iso: string;
    name: string;
    code: string;
    flagImagePos: string;
}

export interface Tag {
    id?: string;
    title?: string;
}

export interface BadgeDialogresult {
    isDone: boolean,
    object?: Badge
}
