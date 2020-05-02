
let isServiceReloadInvoked = false;
getServiceList();
const saveButton = document.querySelector('#post-service');
saveButton.onclick = evt => {
    // get url and remove all spaces
    let input = document.querySelector('#url-name');
    let urlName = input.value;
    if (isUrlValid(urlName)) {
        fetchPost('post', '/addService', urlName)
            .then(res => {
                input.value = '';
                getServiceList();
            })
            .catch(err => {
                console.error(err.message);
            });
    }
    else {
        document.getElementById('error-message').style.display = 'block';
    }

}

/**
 * Function to get service lists
 */
function getServiceList() {
    const servicesRequest = new Request('/listService');
    fetch(servicesRequest)
        .then(response => response.json())
        .then(responseJson => {
            populateTable(responseJson.listService);
            // reload the services periodically - NOTE: timer is fetched from BE
            // reloadServices is only invoked once to avoid building up setInternal call stack
            if (!isServiceReloadInvoked) reloadServices(responseJson.reloadTimer);
        }).catch(err => {
            console.error(err.message);
        });
}

/**
 * Function to get service lists 
 * @param url - url to be invoked
 * @param serviceUrlName - url name to be sent as body param
 */
function fetchPost(methodType, url, serviceUrlName) {
    return fetch(url, {
        method: methodType,
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: serviceUrlName })
    });
}

/**
 * Function to hide the url invalid error message 
 */
function hideInvalidUrlMessage() {
    document.getElementById('error-message').style.display = 'none';
}

/**
 * Function to check if provided url is valid
 * @param url - url to be validated
 * @return true if its valid else false
 */
function isUrlValid(url) {
    let urlRegEx = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/){1}[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    return urlRegEx.test(url);
}

/**
 * Function that reloads the service list
 * @param milliseconds - interval time
 */
function reloadServices(milliseconds) {
    isServiceReloadInvoked = true;
    setInterval(function () {
        getServiceList();
    }, milliseconds);
}

/**
 * Function that adds service data to the page
 * @param serviceList - Array containing service json object
 */
function populateTable(serviceList) {
    const table = document.querySelector('#service-table');
    // remove existing services in the table before fetching and adding new ones
    const tableRows = document.getElementsByClassName('service-row');
    while (tableRows.length > 0) {
        table.removeChild(tableRows[0]);
    }
    let rowIndex = 0;
    serviceList.forEach(service => {
        let formatTimeStamp = new Date(service.time).toLocaleString("en-UK");
        let tableRow = document.createElement("TR");
        let serviceUrlData = document.createElement("TD");
        let serviceStatusData = document.createElement("TD");
        let serviceAddTimeData = document.createElement("TD");
        let deleteButtonData = document.createElement("TD");

        let div = document.createElement("div");
        let deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete Service";
        deleteButton.rowIndex = rowIndex;
        deleteButton.onclick = evt => {
            let rowIndex = evt.target.parentNode.parentNode.parentNode.rowIndex;
            table.deleteRow(rowIndex);
            fetchPost('delete', '/deleteService', service.name).catch(err => {
                console.error(err.message);
            });;
        }
        div.className = 'deleteButton';
        div.appendChild(deleteButton);
        serviceUrlData.appendChild(document.createTextNode(service.name));
        serviceStatusData.appendChild(document.createTextNode(service.status));
        if (service.status === 'PENDING') serviceStatusData.style.backgroundColor = '#e4bc4f';
        else if (service.status === 'OK') serviceStatusData.style.backgroundColor = '#78be6a';
        else serviceStatusData.style.backgroundColor = '#f78686';
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