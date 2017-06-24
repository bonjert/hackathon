var gmap = {
    _markers: {},
    _map:null,

    createMarker: function (uuid, title, pos) {
        if (uuid in this._markers) {
            this._markers[uuid].setPosition(pos);
        } else {
            var self=this;
            var marker = new google.maps.Marker({
                uuid: uuid,
                map: this._map,
                position: pos,
                name: title,
                info: {
                }
            });
            this._markers[uuid] = marker;

            google.maps.event.addListener(marker, 'click', function () {
                var html = "<br>Latitude: " + this.getPosition().lat()
                    + "<br>Longitude: " + this.getPosition().lng()
                    + "<br>Date : " + this.info.date + " " + this.info.time
                    + "<br>GSM: " + this.info.gsm
                    + "<br>strain: " + this.info.strain;
                infowindow.setContent(this.name + " " + html);
                infowindow.open(self._map, this);
            });
            if (currentSettings.clientid != uuid) {
                greenMarker(uuid, pos);
            }
        }

    },

    getDistance: function (latLngA, latLngB) {
        var r = google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB);
        return r;
    }


}

function GMap(display){
    _display=display
}


window.gmap = gmap;