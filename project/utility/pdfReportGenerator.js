
const { chromium } = require('@playwright/test');
const PDFDocument = require('pdfkit');
const fs = require('fs');

let testResults = [];
let doc, stream;
let final 
let totalTests = 0;
let passedTests = 0;
let failedTests=0
 let   skippedTests=0
  let  timedOutTests=0
  let  interruptedTests=0
class MyReporter {
    onBegin(config, suite) {
      console.log("Test case executions started")
      console.log(`Starting the run with ${suite.allTests().length} tests`);

      if (fs.existsSync('./screenshots')) {
        fs.rmdirSync('./screenshots', { recursive: true });
      }
    
      // Create a new ./screenshots folder
      fs.mkdirSync('./screenshots');
      console.log("initialized screenshots folder")
    

    }
  
    onTestEnd(test, result) {
      let tempResult = {
        testName: test.title,
        result: result.status,
        duration: result.duration,
        retry: result.retry,
        error: null
      };
  
      if (result.status === 'failed') {
        tempResult.error = result.error.message;
      }
  
      // Push the temporary result to an array for grouping later
      testResults.push(tempResult);
    }
  
    async onEnd(result) {
      console.log('all results:' + JSON.stringify(testResults));
      const groupedResults = groupResults(testResults);
      const finalResults = calculateFinalResults(groupedResults);
      await this.addResultToDoc(finalResults);
      console.log("Test case executions ended..!!");
    }
  
    async addResultToDoc(testResults) {
      // create a new PDF document
    doc = new PDFDocument();
    // create a buffer to hold the PDF document
    let buffer = [];

    // Add a title to the first page of the document
    doc.fontSize(26).text('Automation Report', { align: 'center' ,underline: true});
    doc.moveDown();

    // Add project and date/time information to the first page
    const project = 'Demo Project';
    const dateTime = new Date().toLocaleString();
    doc.fontSize(16).text(`Project: ${project}`, { align: 'center' });
    doc.fontSize(14).text(`Report generated on ${dateTime}`, { align: 'center' });

    // Draw a border around the first page
    doc.rect(0, 0, doc.page.width, doc.page.height).stroke();
    doc.moveDown();
    doc.addPage()
//deatils in second page of document 

for (let i = 0; i < testResults.length; i++) {
    totalTests++;
  
    if (testResults[i].result === 'passed') {
      passedTests++;
    }

    if (testResults[i].result === 'failed') {
        failedTests++;
      }

      if (testResults[i].result === 'timedOut') {
        timedOutTests++;
      }

      if (testResults[i].result === 'skipped') {
        skippedTests++;
      }

      if (testResults[i].result === 'interrupted') {
        interruptedTests++;
      }
  }
  const details = [
    ['Test Cases',totalTests ],
    ['Passed',passedTests],
    ['Failed',failedTests],
    ['Skipped',skippedTests],
    ['TimedOut',timedOutTests],
    ['Interrupted',interruptedTests],
  ];
  console.log(`Total tests: ${totalTests}`);
 console.log(`Passed tests: ${passedTests}`);
 
 summary(doc,details)
 doc.addPage()

    
    // add each test result to the PDF document
    for (let i = 0; i < testResults.length; i++) {

        doc.rect(0, 0, doc.page.width, doc.page.height).stroke();

      const test = testResults[i];
         
        let testname = test.testName
        testname = testname.replace(/[^a-zA-Z0-9]/g, '');
        const imageName =testname+ '.png';
        const imagePath = './screenshots/' +imageName;
          
      doc.fontSize(16).text(`Test ${i + 1}: ${test.testName}`);
      
      const minutes = (test.duration / 60000).toFixed(2)

      if (test.result === 'passed')
       {
        doc.fontSize(14).fillColor('black').text('Result: Passed');
        doc.fontSize(13).fillColor('black').text('Retry:'+test.retry)
        doc.fontSize(13).fillColor('black').text('Duration:'+minutes+' Minutes')
        addImgToPdf(doc,imagePath)

      } 
      else if (test.result === 'failed')
       {
        doc.fontSize(14).fillColor('red').text('Result: Failed');
        //doc.fontSize(13).fillColor('red').text('Reason:'+test.stack);
        doc.fontSize(13).fillColor('red').text('Retry:'+test.retry)
        doc.fontSize(13).fillColor('red').text('Duration:'+minutes +' Minutes')
        let msg=test.error
            msg =msg.replace(/[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d\/#&.:=?%@~_]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~]))/g, '');
        doc.fontSize(13).fillColor('red').text('Reason:'+msg);
        doc.addPage()
        addImgToPdf(doc,imagePath)

        
      }

      else {
        doc.fontSize(14).fillColor('red').text(`Result: ${test.result}`);

      }

      doc.addPage()

    }

    try {
      // write the PDF document to the buffer
      doc.on('data', chunk => {
        buffer.push(chunk);
      });
      doc.end();
      // wait for the PDF document to finish writing to the buffer
      await new Promise(resolve => {
        doc.on('end', resolve);
      });

      // save the buffer to a file
      fs.writeFileSync('./AutomationReport.pdf', Buffer.concat(buffer));

      console.log('PDF report generated successfully.');
    } catch (error) {
      console.error('Error generating PDF report:', error);
    }
  }
  
    }

  

  
  // Function to group test case results by their name
  function groupResults(results) {
    const groupedResults = {};
  
    results.forEach(result => {
      if (groupedResults[result.testName]) {
        groupedResults[result.testName].push(result);
      } else {
        groupedResults[result.testName] = [result];
      }
    });
  
    return groupedResults;
  }
  
  // Function to calculate the final result for each test case
  function calculateFinalResults(groupedResults) {
    const finalResults = [];
  
    Object.keys(groupedResults).forEach(testName => {
      const results = groupedResults[testName];
      let finalResult = {
        testName: testName,
        result: results[0].result,
        duration: 0,
        retry: results[0].retry,
        error: null
      };
  
      results.forEach(result => {
        if (result.result === 'failed') {
          finalResult.result = 'failed';
          finalResult.retry=result.retry;
          finalResult.error = result.error;
          
        }
  
        finalResult.duration += result.duration;
      });
  
      finalResults.push(finalResult);
    });
  
    return finalResults;
  }
  
  function addImgToPdf(doc,imagePath)
  {

      doc.moveDown();
      doc.fontSize(12).text('Screenshot:', { underline: true });
      doc.moveDown();

    if (fs.existsSync(imagePath)) 
    {
        // Add the image to the PDF document
        //doc.image(imagePath,{ width: 500 }) 
        doc.image(imagePath, {
            width: 500, // Set the width of the image to 500 pixels
            height:500 // Set the height of the image to 300 pixels
          });
    }
  
    else {
          doc.fontSize(14).text('No screenshot available.');
        }     
        
        
}

function summary(doc, details) {

    doc.rect(0, 0, doc.page.width, doc.page.height).stroke();
    
    // Define the table data
    const headers = ['Total Count'];
    const rows = details.map(([header, value]) => [header, value.toString()]);
    const data = [headers, ...rows];
  
    // Define the table width and column width
    const tableWidth = 400;
    const columnWidth = tableWidth / 2;
  
    // Draw the title
    doc.fontSize(20).text('Automation Report Summary ', 50, 50, { align: 'center' });
  
    // Draw the table headers
    doc.fontSize(15).text(data[0][0], 50, 90, { align: 'center' });
  
    // Draw the table rows
    for (let i = 1; i < data.length; i++) {
      doc.fontSize(15).text(data[i][0], 60, 120 + (i - 1) * 30, { align: 'left' });
      doc.fontSize(15).text(data[i][1], 60 + columnWidth, 120 + (i - 1) * 30, { align: 'left' });
    }
  
    // Draw the table borders
    doc.rect(50, 80, tableWidth, 30).stroke(); // First row
    for (let i = 1; i < data.length; i++) {
      doc.rect(50, 110 + (i - 1) * 30, columnWidth, 30).stroke(); // First column
      doc.rect(50 + columnWidth, 110 + (i - 1) * 30, columnWidth, 30).stroke(); // Second column
    }
  }
  




  
  
  
  
  module.exports = MyReporter;
  
