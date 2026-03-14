import { Document, Packer, Paragraph, Table, TableRow, TableCell,
  TextRun, WidthType, AlignmentType, ShadingType, BorderStyle, PageBreak } from 'docx';
import { writeFileSync } from 'fs';
import { casos } from './datos.mjs';

const AUTOR = 'Alejandro Gutierrez Figueroa';

// Colores
const GRIS_HEADER = 'C0C0C0';
const GRIS_LABEL  = 'D9D9D9';
const ROJO_TITULO = 'FF0000';

const cellLabel = (text, bold = true) => new TableCell({
  shading: { type: ShadingType.CLEAR, fill: GRIS_LABEL },
  width: { size: 20, type: WidthType.PERCENTAGE },
  children: [new Paragraph({ children: [new TextRun({ text, bold, size: 20 })] })],
});

const cellValue = (text, width = 80) => new TableCell({
  width: { size: width, type: WidthType.PERCENTAGE },
  children: [new Paragraph({ children: [new TextRun({ text: String(text), size: 20 })] })],
});

const cellHeader = (text, colSpan = 1) => new TableCell({
  shading: { type: ShadingType.CLEAR, fill: GRIS_HEADER },
  columnSpan: colSpan,
  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, bold: true, size: 20 })] })],
});

const buildCasoTable = (c, idx) => {
  const stepRows = c.pasos.map((paso, i) => new TableRow({ children: [
    cellLabel(String(i + 1), false),
    cellValue(paso),
  ]}));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ children: [ cellHeader('Código RF', 1), cellHeader(c.codigo, 1), cellHeader('', 1), cellHeader('', 1) ] }),
      new TableRow({ children: [ cellLabel('Autor'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: AUTOR, size: 20 })] })] }) ] }),
      new TableRow({ children: [ cellLabel('Caso de uso'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: c.cu, size: 20 })] })] }) ] }),
      new TableRow({ children: [ cellLabel('Título'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: c.titulo, size: 20 })] })] }) ] }),
      new TableRow({ children: [ cellLabel('Descripción'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: c.descripcion, size: 20 })] })] }) ] }),
      new TableRow({ children: [ cellLabel('Actores'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: c.actores, size: 20 })] })] }) ] }),
      new TableRow({ children: [ cellLabel('Precondiciones'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: c.precondiciones, size: 20 })] })] }) ] }),
      new TableRow({ children: [ cellHeader('Secuencia Normal', 1), cellHeader('Paso', 1), cellHeader('Acción', 2) ] }),
      ...stepRows,
      new TableRow({ children: [ cellLabel('Post Condición'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: c.post, size: 20 })] })] }) ] }),
      new TableRow({ children: [ cellLabel('Alternativa'), new TableCell({ columnSpan: 3, children: [new Paragraph({ children: [new TextRun({ text: c.alt, size: 20 })] })] }) ] }),
    ],
  });
};

const buildHU = (c) => [
  new Paragraph({ children: [new TextRun({ text: `ID: ${c.hu}`, bold: true, size: 22 })] }),
  new Paragraph({ children: [new TextRun({ text: `Título: ${c.huTitulo}`, bold: true, size: 22 })] }),
  new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })] }),
  new Paragraph({ children: [new TextRun({ text: `Como  ${c.huComo}`, size: 20 })] }),
  new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })] }),
  new Paragraph({ children: [new TextRun({ text: `Quiero  ${c.huQuiero}`, size: 20 })] }),
  new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })] }),
  new Paragraph({ children: [new TextRun({ text: `Para  ${c.huPara}`, size: 20 })] }),
];

const children = [];

casos.forEach((c, idx) => {
  // Título rojo del caso
  children.push(new Paragraph({
    children: [new TextRun({ text: `${c.codigo} El sistema debe permitir ${c.titulo} ${c.cu}`, color: ROJO_TITULO, bold: true, size: 22 })],
    spacing: { before: 300, after: 200 },
  }));

  children.push(buildCasoTable(c, idx));

  children.push(new Paragraph({ children: [new TextRun({ text: ' ', size: 20 })], spacing: { after: 200 } }));

  // Historia de usuario
  children.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: `Historia de usuario - ${c.huTitulo}`, color: ROJO_TITULO, bold: true, size: 22 })],
    spacing: { after: 200 },
  }));

  children.push(...buildHU(c));

  // Salto de página entre casos (excepto el último)
  if (idx < casos.length - 1) {
    children.push(new Paragraph({ children: [new PageBreak()] }));
  }
});

const doc = new Document({
  sections: [{ properties: {}, children }],
});

Packer.toBuffer(doc).then(buffer => {
  writeFileSync('docs/Casos_de_Uso_AhorroApp.docx', buffer);
  console.log('✅ Archivo generado: docs/Casos_de_Uso_AhorroApp.docx');
});
