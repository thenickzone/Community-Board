var dummyEvents = [
    {
        name: "Event 1",
        location: { lat: 40.7128, lng: -74.0060 }, // Coordinates for New York City
        details: "Details about Event 1"
    },
    {
        name: "Event 2",
        location: { lat: 41.8781, lng: -87.6298 }, // Coordinates for Chicago
        details: "Details about Event 2"
    },
    {
        name: "Event 3",
        location: { lat: 41.8761, lng: -87.6098 }, // Coordinates for Chicago
        details: "Details about Event 3"
    },
    {
        name: "Event 4",
        location: { lat: 41.3761, lng: -87.6098 }, // Coordinates for Chicago
        details: "Details about Event 4"
    }
    // Add more dummy events as needed
];

var markers=[];
var markerCluster; 
var zoomThreshold= 15;

function smoothZoom(map, targetZoom, currentZoom) {
    var step = (targetZoom - currentZoom) / 10; // Determines the speed of zooming

    function stepZoom() {
        currentZoom += step;
        if ((step > 0 && currentZoom >= targetZoom) || (step < 0 && currentZoom <= targetZoom)) {
            map.setZoom(targetZoom); // Set final zoom level
            clearInterval(timer); // Clear the interval
        } else {
            map.setZoom(currentZoom); // Increment zoom level
        }
    }

    var timer = setInterval(stepZoom, 80); // Set the interval for each zoom step
};

function createSvgMarker(color) {
    return `
        <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <defs>
                <filter id = "glow">
                    <feGaussianBlur stdDeviation="1.8" result="coloredBlur"/>
                        <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                </filter>
            </defs>
            <circle cx="20" cy="20" r="8" fill="${color}" fill-opacity="0.9" stroke="black" stroke-width="2.5" filter="url(#glow)"/>
        </svg>
    `;
}


var svgString = '<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="15" fill="#FF5733" fill-opacity="0.9" stroke="black" stroke-width="2" /></svg>';
var encodedSvg = encodeURIComponent(svgString);
var dataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodedSvg;
console.log(dataUrl);

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function initMap() {
    var mapOptions = {
        center: new google.maps.LatLng(40.7128, -74.0060), // Example coordinates
        zoom: 10
    };
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);

    var eventsContainer = document.getElementById('event-details-container');
    dummyEvents.forEach(function(event) {
        var eventDiv = document.createElement('div');
        eventDiv.classList.add('event-detail-box');
        eventDiv.innerHTML = '<h4>' + event.name + '</h4><p>' + event.details + '</p>';
        eventsContainer.appendChild(eventDiv);
    });

    // Create the search box and link it to the UI element.
    var input = document.getElementById('search-box');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);


    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });


    // Listen for the event fired when the user selects a prediction
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();


        if (places.length == 0) {
            return;
        }


        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }


            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });

    dummyEvents.forEach(function(event) {
        var icon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(createSvgMarker(getRandomColor())),
            scaledSize: new google.maps.Size(30, 30) // Size of the icon
        };

        var marker = new google.maps.Marker({
            position: event.location,
            title: event.name,
            map: map,
            icon: icon
        });

            // Add click listener to the marker
            marker.addListener('click', function() {
                smoothZoom(map, 15, map.getZoom());
                map.setCenter(marker.getPosition());
                // Optional: Add an info window for each marker
                var infowindow = new google.maps.InfoWindow({
                    content: event.details
                });

                infowindow.open(map, marker);
                
            });        
        
        markers.push(marker); //store the marker
     });

}
