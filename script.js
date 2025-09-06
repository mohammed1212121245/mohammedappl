let map = L.map('map').setView([31.9539,35.9106], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(map);
let markers=[];

// Update vehicles and table
function updateVehicles(){
fetch('./api.php')
.then(res=>res.json())
.then(data=>{
    console.log("Vehicles data:", data); // Debug
    markers.forEach(m=>map.removeLayer(m)); markers=[];
    let tableBody=document.querySelector('#vehicleTable tbody');
    tableBody.innerHTML='';
    let shipmentSelect=document.getElementById('shipmentVehicle');
    shipmentSelect.innerHTML='';
    data.forEach(v=>{
        v.lat += (Math.random()-0.5)/100;
        v.lng += (Math.random()-0.5)/100;
        let m=L.marker([v.lat,v.lng]).addTo(map).bindPopup(`${v.type} ${v.plate}`);
        markers.push(m);
        let row=document.createElement('tr');
        row.innerHTML=`<td>${v.id}</td><td>${v.type}</td><td>${v.plate}</td><td>${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}</td><td><button onclick="deleteVehicle(${v.id})" class="btn">Delete</button></td>`;
        tableBody.appendChild(row);
        shipmentSelect.innerHTML+=`<option value="${v.id}">${v.plate} (${v.type})</option>`;
    });
    document.getElementById('fleet-stats').innerText=data.length+' vehicles online';
}).catch(err=>console.error("Fetch error:",err));
}
updateVehicles();
setInterval(updateVehicles,5000);

// Add vehicle
document.getElementById('vehicleForm').addEventListener('submit',function(e){
e.preventDefault();
let type=document.getElementById('vehicleType').value.trim();
let plate=document.getElementById('vehiclePlate').value.trim();
let lat=document.getElementById('vehicleLat').value.trim();
let lng=document.getElementById('vehicleLng').value.trim();
let errors=[];
if(!type) errors.push('Vehicle type is required.');
if(!plate) errors.push('License plate is required.');
if(!/^[\p{L}\p{N}\-\s]{3,20}$/u.test(plate)) errors.push('Invalid license plate format.');
if(!lat||isNaN(lat)) errors.push('Latitude must be numeric.');
if(!lng||isNaN(lng)) errors.push('Longitude must be numeric.');
if(errors.length>0){ alert(errors.join('\n')); return;}
fetch('./api.php?action=addVehicle',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:`type=${encodeURIComponent(type)}&plate=${encodeURIComponent(plate)}&lat=${lat}&lng=${lng}`
})
.then(res=>res.json())
.then(resp=>{
    if(resp.success){
        alert(resp.message); 
        updateVehicles(); 
        this.reset();
    } else {
        alert(resp.errors.join('\n'));
    }
}).catch(err=>console.error("Add vehicle error:",err));
});

// Schedule shipment
document.getElementById('shipmentForm').addEventListener('submit',function(e){
e.preventDefault();
let dest=document.getElementById('destination').value.trim();
let time=document.getElementById('pickupTime').value;
let errors=[];
if(!dest) errors.push('Destination is required.');
if(!time) errors.push('Pickup time is required.');
else if(new Date(time)<new Date()) errors.push('Pickup time must be in the future.');
if(errors.length>0){alert(errors.join('\n')); return;}
alert('Shipment scheduled successfully!'); this.reset();
});

// Delete vehicle
function deleteVehicle(id){
if(!confirm('Are you sure you want to delete this vehicle?')) return;
fetch('./api.php?action=deleteVehicle',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:`id=${id}`
})
.then(res=>res.json())
.then(resp=>{
    if(resp.success){ alert(resp.message); updateVehicles(); }
    else { alert(resp.errors.join('\n')); }
})
.catch(err=>console.error("Delete error:",err));
}
