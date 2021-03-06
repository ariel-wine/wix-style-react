import GoogleMapsClient from './GoogleMapsClient';

describe('GoogleMapsClient', () => {

  afterEach(() => delete window.google);

  it('should handle null when autocompleting and getting ZERO_RESULTS', () => {
    window.google = new GoogleMapsMock({
      getPlacePredictions: (request, callback) => {
        callback(null, window.google.maps.GeocoderStatus.ZERO_RESULTS);
      }
    });
    const client = new GoogleMapsClient();
    return client.autocomplete({request: {}}).then(result => {
      expect(result).toEqual([]);
    });
  });

  it('should handle null when geocoding and getting ZERO_RESULTS', () => {
    window.google = new GoogleMapsMock(null, {
      geocode: (request, callback) => {
        callback(null, window.google.maps.GeocoderStatus.ZERO_RESULTS);
      }
    });
    const client = new GoogleMapsClient();
    return client.geocode({request: {}}).then(result => {
      expect(result).toEqual([]);
    });
  });

});

function GoogleMapsMock(autocompleteInstance, geocoderInstance) {
  return {
    maps: {
      places: {
        AutocompleteService: () => autocompleteInstance
      },
      Geocoder: () => geocoderInstance,
      GeocoderStatus: {
        OK: 'OK',
        ZERO_RESULTS: 'ZERO_RESULTS'
      }
    }
  };
}
