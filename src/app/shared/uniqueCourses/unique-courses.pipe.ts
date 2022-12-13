import { Pipe, PipeTransform } from '@angular/core';
import _ from 'lodash';

@Pipe({
    name: 'uniqueCourses',
    pure: false
  })
  
  export class UniqueCourses implements PipeTransform {

    transform(value: any): any{
        if(value!== undefined && value!== null){
            return _.uniqBy(value, 'Title');
        }
        return value;
    }
    
  }