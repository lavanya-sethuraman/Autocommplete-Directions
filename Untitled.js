var map;
function initMap() {
   map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 39.90973623453719,
      lng: -102.48046875
    },
    zoom: 4
  });

  var orig = document.getElementById('origin');
  var dest = document.getElementById('destination');
  var autocompleteOrig = new google.maps.places.Autocomplete(orig);
  var autocompleteDest = new google.maps.places.Autocomplete(dest);

  autocompleteOrig.bindTo('bounds', map);
  autocompleteDest.bindTo('bounds', map);

  var origAddr = '';
  var destAddr = '';

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });

  autocompleteOrig.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocompleteOrig.getPlace();
    if (!place.geometry) {

      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    if (place.address_components) {
      origAddr = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }
    console.log(origAddr);
    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = origAddr;
    infowindow.open(map, marker);
  });

  autocompleteDest.addListener('place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    var place = autocompleteDest.getPlace();
    if (!place.geometry) {

      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    if (place.address_components) {
      destAddr = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }
    console.log(destAddr);
    getTransitDetails(origAddr, destAddr);

  });
}

function getTransitDetails(origAddr, destAddr) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {
      lat: 39.90973623453719,
      lng: -102.48046875
    },
    zoom: 4
  });
  var request = {
    origin: origAddr,
    destination: destAddr,
    travelMode: 'TRANSIT',
    provideRouteAlternatives: true
  };
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();

  directionsDisplay.setMap(map);

  directionsService.route(request, callback);

  function callback(response, status) {
    var routes = null;
    if (status === 'OK') {
      directionsDisplay.setDirections(response);
      routes = response.routes;
      getDetails(routes);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  }
}










function getDetails(routes) {

  routes.forEach(function(route) {
    $('.js-directions-result').append('<div></div>');
    var opt=$('.js-directions-result div:last-child');
    var legs = route.legs;

    legs.forEach(function(leg) {

      var steps = leg.steps;

      opt.html( '<p>Route Details : </p><ul><li> Leave At : ' + leg.departure_time.text + '</li><li> Reach At : ' +
        leg.arrival_time.text + '</li><li> Transfers :' + steps.length + '</li></ul>');

      console.log(" Leave At : " + leg.departure_time.text);
      console.log(" Reach At : " + leg.arrival_time.text);
      console.log("Number of steps :" + steps.length);

     opt.append('<ol></ol>');
      var stepsList=opt.find('ol:last-child');
      steps.forEach(function(step) {

        var transit = step.transit;
        var stepOfSteps = step.steps;
       var newStep='Instructions : ' + step.instructions+
          '<ul><li>  Step Distance: ' + step.distance.text + '</li>' +
          '<li> Step Duration: ' + step.duration.text + '</li>';




//         console.log(stepNumber + " Step Instructions: " + step.instructions);

//         console.log(stepNumber + " Step Distance: " + step.distance.text);
//         console.log(stepNumber + " Step Duration: " + step.duration.text);
        if (stepOfSteps !== undefined) {
          stepOfSteps.forEach(function(someS) {
            console.log("Route -> Leg -> Step -> Steps-> StepOfSteps Instruction : " + someS.instructions);
          });
        }

        if (transit !== undefined) {
          newStep+='<li>Board at : ' + transit.departure_stop.name + '</li>';


          console.log("Board at : " + transit.departure_stop.name);
          console.log("Get off at : " + step.transit.arrival_stop.name);
          console.log("Boarding Time : " + transit.departure_time.text);
          console.log("You will reach at : " + transit.arrival_time.text);
          console.log("Headsign : " + transit.headsign);
          console.log("Line Name  : " + transit.line.name + " & Agency : " + transit.line.agencies.map(function(item) {
            return item.name;
          }));
          console.log(" Your Stop Number is  : " + transit.num_stops);

        }
        stepsList.append('<li>' + newStep + '<ul></li>');

      });

    });
  });
}
