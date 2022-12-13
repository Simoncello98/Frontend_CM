import { Route } from '@angular/router';
import { CanDeactivateCompaniesDetails } from 'app/modules/sections/companies/companies.guards';
import { CompaniesCompanyResolver,  CompaniesResolver, NewCompanyResolver } from 'app/modules/sections/companies/companies.resolvers';
import { CompaniesComponent } from 'app/modules/sections/companies/companies.component';
import { CompaniesListComponent } from 'app/modules/sections/companies/list/list.component';
import { CompaniesDetailsComponent } from 'app/modules/sections/companies/details/details.component';
import { AuthChildGuard } from 'app/core/auth/guards/auth.child.guard';
export const companiesRoutes: Route[] = [
    {
        path: '',
        canActivate: [AuthChildGuard],
        component: CompaniesComponent,
        resolve: {
           // tags: CompaniesTagsResolver
        },
        children: [
            {
                path: '',
                component: CompaniesListComponent,
                resolve: {
                    tasks: CompaniesResolver,
                },
                children: [
                    {
                        path: 'newCompany',
                        component: CompaniesDetailsComponent,
                        resolve: {
                            task: NewCompanyResolver,
                        },
                        canDeactivate: [CanDeactivateCompaniesDetails]
                    },
                    {
                        path: ':id',
                        component: CompaniesDetailsComponent,
                        resolve: {
                            task: CompaniesCompanyResolver,
                        },
                        canDeactivate: [CanDeactivateCompaniesDetails]
                    }
                ]
            }
        ]
    }
];
