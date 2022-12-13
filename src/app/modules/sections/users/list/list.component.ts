import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { combineLatest, fromEvent, Observable, Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { TreoMediaWatcherService } from '@treo/services/media-watcher';
import { User, Country, CampusXCompanyXUser, Badge, CampusXCompanyXUserCompaniesGrouped } from 'app/modules/sections/users/users.types';
import { UsersService } from 'app/modules/sections/users/users.service';
import { AuthorizationService } from 'app/core/navigation/navigation.service';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { VisitorsRequestsService } from '../visitorsrequests.service';
import { VisitorsRequest } from '../visitorsrequests.types';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'app/core/auth/auth.service';
import { CustomDialogComponent } from 'app/shared/customDialog/custom-dialog.component';
import { AppService } from 'app/app.service';
import { MatPaginator } from '@angular/material/paginator';
import moment from 'moment';


@Component({
    selector: 'users-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersListComponent implements OnInit, OnDestroy, AfterViewInit {
    users$: Observable<CampusXCompanyXUser[]>;
    temporaryUsers$: Observable<Badge[]>;
    visitorsrequests$: Observable<VisitorsRequest[]>;

    rawRels: CampusXCompanyXUser[];
    temporaryUsers: Badge[];
    visitorsRequests: VisitorsRequest[];

    //usersDataSource : CampusXCompanyXUser[] = [];
    usersDataSource = new MatTableDataSource([]);
    visitorsDataSource = new MatTableDataSource([]);
    requestsDataSource = new MatTableDataSource([]);

    usersCount: number;
    visitorsCount: number;
    requestsCount: number;


    usersTableColumns: string[];
    visitorsTableColumns: string[];
    requestsTableColumns: string[];

    countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl;
    selectedUser: User;
    selectedVisitorsRequest: VisitorsRequest;


    currentTableDataGroup = "users"; 

    @ViewChild('matDrawer', { static: true })
    matDrawer: MatDrawer;
    //private paginator: MatPaginator;

    @ViewChild('visitorsPaginator', { read: MatPaginator }) visitorsPaginator: MatPaginator;
    @ViewChild('requestPaginator', { read: MatPaginator }) requestPaginator: MatPaginator;
    @ViewChild('temporaryPaginator', { read: MatPaginator }) temporaryPaginator: MatPaginator;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatDrawerContent) content: MatDrawerContent;
    
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor 
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {UsersService} _usersService
     * @param {DOCUMENT} _document
     * @param {Router} _router
     * @param {TreoMediaWatcherService} _treoMediaWatcherService
     */
    constructor(
        public authorizationService: AuthorizationService,
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _usersService: UsersService,
        @Inject(DOCUMENT) private _document: any,
        private _router: Router,
        private _treoMediaWatcherService: TreoMediaWatcherService,
        private _visitorsrequestsService: VisitorsRequestsService,
        private dialog: MatDialog,
        public authService: AuthService,
        private _appService : AppService
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        // Set the defaults
        this.usersCount = 0;
        this.visitorsCount = 0;
        this.usersTableColumns = ['Info', "RelatedCompanies", "Actions"];
        this.visitorsTableColumns = ['Info', "RelatedCompanies", "Actions"];
        this.requestsTableColumns = ['VisitorInfo','HostInfo', 'UserHostCompanyName', 'EstimatedDateOfArrival', 'EstimatedReleaseDate', 'VisitorRequestStatus', 'Actions']
        this.searchInputControl = new FormControl();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    @ViewChild(MatSort) set matSort(ms: MatSort) {
        /*this.sort = ms;
        this.setDataSourceAttributes();*/
        this.usersDataSource.sort = ms;
        this.visitorsDataSource.sort = ms;
        this.requestsDataSource.sort = ms;
        this.setDataSourceAttributes();

    }

    @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
		this.paginator = mp;
		this.setDataSourceAttributes();
	}

	setDataSourceAttributes() {
		this.usersDataSource.paginator = this.paginator;
		this.visitorsDataSource.paginator = this.visitorsPaginator;
		this.requestsDataSource.paginator = this.requestPaginator;
	}


    ngAfterViewInit(): void {

        this._usersService.campusXCompanyXUserRawRels$.subscribe(rels => {
            this.rawRels = rels;
        })

        this.users$.subscribe(elements => {
            this.usersDataSource.data = elements.filter(e => !e.IsVisitor);
            this.visitorsDataSource.data = elements.filter(e => e.IsVisitor);
            // this.usersDataSource.sort = this.usersSort;
            // this.visitorsDataSource.sort = this.visitorsSort;
            this.usersCount = this.usersDataSource.data.length;
            this.visitorsCount = this.visitorsDataSource.data.length;
            this._changeDetectorRef.markForCheck();
        });


        this.usersDataSource.filterPredicate = this.getUsersFilterPredicate();
        this.usersDataSource.sortingDataAccessor = (item, property) => {
            if (property === 'Info') {
                return item.LName + " " + item.FName;
            }
            else if (property === 'RelatedCompanies') {
                return item.Companies[0];
            }
            else {
                return item[property];
            }
        };




        this.visitorsDataSource.filterPredicate = this.getUsersFilterPredicate();
        this.visitorsDataSource.sortingDataAccessor = (item, property) => {
            if (property === 'Info') {
                return item.LName + " " + item.FName;
            }
            else if (property === 'RelatedCompanies') {
                return item.Companies[0];
            }
            else {
                return item[property];
            }
        };

        this.visitorsrequests$.subscribe(elements => {
            this.requestsDataSource.data = elements;
            this.visitorsRequests = elements;
            this.requestsCount = this.requestsDataSource.data.length;
            this._changeDetectorRef.markForCheck();
            //this.requestsDataSource.sort = this.requestsSort;
        });

        this.requestsDataSource.filterPredicate = this.getRequestsFilterPredicate();
        this.requestsDataSource.sortingDataAccessor = (item: VisitorsRequest, property) => {
            if (property === 'HostInfo') return item.UserHostLName + " " + item.UserHostFName;
            else if (property === 'VisitorInfo') return item.VisitorLName + " " + item.VisitorFName;
            else if (property === 'EstimatedDateOfArrival') return moment(item.EstimatedDateOfArrival).unix();
            else if (property === 'EstimatedReleaseDate') return moment(item.EstimatedReleaseDate).unix();
            else return item[property];
        };

        let currentCompanyFilter = this._activatedRoute.snapshot.paramMap.get('CompanyName')
        if (currentCompanyFilter) {
            this.searchInputControl.setValue(currentCompanyFilter, { emitEvent: true });
        }

        this._usersService.userUpdateEmail$.subscribe(e => {
            if(!e) return 

            let userIndex = this.usersDataSource.data.findIndex(u => u.Email === e.oldEmail)
            if(userIndex > -1) this.usersDataSource.data[userIndex].Email = e.newEmail
            this._changeDetectorRef.markForCheck()
        })
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the users

        //when i get all data i'll decide wich is the first enabled section. 
        combineLatest([this._usersService.campusXCompanyXUserRels$, this._visitorsrequestsService.visitorsrequests$]).pipe(take(1)).subscribe(data => {

            this.usersCount = data[0].filter(r => r.IsVisitor == false).length;
            this.visitorsCount = data[0].filter(r => r.IsVisitor == true).length;
            this.requestsCount = data[1].length;
            if (this.usersCount > 0) this.currentTableDataGroup = "users";
            else if (this.visitorsCount > 0) this.currentTableDataGroup = "visitors";
            else if (this.requestsCount > 0) this.currentTableDataGroup = "requests";
            else{ 
                this.currentTableDataGroup = "requests";
            }
            this._changeDetectorRef.markForCheck();
        });


        this.users$ = this._usersService.campusXCompanyXUserRels$;
        this.visitorsrequests$ = this._visitorsrequestsService.visitorsrequests$;

        // Get the user
        this._usersService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {
                // Update the selected user
                this.selectedUser = user;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
        // Subscribe to search input field value changes
        this.searchInputControl.valueChanges.subscribe(searchedText => {
            this.applyFilter(searchedText);
        })

        // Subscribe to media query change
        this._treoMediaWatcherService.onMediaQueryChange$('(min-width: 1440px)')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((state) => {

                // Calculate the drawer mode
                this.drawerMode = state.matches ? 'side' : 'over';

                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // Listen for shortcuts
        fromEvent(this._document, 'keydown')
            .pipe(
                takeUntil(this._unsubscribeAll),
                filter<KeyboardEvent>((event) => {
                    return (event.ctrlKey === true || event.metaKey) // Ctrl or Cmd
                        && (event.key === '/'); // '/'
                })
            )
            .subscribe(() => {
                this.createUser();
            });



    }

    scrollToTop(){ 
        this.content.scrollTo({ 
            top: 0, 
            left: 0
          });
    }

    public toggleGroupChange(change: MatButtonToggleChange) {
        /*this.usersDataSource.sort = this.usersSort;
        this.visitorsDataSource.sort = this.visitorsSort;*/

        this.searchInputControl.reset("", {
            onlySelf: true,
            emitEvent: true
        });
        this._changeDetectorRef.markForCheck();
        this.currentTableDataGroup = change.value;
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Go to user
     *
     * @param id
     */
    goToUser(id: string): void {
        let path = '../';
        if (this._activatedRoute.snapshot.paramMap.get('id') === null) {
            path = './';
        }
        this._router.navigate([path + "/user/", id], { relativeTo: this._activatedRoute });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * On backdrop clicked
     */
    onBackdropClicked(): void {
        // Get the current activated route
        let route = this._activatedRoute;
        while (route.firstChild) {
            route = route.firstChild;
        }
        if (route.toString().includes("newUser") || route.toString().includes("newVisitorsRequest")) {
            this._router.navigate(['../'], { relativeTo: route });
        }
        else {
            // Go to the parent route
            this._router.navigate(['../../'], { relativeTo: route });
        }


        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create user
     */
    createUser(): void {
        // Create the user
        let path = '../';
        if (this._activatedRoute.snapshot.paramMap.get('id') === null) {
            path = './';
        }
        this._router.navigate([path, "newUser"], { relativeTo: this._activatedRoute });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    applyFilter(query: string) {
        // create string of our searching values and split if by '$'
        if (this.currentTableDataGroup == "users") {
            const filterValue = query
            this.usersDataSource.filter = filterValue.trim().toLowerCase();
        }
        else if (this.currentTableDataGroup == "visitors") {
            const filterValue = query
            this.visitorsDataSource.filter = filterValue.trim().toLowerCase();
        }
        else if (this.currentTableDataGroup == "requests") {
            const filterValue = query
            this.requestsDataSource.filter = filterValue.trim().toLowerCase();
        }

    }
    getUsersFilterPredicate() {
        return (row: CampusXCompanyXUserCompaniesGrouped, filter: string) => {
            let strings = filter.toLowerCase().split(" ");
            let result = true;
            for (let string of strings) {
                const matchFilter = [];
                matchFilter.push(row.FName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.LName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.Email.toLowerCase().includes(string.toLowerCase()));
                row.Companies.forEach(company => {
                    matchFilter.push(company.toLowerCase().includes(string.toLowerCase()));
                })
                result = result && matchFilter.some(Boolean);
            }
            return result;
        };
    }
    getTemporaryBadgesFilterPredicate() {
        return (row: Badge, filter: string) => {
            let strings = filter.toLowerCase().split(" ");
            let result = true;
            for (let string of strings) {
                const matchFilter = [];
                matchFilter.push(row.FName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.LName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.Email.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.CompanyName.toLowerCase().includes(string.toLowerCase()));
                result = result && matchFilter.some(Boolean);
            }
            return result;
        };
    }
    getRequestsFilterPredicate() {
        return (row: VisitorsRequest, filter: string) => {
            let strings = filter.toLowerCase().split(" ");
            let result = true;
            for (let string of strings) {
                const matchFilter = [];
                matchFilter.push(row.VisitorEmail.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.UserHostEmail.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.UserHostFName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.UserHostLName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.VisitorFName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.VisitorLName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.UserHostTelephoneNumber.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.UserHostCompanyName.toLowerCase().includes(string.toLowerCase()));
                result = result && matchFilter.some(Boolean);
            }
            return result;
        };
    }

    /**
     * Create visitorsrequest
     */
    createVisitorsRequest(): void {
        // Create the visitorsrequest
        this.goToVisitorsRequest('newVisitorsRequest');
    }

    goToVisitorsRequest(id: string): void {
        let path = '../';
        if (this._activatedRoute.snapshot.paramMap.get('id') === null) {
            path = './';
        }
        this._router.navigate([path, id], { relativeTo: this._activatedRoute });
        // Mark for check
        this._changeDetectorRef.markForCheck();
    }


    deleteVisitorRequest(request: VisitorsRequest) {
        const deleteDialog = this.dialog.open(CustomDialogComponent, {
            data: { title: "Are you sure to delete " + request.VisitorEmail + " request?", message: 'The action is not reversible.' }
        });

        deleteDialog.afterClosed().subscribe((deleteVisitorsRequest: boolean) => {
            if (deleteVisitorsRequest) {
                this._visitorsrequestsService.deleteVisitorsRequest(request).subscribe(() => {
                    //remove from dataSource
                    this.visitorsRequests = this.visitorsRequests.filter((e: VisitorsRequest) => e.VisitorRequestID != request.VisitorRequestID)
                    this._visitorsrequestsService._visitorsrequests.next(this.visitorsRequests);
                    this._changeDetectorRef.markForCheck();
                    //this.visitorsDataSource.data = this.visitorsDataSource.data.filter((e: VisitorsRequest) => e.VisitorRequestID != request.VisitorRequestID)
                });
            }
            this._changeDetectorRef.markForCheck();
        });
    }

    denyVisitorRequest(request: VisitorsRequest) {
        if (request.VisitorRequestStatus == "DENIED") return;
        let updateRequest: VisitorsRequest = {
            CampusName: request.CampusName,
            VisitorEmail: request.VisitorEmail,
            VisitorRequestID: request.VisitorRequestID,
            VisitorRequestStatus: "DENIED"
        }
        this._visitorsrequestsService.updateVisitorsRequest(updateRequest).subscribe(() => {
            request.VisitorRequestStatus = "DENIED";
            this._changeDetectorRef.markForCheck();
        });
    }
    acceptVisitorRequest(request: VisitorsRequest) {
        if (request.VisitorRequestStatus == "ACCEPTED") return;
        let updateRequest: VisitorsRequest = {
            CampusName: request.CampusName,
            VisitorEmail: request.VisitorEmail,
            VisitorRequestID: request.VisitorRequestID,
            VisitorRequestStatus: "ACCEPTED"
        }
        this._visitorsrequestsService.updateVisitorsRequest(updateRequest).subscribe(() => {

            request.VisitorRequestStatus = "ACCEPTED";
            this._changeDetectorRef.markForCheck();
        });
    }



    formatDate(date: string) {
        if(moment(date).isValid()) return moment(date).format("YYYY-MM-DD HH:mm");
        else return "-";
    }

    /**
     * Get country code
     *
     * @param iso
     */
    getCountryCode(iso: string): string {
        if (!iso) {
            return '';
        }

        return this.countries.find((country) => country.iso === iso).code;
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
