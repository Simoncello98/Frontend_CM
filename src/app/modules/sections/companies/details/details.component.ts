import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TemplatePortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatDrawerToggleResult } from '@angular/material/sidenav';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Company, Country, Tag, CampusXCompanyXCompany, RelationshipStatus } from 'app/modules/sections/companies/companies.types';
import { CompaniesListComponent } from 'app/modules/sections/companies/list/list.component';
import { CompaniesService } from 'app/modules/sections/companies/companies.service';
import { combineLatest } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from 'app/shared/deleteDialog/delete-dialog.component';
import { AuthorizationService } from 'app/core/navigation/navigation.service';
import { ImageCropperDialogComponent } from 'app/shared/ImageCropperDialog/image-cropper-dialog.component';

@Component({
    selector: 'companies-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesDetailsComponent implements OnInit,AfterViewInit, OnDestroy {
    editMode: boolean;
    tags: Tag[];
    tagsEditMode: boolean;
    filteredTags: Tag[];
    company: Company;
    companyForm: FormGroup;
    campusXCompanyXCompanyForm: FormGroup;
    companies: CampusXCompanyXCompany[];
    countries: Country[];
    newCompany: boolean;

    frontTemplateURL$: Subject<string>;
    backTemplateURL$: Subject<string>;


    // Private
    private _tagsPanelOverlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any>;


    @ViewChild('avatarFileInput')
    private _avatarFileInput: ElementRef;

    @ViewChild('tagsPanel')
    private _tagsPanel: TemplateRef<any>;

    @ViewChild('tagsPanelOrigin')
    private _tagsPanelOrigin: ElementRef;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {CompaniesListComponent} _companiesListComponent
     * @param {CompaniesService} _companiesService
     * @param {FormBuilder} _formBuilder
     * @param {Renderer} _renderer2
     * @param {Router} _router
     * @param {Overlay} _overlay
     * @param {ViewContainerRef} _viewContainerRef
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _companiesListComponent: CompaniesListComponent,
        public _companiesService: CompaniesService,
        private _formBuilder: FormBuilder,
        private _renderer2: Renderer2,
        private _router: Router,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
        private dialog: MatDialog,
        public authorizationService: AuthorizationService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.frontTemplateURL$ = new Subject<string>();
        this.backTemplateURL$ = new Subject<string>();

        // Set the defaults
        this.editMode = false;
        this.tagsEditMode = false;
    }
    ngAfterViewInit(): void {
        if(!this.newCompany){
            this._companiesService.toggle$.pipe(takeUntil(this._unsubscribeAll)).subscribe(r => {
                this.toggleEditMode(r);
                this._changeDetectorRef.markForCheck();
            })
        }
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    
    /**
     * On init
     */
    ngOnInit(): void {


        // Open the drawer
        this._companiesListComponent.matDrawer.open();

        // Create the company form
        this.companyForm = this._formBuilder.group({
            vertical: [''],
            horizontal: [''],
            CompanyName: ['', [Validators.required]],
            CompanyStatus: ['', []],
            WebsiteURL: ['', []],
            Theme: ['', []],
            Logo_Base64: [[], []],
            Front_Badge_Base64: [[], []],
            Back_Badge_Base64: [[], []]

        });

        



        combineLatest([this._companiesService.company$])
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((companyAndRes: [Company]) => {
                const company = companyAndRes[0];

                // Check if is an company to create
                this.newCompany = this._activatedRoute.snapshot.routeConfig.path === 'newCompany';

                // Get the company
                this.company = this.newCompany ? {} as any : company;

                // Patch values to the form
                this.companyForm.patchValue(company);

                // Toggle the edit mode off
                this.toggleEditMode(this.newCompany);

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });


        // Get the country telephone codes
        this._companiesService.countries$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((codes: Country[]) => {
                this.countries = codes;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Get the tags
        this._companiesService.tags$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((tags: Tag[]) => {
                this.tags = tags;
                this.filteredTags = tags;

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
        this._changeDetectorRef.markForCheck();
        // Dispose the overlays if they are still on the DOM
        if (this._tagsPanelOverlayRef) {
            this._tagsPanelOverlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Close the drawer
     */
    closeDrawer(): Promise<MatDrawerToggleResult> {
        this.company = {} as Company;
        this._changeDetectorRef.markForCheck();
        return this._companiesListComponent.matDrawer.close();
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

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    /**
     * Update the company
     */
    updateCompany(isNew = false): void {
        // Get the company object
        const company = this.companyForm.getRawValue();
        if (!isNew) {
            // Update the company on the server
            this._companiesService.updateCompany(company).subscribe(() => {
                // Toggle the edit mode off
                this.toggleEditMode(false);
            });

        } else {
            // create the company on the server
            this._companiesService.createCompany(company).subscribe(() => {
                // Toggle the edit mode off
                let promises = [this.checkForLogoUploadDuringCreation(company), this.checkForBadgeTemplateUploadDuringCreation(company, 'front'), this.checkForBadgeTemplateUploadDuringCreation(company, 'back')];
                Promise.all(promises).then(() => {
                    this._companiesService.getCompanies().subscribe(() => {
                        this.toggleEditMode(false);
                        this._router.navigate(['../', company.CompanyName], { relativeTo: this._activatedRoute });
                    });

                })
            });
        }
    }


    checkForLogoUploadDuringCreation(companyRawValues: any): Promise<boolean> {
        let resultSubject = new Subject<boolean>();
        let logoBase64: string =  typeof companyRawValues.Logo_Base64 == "string" ? companyRawValues.Logo_Base64 : "";
        if (logoBase64) {
            let substr = logoBase64.substr(5);
            let type = substr.split(";")[0];
            let dataBase64 = logoBase64.replace(/^data:image\/\w+;base64,/, "");
            this._companiesService.uploadAvatar(companyRawValues.CompanyName, dataBase64, type).subscribe(r => {
                this.company.Logo = r.Url;
                resultSubject.next(true);
                resultSubject.complete();
            })
        }
        else {
            resultSubject.next(false);
            resultSubject.complete();
        }
        return resultSubject.toPromise();
    }

    checkForBadgeTemplateUploadDuringCreation(companyRawValues: any, side: "front" | "back") {
        let resultSubject = new Subject<boolean>();
        let templateBase64 : string = "";
        if(side == "front") templateBase64 = typeof companyRawValues.Front_Badge_Base64 == "string" ? companyRawValues.Front_Badge_Base64 : "";
        else templateBase64 = typeof companyRawValues.Back_Badge_Base64 == "string" ? companyRawValues.Back_Badge_Base64 : "";
        //let templateBase64: string = side == "front" ? companyRawValues.Front_Badge_Base64 : companyRawValues.Back_Badge_Base64;
        if (templateBase64) {
            let substr = templateBase64.substr(5);
            let type = substr.split(";")[0];
            let dataBase64 = templateBase64.replace(/^data:image\/\w+;base64,/, "");
            this._companiesService.uploadBadgeTemplate(companyRawValues.CompanyName, dataBase64, side, type).subscribe(r => {
                side == "front" ? this.company.BadgeFrontTemplateURL = r.Url : this.company.BadgeBackTemplateURL = r.Url
                resultSubject.next(true);
                resultSubject.complete();
            })
        }
        else {
            resultSubject.next(false);
            resultSubject.complete();
        }
        return resultSubject.toPromise();
    }

    createCompany(): void {
        this.updateCompany(true);
    }

    /**
     * Delete the company
     */
    deleteCompany(): void {
        const deleteDialog = this.dialog.open(DeleteDialogComponent, {
            data: { name: `${this.company.CompanyName}` }
        });


        deleteDialog.afterClosed().subscribe((deleteCompany: boolean) => {
            if (deleteCompany) {
                this._companiesService.deleteCompany(this.company).subscribe(() => {
                    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
                });
            }
            this._changeDetectorRef.markForCheck();
        });
    }





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
        //TODO: call dialog open
        const cropDialog = this.dialog.open(ImageCropperDialogComponent, {
            data: {
                imgChangedEvent: changedEvent,
                aspectRatio: 1.545,
                resolution: 1024,

            }
        });
        cropDialog.afterClosed().subscribe((result: { file: File, base64: string, instantURL: string }) => {
            this._changeDetectorRef.markForCheck();
            if (result && result.instantURL) {
                //put the instant base64 url 
                this.company.Logo = result.instantURL;
                this._changeDetectorRef.markForCheck();
                if (!this.newCompany) {
                    this._companiesService.uploadAvatar(this.company.CompanyName, result.base64, file.type).subscribe(() => {
                    });
                }
                else {
                    //put the image in the form property
                    this.companyForm.get("Logo_Base64").setValue(result.instantURL);
                }
            }
        });
        this._changeDetectorRef.markForCheck();
    }

    uploadBadgeTemplate(fileList: FileList, side: "front" | "back", changedEvent: any): void {
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
        // call dialog crop with info dimension
        const cropDialog = this.dialog.open(ImageCropperDialogComponent, {
            data: {
                imgChangedEvent: changedEvent,
                aspectRatio: 1.545,
                resolution: 1024
            }
        });
        //Front_Badge_Base64
        cropDialog.afterClosed().subscribe((result: { file: File, base64: string, instantURL: string }) => {
            this._changeDetectorRef.markForCheck();
            if (result && result.instantURL) {
                //put the instant base64 url 
                if (side == "front") this.company.BadgeFrontTemplateURL = result.instantURL;
                else this.company.BadgeBackTemplateURL = result.instantURL;
                this._changeDetectorRef.markForCheck();
                if (!this.newCompany) {
                    this._companiesService.uploadBadgeTemplate(this.company.CompanyName, result.base64, side, file.type).subscribe(() => {
                    });
                }
                else {
                    //put the image in the form property 
                    if (side == "front") this.companyForm.get("Front_Badge_Base64").setValue(result.instantURL);
                    else this.companyForm.get("Back_Badge_Base64").setValue(result.instantURL);
                }
            }
        });

        //petro: noto che ha messo i trattini negli spazi dei nomi, questa cosa potrebbe nonf ar funzionare più nulla

    }

    /**
     * Remove the avatar
     */
    removeAvatar(): void {
        // Get the form control for 'avatar'
        const avatarFormControl = this.companyForm.get('avatar');

        // Set the avatar as null
        avatarFormControl.setValue(null);

        // Set the file input value as null
        this._avatarFileInput.nativeElement.value = null;

        // Update the company
        // this.company.CompanyPhoto = null;
    }

    /**
     * Open tags panel
     */
    openTagsPanel(): void {
        // Create the overlay
        this._tagsPanelOverlayRef = this._overlay.create({
            backdropClass: '',
            hasBackdrop: true,
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._tagsPanelOrigin.nativeElement)
                .withFlexibleDimensions()
                .withViewportMargin(64)
                .withLockedPosition()
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    }
                ])
        });

        // Subscribe to the attachments observable
        this._tagsPanelOverlayRef.attachments().subscribe(() => {

            // Add a class to the origin
            this._renderer2.addClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // Focus to the search input once the overlay has been attached
            this._tagsPanelOverlayRef.overlayElement.querySelector('input').focus();
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._tagsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._tagsPanelOverlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._tagsPanelOverlayRef.backdropClick().subscribe(() => {

            // Remove the class from the origin
            this._renderer2.removeClass(this._tagsPanelOrigin.nativeElement, 'panel-opened');

            // If overlay exists and attached...
            if (this._tagsPanelOverlayRef && this._tagsPanelOverlayRef.hasAttached()) {
                // Detach it
                this._tagsPanelOverlayRef.detach();

                // Reset the tag filter
                this.filteredTags = this.tags;

                // Toggle the edit mode off
                this.tagsEditMode = false;
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });
    }

    /**
     * Toggle the tags edit mode
     */
    toggleTagsEditMode(): void {
        this.tagsEditMode = !this.tagsEditMode;
    }

    /**
     * Filter tags
     *
     * @param event
     */
    filterTags(event): void {
        // Get the value
        const value = event.target.value.toLowerCase();

        // Filter the tags
        this.filteredTags = this.tags.filter(tag => tag.title.toLowerCase().includes(value));
    }


    /**
     * Should the create tag button be visible
     *
     * @param inputValue
     */
    shouldShowCreateTagButton(inputValue: string): boolean {
        return !!!(inputValue === '' || this.tags.findIndex(tag => tag.title.toLowerCase() === inputValue.toLowerCase()) > -1);
    }


    /**
     * Remove the email field
     *
     * @param index
     */
    removeCompany(index: number): void {
        // Get form array for emails
        const emailsFormArray = this.companyForm.get('campusXCompanyXCompanyForm') as FormArray;
        // Remove the email field
        const relationship = emailsFormArray.controls[index];
        (relationship as FormGroup).controls._status.setValue(RelationshipStatus.DELETE);
        // Mark as dirty so it will be passed to the service in the UpdateCompany function
        (relationship as FormGroup).markAsDirty();
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Add an empty phone number field
     */
    addPhoneNumberField(): void {
        // Create an empty phone number form group
        const phoneNumberFormGroup = this._formBuilder.group({
            country: ['us'],
            number: [''],
            label: ['']
        });

        // Add the phone number form group to the phoneNumbers form array
        (this.companyForm.get('phoneNumbers') as FormArray).push(phoneNumberFormGroup);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Remove the phone number field
     *
     * @param index
     */
    removePhoneNumberField(index: number): void {
        // Get form array for phone numbers
        const phoneNumbersFormArray = this.companyForm.get('phoneNumbers') as FormArray;

        // Remove the phone number field
        phoneNumbersFormArray.removeAt(index);

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Get country info by iso code
     *
     * @param iso
     */
    getCountryByIso(iso: string): Country {
        return this.countries.find((country) => country.iso === iso);
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

