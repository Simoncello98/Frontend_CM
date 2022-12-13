import { NgModule } from '@angular/core';
import { UniqueCourses } from './unique-courses.pipe';

@NgModule({
    declarations: [
        UniqueCourses
    ],
    exports     : [
        UniqueCourses
    ]
})
export class UniqueCoursesModule
{
}
