import mammoth from 'mammoth';
import jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import htmlDocx from 'html-docx-fixed/dist/html-docx';
import PptxGenJS from 'pptxgenjs';
import { md5 } from 'js-md5';
import * as Papa from 'papaparse';
import { marked } from 'marked';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { XMLParser } from 'fast-xml-parser';
import { PDFDocument } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.js',
  import.meta.url,
).toString();

export const convertFile = async (file: File, outputFormat: string) => {
  const reader = new FileReader();

  reader.onload = async (event) => {
    if (!event.target?.result) return;

    const arrayBuffer = event.target.result as ArrayBuffer;
    const originalFileName = file.name.substring(0, file.name.lastIndexOf('.'));
    const fileHash = md5(arrayBuffer);
    console.log(`File hash: ${fileHash}`);
    
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || '';

      if (extension === 'docx') {
        await convertDocx(arrayBuffer, outputFormat, originalFileName);
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
        await convertImage(arrayBuffer, file.type, outputFormat, originalFileName);
      } else if (extension === 'txt') {
        await convertText(arrayBuffer, outputFormat, originalFileName);
      } else if (extension === 'json') {
        await convertJson(arrayBuffer, outputFormat, originalFileName);
      } else if (extension === 'csv') {
        await convertCsv(arrayBuffer, outputFormat, originalFileName);
      } else if (extension === 'md') {
        await convertMarkdown(arrayBuffer, outputFormat, originalFileName);
      } else if (extension === 'pdf') {
        await convertPdf(arrayBuffer, outputFormat, originalFileName);
      } else if (extension === 'xlsx') {
        await convertXlsx(arrayBuffer, outputFormat, originalFileName);
      } else if (extension === 'svg') {
          await convertSvg(file, outputFormat, originalFileName);
      } else if (extension === 'xml') {
        await convertXml(arrayBuffer, outputFormat, originalFileName);
      } else {
        throw new Error(`Unsupported file type: ".${extension}"`);
      }
    } catch (error) {
        console.error("Conversion Error:", error);
        if (error instanceof Error) {
            alert(`Failed to convert file. Error: ${error.message}`);
        } else {
            alert(`Failed to convert file. An unknown error occurred. See console for details.`);
        }
    }
  };

  reader.readAsArrayBuffer(file);
};

const convertImage = async (buffer: ArrayBuffer, inputType: string, format: string, name: string) => {
    const blob = new Blob([buffer], { type: inputType });
    const url = URL.createObjectURL(blob);
    
    const img = new Image();
    img.src = url;
    await new Promise(resolve => { img.onload = resolve; });

    if (format === 'pdf') {
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(img);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(img, inputType.split('/')[1].toUpperCase(), 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${name}.pdf`);
    } else if (format === 'docx') {
        const htmlString = `<!DOCTYPE html><html><head></head><body><img src="${url}" style="width:100%;" /></body></html>`;
        const data = await htmlDocx.asBlob(htmlString);
        saveAs(data, `${name}.docx`);
    } else if (format === 'png' || format === 'jpg' || format === 'webp') {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
            if (blob) {
                saveAs(blob, `${name}.${format}`);
            }
        }, `image/${format}`);
    } else {
        throw new Error(`Unsupported output format for images: ${format}`);
    }

    URL.revokeObjectURL(url);
};

const convertText = async (buffer: ArrayBuffer, format: string, name: string) => {
    const text = new TextDecoder().decode(buffer);
    if (format === 'pdf') {
        const pdf = new jsPDF();
        // Add text with auto-splitting
        const lines = pdf.splitTextToSize(text, pdf.internal.pageSize.getWidth() - 20);
        pdf.text(lines, 10, 10);
        pdf.save(`${name}.pdf`);
    } else if (format === 'docx') {
        const htmlString = `<!DOCTYPE html><html><head></head><body><p>${text.replace(/\n/g, '<br/>')}</p></body></html>`;
        const data = htmlDocx.asBlob(htmlString);
        saveAs(data, `${name}.docx`);
    } else if (format === 'html') {
        const blob = new Blob([`<p>${text.replace(/\n/g, '<br/>')}</p>`], { type: 'text/html' });
        saveAs(blob, `${name}.html`);
    } else {
        throw new Error('Text can only be converted to PDF, DOCX, or HTML.');
    }
};

const convertDocx = async (buffer: ArrayBuffer, format: string, name: string) => {
    if (format === 'txt') {
        const { value } = await mammoth.extractRawText({ arrayBuffer: buffer });
        if (!value.trim()) throw new Error("Failed to extract text from DOCX. The document might be empty or unsupported.");
        const blob = new Blob([value], { type: 'text/plain' });
        saveAs(blob, `${name}.txt`);
    } else if (format === 'html') {
        const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (!value.trim()) throw new Error("Failed to convert DOCX to HTML. The document might be empty or unsupported.");
        const blob = new Blob([value], { type: 'text/html' });
        saveAs(blob, `${name}.html`);
    } else if (format === 'pdf') {
        // Use a reliable text-based approach instead of HTML rendering
        const { value: rawText } = await mammoth.extractRawText({ arrayBuffer: buffer });
        if (!rawText.trim()) throw new Error("Failed to extract text from DOCX for PDF generation. The document might be empty or unsupported.");
        
        const pdf = new jsPDF();
        pdf.setFontSize(12);
        
        // Split text into lines that fit the page width
        const pageWidth = pdf.internal.pageSize.getWidth() - 20; // 10mm margin on each side
        const lines = pdf.splitTextToSize(rawText, pageWidth);
        
        let yPosition = 20; // Start 20mm from top
        const lineHeight = 6; // 6mm between lines
        const pageHeight = pdf.internal.pageSize.getHeight() - 20; // Leave 20mm margin at bottom
        
        for (const line of lines) {
            if (yPosition + lineHeight > pageHeight) {
                pdf.addPage();
                yPosition = 20; // Reset to top of new page
            }
            
            pdf.text(line, 10, yPosition);
            yPosition += lineHeight;
        }
        
        pdf.save(`${name}.pdf`);
    } else if (format === 'pptx') {
        const { value } = await mammoth.convertToHtml({ arrayBuffer: buffer });
        if (!value.trim()) throw new Error("Failed to convert DOCX for PPTX generation. The document might be empty or unsupported.");
        
        const pptx = new PptxGenJS();
        pptx.addSection({ title: 'Converted Document' });

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = value;
        const elements = Array.from(tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li'));

        const CHAR_LIMIT_PER_SLIDE = 750;
        let currentSlideText: string[] = [];
        let currentSlideCharCount = 0;

        for (const p of elements) {
            const text = p.textContent?.trim();
            if (!text) continue;

            if (currentSlideCharCount + text.length > CHAR_LIMIT_PER_SLIDE && currentSlideCharCount > 0) {
                pptx.addSlide().addText(currentSlideText.join('\n\n'), { x: 0.5, y: 0.5, w: '90%', h: '90%', fontSize: 14 });
                currentSlideText = [];
                currentSlideCharCount = 0;
            }

            currentSlideText.push(text);
            currentSlideCharCount += text.length;
        }

        if (currentSlideText.length > 0) {
            pptx.addSlide().addText(currentSlideText.join('\n\n'), { x: 0.5, y: 0.5, w: '90%', h: '90%', fontSize: 14 });
        }

        pptx.writeFile({ fileName: `${name}.pptx` });
    } else {
        throw new Error('DOCX can only be converted to TXT, HTML, PDF, or PPTX.');
    }
};

const convertJson = async (buffer: ArrayBuffer, format: string, name: string) => {
    if (format !== 'csv') throw new Error('JSON can only be converted to CSV.');
    const text = new TextDecoder().decode(buffer);
    const json = JSON.parse(text);
    const csv = Papa.unparse(json);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${name}.csv`);
};

const convertCsv = async (buffer: ArrayBuffer, format: string, name: string) => {
    const text = new TextDecoder().decode(buffer);
    if (format === 'json') {
        return new Promise<void>((resolve, reject) => {
            Papa.parse(text, {
                header: true,
                complete: (results) => {
                    const jsonString = JSON.stringify(results.data, null, 2);
                    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
                    saveAs(blob, `${name}.json`);
                    resolve();
                },
                error: (error: Error) => {
                    reject(new Error(`CSV to JSON conversion failed: ${error.message}`));
                }
            });
        });
    } else if (format === 'xlsx') {
        const rows = Papa.parse(text).data as string[][];
        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        saveAs(blob, `${name}.xlsx`);
    } else {
        throw new Error('CSV can only be converted to JSON or XLSX.');
    }
};

const convertMarkdown = async (buffer: ArrayBuffer, format:string, name:string) => {
    const text = new TextDecoder().decode(buffer);
    const html = await marked.parse(text, { gfm: true, breaks: true });
    if (format === 'html') {
        const blob = new Blob([html], { type: 'text/html' });
        saveAs(blob, `${name}.html`);
    } else if (format === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4');
        await pdf.html(html, {
            autoPaging: 'text',
            width: pdf.internal.pageSize.getWidth(),
            windowWidth: pdf.internal.pageSize.getWidth()
        });
        pdf.save(`${name}.pdf`);
    } else {
        throw new Error('Markdown can only be converted to HTML or PDF.');
    }
}

const convertPdf = async (buffer: ArrayBuffer, format: string, name: string) => {
    if (format === 'jpg' || format === 'png') {
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        const page = await pdf.getPage(1); // Convert first page only for simplicity
        const viewport = page.getViewport({ scale: 2 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext('2d');
        if(!context) throw new Error('Could not get canvas context');
        
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        
        canvas.toBlob((blob) => {
            if(blob) saveAs(blob, `${name}.${format}`);
        }, `image/${format}`);
    } else {
        throw new Error('PDF can only be converted to JPG or PNG currently.');
    }
};

const convertXlsx = async (buffer: ArrayBuffer, format: string, name: string) => {
    if(format !== 'csv') throw new Error('XLSX can only be converted to CSV.');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: 'text/csv' });
    saveAs(blob, `${name}.csv`);
};

const convertSvg = async (file: File, format: string, name: string) => {
    if (format !== 'png') throw new Error('SVG can only be converted to PNG currently.');
    const text = await file.text();
    const img = new Image();
    const blob = new Blob([text], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((pngBlob) => {
            if (pngBlob) saveAs(pngBlob, `${name}.png`);
        }, 'image/png');
    };
    img.src = url;
};

const convertXml = async (buffer: ArrayBuffer, format: string, name: string) => {
    if (format !== 'json') throw new Error('XML can only be converted to JSON.');
    const text = new TextDecoder().decode(buffer);
    const parser = new XMLParser();
    const jsonObj = parser.parse(text);
    const jsonString = JSON.stringify(jsonObj, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    saveAs(blob, `${name}.json`);
}; 