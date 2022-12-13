import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
    selector       : 'companies',
    templateUrl    : './companies.component.html',
    styleUrls      : ['./companies.component.scss'],
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CompaniesComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
