export interface Company {
    CompanyName: string;
    CompanyStatus: string;
    WebsiteURL: string;
    Theme: string;
    Logo: string;
    //BadgeFrontTemplateName : string;
    //BadgeBackTemplateName : string;
    BadgeFrontTemplateURL? : string;
    BadgeBackTemplateURL? : string;
}

export interface CampusXCompanyXCompany {
    CompanyName: string;
    CampusName: string;
}

export interface CampusXCompanyXCompanyUpdate extends CampusXCompanyXCompany {
    _status: RelationshipStatus;
}

export enum RelationshipStatus {
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
