var token = "5173676480:AAGlC9EdHHZxKKNRuqSxnJLtCAyIh95t2nQ";
var telegramUrl = "https://api.telegram.org/bot" + token;
var webAppUrl = "https://script.google.com/macros/s/AKfycbzulvvKUFmhs-UiYeCJs8a7Uvr009286yjopnutRbS6ZwYOmmY/exec";

function setWebhook() {
var url = telegramUrl + "/setWebhook?url=" + webAppUrl;
var response = UrlFetchApp.fetch(url);
Logger.log(response.getContentText())
}


// send /start message
function sendMessage(id, text, keyBoard){
  var data = {
    method: "post",
    payload: {
    method: "sendMessage",
    chat_id: String(id),
    text: text,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(keyBoard)
    }
  };
UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data)
  
}

function sendTable(id, text, keyBoard){
    var data = {
    method: "post",
    payload: {
    method: "sendMessage",
    chat_id: String(id),
    text: text,
    parse_mode: "MarkdownV2",
    reply_markup: JSON.stringify(keyBoard)
    }
  };
UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/", data)
}

function formatArray2DAsMarkdown(values2D) {
  const formatted = values2D
    .map(formatRow_)
    .join('\n');
  return '```\n' + formatted + '\n```';
}
function formatRow_(values) {
  const first = (values.shift() + (' '.repeat(10))).slice(0, 12);
  return [first, ...values].join('\t');
}


function doPost(e){
  
try{
 var contents = JSON.parse(e.postData.contents);
 var ssId = "1AGImCfPh51Kyj2oerJ3a-HSnVxM-_ByxpQWskKijoFA"
 var sheet =SpreadsheetApp.openById(ssId).getSheetByName("Daily Finances");
 var nowDate = new Date();
 var date = nowDate.getMonth()+1+'/'+nowDate.getDate(); 
  
  if (contents.callback_query){
    
    var id = contents.callback_query.from.id
    var data = contents.callback_query.data
    
    if(data == "Add"){
      
      // add new record into google sheet with certain format
      sendMessage(id,"Please send your daily expenses with the format: [Modal] - [Barang] - [Collection]");  
      
    }else if (data == "Edit"){
      
     // edit exist record with input of date
     sendMessage(id,"Please specify which date of record would you like to edit. Reply in format [edit month/date]");  
      
    }else if (data == "Delete"){
      
     //delete record with input of date
     sendMessage(id,"Please specify which date of record would you like to delete. Reply in format [delete month/date]");   
      
    }else if (data == "View1"){
      
      //view specific row
      sendMessage(id, "Please specifiy which date of record would you like to view. Reply in format [view month/date]");
      
    }else if (data == "View"){
      
      //view the whole table without the table header
      var listArray = sheet.getDataRange().getDisplayValues()
      var listData = listArray.slice(1);
      var formattedData = formatArray2DAsMarkdown(listData);
      sendTable(id, formattedData);
     // var list  =  listData.map(row => row.join('\t \t')).join('\n') ;
     // sendMessage(id, list);
      
    }
    
    
    
  }else if (contents.message){
    var id = contents.message.from.id;
    var text = contents.message.text;
    var person = contents.message.from.first_name
    
    if(text.indexOf("-") !== -1){
           
      var item = text.split("-"); 
      sheet.appendRow([date, item[0], item[1], item[2], item[3], person ]) 
      sendMessage(id, "Ok added to your expense");
            
    }else if (text.indexOf("view") !== -1){
      
      // view a record
      var viewDate = text.split(" ");
      sendMessage(id, "Seacrhing.. ");
      var dataFinder = sheet.createTextFinder(viewDate[1]);
      var dataRow = dataFinder.findNext().getRow();
      var data = sheet.getRange("A"+dataRow+":E"+dataRow).getDisplayValues();
      var formattedData = formatArray2DAsMarkdown(data);
      sendTable(id, formattedData);
     // var data = sheet.getRange("A"+dataRow+":E"+dataRow).getDisplayValues().map(row => row.join('\t \t')).join('\n') ;
     // sendMessage(id, data);
      
      
    }else if (text.indexOf("edit") !== -1){
      
      // edit a record
      var editDate = text.split(" ");
      sendMessage(id, "Seacrhing.. ");
      var editFinder = sheet.createTextFinder(editDate[1]);
      var dataRow = editFinder.findNext().getRow();
      
      var data = sheet.getRange("A"+dataRow+":E"+dataRow).getDisplayValues().map(row => row.join('\t \t')).join('\n') ;
      sendMessage(id, data);
      
      
    }else if (text.indexOf("delete") !== -1){
      
      // trim "delete date", search based on date and delete the row
      var deleteDate = text.split(" ");
      sendMessage(id, "deleting in progress..");
      var textFinder = sheet.createTextFinder(deleteDate[1])
      var finderRow = textFinder.findNext().getRow()
      sheet.deleteRow(finderRow)
      sendMessage(id, "Data for date " + deleteDate[1] + " have been deleted");
      
    }else if (text == "admin"){
      
      var keyBoard = {
        "inline_keyboard":[
          [{
            "text": "Add Record",
            "callback_data": "Add"
          }],
       //   [{
       //     "text": "Edit Record",
       //     "callback_data": "Edit"
       //   }],
          [{
            "text": "Delete Record",
            "callback_data": "Delete"
          }],
          [{
            "text": "View Specific Record",
            "callback_data": "View1"
          }],
          [{
            "text": "View All Record",
            "callback_data": "View"
          }],
        ]
      };
      
      return sendMessage(id, "Hello admin choose type of action", keyBoard)     
    
    }else{
      
      return sendMessage(id, "Identifies yourself..")
    }
  }
  }catch(e){
    return sendMessage(id, "error " + e, keyBoard)
  }

  
}



