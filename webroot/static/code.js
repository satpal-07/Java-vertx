
var isServiceReloadInvoked = false;
getServiceList();
const saveButton = document.querySelector('#post-service');
saveButton.onclick = evt => {
    let urlName = document.querySelector('#url-name').value;
    if(isUrlValid(urlName)) fetchPost('post', '/addService', urlName).then(res=> location.reload());
    else document.getElementById('error-message').style.display = 'block';

}

/**
 * Function to get service lists
 */
function getServiceList() {
    const servicesRequest = new Request('/listService');
    fetch(servicesRequest)
    .then(function(response) {
        return response.json();
    })
    .then(function(responseJson) {
        populateTable(responseJson.listService);
        if(!isServiceReloadInvoked) reloadServices(responseJson.reloadTimer);
    });
}

/**
 * Function to get service lists 
 * @param url - url to be invoked
 * @param serviceUrlName - url name to be sent as body param
 */
function fetchPost(methodType, url,serviceUrlName) {
    return fetch(url, {
        method: methodType,
        headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
      body: JSON.stringify({url:serviceUrlName})
    });
}

function showInvalidUrlMessage() {
    document.getElementById('error-message').style.display = 'none';
}

/**
 * Function to check if provided url is valid
 * @param url - url to be validated
 * @return true if its valid else false
 */
function isUrlValid(url) {
    var urlRegEx = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    return urlRegEx.test(url);
}

/**
 * Function that reloads the service list
 * @param milliseconds - interval time
 */
function reloadServices(milliseconds){
    isServiceReloadInvoked = true;
    setInterval(function(){
       getServiceList();
    }, milliseconds);
}

function populateTable(serviceList) {
    const table = document.querySelector('#service-table');
    // remove existing services in the table before fetching and adding new ones
    const tableRows = document.getElementsByClassName('service-row');
    while (tableRows.length > 0) {
        table.removeChild(tableRows[0]);
    }
    var rowIndex = 0;
    serviceList.forEach(service => {
        var formatTimeStamp = new Date(service.time).toLocaleString("en-UK");
        var tableRow = document.createElement("TR");
        var serviceUrlData = document.createElement("TD");
        var serviceStatusData = document.createElement("TD");
        var serviceAddTimeData = document.createElement("TD");
        var deleteButtonData = document.createElement("TD");
    
        var div = document.createElement("div");
        var deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete Service";
        deleteButton.rowIndex = rowIndex;
        deleteButton.onclick = evt => {
            var rowIndex = evt.target.parentNode.parentNode.parentNode.rowIndex;
            table.deleteRow(rowIndex);
            fetchPost('delete', '/deleteService', service.name);
        }
        div.className = 'deleteButton';
        div.appendChild(deleteButton);
        serviceUrlData.appendChild(document.createTextNode(service.name));
        serviceStatusData.appendChild(document.createTextNode(service.status));
        serviceAddTimeData.appendChild(document.createTextNode(formatTimeStamp));
        deleteButtonData.appendChild(div);
        tableRow.className = 'service-row';
        tableRow.appendChild(serviceUrlData);
        tableRow.appendChild(serviceStatusData);
        tableRow.appendChild(serviceAddTimeData);
        tableRow.appendChild(deleteButtonData);
        table.appendChild(tableRow);
        rowIndex++;
    });
}