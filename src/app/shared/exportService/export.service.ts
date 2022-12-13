import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  public exportAsExcelFile({ fileName, list }): Promise<any> {
    return new Promise((resolve, reject) => {
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(list);
        const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }); // buffer
        this.saveAsExcelFile(excelBuffer, fileName).then(() => resolve(true));
    })
  }

  public exportAsExcelMultiSheetsFile(fileName: string, sheets: { sheetName: string, list: any[] }[]): Promise<any> {
    return new Promise((resolve, reject) => {
      let sheetModels = {};
      let sheetNames = [];

      sheets.forEach(sheetInfo => {
        const { sheetName, list } = sheetInfo;
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(list);

        sheetModels[sheetName] = worksheet;
        sheetNames.push(sheetName);
      });

      const workbook: XLSX.WorkBook = { Sheets: sheetModels, SheetNames: sheetNames };
      const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }); // buffer
      this.saveAsExcelFile(excelBuffer, fileName).then(() => resolve(true));
    })
  }

  private saveAsExcelFile(buffer: any, fileName: string): Promise<any> {
      return new Promise((resolve, reject) => {
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
          });
          FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
          resolve(true)
      })
  }

}