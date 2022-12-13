import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

/**
 * Loading service for handling loading spinners
 */
@Injectable({
    providedIn: 'root'
})
export class LoadingService {
    private _loading: BehaviorSubject<boolean>;

    public readonly loading$: Observable<boolean>;

    constructor() {
        this._loading = new BehaviorSubject<boolean>(false);
        this.loading$ = this._loading.asObservable();
    }

    /**
     * Show loading
     */
    show() {
        this._loading.next(true);
    }
    
    /**
     * Hide loading
     */
    hide() {
        this._loading.next(false);
    }
}