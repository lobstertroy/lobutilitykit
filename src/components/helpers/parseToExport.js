export default function parseToExport(data, filename = 'data_export') {
  const csvData = convertToCSV(data); //take data array and turn it into CSV string
  const csvBlob = new Blob([csvData], { type: 'text/csv' });
  const url = URL.createObjectURL(csvBlob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  function convertToCSV(info) {
    const arr = typeof info !== 'object' ? JSON.parse(info) : info; //confirm this is an array or object

    for (let each of arr) {
      each["Mailed"] = null;
      each["In Transit"] = null;
      each["In Local Area"] = null;
      each["Processed for Delivery"] = null;
      each["Delivered"] = null;
      each["Re-Routed"] = null;
      each["Returned to Sender"] = null;

      for (let scan of each.tracking_events) {
        each[scan.name] = scan.time
      }
    }

    let str = '' //init headers TODO
    for (let key in info[0]) {
      str += key + ","
    }
    str += "\r\n"

    for (let i = 0; i < arr.length; i++) { //loop over every row in the data
      let line = ''; //init new line
      for (let index in arr[i]) { //loop over every index in row
        if (line !== '') line += ','; //if this isn't the start of the row, add delimiter
        line += typeof arr[i][index] === 'string' ? arr[i][index] : `"${JSON.stringify(arr[i][index]).replace(/"/g, '""')}"`; //add index item to row, wrap in double quotes and replace to avoid breaking csv ??
      }
      str += line + "\r\n"; //linebreak after each line
    }

    return str //when object is fully parsed to CSV
  }
}
