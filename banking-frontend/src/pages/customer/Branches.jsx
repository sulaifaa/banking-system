import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import API from "../../services/api";

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker colors
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to center map on user location
const SetViewOnLocation = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, map, zoom]);
  return null;
};

const Branches = () => {
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [selectedCity, setSelectedCity] = useState("all");
  const [cities, setCities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [findingLocation, setFindingLocation] = useState(false);
  const [nearestBranchId, setNearestBranchId] = useState(null);
  const [mapCenter, setMapCenter] = useState([30.3753, 69.3451]); // Center of Pakistan
  const [mapZoom, setMapZoom] = useState(5); // Zoom out to see all
  const [message, setMessage] = useState(""); // ← THIS WAS MISSING
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await API.get("/branches");

      // Try to get branches array from different possible locations
      let branchesData = response.data;
      if (response.data.data && Array.isArray(response.data.data)) {
        branchesData = response.data.data;
      } else if (
        response.data.branches &&
        Array.isArray(response.data.branches)
      ) {
        branchesData = response.data.branches;
      } else if (!Array.isArray(response.data)) {
        branchesData = response.data.branches || [];
      }

      console.log("Branches data:", branchesData);
      setBranches(branchesData);
      setFilteredBranches(branchesData);

      // Extract unique cities
      const uniqueCities = [...new Set(branchesData.map((b) => b.city))].filter(
        Boolean,
      );
      setCities(uniqueCities);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching branches:", err);
      setLoading(false);
    }
  };
  // Fit map to show all branches
  const fitAllBranches = () => {
    const branchesWithCoords = filteredBranches.filter(
      (b) => b.location?.coordinates,
    );
    if (branchesWithCoords.length === 0) return;

    const lats = branchesWithCoords.map((b) => b.location.coordinates[1]);
    const lngs = branchesWithCoords.map((b) => b.location.coordinates[0]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;

    setMapCenter([centerLat, centerLng]);

    // Auto zoom based on spread
    const latDiff = maxLat - minLat;
    const lngDiff = maxLng - minLng;
    const maxDiff = Math.max(latDiff, lngDiff);

    let zoom = 5;
    if (maxDiff < 3) zoom = 6;
    if (maxDiff < 2) zoom = 7;
    if (maxDiff < 1) zoom = 8;
    if (maxDiff < 0.5) zoom = 9;
    if (maxDiff < 0.3) zoom = 10;

    setMapZoom(zoom);
  };

  // Filter branches by city
  useEffect(() => {
    if (selectedCity === "all") {
      setFilteredBranches(branches);
    } else {
      setFilteredBranches(branches.filter((b) => b.city === selectedCity));
    }
  }, [selectedCity, branches]);
  // Auto-fit map when filtered branches change
  useEffect(() => {
    if (filteredBranches.length > 0) {
      fitAllBranches();
    }
  }, [filteredBranches]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Find user's location
  const findMyLocation = () => {
    setFindingLocation(true);
    setLocationError("");
    setMessage("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setFindingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(12);

        // Find nearest branch
        let minDistance = Infinity;
        let nearest = null;

        branches.forEach((branch) => {
          if (branch.location && branch.location.coordinates) {
            const [branchLng, branchLat] = branch.location.coordinates;
            const distance = calculateDistance(
              latitude,
              longitude,
              branchLat,
              branchLng,
            );
            if (distance < minDistance) {
              minDistance = distance;
              nearest = branch;
            }
          }
        });

        if (nearest) {
          setNearestBranchId(nearest._id);
          setMessage(
            `Nearest branch: ${nearest.name} (${minDistance.toFixed(1)} km away)`,
          );

          // Auto-zoom to nearest branch
          if (nearest.location?.coordinates) {
            const [lng, lat] = nearest.location.coordinates;
            setMapCenter([lat, lng]);
            setMapZoom(14);
          }
        }

        setFindingLocation(false);
      },
      (error) => {
        let errorMsg = "Unable to get your location. ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += "Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMsg += "Location request timed out.";
            break;
          default:
            errorMsg += "Please try again.";
        }
        setLocationError(errorMsg);
        setFindingLocation(false);
      },
    );
  };

  const formatDistance = (lat1, lon1, lat2, lon2) => {
    const distance = calculateDistance(lat1, lon1, lat2, lon2);
    if (distance < 1) {
      return `${(distance * 1000).toFixed(0)} meters`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const getMarkerIcon = (branchId) => {
    return branchId === nearestBranchId ? greenIcon : redIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link
              to="/dashboard"
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ← Back
            </Link>
            <div className="text-xl font-light tracking-wide text-gray-900">
              COMET
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-light text-gray-900">Branches</h1>
          <p className="text-gray-400 text-sm mt-1">
            Find COMET branches near you
          </p>
        </div>

        {/* Location Error */}
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm text-center">{locationError}</p>
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-4 p-3 bg-emerald/10 border border-emerald/20 rounded-xl">
            <p className="text-emerald text-sm text-center">{message}</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-emerald text-sm"
          >
            <option value="all">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button
            onClick={findMyLocation}
            disabled={findingLocation}
            className="px-5 py-2 bg-emerald text-white rounded-xl text-sm font-medium hover:bg-emerald-dark transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {findingLocation ? "Finding location..." : "Find nearest branch"}
          </button>
        </div>

        {/* Map and List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Branch List - Left Sidebar */}
          <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-2">
            <h3 className="text-gray-800 font-medium mb-3">All Branches</h3>
            {filteredBranches.length > 0 ? (
              filteredBranches.map((branch) => {
                let distance = null;
                if (userLocation && branch.location?.coordinates) {
                  const [branchLng, branchLat] = branch.location.coordinates;
                  distance = calculateDistance(
                    userLocation.lat,
                    userLocation.lng,
                    branchLat,
                    branchLng,
                  );
                }
                console.log(
                  "Branch ID:",
                  branch._id,
                  "Selected ID:",
                  selectedBranchId,
                );

                return (
                  <div
                    key={branch._id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                      branch._id === selectedBranchId
                        ? "border-emerald bg-emerald/10"
                        : "border-gray-100 bg-white"
                    }`}
                    onClick={() => {
                      console.log("Clicked branch ID:", branch._id);
                      setSelectedBranchId(branch._id);
                      if (branch.location?.coordinates) {
                        const [lng, lat] = branch.location.coordinates;
                        setMapCenter([lat, lng]);
                        setMapZoom(15);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-gray-800 font-medium">
                          {branch.name}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          {branch.address}
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          {branch.city}
                        </p>
                        {branch.contact && (
                          <p className="text-gray-400 text-xs mt-1">
                            📞 {branch.contact}
                          </p>
                        )}
                        {distance !== null && (
                          <p className="text-emerald text-xs mt-2 font-medium">
                            {distance < 1
                              ? `${(distance * 1000).toFixed(0)} meters away`
                              : `${distance.toFixed(1)} km away`}
                          </p>
                        )}
                      </div>
                      {branch._id === nearestBranchId && (
                        <div className="w-2 h-2 bg-emerald rounded-full"></div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-center py-8">
                No branches found in this city
              </p>
            )}
          </div>

          {/* Map - Right Side */}
          <div className="lg:col-span-2">
            <div className="bg-gray-100 rounded-xl overflow-hidden h-[500px]">
              <MapContainer
                center={mapCenter}
                zoom={mapZoom}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <SetViewOnLocation center={mapCenter} zoom={mapZoom} />

                {/* User location marker */}
                {userLocation && (
                  <Marker
                    position={[userLocation.lat, userLocation.lng]}
                    icon={
                      new L.Icon({
                        iconUrl:
                          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                        shadowUrl:
                          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41],
                      })
                    }
                  >
                    <Popup>Your location</Popup>
                  </Marker>
                )}

                {/* Branch markers */}
                {filteredBranches.map((branch) => {
                  if (branch.location?.coordinates) {
                    const [lng, lat] = branch.location.coordinates;
                    return (
                      <Marker
                        key={branch._id}
                        position={[lat, lng]}
                        icon={getMarkerIcon(branch._id)}
                      >
                        <Popup>
                          <div className="text-center min-w-[200px]">
                            <p className="font-semibold text-gray-800">
                              {branch.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {branch.address}
                            </p>
                            <p className="text-xs text-gray-500">
                              {branch.city}
                            </p>
                            {branch.contact && (
                              <p className="text-xs text-gray-500 mt-1">
                                📞 {branch.contact}
                              </p>
                            )}
                            {userLocation && (
                              <p className="text-emerald text-xs mt-2 font-medium">
                                {formatDistance(
                                  userLocation.lat,
                                  userLocation.lng,
                                  lat,
                                  lng,
                                )}{" "}
                                away
                              </p>
                            )}
                            <button
                              onClick={() => {
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                                  "_blank",
                                );
                              }}
                              className="mt-3 px-3 py-1 bg-emerald text-white text-xs rounded-lg hover:bg-emerald-dark transition-all"
                            >
                              Get directions
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  }

                  return null;
                })}
              </MapContainer>
            </div>
            <p className="text-gray-400 text-xs text-center mt-2">
              Click on a branch marker for details • Green marker shows your
              nearest branch
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Branches;
