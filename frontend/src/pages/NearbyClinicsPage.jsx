import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";
import VerificationBadge from "../components/VerificationBadge";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, { animate: true, duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        onSearch(lat, lon);
      } else {
        alert("Location not found. Please try a different search term.");
      }
    } catch (err) {
      console.error("Search error:", err);
      alert("Error searching for location.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full flex gap-2 mb-4 relative z-20"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for any city or neighborhood (e.g., Amman, Irbid)..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
      />
      <button
        type="submit"
        disabled={isSearching}
        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isSearching ? "Searching..." : "Search"}
      </button>
    </form>
  );
};

export default function NearbyClinicsPage() {
  const [userLocation, setUserLocation] = useState([31.9522, 35.9331]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const radiusInKm = 10;

  useEffect(() => {
    if (!navigator.geolocation) {
      setError(
        "Your browser does not support geolocation. Please use the search bar.",
      );
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        handleLocationUpdate(lat, lng);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(
          "Location access denied. Please use the search bar to set your location manually.",
        );
        setLoading(false);
      },
    );
  }, []);

  const handleLocationUpdate = (lat, lng) => {
    setUserLocation([lat, lng]);
    fetchNearbyClinics(lat, lng);
  };

  const fetchNearbyClinics = async (lat, lng) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/clinics/nearby?lat=${lat}&lng=${lng}&radius=${radiusInKm}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch clinics");
      }

      const data = await response.json();
      setClinics(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to load nearby clinics from the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-5xl bg-white p-6 rounded-xl shadow-md flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">
          Find Nearby Veterinary Clinics
        </h1>
        <p className="text-gray-500 text-sm w-full text-center mb-2">
          We automatically detect your location, or you can search manually
          below.
        </p>

        <SearchBar onSearch={handleLocationUpdate} />

        {loading && (
          <p className="text-blue-600 font-semibold animate-pulse">
            Detecting your location and finding clinics...
          </p>
        )}
        {error && (
          <p className="text-red-500 font-semibold text-center">{error}</p>
        )}

        <div className="w-full h-[600px] rounded-lg overflow-hidden border-2 border-gray-200 z-0 relative">
          <MapContainer
            center={userLocation}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapUpdater center={userLocation} />

            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <strong className="text-red-600">Your Target Location</strong>
              </Popup>
            </Marker>

            {clinics.map((clinic) => (
              <Marker
                key={clinic.id}
                position={[clinic.latitude, clinic.longitude]}
              >
                <Popup>
                  <div className="flex flex-col gap-2 p-1 min-w-[150px]">
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-lg text-[#0A1B70]">
                          {clinic.clinicName || clinic.name}
                        </strong>
                        {clinic.verified && <VerificationBadge compact />}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {clinic.address
                          ? clinic.address
                          : "No address provided"}
                      </p>
                    </div>

                    <hr className="border-gray-300 my-1" />

                    <button
                      onClick={() => navigate(`/app/profile/${clinic.id}`)}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-bold shadow-sm"
                    >
                      Visit Profile
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
