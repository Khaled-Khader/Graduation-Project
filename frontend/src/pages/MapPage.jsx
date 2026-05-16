import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../Auth/AuthHook';
import { fetchMyVerificationStatus, http } from '../util/http';
import { useQuery } from '@tanstack/react-query';

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


const LocationMarker = ({ position, setPosition, disabled }) => {
    useMapEvents({
        click(e) {
            if (disabled) return;
            setPosition([e.latlng.lat, e.latlng.lng]);
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Clinic Location</Popup>
        </Marker>
    );
};


const SearchBar = ({ onSearch, disabled }) => {
    const [query, setQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (disabled) return;
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
                disabled={disabled}
                placeholder="Search for a city, street, or landmark (e.g., Amman, Irbid)..." 
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black disabled:cursor-not-allowed disabled:bg-gray-100"
            />
            <button 
                type="submit" 
                disabled={isSearching || disabled}
                className="px-6 py-2 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition disabled:opacity-50"
            >
                {isSearching ? 'Searching...' : 'Search'}
            </button>
        </form>
    );
};


export default function MapPage() {
    const [position, setPosition] = useState([32.5514, 35.8515]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [saveError, setSaveError] = useState("");
    const { user } = useAuth();
    const isClinic = user?.role === "CLINIC";

    const { data: verificationStatus, isLoading: verificationLoading } = useQuery({
        queryKey: ["verification-status", user?.id],
        queryFn: fetchMyVerificationStatus,
        enabled: isClinic,
        retry: false,
    });

    const isVerifiedClinic = isClinic && verificationStatus?.verified === true;
    const locationLocked = isClinic && (!isVerifiedClinic || verificationLoading);

    const handleSaveLocation = async () => {
        setSaveMessage("");
        setSaveError("");

        if (user?.role !== "CLINIC") {
            setSaveError("Only clinic accounts can save clinic locations.");
            return;
        }

        if (!isVerifiedClinic) {
            setSaveError("Admin verification is required before saving a clinic location.");
            return;
        }

        const payload = {
            latitude: position[0],
            longitude: position[1]
        };

        const clinicId = user?.id;

        if (!clinicId) {
            setSaveError("No clinic account was found. Please sign in again.");
            return;
        }

        setIsSaving(true);

        try {
            await http(`/api/clinics/${clinicId}/location`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });

            setSaveMessage("Clinic location saved successfully.");
        } catch (err) {
            console.error("Error:", err);
            setSaveError(err.message || "Unable to save location. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            
            <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-md flex flex-col items-center gap-4">
                
                <h1 className="text-2xl font-bold text-gray-800">Clinic Location Setup</h1>
                <p className="text-gray-500 text-sm mb-2">Search for your city or click on the map to pinpoint the exact location of your clinic</p>
                
                
                {locationLocked && (
                    <p className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                        Admin verification is required before setting a public clinic location.
                    </p>
                )}

                <SearchBar onSearch={setPosition} disabled={locationLocked} />

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
                        <LocationMarker position={position} setPosition={setPosition} disabled={locationLocked} />
                    </MapContainer>
                </div>

                <button 
                    onClick={handleSaveLocation}
                    disabled={isSaving || locationLocked}
                    className="mt-4 w-full sm:w-auto px-10 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSaving ? "Saving..." : "Save Location"}
                </button>

                {saveMessage && (
                    <p className="text-sm font-semibold text-green-700">{saveMessage}</p>
                )}

                {saveError && (
                    <p className="text-sm font-semibold text-red-600">{saveError}</p>
                )}
            </div>

        </div>
    );
}
