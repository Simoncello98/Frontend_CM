import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, of, Subject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

/**
 * @title Chips Autocomplete
 */
@Component({
  selector: 'filter-chips',
  templateUrl: 'filter-chips.html',
  styleUrls: ['filter-chips.scss'],
})
export class FilterChipsComponent implements OnInit , AfterViewInit{

  //@Input() allFilters: Promise<any>;
  //@Input() apiObservable: Observable<any>;
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  filterCtrl = new FormControl();
  filteredFilters: Observable<string[]>;
  placeholderString : string = "Choose some categories or plate types..";

  @Input() activeFilters: string[] = [];
  @Input() filters: string[] = [];
  @Input() filtersObservable: Observable<string[]>;

  @Input() filterChangeObservable: Subject<string[]>;
  @Input() placeholder: string;

  @ViewChild('filtersInput') filtersInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  constructor(public _changeDetectorRef: ChangeDetectorRef) {
    this.filteredFilters = this.filterCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.filters.slice()));
  }

  ngAfterViewInit(): void {
    if(this.placeholder) this.placeholderString = this.placeholder;
  }

  ngOnInit(): void {
    /*if (this.filtersObservable) {
      this.filtersObservable.subscribe(filters => {
        this.filters = filters;
        this._changeDetectorRef.markForCheck();
      })
    }*/
  }

  setFilters(filters: string[]) {
    this.filters = [].concat(filters);
    this.filteredFilters = of(this.filters.slice());
    this.filteredFilters = this.filterCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) => fruit ? this._filter(fruit) : this.filters.slice()));
    this._changeDetectorRef.markForCheck();
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if ((value || '').trim()) {
      this.activeFilters.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.filterCtrl.setValue(null);
    this.filterChangeObservable.next(this.activeFilters);

  }

  remove(filter: string): void {
    const index = this.activeFilters.indexOf(filter);

    if (index >= 0) {
      this.activeFilters.splice(index, 1);
    }
    this.filterChangeObservable.next(this.activeFilters);
  }

  removeAll() {
    this.activeFilters = [];
    this.filterChangeObservable.next(this.activeFilters);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.activeFilters.push(event.option.viewValue);
    this.filtersInput.nativeElement.value = '';
    this.filterCtrl.setValue(null);
    this.filterChangeObservable.next(this.activeFilters);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.filters.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
  }
}
