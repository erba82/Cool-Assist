import 'jspdf';

declare module 'jspdf' {
  export interface jsPDF {
    /**
     * Creates a table in the PDF.
     * @param options Options for the AutoTable plugin.
     * @returns jsPDF instance.
     */
    autoTable(options: any): jsPDF;
    /**
     * Contains the last autoTable properties.
     */
    lastAutoTable?: {
      finalY: number;
    };
  }
}