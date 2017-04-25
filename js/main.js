var myerrorhandler = function(){
     alert("Error connecting to Google Maps");
}

var map;
//Code for Displaying Map
var initMap = function () {
    try {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 2,
            center: new google.maps.LatLng(24.8957746, 67.0770452),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        
        viewModel.init();
    }
    catch (error) {
        alert("Error connecting to Google Maps! Error: " + error);
    }
};


var viewModel = {

    self: this,
    locations: ko.observableArray(),

    // variable used for searching
    searchQuery: ko.observable(''),

    //method called by KO list item from index.html when the list item is clicked
    
    toggleMarker: function (location) {
        viewModel.disableMarkers();
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        location.infowindow.open(map, location.marker);
    },

    //disable marker
        disableMarkers: function () {
        for (var i = 0; i < this.locations().length; i++) {
            this.locations()[i].marker.setAnimation(null);
            this.locations()[i].infowindow.close();
        }
    },

    //Get Loacations
    fillLocations: function () {
        for (var i = 0; i < model.locations.length; i++) {
            this.locations.push(model.locations[i]);
        }
    },

    
    init: function () {
        model.init();
        this.fillLocations();
        ko.applyBindings(viewModel);
        viewModel.searchQuery.subscribe(this.filterItems);
    },

    
    filterItems: function () {
        var filter = viewModel.searchQuery().toLowerCase();

        for (var i = 0; i < model.locations.length; i++) {

            var searchedTitle = model.locations[i].title().toLowerCase();

            if (searchedTitle.indexOf(filter) > -1) {
                model.locations[i].isFiltered(true);
                model.locations[i].marker.setMap(map);
            }
            else {
                model.locations[i].isFiltered(false);
                model.locations[i].marker.setMap(null);
            }
        }
    }
};

//The wonders are listed in this variable
var model = {
    self: this,
    locations: [
        {
            title: ko.observable("Great Wall of China"),
            lat: 40.4321,
            lng: 116.5703,
            isFiltered: ko.observable(true),
            Url:"https://en.wikipedia.org/wiki/Great_Wall_of_China"
        },
        {
            title: ko.observable("Taj Mahal"),
            lat: 27.1752,
            lng: 78.0421,
            isFiltered: ko.observable(true),
            Url:"https://en.wikipedia.org/wiki/Taj_Mahal"
        },
        {
            title: ko.observable("Great Pyramid of Giza"),
            lat: 29.9795,
            lng: 31.1342,
            isFiltered: ko.observable(true),
            Url:"https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza"
        },
        {
            title: ko.observable("Colosseum"),
            lat: 41.8904,
            lng: 12.4922,
            isFiltered: ko.observable(true),
            Url:"https://en.wikipedia.org/wiki/Colosseum"
        },
        {
            title: ko.observable("Machu Picchu"),
            lat: -13.1628,
            lng: -72.5449,
            isFiltered: ko.observable(true),
            Url:"https://en.wikipedia.org/wiki/Machu_Picchu"
        },
        {
            title: ko.observable("Statue of Zeus"),
            lat: 38.1002,
            lng: 21.5833,
            isFiltered: ko.observable(true),
            Url:"https://en.wikipedia.org/wiki/Statue_of_Zeus_at_Olympia"
        },
        {
            title: ko.observable("Hanging Gardens of Babylon"),
            lat: 32.5424,
            lng: 44.4210,
            isFiltered: ko.observable(true),
            Url:"https://en.wikipedia.org/wiki/Hanging_Gardens_of_Babylon"
        }

    ],
   //adds wikipedia content to the model 
    setContent: function () {
        for (var i = 0; i < this.locations.length; i++) {
            var wikiURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + this.locations[i].title();
            var wikiRequestTimeout = setTimeout(function () {
                article = "Wiki resources not available";
                alert("Wiki resources not available");

            }, 8000);
            var article = getWikiExtract(i, wikiRequestTimeout, wikiURL);

            function getWikiExtract(i, wikiRequestTimeout, wikiURL) {
                var result = '';
                $.ajax({
                    url: wikiURL,
                    dataType: "jsonp"
                }).done(function (data) {
                    if (data && data.query && data.query.pages) {
                        var pages = data.query.pages;
                    }
                    
                    else {
                        result = "No wiki page found!";
                        model.locations[i].infowindow = new google.maps.InfoWindow({
                            content: model.locations[i].title() + "<br><br>" + "Wikipedia info:" + "<br>" + result
                        })
                    }
                    for (var id in pages) {
                        result = pages[id].extract;
                        model.locations[i].infowindow = new google.maps.InfoWindow({
                            content: '<div class="infoWindow"' + '<strong><b>' + model.locations[i].title() + '</b></strong>' + '<br><br>' + "Wikipedia info:" + '<br>' + result + '</div>',
                            maxWidth: '300'
                        })
                    }
                    clearTimeout(wikiRequestTimeout);
                }).fail(function () {
                    alert("Wikipedia unreachable!");
                    model.locations[i].infowindow = new google.maps.InfoWindow({
                        content: model.locations[i].title() + "<br><br>" + "Wikipedia info:" + "<br>" + "Unavailable"
                    })
                })
            }
        }
    },

    //creates a marker for each location.
    addMarkers: function () {
        for (var i = 0; i < this.locations.length; i++) {
            this.locations[i].marker = this.createMarker(this.locations[i], i);
        }
    },

    //Add animation to marker
    toggleBounce: function (location) {
        viewModel.disableMarkers();
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
    },

    //create marker
    createMarker: function (location) {
        var marker = new google.maps.Marker({
            title: location.title(),
            map: map,
            animation: google.maps.Animation.DROP,
            position: new google.maps.LatLng(location.lat, location.lng)
        });
        marker.addListener('click', function () {
            model.toggleBounce(location);
            location.infowindow.open(map, marker);
        });
        return marker;
    },

        init: function () {
        this.addMarkers();
        this.setContent();
    }
};
