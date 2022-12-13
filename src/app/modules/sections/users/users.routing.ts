import { Route } from '@angular/router';
import { CanDeactivateUsersDetails } from 'app/modules/sections/users/users.guards';
import { UsersUserResolver,  UsersResolver,  NewUserResolver, CampusXCompanyXUserResolver } from 'app/modules/sections/users/users.resolvers';
import { UsersComponent } from 'app/modules/sections/users/users.component';
import { UsersListComponent } from 'app/modules/sections/users/list/list.component';
import { UsersDetailsComponent } from 'app/modules/sections/users/details/details.component';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { AuthChildGuard } from 'app/core/auth/guards/auth.child.guard';
import { NewVisitorsRequestResolver } from './visitorsrequests.resolvers';
import { VisitorsRequestsDetailsComponent } from './visitorsRequestsDetails/details.component';
import { CanDeactivateVisitorsRequestsDetails } from './visitorsrequests.guards';

export const usersRoutes: Route[] = [
    {
        path: '',
        component: UsersComponent,
        canActivate : [AuthChildGuard],
        resolve: {
            //tags: UsersTagsResolver
        },
        children: [
            {
                path: '',
                component: UsersListComponent,
                canActivate: [AuthGuard],
                resolve: {
                    tasks: UsersResolver,
                },
                children: [
                    {
                        path: 'newUser',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: NewUserResolver,
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    },
                    {
                        path: 'newVisitorsRequest',
                        component: VisitorsRequestsDetailsComponent,
                        resolve: {
                            task: NewVisitorsRequestResolver,
                        },
                        canDeactivate: [CanDeactivateVisitorsRequestsDetails]
                    },
                    {
                        path: 'user/:id',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: UsersUserResolver,
                            companies: CampusXCompanyXUserResolver
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    }
                ]
            },
            {
                path: 'Company/:CompanyName',
                component: UsersListComponent,
                canActivate: [AuthGuard],
                resolve: {
                    tasks: UsersResolver,
                },
                children: [
                    {
                        path: 'newUser',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: NewUserResolver,
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    },
                    {
                        path: 'newVisitorsRequest',
                        component: VisitorsRequestsDetailsComponent,
                        resolve: {
                            task: NewVisitorsRequestResolver,
                        },
                        canDeactivate: [CanDeactivateVisitorsRequestsDetails]
                    },
                    {
                        path: 'user/:id',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: UsersUserResolver,
                            companies: CampusXCompanyXUserResolver
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    }
                ]
            },
            {
                path: 'visitors',
                component: UsersListComponent,
                resolve: {
                    tasks: UsersResolver,
                },
                children: [
                    {
                        path: 'newUser',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: NewUserResolver,
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    },
                    {
                        path: 'newVisitorsRequest',
                        component: VisitorsRequestsDetailsComponent,
                        resolve: {
                            task: NewVisitorsRequestResolver,
                        },
                        canDeactivate: [CanDeactivateVisitorsRequestsDetails]
                    },
                    {
                        path: 'user/:id',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: UsersUserResolver,
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    }
                ]
            },
            {
                path: 'requests',
                component: UsersListComponent,
                canActivate: [AuthGuard],
                resolve: {
                    tasks: UsersResolver,
                },
                children: [
                    {
                        path: 'newUser',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: NewUserResolver,
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    },
                    {
                        path: 'newVisitorsRequest',
                        component: VisitorsRequestsDetailsComponent,
                        resolve: {
                            task: NewVisitorsRequestResolver,
                        },
                        canDeactivate: [CanDeactivateVisitorsRequestsDetails]
                    },
                    {
                        path: 'user/:id',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: UsersUserResolver,
                            companies: CampusXCompanyXUserResolver
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    }
                ]
            },
            {
                path: 'temporaryBadges',
                component: UsersListComponent,
                canActivate: [AuthGuard],
                resolve: {
                    tasks: UsersResolver,
                },
                children: [
                    {
                        path: 'newUser',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: NewUserResolver,
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    },
                    {
                        path: 'newVisitorsRequest',
                        component: VisitorsRequestsDetailsComponent,
                        resolve: {
                            task: NewVisitorsRequestResolver,
                        },
                        canDeactivate: [CanDeactivateVisitorsRequestsDetails]
                    },
                    {
                        path: 'user/:id',
                        component: UsersDetailsComponent,
                        resolve: {
                            task: UsersUserResolver,
                            companies: CampusXCompanyXUserResolver
                        },
                        canDeactivate: [CanDeactivateUsersDetails]
                    }
                ]
            }
        ],
    }
];
