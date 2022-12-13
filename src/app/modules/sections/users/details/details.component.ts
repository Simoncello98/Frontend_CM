import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { User, Country, Tag, CampusXCompanyXUser, Operation, RegulationDoc } from 'app/modules/sections/users/users.types';
import { UsersListComponent } from 'app/modules/sections/users/list/list.component';
import { UsersService } from 'app/modules/sections/users/users.service';
import { combineLatest } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { API } from 'aws-amplify';
import { AuthorizationService } from 'app/core/navigation/navigation.service';
import { SharedService } from 'app/shared/shared.service';
import { AuthService } from 'app/core/auth/auth.service';
import { FunctionalityMetadata } from 'app/core/auth/auth.types';
import { ImageCropperDialogComponent } from 'app/shared/ImageCropperDialog/image-cropper-dialog.component';
import { CustomDialogComponent } from 'app/shared/customDialog/custom-dialog.component';
import { AppService } from 'app/app.service';
import moment from 'moment';
import { TeamNameObservable, TeamNamePossibleValues } from './models/teams';
import { getBaseApiPath } from 'main';

@Component({
    selector: 'users-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
    changeEmail: boolean;
    sendEmail: boolean;
    editMode: boolean;
    tags: Tag[];
    tagsEditMode: boolean;
    filteredTags: Tag[];
    user: User;
    userForm: FormGroup;
    userPhotoUrl: string;
    campusXCompanyXUserForm: FormGroup;
    companies: CampusXCompanyXUser[];
    countries: Country[];
    newUser: boolean;
    alreadyAssociatedCompanies: string[];
    initialImageURL: string;

    FirstName: string;
    LastName: string;
    PlaceOfBirth: string;
    CardID: string;
    SocialNumber: string;
    UserEmail: string;

    CompanyNamePromise: Promise<any>;

    CognitoGroupsPromise: Promise<any>;

    companiesCount: number = 0;

    createUserFunctionalityMetadata: FunctionalityMetadata;

    campusRegulationDocs: RegulationDoc[];

    // Private
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any>;

    @ViewChild('avatarFileInput')
    private _avatarFileInput: ElementRef;

    userIDMaxLen: number;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {UsersListComponent} _usersListComponent
     * @param {UsersService} _usersService
     * @param {FormBuilder} _formBuilder
     * @param {Renderer} _renderer2
     * @param {Router} _router
     * @param {Overlay} _overlay
     * @param {ViewContainerRef} _viewContainerRef
     */
    constructor(
        public authorizationService: AuthorizationService,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersListComponent: UsersListComponent,
        private _usersService: UsersService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private dialog: MatDialog,
        private _sharedService: SharedService,
        public authService: AuthService,
        private _appService: AppService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.userIDMaxLen = 7 // TODO: create backend service for configuration, as in MealReservation

        // Set the defaults
        this.editMode = false;
        this.tagsEditMode = false;
        this.changeEmail = false;
        this.sendEmail = false;
    }
    ngAfterViewInit(): void {
        this.userForm.get("CognitoGroupName").valueChanges.subscribe((value) => {
            this.groupSelectionChanged(value);
        });

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        

        //get authorization creation metadata 
        this.createUserFunctionalityMetadata = this.authorizationService.getFunctionalityMetadata("CreateUser");

        // Open the drawer
        this._usersListComponent.matDrawer.open();
        // Create the user form
        this.userForm = this._formBuilder.group({
            Image_Base64: [[], []],
            LName: ['', [Validators.required]],
            FName: ['', [Validators.required]],
            Email: ['', [Validators.email]],
            DateOfBirth: ['',],
            DCCExpirationDate: ['',],
            UserPhoto: ['', []],
            CardID: ['', []],
            SocialNumber: ['', []],
            PlaceOfBirth: ['',],
            TelephoneNumber: ['', [Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"), Validators.minLength(10)]],
            UserStatus: ['', []],
            IsVisitor: ['', []],
            CognitoGroupName: ['', []], //if you are hr you don't need to specify it, so we need a custom validator that checks if you are forced to specify the group.
            campusXCompanyXUserForm: this._formBuilder.array([]),
            SignedRegulations: this._formBuilder.array([])
        }, {
            validator: [
                CustomGroupFieldValidator.userGroupValidator(this.createUserFunctionalityMetadata, "CognitoGroupName"),
                CustomCFFieldValidator.CFValidator("SocialNumber")
            ]
        });


        if (this.authorizationService.isAuthorized("ListCognitoGroupsName")) {
            this.CognitoGroupsPromise = API.get(getBaseApiPath(), this.authorizationService.getApiPath("ListCognitoGroupsName"), {
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            });
        }


        //TODO: simone: call it just if the html elemtn will be istantiated. 
        if (this.authorizationService.isAuthorized("GetCompanies"))
            this.CompanyNamePromise = API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetCompanies"), {
                queryStringParameters: {
                    CampusName: this._appService.getCurrentCampusName()
                },
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            });

        //TODO: it canno take the info of giovanni di carlo from a table in wich it does no thave any info. So we need to download userCompanies.
        //maybe we can check and see if we find a company, else download it.
        combineLatest([this._usersService.user$, this._usersService.userCompanies$])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((userAndRes: [User, CampusXCompanyXUser[]]) => {
                this.newUser = this._activatedRoute.snapshot.routeConfig.path === 'newUser';

                const user = userAndRes[0];
                const companies = userAndRes[1];

                this.campusRegulationDocs = this._usersService.campusRegulationDocs; //loaded from resolver.

                if (this.newUser) {

                    this.user = {} as User;
                    this.FirstName = '';
                    this.LastName = '';
                    this.PlaceOfBirth = '';
                    this.CardID = '';
                    this.SocialNumber = '';
                    this.UserEmail = '';
                    this.addCompany(false);
                    this.groupSelectionChanged("employee");  //default creation needs default validators

                }
                else {
                    this.user = user;
                    this.FirstName = user.FName;
                    this.LastName = user.LName;
                    this.PlaceOfBirth = user.PlaceOfBirth;
                    this.CardID = user.CardID;
                    this.SocialNumber = user.SocialNumber;
                    this.UserEmail = user.Email;
                    this.groupSelectionChanged(user.CognitoGroupName);
                    this.companies = companies;
                    this.userForm.reset();
                    // this.userForm.get('DCCExpirationDate').setValue('');
                    this.userForm.patchValue(user);
                    this.initRelationshipForm(companies, user, 'campusXCompanyXUserForm', this.getcampusXCompanyXUserFormDef());

                    this.alreadyAssociatedCompanies = [];
                    companies.forEach(element => {
                        this.alreadyAssociatedCompanies.push(element.CompanyName);
                    });
                }
 


                this.companiesCount = this.userForm.get('campusXCompanyXUserForm')['controls'].length;
                this.toggleEditMode(this.newUser);
                this._changeDetectorRef.markForCheck();
            });

        this.showErrors();
    }

    showErrors() {
        this.userForm.markAllAsTouched();
    }

    groupSelectionChanged(selectedGroup: string) {
        if (selectedGroup && selectedGroup.includes("visitor")) {
            let control = this.userForm.get("PlaceOfBirth");
            control.setValidators([]);
            control.setErrors(null)

            let control1 = this.userForm.get("DateOfBirth");
            control1.setValidators([]);
            control1.setErrors(null)

            this._changeDetectorRef.markForCheck();

        } else {
            let control = this.userForm.get("PlaceOfBirth");
            control.setValidators([Validators.required]);
            if (!control.value) {
                control.setErrors({ 'incorrect': true })
            }

            let control1 = this.userForm.get("DateOfBirth");
            control1.setValidators([Validators.required]);
            if (!control1.value) {
                control1.setErrors({ 'incorrect': true })
            }

            this._changeDetectorRef.markForCheck();
        }
    }

    getRegulationDocFormDef(): any {
        return {
            Signed: [''],
            DocumentTitle: [''],
            Description: ['']
        };
    }

    getcampusXCompanyXUserFormDef(status: Operation = Operation.UPDATE, addedCompany: boolean = false): any {

        let obj = {
            CompanyName: ['', [Validators.required]],
            CampusName: [this._appService.getCurrentCampusName(), [Validators.required]],
            CompanyRole: [''],
            CampusRole: [''],
            UserSerialID: ['',],
            CompanyEmailAlias: ['', [Validators.email]],
            RelationshipStatus: [''],
            EmploymentContractHours: [0, [Validators.required, Validators.min(0), Validators.max(84)]],
            TeamName: ['', [Validators.required]],
            Email: [this.userForm.get('Email').value],
            _operation: [status],
            _unsavedCompany: [addedCompany],
            _adminRole: [false]
        }
        return obj;
    }

    

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlays if they are still on the DOM
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------



    private initRelationshipForm(rels: Array<any>, user: User, formGroupId: string, formGroupDef: any): void {
        // Clear the campusXCompanyXUserForm rels form arrays
        (this.userForm.get(formGroupId) as FormArray).clear();

        // Setup the emails form array
        const tempFormGroups = [];

        if (rels && rels.length > 0) {
            // Iterate through them
            rels.filter((rel) => rel.Email === user.Email).forEach((relationship) => {
                const formGroup = this._formBuilder.group(formGroupDef);
                // Create an email form group
                if (relationship.CompanyRole == "Admin") relationship._adminRole = true;
                else relationship._adminRole = false;
                relationship.TeamName = relationship.TeamName || 'none';
                relationship.EmploymentContractHours = relationship.EmploymentContractHours || 0;
                formGroup.patchValue(relationship);
                tempFormGroups.push(
                    formGroup
                );
            });
        }

        // Add the email form groups to the emails form array
        tempFormGroups.forEach((campusXCompanyXUserFormGroup) => {
            (this.userForm.get(formGroupId) as FormArray).push(campusXCompanyXUserFormGroup);
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------


    showSaveChangesAlert(newUser: boolean) {
        if (!this.userForm.dirty) {
            this.toggleEditMode(false);
            if (newUser) this._router.navigate(['../'], { relativeTo: this._activatedRoute });
            return;
        }

        const customDialog = this.dialog.open(CustomDialogComponent, {
            data: { title: "Are you sure to leave edit mode?", message: 'You will lose all unsaved changes.' }
        });

        customDialog.afterClosed().subscribe((toClose: boolean) => {
            if (toClose) {
                this.toggleEditMode(false);
                if (newUser) this._router.navigate(['../'], { relativeTo: this._activatedRoute });
            }
        });

    }

    addCompany(canRemove: boolean): void {
        (this.userForm.get('campusXCompanyXUserForm') as FormArray)
            .push(
                this._formBuilder.group(
                    this.getcampusXCompanyXUserFormDef(Operation.CREATE, canRemove)
                )
            );
        (this.userForm.get('campusXCompanyXUserForm') as FormArray).controls[0].markAllAsTouched();
    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._usersListComponent.matDrawer.close();
    }

    /**
     * Toggle edit mode
     *
     * @param editMode
     */
    toggleEditMode(editMode: boolean | null = null): void {
        if (editMode === null) {
            this.editMode = !this.editMode;
        }
        else {
            this.editMode = editMode;
        }
        if (!editMode) this.removeUnsavedCompanies();
        this.changeEmail = false;
        this._changeDetectorRef.markForCheck();
    }

    removeUnsavedCompanies() {
        const companies =
            Object.values((this.userForm.get('campusXCompanyXUserForm') as FormArray).controls)
                .map(
                    (c: FormGroup) => c.getRawValue()
                );
        let i = 0;
        companies.forEach(r => {
            if (r._unsavedCompany) this.removeCompany(i);
            i++;
        })
    }


    /**
     * Update the user
     */
    updateUser(isNew = false): void {
        const oldEmail = this.user.Email;

        let dialogEmail = "";
        let dialogPassword = "";

        // Get the user object
        this.userForm.get('campusXCompanyXUserForm').disable(); //useful to not consider that control in the dirty check
        const rawUser = this.userForm.dirty ? this.userForm.getRawValue() : null;
        const user = rawUser ? {
            ...rawUser
        } : null;
        if (user) delete user.Image_Base64;
        if (user && user.DateOfBirth) user.DateOfBirth =
            (typeof this.userForm.get('DateOfBirth').value === "string") ?
                moment(this.userForm.get('DateOfBirth').value).format('YYYY-MM-DD') : this.userForm.get('DateOfBirth').value.format('YYYY-MM-DD')

        if (user && user.DCCExpirationDate) user.DCCExpirationDate =
            (typeof this.userForm.get('DCCExpirationDate').value === "string") ?
                moment(this.userForm.get('DCCExpirationDate').value).format('YYYY-MM-DD') : this.userForm.get('DCCExpirationDate').value.format('YYYY-MM-DD')


        if (user) delete user.campusXCompanyXUserForm;
        if (user && user.CognitoGroupName) {
            user.IsVisitor = user.CognitoGroupName.includes("visitor");
            // user.IsVisitor = this.user.CognitoGroupName.includes("visitor");
        }
        if (user) this.user = user;

        if (user && user.SignedRegulations) {
            let docs: any[] = user.SignedRegulations;
            let signedTitles = docs.filter(d => d.Signed).map(d => d.DocumentTitle);
            user.SignedRegulations = signedTitles;
        }
        this.userForm.get('campusXCompanyXUserForm').enable(); //enabling the control again
        // make relationShips obj
        const relationShips =
            Object.values((this.userForm.get('campusXCompanyXUserForm') as FormArray).controls)
                .filter(
                    (c: FormGroup) => !c.pristine
                )
                .map(
                    (c: FormGroup) => c.getRawValue()
                );
       
        //set Adimn role eventually
        relationShips.forEach(relationship => {
            if (relationship._adminRole == true) relationship.CompanyRole = "Admin";
            else relationship.CompanyRole = "Common";

            relationship.UserSerialID = this.fillUserSerialID(relationship.UserSerialID)
        })

        if (!isNew) {
            if (user && oldEmail) user.Email = oldEmail;
            // Update the user on the server
            this._usersService.updateUser(user, relationShips).subscribe(() => {
                // Toggle the edit mode off
                relationShips.forEach(r => {
                    if (r._operation == Operation.CREATE) {
                        this._usersListComponent.rawRels.push(r);
                        this._usersService._CampusXCompanyXUserRels.next(this._usersListComponent.rawRels);
                    }
                    if (r._operation == Operation.UPDATE) {
                        let currentRelIndex = this._usersListComponent.rawRels.findIndex(rawRel => rawRel.CompanyName == r.CompanyName && rawRel.Email == r.Email);
                        this._usersListComponent.rawRels[currentRelIndex] = r;
                    }
                    let thisRelationshipFormControl = (this.userForm.get('campusXCompanyXUserForm') as FormArray).controls.find(e => e.get("CompanyName").value == r.CompanyName);
                    //useful if the user come back in the edit mode after adding a company and we need to not show the select from api.
                    thisRelationshipFormControl.get("_operation").reset();
                    //set form ad not dirty now. 
                    if (thisRelationshipFormControl.get("_unsavedCompany").value == true) {
                        thisRelationshipFormControl.get("_unsavedCompany").reset();
                        this.companiesCount++;
                    }

                    if (thisRelationshipFormControl.get("_adminRole").value == true) {
                        thisRelationshipFormControl.get("CompanyRole").setValue("Admin");
                    }

                    thisRelationshipFormControl.markAsPristine();

                    //TODO: resolve bug with dates.

                });
                this.toggleEditMode(false);
            });

        } else {
            let uniqueRelationships = []; //filter relationships if equals.
            relationShips.forEach(r => {
                if (uniqueRelationships.filter(rel => rel.CompanyName === r.CompanyName).length == 0) {
                    uniqueRelationships.push(r);
                }
            })
            // create the user on the server
            this._usersService.createUser(user, uniqueRelationships).subscribe(info => {
                if (info && info.Password && info.Password.length > 0) {
                    dialogEmail = info.Email
                    dialogPassword = info.Password
                }

                uniqueRelationships.forEach(r => {
                    if (r._operation == Operation.CREATE) {
                        this._usersListComponent.rawRels.push(r);
                        this._usersService._CampusXCompanyXUserRels.next(this._usersListComponent.rawRels);
                        let thisRelationshipFormControl = (this.userForm.get('campusXCompanyXUserForm') as FormArray).controls.find(e => e.get("CompanyName").value == r.CompanyName);
                        //useful if the user come back in the edit mode after adding a company and we need to not show the select from api.
                        thisRelationshipFormControl.get("_operation").reset();
                        if (thisRelationshipFormControl.get("_adminRole").value == true) {
                            thisRelationshipFormControl.get("CompanyRole").setValue("Admin");
                        }
                        //set form ad not dirty now. 
                        thisRelationshipFormControl.markAsPristine();
                    }
                })
                let imageBase64: string = typeof rawUser.Image_Base64 == "string" ? rawUser.Image_Base64 : "";
                if (imageBase64) {
                    let substr = imageBase64.substr(5);
                    let type = substr.split(";")[0];
                    let dataBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
                    //save photo 
                    this._usersService.uploadAvatar(this.user.Email, dataBase64, type).subscribe((result) => {
                        this.user.UserPhoto = result.Url;
                        this._usersService.getUsers().subscribe(() => {
                            this.toggleEditMode(false);
                            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                            this.openUserDialog(dialogEmail, dialogPassword)
                        });
                    });
                }
                else {
                    this._usersService.getUsers().subscribe(() => {
                        this.toggleEditMode(false);
                        this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                        this.openUserDialog(dialogEmail, dialogPassword)
                    });
                }
            });
        }

        if (this.user.Email === this.authService.currentUserEmail)
            this.authService.setCurrentUserInfo(this.user);
    }

    private openUserDialog(dialogEmail: string, dialogPassword: string) {
        let psw = ''
        if (dialogPassword.length > 0)
            psw = '<br>Email: <b>' + dialogEmail + '</b>, Temporary password: <b>' + dialogPassword + '</b>' +
                '<br><i>User must sign-in within six days.</i>'

        this.dialog.open(CustomDialogComponent, {
            data: { title: "User", message: 'User has been successfully created.', message2: psw, singleButton: true }
        });
    }

    private fillUserSerialID(uid: string): string {
        if (!uid) return "";
        return uid.padStart(this.userIDMaxLen, "0")
    }

    createUser(): void {
        this.updateUser(true);
    }

    /**
     * Delete the user
     */
    deleteUser(): void {
        const deleteDialog = this.dialog.open(CustomDialogComponent, {
            data: { title: "Are you sure to delete " + this.user.FName + " " + this.user.LName + "?", message: 'The action is not reversible.' }
        });

        deleteDialog.afterClosed().subscribe((isDone: boolean) => {
            if (isDone) {
                this._usersService.deleteUserById(this.user.Email).subscribe(deleted => {
                    if (deleted) {

                        this._usersListComponent.rawRels = this._usersListComponent.rawRels.filter((e: CampusXCompanyXUser) => e.Email != this.user.Email);
                        this._usersService._CampusXCompanyXUserRels.next(this._usersListComponent.rawRels);
                    }
                })
                this._router.navigate(['../../'], { relativeTo: this._activatedRoute });
            }
            this._changeDetectorRef.markForCheck();
        });
    }


    /**
     * Upload avatar
     *
     * @param fileList
     */
    uploadAvatar(fileList: FileList, changedEvent: any): void {
        // Return if canceled
        if (!fileList.length) {
            return;
        }
        const allowedTypes = ['image/jpeg', 'image/png'];
        const file = fileList[0];

        // Return if the file is not allowed
        if (!allowedTypes.includes(file.type)) {
            return;
        }

        const cropDialog = this.dialog.open(ImageCropperDialogComponent, {
            data: {
                imgChangedEvent: changedEvent
            }
        });


        cropDialog.afterClosed().subscribe((result: { file: File, base64: string, instantURL: string }) => {
            this._changeDetectorRef.markForCheck();
            if (result && result.instantURL) {
                this.user.UserPhoto = result.instantURL;
                this._changeDetectorRef.markForCheck();
                if (!this.newUser && result.base64) {
                    this._usersService.uploadAvatar(this.user.Email, result.base64, result.file.type).subscribe((result) => {
                        this.userForm.get("UserPhoto").setValue(result.Url); 
                    });
                }
                else {
                    //put the image in the form property
                    this.userForm.get("Image_Base64").setValue(result.instantURL);
                }

            }
        });
    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.userForm.get('UserPhoto');

        // Set the avatar as null
        avatarFormControl.setValue('');

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the user
        this.user.UserPhoto = null;
    }



    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }



    /**
     * Remove the email field
     *
     * @param index
     */
    removeCompany(index: number): void {
        const companiesFormArray = this.userForm.get('campusXCompanyXUserForm') as FormArray;

        const relationship = companiesFormArray.controls[index];
        let objectControl = (relationship as FormGroup).controls
        if (objectControl._unsavedCompany.value) {
            //remove without dialog
            //(relationship as FormGroup).markAsDirty();
            //objectControl._operation.setValue(Operation.DELETE);
            this.companiesCount--;
            companiesFormArray.removeAt(index);
            //put in the form initial status
            this._changeDetectorRef.markForCheck();

            return;
        }
        //open dialog 
        const deleteDialog = this.dialog.open(CustomDialogComponent, {
            data: { title: "Are you sure to delete " + objectControl.CompanyName.value + " company association?", message: 'The action is not reversible.' }
        });

        deleteDialog.afterClosed().subscribe((isDone: boolean) => {
            if (isDone) {
                this._usersService.deleteCompanyRelationship(objectControl.CompanyName.value, this.user.Email).subscribe(deleted => {
                    if (deleted) {
                        companiesFormArray.removeAt(index);
                        this.companiesCount--;
                        this._usersListComponent.rawRels = this._usersListComponent.rawRels.filter((e: CampusXCompanyXUser) => e.CompanyName != objectControl.CompanyName.value || e.Email != this.user.Email);
                        this._usersService._CampusXCompanyXUserRels.next(this._usersListComponent.rawRels);
                        this._changeDetectorRef.markForCheck();


                    }
                })
                //this._router.navigate(['../../'], { relativeTo: this._activatedRoute });
            }
            this._changeDetectorRef.markForCheck();
        });
    }



    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }



}



export class CustomGroupFieldValidator {
    static userGroupValidator(metadata: FunctionalityMetadata, groupField: string, errorName: string = 'groupEmpty'): ValidatorFn {
        return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
            let control = formGroup.get(groupField);
            if (metadata && metadata.Specifications?.includes("Employee")) {
                return null; //you can create just employee so don't specify it
            }
            if (!control.value) {
                control.setErrors({ 'incorrect': true })
                return { [errorName]: true }; //you are admin you need to specify it
            }
            else return null;
        };
    }
}

export class CustomCFFieldValidator {
    static CFValidator(CFField: string, errorName: string = 'CF-wrong'): ValidatorFn {
        return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
            let control = formGroup.get(CFField);
            let cf = control.value;
            if (!cf) return null;
            const regex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/i;
            const found = cf.match(regex);

            if (cf && !found) {
                //set invalid css
                control.setErrors({ 'incorrect': true })
                return { [errorName]: true };
            }
            else {
                return null;
            }
        };
    }
}
