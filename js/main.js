
var newMap;
//Function for handling errors.
var mapError = function(){
    alert("Google Maps Error");
};
//initial display of the map
var initializeMap = function () {
    try {
        newMap = new google.maps.Map(document.getElementById('myMap'), {
            zoom: 2,
            center: new google.maps.LatLng(24.8957746, 67.0770452),         //defines the center for display
        });
        vm.initialize();
    }
    catch (error) {
        alert("Google maps error");
    }
};
var vm = {
    //function for filtering the searched items
    filterItem: function () {
        var filtered = vm.searchQuery().toLowerCase();

        for (var i = 0; i < viewModel.wonders.length; i++) {

            var searched = viewModel.wonders[i].title().toLowerCase();

            if (searched.indexOf(filtered) > -1) {
                viewModel.wonders[i].isFiltered(true);
                viewModel.wonders[i].marker.setMap(newMap);
            }
            else {
                viewModel.wonders[i].isFiltered(false);
                viewModel.wonders[i].marker.setMap(null);
            }
        }
    },
    //function for making the marker bounce
    markerToggle: function(loc){
        vm.disableAllMarkers();
        loc.marker.setAnimation(google.maps.Animation.BOUNCE);
        loc.infowindow.open(newMap, loc.marker);
    },
    //function for disabling the markers
    disableAllMarkers: function () {
        for (var i = 0; i < this.wonders().length; i++) {
            this.wonders()[i].marker.setAnimation(null);
            this.wonders()[i].infowindow.close();
        }
    },
    //function for adding the wonders of the world to the array
    fillWonders: function () {
        for (var i = 0; i < viewModel.wonders.length; i++) {
            this.wonders.push(viewModel.wonders[i]);
        }
    },
    searchQuery: ko.observable(''),
    self: this,
    initialize: function () {
        viewModel.initialize();
        this.fillWonders();
        ko.applyBindings(vm);
        vm.searchQuery.subscribe(this.filterItem);
    },
    wonders: ko.observableArray()
};
var viewModel = 
{
    //the list of the 7 wonders of the world with their positions on the map represented in coordinates
    wonders: [
        {
            isFiltered: ko.observable(true),
            latitude: 40.4321,
            longitude: 116.5703,
            title: ko.observable("Great Wall of China"),
            Url:"https://en.wikipedia.org/wiki/Great_Wall_of_China"     //url for redirecting information from wikipedia
        },
        {
            isFiltered: ko.observable(true),
            latitude: 27.1752,
            longitude: 78.0421,
            title: ko.observable("Taj Mahal"),
            Url:"https://en.wikipedia.org/wiki/Taj_Mahal"
        },
        {
            isFiltered: ko.observable(true),
            latitude: 29.9795,
            longitude: 31.1342,
            title: ko.observable("Great Pyramid of Giza"),
            Url:"https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza"
        },
        {
            isFiltered: ko.observable(true),
            latitude: 41.8904,
            longitude: 12.4922,
            title: ko.observable("Colosseum"),
            Url:"https://en.wikipedia.org/wiki/Colosseum"
        },
        {
            isFiltered: ko.observable(true),
            latitude: -13.1628,
            longitude: -72.5449,
            title: ko.observable("Machu Picchu"),
            Url:"https://en.wikipedia.org/wiki/Machu_Picchu"
        },
        {
            isFiltered: ko.observable(true),
            latitude: 38.1002,
            longitude: 21.5833,
            title: ko.observable("Statue of Zeus"),
            Url:"https://en.wikipedia.org/wiki/Statue_of_Zeus_at_Olympia"
        },
        {
            isFiltered: ko.observable(true),
            latitude: 32.5424,
            longitude: 44.4210,
            title: ko.observable("Hanging Gardens of Babylon"),
            Url:"https://en.wikipedia.org/wiki/Hanging_Gardens_of_Babylon"
        }

    ],
    self: this,
    //function to create marker at the defined point
    createMarker: function (loc) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(loc.latitude, loc.longitude),
            map: newMap,
            title: loc.title()
        });
        //event on click added to make the marker bounce after the click only
        marker.addListener('click', function () {
            viewModel.markerBounce(location);
            loc.infowindow.open(newMap, marker);
        });
        return marker;
    },
     initialize: function () {
        this.addMarkers();
        this.setInfo();
    },
    addMarkers: function () {
        for (var i = 0; i < this.wonders.length; i++) {
            this.wonders[i].marker = this.createMarker(this.wonders[i], i);
        }
    },
     markerBounce: function (loc) {
        vm.disableAllMarkers();
        loc.marker.setAnimation(google.maps.Animation.BOUNCE);
    },
    //function to take information from wikipedia using wikipedia API
    setInfo: function () 
    {
        for (var i = 0; i < this.wonders.length; i++) 
        {
            var wikipediaURL = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + this.wonders[i].title();
            var wikipediaRequestTimeout = setTimeout(function () {
                alert("Wiki resources not available");
            }, 6000);
            var article = getWikiExtract(i, wikipediaRequestTimeout, wikipediaURL);
            function getWikiExtract(i, wikipediaRequestTimeout, wikipediaURL) 
            {
                var content = '';
                $.ajax(
                {
                    url: wikipediaURL,
                    dataType: "jsonp"
                }   ).done(function (data) 
                {
                    if (data && data.query && data.query.pages) 
                    {
                        var pages = data.query.pages;
                    }
                    
                    else 
                    {
                        content = "No content available";
                        viewModel.wonders[i].infowindow = new google.maps.InfoWindow(
                        {
                            content: viewModel.wonders[i].title() + "<br>" + "Wikipedia content : " + "<br>" + content
                        })
                    }
                    for (var page in pages) 
                    {
                        content = pages[page].extract;
                        viewModel.wonders[i].infowindow = new google.maps.InfoWindow(
                        {
                            content: '<div class="infoWindow"' + '<b>' + model.wonders[i].title() + '</b>' + '<br>' + "Wikipedia content : " + '<br>' + content + '</div>'
                        })
                    }
                    clearTimeout(wikipediaRequestTimeout);
                }   ).fail(function () 
                {
                    alert("Wikipedia unreachable!");
                    viewModel.wonders[i].infowindow = new google.maps.InfoWindow(
                    {
                        content: viewModel.wonders[i].title() + "<br>" + "Wikipedia content Unavailable"
                    })
                })
            }
        }
    }
    
        
};
