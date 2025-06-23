declare module 'pdfjs-dist/build/pdf' {
    const pdfjsLib: any;
    export = pdfjsLib;
}

declare module 'pdfjs-dist/build/pdf.worker.entry' {
    const pdfjsWorker: any;
    export default pdfjsWorker;
}

declare module 'pdfjs-dist/build/pdf.mjs' {
    const pdfjsLib: any;
    export = pdfjsLib;
}

declare module '*.mjs?url' {
    const src: string;
    export default src;
} 