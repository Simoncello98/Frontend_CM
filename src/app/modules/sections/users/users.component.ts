import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'users',
    templateUrl    : './users.component.html',
    styleUrls      : ['./users.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
