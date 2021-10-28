const { Classifier } = require('ml-classify-text');

const classifier = new Classifier();

/**
 * configurations
 * isClassified
 * 
 * Classifier
 * Schema(category:string);
 */




// OTROS es un valor ingresado por default
const ANOTHER_CATEGORY = {tag: 'OTROS', keywords: '', totalPredictions: 0};


const chatbotClassifyDbData = [
    {tag: 'Proyecto Modular', keywords: 'proyecto modular proyectos modulares', totalPredictions: 0},
    {tag: 'CUCEI', keywords: 'edificio cucei aula salon',  totalPredictions: 0},
    {tag: 'Servicio Social', keywords: 'Servicio social',  totalPredictions: 0},
    {tag: 'Tacos', keywords: 'tacos',  totalPredictions: 0}
];

chatbotClassifyDbData.forEach(data => {
    //(tag, string to be classified in that tag)
    classifier.train([data.keywords.toLowerCase()], `${data.tag}`);
});

chatbotClassifyDbData.push(ANOTHER_CATEGORY);




/**
 * Si se requiere classificar toda la data de la db
 * A considerar: tendran tambien el campo de 'createdAt'
 */
chatbotDbData = [
    {input: 'Cuando se entrega el proyecto modular?', category: ''},
    {input: 'Informacion general proyectos modulares', category: ''},
    {input: 'Donde estan las vacantes para el servicio social?', category: ''},
    {input: 'Hola', category: ''},
    {input: 'Tacos', category: ''},
    {input: 'Modulos de los modulares', category: ''},
];

chatbotDbData.forEach(data => {
    const predictions = classifier.predict(data.input.toLowerCase());
    if (predictions.length) {
        predictions.forEach(prediction => {
            // console.log(`${prediction.label} (${prediction.confidence})`);
            data.category = prediction.label;
            chatbotClassifyDbData.find(c => c.tag === prediction.label).totalPredictions += 1;
        })
    } else {
        // console.log('No predictions returned');
        data.category = ANOTHER_CATEGORY.tag;
        chatbotClassifyDbData.find(c => c.tag === ANOTHER_CATEGORY.tag).totalPredictions += 1;
    }
});

console.table(chatbotDbData);
console.table(chatbotClassifyDbData);


//   EXCEL
// https://www.npmjs.com/package/excel4node

// Require library
var xl = require('excel4node');
 
// Create a new instance of a Workbook class
var wb = new xl.Workbook({
    jszip: {
      compression: 'DEFLATE',
    },
    defaultFont: {
      size: 12,
      name: 'Calibri',
      color: 'FFFFFFFF',
    },
    dateFormat: 'm/d/yy hh:mm:ss',
    workbookView: {
      activeTab: 1, // Specifies an unsignedInt that contains the index to the active sheet in this book view.
      autoFilterDateGrouping: true, // Specifies a boolean value that indicates whether to group dates when presenting the user with filtering options in the user interface.
      firstSheet: 1, // Specifies the index to the first sheet in this book view.
      minimized: false, // Specifies a boolean value that indicates whether the workbook window is minimized.
      showHorizontalScroll: true, // Specifies a boolean value that indicates whether to display the horizontal scroll bar in the user interface.
      showSheetTabs: true, // Specifies a boolean value that indicates whether to display the sheet tabs in the user interface.
      showVerticalScroll: true, // Specifies a boolean value that indicates whether to display the vertical scroll bar.
      tabRatio: 600, // Specifies ratio between the workbook tabs bar and the horizontal scroll bar.
      visibility: 'visible', // Specifies visible state of the workbook window. ('hidden', 'veryHidden', 'visible') (§18.18.89)
      windowHeight: 17620, // Specifies the height of the workbook window. The unit of measurement for this value is twips.
      windowWidth: 28800, // Specifies the width of the workbook window. The unit of measurement for this value is twips..
      xWindow: 0, // Specifies the X coordinate for the upper left corner of the workbook window. The unit of measurement for this value is twips.
      yWindow: 440, // Specifies the Y coordinate for the upper left corner of the workbook window. The unit of measurement for this value is twips.
    },
    logLevel: 0, // 0 - 5. 0 suppresses all logs, 1 shows errors only, 5 is for debugging
    author: 'Microsoft Office User', // Name for use in features such as comments
  });
 
// Add Worksheets to the workbook
var ws = wb.addWorksheet('Sheet 1', {sheetProtection: {autofilter: true}});
 
// Create a reusable style
var style = wb.createStyle({
  font: {
    color: '#000000',
    size: 12,
  },
  numberFormat: '$#,##0.00; ($#,##0.00); -',
});

var titleStyle = wb.createStyle({
    font: {
      bold: true,
      color: '#000000',
      size: 16
    },
    alignment: {horizontal: 'center'}
  });

ws.cell(1, 1)
.string('Category')
.style(titleStyle);

ws.cell(1, 2)
.string('Input')
.style(titleStyle);

let cellNumber = 2;
let colNumber = 1;

chatbotDbData.forEach(data => {
    console.log(data);
    ws.cell(cellNumber, colNumber)

      .string(data.category)
      .style(style);
    ws.cell(cellNumber++, colNumber+1)
      .string(data.input)
      .style(style);
});
 
// // Set value of cell A1 to 100 as a number type styled with paramaters of style
// ws.cell(1, 1)
//   .number(100)
//   .style(style);
 
// // Set value of cell B1 to 200 as a number type styled with paramaters of style
// ws.cell(1, 2)
//   .number(200)
//   .style(style);
 
// // Set value of cell C1 to a formula styled with paramaters of style
// ws.cell(1, 3)
//   .formula('A1 + B1')
//   .style(style);
 
// // Set value of cell A2 to 'string' styled with paramaters of style
// ws.cell(2, 1)
//   .string('string')
//   .style(style);
 
// // Set value of cell A3 to true as a boolean type styled with paramaters of style but with an adjustment to the font size.
// ws.cell(3, 1)
//   .bool(true)
//   .style(style)
//   .style({font: {size: 14}});

console.log('writting excel');
ws.row(1).freeze();
wb.write('CHATBOT DATA COORDINADESK 2021 B.xlsx');

 
// sends Excel file to web client requesting the / route
// server will respond with 500 error if excel workbook cannot be generated
// var express = require('express');
// var app = express();
// app.get('/', function(req, res) {
//   wb.write('ExcelFile.xlsx', res);
// });
// app.listen(3000, function() {
//   console.log('Example app listening on port 3000!');
// });