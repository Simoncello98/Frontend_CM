import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatButton } from '@angular/material/button';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NotificationsService } from 'app/layout/common/notifications/notifications.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MessageDialogComponent } from 'app/shared/dialog/dialog.component';
import _ from 'lodash';


@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'notifications'
})
export class NotificationsComponent implements OnInit, OnDestroy {
    activeDataSource = new MatTableDataSource<any>([]);
    activeTableColumns: string[] = [
        "Title", "Read"
    ];
    directiveDataSource = new MatTableDataSource<any>([]);
    directiveTableColumns: string[] = [
        "Title", "Read"
    ];
    distinctNormativesDataSource = new MatTableDataSource<any>([]);
    distinctDirectivesDataSource = new MatTableDataSource<any>([]);


    // Private
    private _notifications: Notification[];
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any>;

    @ViewChild('notificationsOrigin')
    private _notificationsOrigin: MatButton;

    @ViewChild('notificationsPanel')
    private _notificationsPanel: TemplateRef<any>;

    /**
     * Constructor
     *
     * @param {ChangeDetectorRef} _changeDetectorRef
     * @param {NotificationsService} _notificationsService
     * @param {Overlay} _overlay
     * @param {ViewContainerRef} _viewContainerRef
     */
    constructor(
        private cdRef: ChangeDetectorRef,
        public dialog: MatDialog,
        private _notificationsService: NotificationsService,
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        // Set the defaults

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------


    get notifications(): Notification[] {
        return this._notifications;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.getAllMessages().subscribe((messages: any[]) => {
        });
    }
    // get API data 
    getAllMessages(): Observable<any[]> {
        return new BehaviorSubject<any[]>([]);
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

        // Dispose the overlay if it's still on the DOM
        if (this._overlayRef) {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create route from given link
     */
    createRouteFromLink(link): string[] {
        // Split the link and add a leading slash
        const route = link.split('/');
        route.unshift('/');

        // Return the route
        return route;
    }

    /**
     * Open the notifications panel
     */
    openPanel(): void {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop: true,
            backdropClass: '',
            scrollStrategy: this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
                .withFlexibleDimensions()
                .withViewportMargin(16)
                .withLockedPosition()
                .withPositions([
                    {
                        originX: 'start',
                        originY: 'bottom',
                        overlayX: 'start',
                        overlayY: 'top'
                    },
                    {
                        originX: 'start',
                        originY: 'top',
                        overlayX: 'start',
                        overlayY: 'bottom'
                    },
                    {
                        originX: 'end',
                        originY: 'bottom',
                        overlayX: 'end',
                        overlayY: 'top'
                    },
                    {
                        originX: 'end',
                        originY: 'top',
                        overlayX: 'end',
                        overlayY: 'bottom'
                    }
                ])
        });

        // Create a portal from the template
        const templatePortal = new TemplatePortal(this._notificationsPanel, this._viewContainerRef);

        // Attach the portal to the overlay
        this._overlayRef.attach(templatePortal);

        // Subscribe to the backdrop click
        this._overlayRef.backdropClick().subscribe(() => {

            // If overlay exists and attached...
            if (this._overlayRef && this._overlayRef.hasAttached()) {
                // Detach it
                this._overlayRef.detach();
            }

            // If template portal exists and attached...
            if (templatePortal && templatePortal.isAttached) {
                // Detach it
                templatePortal.detach();
            }
        });

    }

    goToMessage(index: number, dataSource: MatTableDataSource<any>, dialogType: string = "default"): void {
    }

    get getUnreadCount() {
        return 0
    }
}
