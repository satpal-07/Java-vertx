const listContainer = document.querySelector('#service-list');
const table = document.querySelector('#service-table');
let servicesRequest = new Request('/listService');
fetch(servicesRequest)
.then(function(response) {
    return response.json();
})
.then(function(responseJson) {
  var serviceList = responseJson.listService;
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
    deleteButton.onclick = evt => {
        fetchPost('/deleteService', service.name);
    }
    div.className = 'deleteButton';
    div.appendChild(deleteButton);
    serviceUrlData.appendChild(document.createTextNode(service.name));
    serviceStatusData.appendChild(document.createTextNode(service.status));
    serviceAddTimeData.appendChild(document.createTextNode(formatTimeStamp));
    deleteButtonData.appendChild(div);

    tableRow.appendChild(serviceUrlData);
    tableRow.appendChild(serviceStatusData);
    tableRow.appendChild(serviceAddTimeData);
    tableRow.appendChild(deleteButtonData);
    table.appendChild(tableRow);
  });
//   reloadPage(responseJson.reloadTimer);
});

const saveButton = document.querySelector('#post-service');
saveButton.onclick = evt => {
    let urlName = document.querySelector('#url-name').value;
    if(isUrlValid(urlName)) fetchPost('/addService', urlName);
    else document.getElementById('error-message').style.display = 'block';

}

function fetchPost(url, serviceUrlName) {
    fetch(url, {
        method: 'post',
        headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
        },
      body: JSON.stringify({url:serviceUrlName})
    }).then(res=> location.reload());
}

function showInvalidUrlMessage() {
    document.getElementById('error-message').style.display = 'none';
}

function isUrlValid(url) {
    var urlRegEx = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/;
    return urlRegEx.test(url);
}

function reloadPage(milliseconds){
    setInterval(function(){
       location.reload();
    }, milliseconds);
}