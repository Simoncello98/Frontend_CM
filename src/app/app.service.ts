import { Injectable } from '@angular/core';
import { production } from 'main';
import moment from 'moment';
import { mainModule } from 'process';
@Injectable({
    providedIn: 'root'
})
export class AppService {
    public entrance: string;

    public getCurrentCampusName(): string {
        return 'C1';
    }

    public getVersion(): string {
        return 'v20220124';
    }

    public setEntrance(date: string) {
        this.entrance = date ? moment(date).format('LT') : '';
    }

    public getYoutubeApiKey(){
        return "AIzaSyCZ3NZn2_7GfTiA4SI0GW4VNtzmM1_y9bE"
    }
}
