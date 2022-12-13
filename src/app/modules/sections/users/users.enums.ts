export enum WSActions {
    // Incoming in client
    'readed' = 'readed', // returs Rfid
    // Outgoing to server
    'read' = 'read',

    //Outgoing to server: 
    'generateCardPreview' = 'generateCardPreview',
    'printBadge' = 'printBadge',
    'bulkPrintBadge' = 'bulkPrintBadge',

    //Incoming:
    'cardPreview' = 'cardPreview',
    'printResult' = 'printResult'
}