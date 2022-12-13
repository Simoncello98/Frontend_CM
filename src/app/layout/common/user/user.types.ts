// export interface CognitoUser
// {
//     FName: string;
//     LName: string;
//     Email: string;
//     UserPhoto?: string;
//     status?: string;
// }

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

    UserStatus: string;
    CognitoGroupName?: string;
    DCCExpirationDate?: string;
}
