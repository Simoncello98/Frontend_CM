import { AfterViewInit, ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, ViewChild, ComponentFactoryResolver } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil, take, map } from 'rxjs/operators';

@Component({
    selector: 'select-from-api',
    templateUrl: './select-from-api.component.html',
    styleUrls: ['./select-from-api.component.scss'],
    // encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectFromApiComponent implements OnInit, OnDestroy, AfterViewInit {
    @Input() apiPromise: Promise<any>;
    @Input() apiObservable: Observable<any>;
    @Input() keyLocale: string;
    @Input() keyOutput: string;
    @Input() keyTooltip: string;
    @Input() label: string;
    @Input() placeholder = 'Items';
    @Input() disabled = false;
    @Input() FormControl: FormControl;
    @Input() multiple: true;
    @Input() infoKeys: string[];
    @Input() filterKeys: string[];
    @Input() selectAll = false;
    @Input() emitEvent = true;
    @Input() required = false;
    @Input() autoSelection = true
    @Input() showMatTooltip = false;

    /** control for the selected item for multi-selection */
    public itemsMultiSelectFormCtrl: FormControl = new FormControl();

    /** control for the MatSelect filter keyword multi-selection */
    public multiFilterFormCtrl: FormControl = new FormControl();

    /** list of itemsList filtered by search keyword */
    public filteredItems$: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

    private itemsList: any[] = [];

    /** Subject that emits when the component has been destroyed. */
    protected _onDestroy = new Subject<void>();

    protected _externalChange = new Subject<void>();

    selectAllModel = {};

    constructor() { }

    ngOnInit(): void {
        this.selectAllModel[this.keyLocale] = "*"
        this.selectAllModel[this.keyOutput] = "*"
        if (!this.keyTooltip) this.keyTooltip = '';

        if (!this.required) this.required = false;
        this.itemsMultiSelectFormCtrl.markAsTouched();
        this.multiFilterFormCtrl.markAsTouched();
        if (this.apiPromise) {
            // tslint:disable-next-line: no-shadowed-variable
            this.apiPromise.then((result: any) => {
                this.startObservers(result);
            });
        }
        else if (this.apiObservable) {
            this.apiObservable.subscribe((result: any) => {
                this.startObservers(result);
            });
        }

        this.startExternalChangesSubscription();
    }


    private startExternalChangesSubscription() {
        this.FormControl.valueChanges.pipe(takeUntil(this._externalChange)).subscribe(v => {
            if (!v) this.itemsMultiSelectFormCtrl.setValue("", { onlySelf: false, emitEvent: false });
            else {
                this.setInteralFormValue(this.FormControl);
            }
        });
    }

    public reload() {
        this._onDestroy.next();
        this._onDestroy.complete();
        this._onDestroy = new Subject<void>();
        this._externalChange.next();
        this._externalChange.complete();
        this._externalChange = new Subject<void>();

        this.selectAllModel[this.keyLocale] = "*"
        this.selectAllModel[this.keyOutput] = "*"
        if (!this.keyTooltip) this.keyTooltip = '';

        if (!this.required) this.required = false;
        this.itemsMultiSelectFormCtrl.markAsTouched();
        this.multiFilterFormCtrl.markAsTouched();
        if (this.apiPromise) {
            // tslint:disable-next-line: no-shadowed-variable
            this.apiPromise.then((result: any) => {
                this.startObservers(result);
            });
        }
        else if (this.apiObservable) {

            this.apiObservable.subscribe((result: any) => {
                this.startObservers(result);
            });
        }

        this.startExternalChangesSubscription();
        this.setInitialValue();
    }


    private startObservers(result: any) {
        if (this.selectAll && !result.map(m => m[this.keyOutput]).includes("*"))
            result.unshift(this.selectAllModel)

        //it removed the filterKeys passed
        if (this.filterKeys) this.itemsList = result.filter(e => this.filterKeys.findIndex(k => k === e[this.keyOutput]) == -1);
        else this.itemsList = result;
        this.setInteralFormValue(this.FormControl);
        // load the initial item list
        this.filteredItems$.next(this.itemsList.slice());
        // listen for search field value changes
        this.multiFilterFormCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe(() => {
                this.filterItemsMulti();
            });

        this.itemsMultiSelectFormCtrl.valueChanges.pipe(takeUntil(this._onDestroy))
            .subscribe((res) => {

                //stop the receiver for external changes and apply the change external
                this._externalChange.next();
                this._externalChange.complete()
                if (this.multiple) {
                    this.FormControl.setValue(res.map((v) => v[this.keyOutput]), { onlySelf: true, emitEvent: this.emitEvent });
                } else {
                    if (res) this.FormControl.setValue(res[this.keyOutput], { onlySelf: true, emitEvent: this.emitEvent });
                }
                this.FormControl.markAsDirty();
                this.FormControl.markAsTouched();
                this.FormControl.updateValueAndValidity();

                //start the receiver for external changes again
                this._externalChange = new Subject<void>();
                this.startExternalChangesSubscription();
            });

        if (this.autoSelection && result.length == 1) {
            this.itemsMultiSelectFormCtrl.setValue(result[0], { onlySelf: true, emitEvent: this.emitEvent });
        }
    }

    ngAfterViewInit(): void {
        this.setInitialValue();
    }

    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    setInteralFormValue(formControl: FormControl): void {
        const values = this.multiple
            ? formControl.value || []
            : formControl.value && [formControl.value] || [];
        const toSet = [];
        for (const value of values) {
            const res = this.itemsList.find((item) => item[this.keyOutput] === value);
            toSet.push(res);
        }
        // set initial selection
        this.itemsMultiSelectFormCtrl.setValue(this.multiple ? toSet : toSet[0], {
            onlySelf: true,
            emitEvent: false
        });
    }

    /**
     * Sets the initial value after the filteredItems are loaded initially
     */
    protected setInitialValue(): void {
        this.filteredItems$
            .pipe(take(1), takeUntil(this._onDestroy))
            .subscribe(() => {
                // setting the compareWith property to a comparison function
                // triggers initializing the selection according to the initial value of
                // the form control (i.e. _initializeSelection())
                // this needs to be done after the filteredItems are loaded initially
                // and after the mat-option elements are available
                this.multiSelect.compareWith = (a: any, b: any) => a && b && a[this.keyOutput] === b[this.keyOutput];
            });
    }

    public removeSelection() {
        this.itemsMultiSelectFormCtrl.setValue(null, {
            onlySelf: true,
            emitEvent: this.emitEvent
        });
    }


    protected filterItemsMulti(): void {
        if (!this.itemsList) {
            return;
        }
        // get the search keyword
        let search = this.multiFilterFormCtrl.value;
        if (!search) {
            this.filteredItems$.next(this.itemsList.slice());
            return;
        } else {
            search = search.toLowerCase();
        }

        // filter the itemsList
        this.filteredItems$.next(
            this.itemsList.filter(item => {
                let filterPredicate = item[this.keyLocale].toLowerCase().indexOf(search) > -1
                if (this.infoKeys) {
                    for (let key of this.infoKeys) {
                        filterPredicate = filterPredicate || item[key].toLowerCase().indexOf(search) > -1;
                    }
                }
                return filterPredicate;
            })
        );
    }
}
