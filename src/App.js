import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import 'leaflet/dist/leaflet.css';
import './App.css'; // Optional: Add your CSS for styling

// Set default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const App = () => {
  const [position, setPosition] = useState([0, 0]); // Default position
  const [pinnedPosition, setPinnedPosition] = useState(null); // Pinned location
  const [address, setAddress] = useState('');
  const [coordinatesInput, setCoordinatesInput] = useState('');
  const [addressInput, setAddressInput] = useState('');

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setPosition([latitude, longitude]);
          setPinnedPosition([latitude, longitude]); // Set initial pinned position
          setCoordinatesInput(`${latitude}, ${longitude}`); // Display coordinates in the input box
          await getAddressFromCoordinates(latitude, longitude);
        },
        (err) => {
          alert('Unable to retrieve your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const getAddressFromCoordinates = async (lat, lon) => {
    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      setAddress(response.data.display_name || 'Address not found');
      setAddressInput(response.data.display_name || 'Address not found'); // Display address in the input box
    } catch (err) {
      alert('Failed to fetch address from coordinates.');
    }
  };

  const confirmLocation = () => {
    if (pinnedPosition) {
      alert('Location confirmed!');
    }
  };

  const handleCoordinatesChange = (e) => {
    setCoordinatesInput(e.target.value);
    const coords = e.target.value.split(',').map(Number);
    if (coords.length === 2) {
      setPosition(coords);
      setPinnedPosition(coords); // Pin location on coordinates input
      getAddressFromCoordinates(coords[0], coords[1]); // Fetch address from coordinates input
    }
  };

  const handleAddressChange = (e) => {
    setAddressInput(e.target.value);
  };

  const handleMapClick = (e) => {
    setPinnedPosition(e.latlng); // Set pinned position on map click
    setPosition([e.latlng.lat, e.latlng.lng]); // Update the position state
    setCoordinatesInput(`${e.latlng.lat}, ${e.latlng.lng}`); // Update coordinates input
    getAddressFromCoordinates(e.latlng.lat, e.latlng.lng); // Get address from new position
  };

  return (
    <div className="App">
      <h1>Location App</h1>

      {/* Input boxes for coordinates and address */}
      <div>
        <input 
          type="text" 
          placeholder="Coordinates (lat, lon)" 
          value={coordinatesInput} 
          onChange={handleCoordinatesChange} 
        />
        <input 
          type="text" 
          placeholder="Address" 
          value={addressInput} 
          onChange={handleAddressChange} 
        />
      </div>

      {/* Buttons for getting and confirming location */}
      <div>
        <button onClick={getCurrentLocation}>Get Location</button>
        <button onClick={confirmLocation}>Confirm Location</button>
        {/* Location Icon beside Confirm Location Button */}
        {pinnedPosition && (
          <a 
            href={`https://www.google.com/maps?q=${pinnedPosition[0]},${pinnedPosition[1]}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ marginLeft: '10px' }} // Add some margin to separate the icon from the button
          >
            <FontAwesomeIcon 
              icon={faMapMarkerAlt} 
              size="2x" 
              style={{ color: 'red' }} 
            />
          </a>
        )}
      </div>

      <div className="map-container">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: '400px', width: '100%' }} // Set the height of the map
          onClick={handleMapClick} // Handle map click to set pinned position
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {pinnedPosition && (
            <Marker position={pinnedPosition}>
              <Popup>Pinned Location</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default App;
