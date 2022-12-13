import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TreoMediaWatcherService } from '@treo/services/media-watcher';
import { Company, Country, CampusXCompanyXCompany } from 'app/modules/sections/companies/companies.types';
import { CompaniesService } from 'app/modules/sections/companies/companies.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { AuthorizationService } from 'app/core/navigation/navigation.service';

@Component({
    selector: 'companies-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesListComponent implements OnInit, OnDestroy {
    companies$: Observable<CampusXCompanyXCompany[]>;
    companiesCount: number;
    companiesTableColumns: string[];
    countries: Country[];
    drawerMode: 'side' | 'over';
    searchInputControl: FormControl;
    selectedCompany: Company;
    companiesDataSource = new MatTableDataSource([]);
    badges: any;

    @ViewChild('matDrawer', { static: true })
    matDrawer: MatDrawer;

    @ViewChild(MatSort) set matSort(ms: MatSort) {
        this.companiesDataSource.sort = ms;
    }

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {ActivatedRoute} _activatedRoute
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {CompaniesService} _companiesService
     * @param {DOCUMENT} _document
     * @param {Router} _router
     * @param {TreoMediaWatcherService} _treoMediaWatcherService
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _companiesService: CompaniesService,
        private _router: Router,
        private _treoMediaWatcherService: TreoMediaWatcherService,
        public authorizationService: AuthorizationService,
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        // Set the defaults
        this.companiesCount = 0;
        this.companiesTableColumns =  ['CompanyName', 'Actions'];
        this.searchInputControl = new FormControl();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Get the companies
        this.companies$ = this._companiesService.campusXCompanyXCompanyRels$;
        this._companiesService.campusXCompanyXCompanyRels$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((companies: CampusXCompanyXCompany[]) => {
                //console.log(companies);
                this.companiesDataSource.data = companies;
                // Update the counts
                this.companiesCount = companies.length;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        this.badges = {};

        this.companiesDataSource.filterPredicate = this.getCompaniesFilterPredicate();

        // Get the company
        this._companiesService.company$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((company: Company) => {
                // Update the selected company
                this.selectedCompany = company;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });

        // all transits
        this._companiesService.badges$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((badgesReceived: any) => {
                if (badgesReceived === null || badgesReceived === undefined) {
                    return;
                }
                this.badges = badgesReceived;
                this._changeDetectorRef.markForCheck();
            });

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
    }
    applyFilter(query: string) {
        const filterValue = query
        this.companiesDataSource.filter = filterValue.trim().toLowerCase();
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
     * Go to company
     *
     * @param id
     */
    goToCompany(id: string, edit?: boolean): void {
        let path = '../';
        if (this._activatedRoute.snapshot.paramMap.get('id') === null) {
            path = './';
        }
        this._router.navigate([path, id], { relativeTo: this._activatedRoute }).then(() => {
            if (edit) this._companiesService.toggleEditModeOnDetails(true);
            else this._companiesService.toggleEditModeOnDetails(false);
        });

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

        // Go to the parent route
        this._router.navigate(['../'], { relativeTo: route });

        // Mark for check
        this._changeDetectorRef.markForCheck();
    }

    /**
     * Create company
     */
    createCompany(): void {
        // Create the company
        this.goToCompany('newCompany');
    }

    getCompaniesFilterPredicate() {
        return (row: CampusXCompanyXCompany, filter: string) => {
            let strings = filter.toLowerCase().split(" ");
            let result = true;
            for (let string of strings) {
                const matchFilter = [];
                matchFilter.push(row.CampusName.toLowerCase().includes(string.toLowerCase()));
                matchFilter.push(row.CompanyName.toLowerCase().includes(string.toLowerCase()));
                result = result && matchFilter.some(Boolean);
            }
            return result;
        };
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

    public getBadgeUsersCounterByCompany(companyName: string): number {
        return this.badges[companyName]
            ? this.badges[companyName].users
            : 0
    }

    public getBadgeVisitorsCounterByCompany(companyName: string): number {
        return this.badges[companyName]
            ? this.badges[companyName].visitors
            : 0
    }
}
