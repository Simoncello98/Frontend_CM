import { Injectable } from '@angular/core';
import moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class ExportConnectorService {

    constructor() { }

    createTransitData(startDate: string, endDate: string, data: any[]): { fileName: string, list: any[] } {
        let dataToExport: any[] = [];
        for (let item of data) {
            dataToExport.push({
                'User info': `${item.LName} ${item.FName}`,
                Email: item.Email,
                Company: item.CompanyName,
                Event: this.getDeviceAction(item.DeviceAction),
                Time: this.formatDate(item.ISTimestamp)
            })
        }
        return {
            fileName: this.generateFileName('Transit', startDate, endDate),
            list: dataToExport
        }
    }
    
    createEntrancesData(startDate: string, endDate: string, data: any[]): { fileName: string, list: any[] } {
        let dataToExport: any[] = [];
        for (let item of data) {
            dataToExport.push({
                'User info': `${item.LName} ${item.FName}`,
                Email: item.Email,
                Company: item.CompanyName,
                Event: this.getDeviceAction(item.DeviceAction),
                Floor: item.FloorID,
                Time: this.formatDate(item.ISTimestamp)
            })
        }
        return {
            fileName: this.generateFileName('Entrances', startDate, endDate),
            list: dataToExport
        }
    }

    createMealReportData(startDate: string, endDate: string, data: any[]): { fileName: string, list: any[] } {
        let dataToExport: any[] = [];
        for (let item of data) {
            dataToExport.push({
                ReservationDate: this.formatDate(item.OrderedAt),
                BadgeRfid: this.clearRfid(item.Rfid),
                BadgeActionDate: this.formatDate(item.BadgeStampDate),
                Company: item.CompanyName,
                LastName: item.LName,
                FirstName: item.FName,
                PackageName: item.PackageName,
                CompanyCost: item.CompanyCost,
                UserCost: item.UserCost,
                Status: this.getReportStatus(item.Rfid),
            })
        }
        return {
            fileName: this.generateFileName('Meal', startDate, endDate),
            list: dataToExport
        }
    }

    
    createMessageConfirmationsStatistics(sheetName: string, recipientsCount: number, seenCount: number) {
        let dataToExport: any[] = [{"Recipients count": recipientsCount, "Seen count": seenCount}];
        
        return {
            sheetName: sheetName,
            list: dataToExport
        }
    }
    

    private generateFileName(type: 'Transit' | 'Entrances' | 'Meal' | 'Activity' | 'Confirmations', startDate: string, endDate: string): string {
        return type + ' - from ' +
            moment(startDate).format('YYYY.MM.DD') + ' to ' +
            moment(endDate).format('YYYY.MM.DD') + ' created ' +
            moment().format('YYYY-MM-DD_HH-mm-ss');
    }

    private getDeviceAction(action: string) {
        return action === 'IN' ? 'Enter' : 'Exit';
    }

    private formatDate(date: string) {
        if (date !== '-' && moment(date).isValid()) {
            return moment(date).format('YYYY-MM-DD HH:mm');
        }else {
            return '';
        }
    }

    private clearRfid(rfid: string): string {
        return rfid === '-' ? '' : rfid;
    }

    private getReportStatus(rfid: string): string {
        return rfid === '-' ? 'Not complete' : 'Complete';
    }
}