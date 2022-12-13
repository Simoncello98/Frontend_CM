export interface VisitorsRequest {
    CampusName: string;
    VisitorFName? : string;
    VisitorLName?: string;
    UserHostFName? : string;
    UserHostLName?: string;
    EstimatedDateOfArrival?: string;
    EstimatedReleaseDate?: string;
    UserHostCompanyName?: string;
    UserHostEmail?: string;
    UserHostTelephoneNumber?: string;
    VisitorEmail: string;
    VisitorRequestID: string;
    VisitorTelephoneNumber?: string;
    VisitorRequestStatus: 'PENDING' | 'ACCEPTED' | 'DENIED' | 'EXPIRED' | '';
    LocalEstimatedDateOfArrival? : string;
    LocalEstimatedReleaseDate? : string;
}


export interface Visitor {
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
    UserStatus: string;
}


export interface CampusXCompanyXUser {
    CompanyName: string;
    CampusName: string;
    CompanyRole: string;
    CampusRole: string;
    CompanyEmailAlias: string;
    UserSerialID: string;
    Email: string;
    IsVisitor: boolean;
}