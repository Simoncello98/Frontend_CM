/* tslint:disable:max-line-length */
import { TreoNavigationItem } from "@treo/components/navigation";

//TODO : remove this file.
export var defaultNavigation: TreoNavigationItem[] = [
    {
        id: "starter",
        title: "CM People",
        subtitle: "Campus user management",
        type: "group",
        icon: "apps",
        children: [
            {
                id: "crud.companies",
                title: "Companies",
                type: "basic",
                icon: "mat_outline:work_outline",
                link: "/companies"
            },
            {
                id: "crud.users",
                title: "Users",
                type: "basic",
                icon: "mat_outline:people",
                link: "/users"
            },
            {
                id: "Visitor.requests",
                title: "Visitor requests",
                type: "basic",
                icon: "mat_outline:supervised_user_circle",
                link: "/visitorsrequests"
            },
        ]
    },
];

export const compactNavigation: TreoNavigationItem[] = [
    {
        id: "starter",
        title: "Starter",
        type: "aside",
        icon: "apps",
        children: [] // This will be filled from defaultNavigation so we don"t have to manage multiple sets of the same navigation
    }
];
export const futuristicNavigation: TreoNavigationItem[] = [
    {
        id: "starter.example",
        title: "Example component",
        type: "basic",
        icon: "heroicons:chart-pie",
        link: "/example"
    },
    {
        id: "starter.dummy.1",
        title: "Dummy menu item #1",
        icon: "heroicons:calendar",
        type: "basic"
    },
    {
        id: "starter.dummy.2",
        title: "Dummy menu item #1",
        icon: "heroicons:user-group",
        type: "basic"
    }
];
export const horizontalNavigation: TreoNavigationItem[] = [
    {
        id: "starter",
        title: "Starter",
        type: "group",
        icon: "apps",
        children: [] // This will be filled from defaultNavigation so we don"t have to manage multiple sets of the same navigation
    }
];
