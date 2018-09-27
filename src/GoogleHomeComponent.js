import { GoogleApiWrapper } from 'google-maps-react'; 

import React from 'react';

const API_KEY = 'AIzaSyAjo2E9Np9S3d6zg60Tz9MaFKoOPCUC1gQ';

export class MapContainer extends React.Component {
  render() {
    return (
      <div className="App">          
        <p>Hello World</p>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: (API_KEY)
})(MapContainer)