import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;


const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 14, { animate: true, duration: 1.5 });
    }, [center, map]);
    return null;
};


const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Clinic Location</Popup>
        </Marker>
    );
};


const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                
                onSearch([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
            } else {
                alert('Location not found. Please try a different search term.');
            }
        } catch (err) {
            console.error("Search error:", err);
            alert('Error searching for location.');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full flex gap-2 mb-4 relative z-20">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a city, street, or landmark (e.g., Amman, Irbid)..." 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <button 
                type="submit" 
                disabled={isSearching}
                className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
            >
                {isSearching ? 'Searching...' : 'Search'}
            </button>
        </form>
    );
};


export default function MapPage() {
    const [position, setPosition] = useState([32.5514, 35.8515]);

    const handleSaveLocation = () => {
        const payload = {
            latitude: position[0],
            longitude: position[1]
        };

        const clinicId = localStorage.getItem('clinicId');

        if (!clinicId || clinicId === 'null') {
            alert('Error: No clinic ID found. Please log in again.');
            return; 
        }

        fetch(`http://localhost:8080/api/clinics/${clinicId}/location`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                alert('Coordinates saved successfully!');
            } else {
                alert('Error saving location. Please ensure you are logged in.');
            }
        })
        .catch(err => {
            console.error("Error:", err);
            alert('Unable to connect to the server. Please check your connection.');
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            
            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md flex flex-col items-center gap-4">
                
                <h1 className="text-2xl font-bold text-gray-800">Clinic Location Setup</h1>
                <p className="text-gray-500 text-sm mb-2">Search for your city or click on the map to pinpoint the exact location of your clinic</p>
                
                
                <SearchBar onSearch={setPosition} />

                <div className="w-full h-[500px] rounded-lg overflow-hidden border-2 border-gray-200 z-0 relative">
                    <MapContainer 
                        center={position} 
                        zoom={13} 
                        scrollWheelZoom={true} 
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={position} />
                        <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                </div>

                <button 
                    onClick={handleSaveLocation}
                    className="mt-4 w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
                >
                    Save Location
                </button>
            </div>

        </div>
    );
}