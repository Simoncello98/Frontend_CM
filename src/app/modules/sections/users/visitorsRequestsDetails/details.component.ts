import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { from, Observable, Observer, of, Subject } from 'rxjs';
import { debounceTime, map, takeUntil } from 'rxjs/operators';
import { Visitor, VisitorsRequest } from '../visitorsrequests.types';
import { UsersListComponent } from '../list/list.component';
import { VisitorsRequestsService } from '../visitorsrequests.service';
import { combineLatest } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Amplify, { API } from 'aws-amplify';

import { CampusXCompanyXUser, User } from '../../users/users.types';
import { AuthorizationService } from 'app/core/navigation/navigation.service';
import { group } from 'console';
import { bind, take } from 'lodash';
import { AuthService } from 'app/core/auth/auth.service';
import { SharedService } from 'app/shared/shared.service';
import { UsersService } from '../users.service';
import { AppService } from 'app/app.service';
import moment from 'moment';
import { AmazingTimePickerService } from 'amazing-time-picker';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { getBaseApiPath } from 'main';

@Component({
    selector: 'visitorsrequests-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class VisitorsRequestsDetailsComponent implements OnInit, OnDestroy {
    editMode: boolean;

    tagsEditMode: boolean;
    visitorsrequest: VisitorsRequest;

    campusXVisitorsRequestXVisitorsRequestForm: FormGroup;
    newVisitorsRequest: boolean;

    selectForm: FormGroup;
    createRequestForm: FormGroup;
    userForm: FormGroup;
    requestForm: FormGroup;

    VisitorPromise: Promise<CampusXCompanyXUser[]>;
    visitor: User;
    requestHost: User;
    hostsPromise: Promise<CampusXCompanyXUser[]>
    hostEmail: string = "";
    //hostCompaniesPromise: Promise<any[]>;
    hostCompaniesObservable: Observable<any[]>;

    VisitorEmail: string;
    VisitorFirstName: string;
    VisitorLastName: string;
    VisitorCF: string;
    VisitorPOB: string;
    VisitorCID: string;

    visitorCreated: boolean = false;
    //visitorSelected: boolean = false;
    myUserEmail: string;
    requestHostObservable: Observable<User>;

    pendingCreation = false;

    // Private
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any>;

    verticalStepperForm: FormGroup;

    minStartDate: string;
    minStartTime: string;
    minEndDate: string;
    minEndTime: string;

    deniedSelectEndDate: boolean = false;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {VisitorsRequestsListComponent} _visitorsrequestsListComponent
     * @param {VisitorsRequestsService} _visitorsrequestsService
     * @param {FormBuilder} _formBuilder
     * @param {Renderer} _renderer2
     * @param {Router} _router
     * @param {Overlay} _overlay
     * @param {ViewContainerRef} _viewContainerRef
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _visitorsrequestsListComponent: UsersListComponent,
        private _visitorsrequestsService: VisitorsRequestsService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        public authorizationService: AuthorizationService,
        private _authService: AuthService,
        private _sharedService: SharedService,
        private _usersListComponent: UsersListComponent,
        private _usersService: UsersService,
        private _appService: AppService,
        private atp: AmazingTimePickerService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Set the defaults
        this.editMode = false;
        this.tagsEditMode = false;

        //yyyy-MM-ddThh:mm
        this.deniedSelectEndDate = 
            this.authorizationService.getFunctionalityMetadata('createVisitorRequest').DeniedOperations?.includes('SelectEndDate')

        // New specification from last meeting: employee must be able to create visitors request also for today 
        // if (this.deniedSelectEndDate)
        //     this.minStartDate = moment().add(1, 'day').format('YYYY-MM-DD')
        // else 
        this.minStartDate = moment().format('YYYY-MM-DD')
        //this.minEndDateTime = this.minDateTime
        //this.minEndTime = moment().format('HH:mm')
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
            */
    ngOnInit(): void {
        // Open the drawer
        this.myUserEmail = this._authService.getCurrentUserEmail();
        this.VisitorEmail = '';
        this.VisitorFirstName = '';
        this.VisitorLastName = '';
        this.VisitorCF = '';
        this.VisitorPOB = '';
        this.VisitorCID = '';
        this._istantiateForms();
        this._startObservers();
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

    onArrivalDateChange() {
        this.minEndDate = moment(this.requestForm.get("startDate").value).format('YYYY-MM-DD')
        if(moment(this.requestForm.get("startDate").value).isAfter(moment(this.requestForm.get("endDate").value))) 
            this.requestForm.get("endDate").setValue(this.requestForm.get("startDate").value)
    }

    endTimeValidator() {
        if(this.checkEmptyFormDates()) return 
        if(moment(this.requestForm.get("startDate").value).isSame(moment(this.requestForm.get("endDate").value))) {
            let start = moment(moment(this.requestForm.get("startDate").value).format('YYYY-MM-DD') + "T" + this.requestForm.get("startTime").value)
            let end = moment(moment(this.requestForm.get("endDate").value).format('YYYY-MM-DD') + "T" + this.requestForm.get("endTime").value)
            if(end.isBefore(start))
                this.requestForm.get("endTime").setValue(this.requestForm.get("startTime").value)
        }
    }

    private checkEmptyFormDates(): boolean {
        return  !this.requestForm.get("startDate").value || 
                !this.requestForm.get("startTime").value || 
                !this.requestForm.get("endTime").value ||
                (!this.deniedSelectEndDate && !this.requestForm.get("endDate").value)
    }

    openArrivalTimePicker() {
        this.openTimePicker('startTime')
    }

    openEndTimePicker() {
        this.openTimePicker('endTime')
    }

    private openTimePicker(form: string) {
        const amazingTimePicker = this.atp.open({
            //time:  this.selectedTime,
            theme: 'dark',
            arrowStyle: {
                background: 'red',
                color: 'white'
            }
        });
        amazingTimePicker.afterClose().subscribe(time => {
            this.requestForm.get(form).setValue(time)
            this.endTimeValidator()
        });
    }

    private _istantiateForms() {
        this.requestForm = this._formBuilder.group({
            selectHost: ['', []],
            requestHostTelephoneNumber: ['', [Validators.required]],
            selectCompany: ['', [Validators.required]],
            startDate: [moment(), [Validators.required]],
            startTime: ['09:00', [Validators.required]],
            endDate: [moment(), []],
            endTime: ['18:00', [Validators.required]]
        }, {
            validator: []
        });

        if (!this.authorizationService.getFunctionalityMetadata("CreateVisitorRequest").DeniedOperations?.includes("SelectHost")) {
            this.requestForm.controls.selectHost.setValidators([Validators.required]);
        }
        if(!this.deniedSelectEndDate) {
            this.requestForm.controls.endDate.setValidators([Validators.required]);
        }

        this.userForm = this._formBuilder.group({
            LName: ['', [Validators.required]],
            FName: ['', [Validators.required]],
            Email: ['', [Validators.email]],
            DateOfBirth: [''],
            UserPhoto: ['', []],
            CardID: ['', []],
            SocialNumber: ['', []],
            PlaceOfBirth: ['', []],
            TelephoneNumber: ['', [Validators.pattern("^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$"), Validators.minLength(10)]],
            UserStatus: ['', []],
            IsVisitor: ['', []]
        }, {
            validator: [
                CustomCFFieldValidator.CFValidator("SocialNumber")
            ]
        });

        this._visitorsrequestsListComponent.matDrawer.open();

        this.selectForm = this._formBuilder.group({
            selectVisitor: ['']
        }),

            this.verticalStepperForm = this._formBuilder.group({
                step1: this.selectForm,
                step2: this._formBuilder.group({
                    visitor: this.userForm
                }),
                step3: this._formBuilder.group({
                    request: this.requestForm
                }),

            });

        this.createRequestForm = this._formBuilder.group({
            verticalStepperForm: this.verticalStepperForm
        })
    }


    private _startObservers() {

        this.VisitorPromise = API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetVisitors"), {
            queryStringParameters: {
                CampusName: this._appService.getCurrentCampusName()
            },
        }).then((users: CampusXCompanyXUser[]) => [...new Map<string, any>(users.map((item: CampusXCompanyXUser) => [item.Email, item])).values()]);

        if (!this.authorizationService.getFunctionalityMetadata("CreateVisitorRequest").DeniedOperations?.includes("SelectHost")) {
            this.hostsPromise = API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUsers"), {
                queryStringParameters: {
                    CampusName: this._appService.getCurrentCampusName()
                },
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            }).then((users: CampusXCompanyXUser[]) => {
                return [...new Map<string, any>(users.filter(u => !u.IsVisitor).map((item: CampusXCompanyXUser) => [item.Email, item])).values()]
            });
        }


        this.selectForm.get('selectVisitor').valueChanges.subscribe((value: string) => {
            if (!value) return;
            this.visitor = null;
            let email: string;
            email = value.slice(); //copy the string
            API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUser"), {
                queryStringParameters: {
                    Email: email
                },
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            }).then((user: User) => {
                this.visitor = user;
                //put in form the current user values to enable the button next on step2
                this.userForm.get('LName').setValue(user.LName);
                this.userForm.get('FName').setValue(user.FName);
                this.userForm.get('Email').setValue(user.Email);

            });
            this._visitorsrequestsService.getVisitorsRequestsByVisitor(email).subscribe(requests => {
                let ordered = requests.sort((a, b) => { return moment(a.EstimatedReleaseDate).unix() - moment(b.EstimatedReleaseDate).unix() });
                if(ordered.length > 0){
                    let lastRequest = ordered[ordered.length-1];
                    this.requestForm.controls.selectHost.setValue(lastRequest.UserHostEmail);
                }
                
            })
        });

      

        if (this.authorizationService.getFunctionalityMetadata("CreateVisitorRequest").DeniedOperations?.includes("SelectHost")) {
            this.requestHost = this._authService.getCurrentUserInfo();
            if (this.requestHost.TelephoneNumber) this.requestForm.get("requestHostTelephoneNumber").setValue(this.requestHost.TelephoneNumber);
            else this.requestForm.get("requestHostTelephoneNumber").reset();
            //get the current user companies now!
            this.hostCompaniesObservable = this.getCompaniesFromCurrentUser();
        }
        else {//start observer for getting selected host companies on selection
            this.requestHostObservable = this.getSelectedHostInfo();
            this.requestHostObservable.subscribe((hostUser: User) => {
                this.requestHost = hostUser;
                if (hostUser.TelephoneNumber) this.requestForm.get("requestHostTelephoneNumber").setValue(hostUser.TelephoneNumber);
                else this.requestForm.get("requestHostTelephoneNumber").reset();
            });
            this.hostCompaniesObservable = this.getCompaniesFromSelectedHost();
        }
    }

    private getCompaniesFromSelectedHost(): Observable<CampusXCompanyXUser[]> {
        return new Observable((res) => {
            this.requestForm.get("selectHost").valueChanges.subscribe((value: string) => {
                API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUserParentCompaniesAndCampuses"), {
                    queryStringParameters: {
                        Email: value
                    },
                }).catch((error) => {
                    this._sharedService.openErrorDialog(error);
                    console.log("rejected:  " + error);
                }).then((records: CampusXCompanyXUser[]) => {
                    records = records.filter(u => u.CampusName === this._appService.getCurrentCampusName());
                    let result: CampusXCompanyXUser[] = [...new Map<string, any>(records.map((item: CampusXCompanyXUser) => [item.CompanyName, item])).values()]
                    if (this.authorizationService.getFunctionalityMetadata("CreateVisitorRequest").Specifications?.includes("OnlyMyCompanies")) {
                        this.getCompaniesFromCurrentUser().subscribe(currentUserCompanies => {
                            result = result.filter(c => currentUserCompanies.findIndex(e => e.CompanyName == c.CompanyName) != -1);
                            res.next(result);
                        })
                    }
                    else {
                        res.next(result);
                    }

                    //res.complete();
                });
            })
        });
    }

    private getCompaniesFromCurrentUser(): Observable<CampusXCompanyXUser[]> {
        return new Observable((res) => {
            API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUserParentCompaniesAndCampuses"), {
                queryStringParameters: {
                    Email: this._authService.getCurrentUserEmail()
                },
            }).catch((error) => {
                this._sharedService.openErrorDialog(error);
                console.log("rejected:  " + error);
            }).then((records: CampusXCompanyXUser[]) => {
                records = records.filter(u => u.CampusName === this._appService.getCurrentCampusName());
                let result: CampusXCompanyXUser[] = [...new Map<string, any>(records.map((item: CampusXCompanyXUser) => [item.CompanyName, item])).values()]
                res.next(result);
                //res.complete();
            });
        });
    }

    private getSelectedHostInfo(): Observable<any> {
        return new Observable((res) => {
            this.requestForm.get("selectHost").valueChanges.subscribe((value: string) => {
                //remove current host if there is a change of selection
                this.requestHost = null;
                API.get(getBaseApiPath(), this.authorizationService.getApiPath("GetUser"), {
                    queryStringParameters: {
                        Email: value
                    },
                }).catch((error) => {
                    this._sharedService.openErrorDialog(error);
                    console.log("rejected:  " + error);
                }).then((record: User) => {
                    res.next(record);
                    //res.complete();
                });
            })
        });
    }

    public constructVisitor() {
        if (!this.visitor) { //create new visitor with form parameters
            let newVisitor: User = {
                LName: this.userForm.get('LName').value,
                FName: this.userForm.get('FName').value,
                Email: this.userForm.get('Email').value,
                DateOfBirth: this.userForm.get('DateOfBirth').value,
                UserPhoto: "",
                CardID: this.userForm.get('CardID').value,
                SocialNumber: this.userForm.get('SocialNumber').value,
                PlaceOfBirth: this.userForm.get('PlaceOfBirth').value,
                TelephoneNumber: this.userForm.get('TelephoneNumber').value,
                IsVisitor: true,
                UserStatus: "",
                //CognitoGroupName : '' is automatically set from api
            }
            this.visitor = newVisitor;
        }
    }

    public confirmRequest() {
        if (this.pendingCreation) return;
        let request = this.constructVisitorRequest();
        let hostToUpdate = false;
        if (!this.requestHost.TelephoneNumber) {
            this.requestHost.TelephoneNumber = this.requestForm.get("requestHostTelephoneNumber").value;
            hostToUpdate = true;
            request.UserHostTelephoneNumber = this.requestHost.TelephoneNumber;
        }
        this.pendingCreation = true;
        
        this._visitorsrequestsService.confirmRequest(request, this.requestHost, this.visitorCreated, this.visitor, hostToUpdate).subscribe(res => {

            if (this.visitorCreated) {
                //put the relationship for appearing record in tables. 
                let relationship = {
                    ...this.visitor,
                    TeamName: 'none',
                    EmploymentContractHours: 0,
                    CompanyName: request.UserHostCompanyName,
                    CampusName: this._appService.getCurrentCampusName(),
                } as CampusXCompanyXUser;


                this._usersListComponent.rawRels.push(relationship);
                this._usersService._CampusXCompanyXUserRels.next(this._usersListComponent.rawRels);
            }
            this.pendingCreation = false;
            this._router.navigate(['../'], { relativeTo: this._activatedRoute });
            // Mark for check
            this._changeDetectorRef.markForCheck();
        }) 
    }

    private constructVisitorRequest(): VisitorsRequest {
        let startDate =  
            moment(this.requestForm.get("startDate").value).format('YYYY-MM-DD') +
            "T" + 
            this.requestForm.get("startTime").value;
        let endDate = "";
        if (this.deniedSelectEndDate) { //we are not admin or frontdesk
            //get the startDate
            endDate = 
                moment(this.requestForm.get("startDate").value).format('YYYY-MM-DD') +
                "T" + 
                this.requestForm.get("endTime").value;
        }
        else {//get date from form 
            endDate = 
                moment(this.requestForm.get("endDate").value).format('YYYY-MM-DD') +
                "T" + 
                this.requestForm.get("endTime").value;
        }

        let visitorRequest: VisitorsRequest = {
            VisitorRequestID: "",
            CampusName: this._appService.getCurrentCampusName(),
            EstimatedDateOfArrival: startDate,
            EstimatedReleaseDate: endDate,
            UserHostCompanyName: this.requestForm.get("selectCompany").value,
            UserHostEmail: this.requestHost.Email,
            UserHostTelephoneNumber: this.requestHost.TelephoneNumber,
            VisitorEmail: this.visitor.Email,
            VisitorTelephoneNumber: this.visitor.TelephoneNumber,
            VisitorRequestStatus: "PENDING"
        }
        return visitorRequest;
    }


    public selectionChange(e): void {
        if (e.selectedIndex === 2) { //check if visitor exists or not. 
            //at the last step check the situation to understand if the visitor is created or selected.
            //you cannot have th eselectVisitor filled and the visitor created. 
            if (this.selectForm.get('selectVisitor').value) this.visitorCreated = false;
            else this.visitorCreated = true;
            this.constructVisitor(); //get all values from texfields, in both cases
        }
    }


    //TODO: this is the class that has more margin bottom : 
    //.mat-form-field-wrapper
    //better if we remove margin from address class and we use alwys appearence "fill" on form controls.
    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    public startCreateVisitorProcess() {
        this.visitor = null; //remove all current visitor selected
        //reset forms 
        this.userForm.reset();
        this.selectForm.controls.selectVisitor.reset();

    }

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        return this._visitorsrequestsListComponent.matDrawer.close();
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

export class CustomCFFieldValidator {
    static CFValidator(CFField: string, errorName: string = 'CF-wrong'): ValidatorFn {
        return (formGroup: AbstractControl): { [key: string]: boolean } | null => {
            let control = formGroup.get(CFField);
            let cf = control.value;
            if(!cf) return null;
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
