var map;
var infowindow;

var current_gps = document.getElementById("current_gps");
var logger =document.getElementById("logger");
logger.innerHTML="";
var mqtt_client;
var mqtt_client_on=false;
var currentSettings={
	
} ;

var markers={};
var greenZones={};
var labels={};

var cid=localStorage.getItem("uuid");
var newDevice=false;
if(cid){
	currentSettings.clientid=cid;
	newDevice=true;
}else{
	
	currentSettings.clientid=gen_uuid();
	localStorage.setItem('uuid', currentSettings.clientid);	
}
var ev_1=false;
var ev_2=false;
var ev_3=false;
var ev_4=false;
function initMap() {
	var pyrmont = {lat: 13.872062000000001, lng: 100.4980678
	};
			// Try HTML5 geolocation.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position) {
					var pos = {
							lat: position.coords.latitude,
							lng: position.coords.longitude
					};
					pyrmont = pos;
					map = new google.maps.Map(document.getElementById('map'), {
							center:pyrmont,
							zoom: 14
					});
					infowindow = new google.maps.InfoWindow();
					//var marker = new google.maps.Marker({
					//		map: map,
					//		position: pos,
					//		name: 'ตำแหน่งปัจจุบันของคุณ'
					//});
					
					
					
					var marker = createMarker(currentSettings.clientid,'ตำแหน่งปัจจุบันของคุณ',pos);
					var html="<br>Latitude: "+marker.getPosition().lat()
				    +"<br>Longitude: "+marker.getPosition().lng();
					infowindow.setContent("ตำแหน่งปัจจุบันของคุณ"+html);
					infowindow.open(map, marker);
					
					init();
					//google.maps.event.addListener(marker, 'click', function () {
					// console.log(place);
					//infowindow.setContent("ตำแหน่งปัจจุบันของคุณ");
						//	infowindow.open(map, this);
					//});
					//var service = new google.maps.places.PlacesService(map);
					//service.textSearch({
					//location: pyrmont,
					//		radius: 20000,
					///		query: 'สัตว์',
					//		types: ['hospital']

					//}, callback);
		}, function() {
		
		});
	} else {
   
	}


}


/*function callback(results, status, pagination) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
		createMarker(results[i]);
		}
		if (pagination.hasNextPage) {
			var moreButton = document.getElementById('more');
					moreButton.disabled = false;
					moreButton.addEventListener('click', function () {
					moreButton.disabled = true;
							pagination.nextPage();
					});
			}
	}
}*/

function createMarker(uuid,title,pos) {

  if(uuid in markers){
	markers[uuid].setPosition(pos);
	
	
  }else{
	var marker = new google.maps.Marker({
			uuid:uuid,
			map: map,
			position: pos,
			name: title,
			info:{
			}
	});
	
	
	
		markers[uuid]=marker;
		google.maps.event.addListener(marker, 'click', function () {
				var html="<br>Latitude: "+this.getPosition().lat()
				+"<br>Longitude: "+this.getPosition().lng()
				+"<br>Date : "+this.info.date+" " + this.info.time
				+"<br>GSM: "+this.info.gsm
				+"<br>strain: "+this.info.strain;
				infowindow.setContent(this.name + " " +html);
				infowindow.open(map, this);
		});
	 if(currentSettings.clientid!=uuid){
		greenMarker(uuid,pos);
	 }
  }
  if(uuid in markers){
   if(uuid in greenZones){
		checkAlarm(uuid);
		/*var p1=markers[uuid].getPosition();
		var p2=greenZones[uuid].getCenter();
		var d=getDistance(p1,p2);
		var r=greenZones[uuid].getRadius();
		console.log("getRadius:"+r);
	    console.log("getDistance:"+d);
		if(d>r){
			var msg =""+markers[uuid].uuid +" Latitude: "+markers[uuid].getPosition().lat()
				+" Longitude: "+markers[uuid].getPosition().lng()
				+" Distance: "+(d-r);
				
				var html="<br>Device : "+markers[uuid].uuid 
				+"<br>Latitude: "+markers[uuid].getPosition().lat()
				+"<br>Longitude: "+markers[uuid].getPosition().lng()
				+"<br>Distance: "+(d-r);
				infowindow.setContent("ออกนอกพื้นที่ " +html);
				infowindow.open(map, markers[uuid]);
				
		   // notifyMe(msg);
		   sendAlarmOn(uuid);
		}else{
			sendAlarmOff(uuid);
			infowindow.close(map, markers[uuid]);
		}*/
   }
  }
  return markers[uuid];
	
}
 //var notification ;
function notifyMe(msg) {
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("This browser does not support desktop notification");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
	 var options = {
      body: msg
	}
    var notification = new Notification("ออกนอกพื้นที่",options);
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== 'denied') {
    Notification.requestPermission(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
       	 var options = {
			body: msg
			}
    var notification = new Notification("ออกนอกพื้นที่",options);
    }});
  }

  // At last, if the user has denied notifications, and you 
  // want to be respectful there is no need to bother them any more.
}



function greenMarker(uuid,pos) {
	 if(uuid in greenZones){
		greenZones[uuid].setCenter(pos);
		if(pos.radius!=greenZones[uuid].getRadius()){
			greenZones[uuid].setRadius(pos.radius);
		}
		//greenZones[uuid].setRadius(pos.radius);
	 }else{
		 var greenZone = new google.maps.Circle({
			uuid:uuid,
            strokeColor: '#00f60f',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#00f60f',
            fillOpacity: 0.35,
            map: map,
            center: pos,
            radius: 100,
			editable: true,
			draggable: true
          });
		  greenZones[uuid]=greenZone;
		  
		  google.maps.event.addListener(greenZone, 'dragend', function () {
				checkAlarm(this.uuid);
				
			//	msg="{\"lat\":" + (this.getCenter().lat()) +",\"lng\": " + (this.getCenter().lng())+",\"radius\":"+this.getRadius()+"}";
			//	console.log(msg);
				//sendMessage(currentSettings.topic+"/"+this.uuid+"/green",msg);
		});
		
		google.maps.event.addListener(greenZone, 'radius_changed', function () {
				checkAlarm(this.uuid);
			//	
			//	msg="{\"lat\":" + (this.getCenter().lat()) +",\"lng\": " + (this.getCenter().lng())+",\"radius\":"+this.getRadius()+"}";
			//	console.log(msg);
				//sendMessage(currentSettings.topic+"/"+this.uuid+"/green",msg);
		});
		
		
	 }
}

function checkAlarm(uuid){
	if(ev_2==false&&ev_3==false&&ev_4==false){
				
				var p1=markers[uuid].getPosition();
				var p2=greenZones[uuid].getCenter();
				var d=getDistance(p1,p2);
				var r=greenZones[uuid].getRadius();
				console.log("getRadius:"+r);
				console.log("getDistance:"+d);
				if(d>r){
					if(ev_1==false){
						//var msg =""+markers[uuid].uuid +" Latitude: "+markers[uuid].getPosition().lat()
						//+" Longitude: "+markers[uuid].getPosition().lng()
						//+" Distance: "+(d-r);
						
						var html="<br>Device : "+markers[uuid].uuid 
						+"<br>Latitude: "+markers[uuid].getPosition().lat()
						+"<br>Longitude: "+markers[uuid].getPosition().lng()
						+"<br>Distance: "+(d-r);
						infowindow.setContent("ออกนอกพื้นที่ " +html);
						infowindow.open(map, markers[uuid]);
						ev_1=true;
						 sendAlarmOn(uuid);
					 }
				}else{
					if(ev_1){
						ev_1=false;
						sendAlarmOff(uuid);
						infowindow.close(map, markers[uuid]);
					}
				}
	}
}
	
function getDistance(latLngA,latLngB){
	var r=google.maps.geometry.spherical.computeDistanceBetween (latLngA, latLngB);
	return r;
}




function init(){
	var cid=localStorage.getItem("uuid");
	if(cid){
		currentSettings.clientid=cid;
	}else{
		
		currentSettings.clientid=gen_uuid();
		localStorage.setItem('uuid', currentSettings.clientid);	
	}
	
	currentSettings.topic="m001";//currentSettings.clientid;
	currentSettings.server="io.codeunbug.com"
	currentSettings.port=443
	currentSettings.user=""
	currentSettings.password=""
	currentSettings.use_ssl=true;
	mqtt_init();
	
}


function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition);
	} else {
		current_gps.innerHTML = "Geolocation is not supported by this browser.";
	}
}

function generateRandomNumber() {
    var min = 0.0001,
        max = 0.0009,
        highlightedNumber = Math.random() * (max - min) + min;

   // alert(highlightedNumber);
   return highlightedNumber;
};



function showPosition(position) {

//console.log(Math.random()/10000);
	var offset1=generateRandomNumber();//Math.random()/10000;
    var offset2=generateRandomNumber();
	var msg="{\"lat\":" + (position.coords.latitude+offset1) +",\"lng\": " + (position.coords.longitude+offset2)+"}";
	console.log(msg);
	sendMessage(currentSettings.topic+"/"+currentSettings.clientid+"/cur",msg);
	
	 if(currentSettings.clientid in greenZones){
		
	}else{
		msg="{\"lat\":" + (position.coords.latitude+offset1) +",\"lng\": " + (position.coords.longitude+offset2)+",\"radius\":100}";
		console.log(msg);
		sendMessage(currentSettings.topic+"/"+currentSettings.clientid+"/green",msg);
		newDevice=false;
	}
	//setTimeout(getLocation, 5000);
}

function gen_uuid(){
					function s4() {
						return Math.floor((1 + Math.random()) * 0x10000)
						  .toString(16)
						  .substring(1);
					  }
					  return (s4() + s4()  + s4()+ '-' + s4() + '-' +s4() + '-' + s4() + s4() + s4()).toString();
}
function mqtt_init(){
	dataObject={};
	// set callback handlers
	console.log(currentSettings.clientid);
	mqtt_client=new Paho.MQTT.Client(currentSettings.server, currentSettings.port,currentSettings.clientid);
	mqtt_client.onConnectionLost = onConnectionLost_mqtt;
	mqtt_client.onMessageArrived = onMessageArrived_mqtt;
	
	var mqtt_config = {
		useSSL: currentSettings.use_ssl,
		userName: currentSettings.user,
		password: currentSettings.password,
		onSuccess:onConnect_mqtt,
		onFailure:doFail_mqtt,
		keepAliveInterval:30
	};
 
	// connect the client
	
	mqtt_client.connect(mqtt_config);
	//paho_object[currentSettings.clientid]= mqtt_client;
}

function onConnect_mqtt() {
			console.log("onConnect");
			mqtt_client.subscribe(currentSettings.topic+"/#", {qos: Number(0)});
			mqtt_client_on=true;
			//setTimeout(getLocation, 20000);
}

function doFail_mqtt(e){
	//mqtt_init();
	console.log(e);
}
function onConnectionLost_mqtt(responseObject) {
		if (responseObject.errorCode !== 0) {
		  //updateCallback(responseObject.errorMessage);
		  console.log("onConnectionLost:"+responseObject.errorMessage);
		  //onConnect_mqtt();
		  mqtt_init();
		}
}

function onMessageArrived_mqtt(message) {
	 try {
			
			
			var topic=message.destinationName;
			var payload=message.payloadString;
			
			//console.log(topic);
			console.log("Arrived :: "+topic+" "+payload);
			//var t = document.createTextNode(topic+" "+ message.payloadString);     // Create a text node
			logger.innerHTML+="<br>"+topic+" "+ payload;
			
			var topics=topic.split("/");
			//update_data(topics,0,dataObject,message.payloadString);
			//console.log(message.payloadString);
			//console.log("xxxxxx");
			//var pos=JSON.parse(message.payloadString);
			//console.log(obj);
			//if(currentSettings.clientid==topics[1]){
			//	if(topics[2]=="cur"){
				//	current_gps.innerHTML ="Device Id:"+topics[1]+ "<br>Latitude: " + pos.lat + 
				//	"<br>Longitude: " + pos.lng; 
				//}
				
			//	createMarker(topics[1],topics[1],pos);
			//}
			//if(topics[2]=="cur"){
			//	createMarker(topics[1],topics[1],pos);
			//}
			//else if(topics[2]=="green"){
			//	greenMarker(topics[1],pos);
			
			
			//}
			
			//current_gps.innerHTML=message.payloadString;
			var uuid=topics[0];
			if(topics[2]=="gps"){
				//m001/data/gps 0,0,0.000000,0.000000
				var res = payload.split(",");
				var pos={
					lat:parseFloat(res[2]),
					lng:parseFloat(res[3])
				};
				createMarker(topics[0],topics[0],pos);
				 if(uuid in markers){
				markers[uuid].info.date=res[0];
				markers[uuid].info.time=res[1];
				}
			}
			else if(topics[2]=="strain"){
				//m001/data/strain 44
				
				
				var strain = parseFloat(payload);
				if(ev_1==false&&ev_3==false&&ev_4==false){
						if(strain>30){
							if(ev_2==false){
								ev_2=true;
								showEvent(topics[0],"มีการพยายามถอด")
								sendAlarmOn(topics[0]);
							}
							
						}else{
							if(ev_2){
								ev_2=false;
								sendAlarmOff(topics[0]);
								closeEvent(topics[0]);
							}
						}
				}
				 if(uuid in markers){
				markers[uuid].info.strain=strain;
				}
			}
			else if(topics[2]=="gsm_signal"){
				//m001/data/gsm_signal 34
				var gsm_signal = parseFloat(payload);
				 if(uuid in markers){
				markers[uuid].info.gsm=gsm_signal;
				}
			}
			else if(topics[2]=="alarm_cut"){
			if(ev_1==false&&ev_2==false&&ev_4==false){
				if(payload=="Normal"){
					if(ev_3){
						ev_3=false;
						sendAlarmOff(topics[0]);
						closeEvent(topics[0]);
					}
				}else{
					
					if(ev_3==false){
						ev_3=true;
						showEvent(topics[0],"มีการตัดสาย")
						sendAlarmOn(topics[0]);
					}
				}
			}
				//m001/data/gsm_signal 34
				//var gsm_signal = parseFloat(payload);
			}
			///alarm_cut
			
			
		}
		catch(e) {
			console.log(e);
		}	
			
			//updateCallback(dataObject);
			
			
}
function showEvent(uuid,title){
		var html="<br>Device : "+markers[uuid].uuid 
					+"<br>Latitude: "+markers[uuid].getPosition().lat()
					+"<br>Longitude: "+markers[uuid].getPosition().lng()
					infowindow.setContent(title +html);
					infowindow.open(map, markers[uuid]);
}
function closeEvent(uuid){
infowindow.close(map, markers[uuid]);
}

function sendMessage(topic,msg){
	console.log("send Message :: "+ topic +" " + msg);
	message = new Paho.MQTT.Message(msg.toString());
	message.destinationName = topic;
	message.retained=true;
	mqtt_client.send(message); 
	
}



function sendAlarmOff(uuid){
	var topic =uuid+"/data/buzzer";
	sendMessage(topic,0);
}

function sendAlarmOn(uuid){
	var topic =uuid+"/data/buzzer";
	sendMessage(topic,1);
}