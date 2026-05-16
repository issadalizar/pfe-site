// /src/components/BI/ClientMapCluster.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaMapMarkedAlt, FaUsers, FaUserCheck, FaUserTimes, FaSearch, FaCrosshairs, FaList } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Composant pour centrer la carte
function MapCenter({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
}

// Icônes personnalisées pour les marqueurs
const createCustomIcon = (isActive) => {
    return L.divIcon({
        html: `<div style="
            background-color: ${isActive ? '#22c55e' : '#ef4444'};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: white;
            font-weight: bold;
        ">${isActive ? '✓' : '✗'}</div>`,
        className: 'custom-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
    });
};

// Composant de marqueurs
function SimpleMarkers({ markers, onMarkerClick }) {
    return (
        <>
            {markers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={[marker.lat, marker.lng]}
                    icon={createCustomIcon(marker.status === 'actif')}
                    eventHandlers={{
                        click: () => onMarkerClick(marker)
                    }}
                >
                    <Popup>
                        <div style={{ minWidth: '220px' }}>
                            <strong style={{ fontSize: '14px' }}>{marker.client_name}</strong><br/>
                            <span style={{ color: marker.status === 'actif' ? '#16a34a' : '#dc2626', fontSize: '12px' }}>
                                {marker.status === 'actif' ? '● Actif' : '● Inactif'}
                            </span>
                            {marker.email && (
                                <>
                                    <hr style={{ margin: '8px 0' }} />
                                    <div style={{ fontSize: '12px' }}>
                                        <strong>Email:</strong> {marker.email}
                                    </div>
                                </>
                            )}
                            {marker.telephone && (
                                <div style={{ fontSize: '12px' }}>
                                    <strong>Tél:</strong> {marker.telephone}
                                </div>
                            )}
                            {marker.adresse && (
                                <div style={{ fontSize: '12px' }}>
                                    <strong>Adresse:</strong> {marker.adresse}
                                </div>
                            )}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

export default function ClientMapCluster({ users = [], centerLat = 36.8065, centerLng = 10.1815, zoom = 7.5 }) {
    const [markers, setMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [mapCenter, setMapCenter] = useState([centerLat, centerLng]);
    const [mapZoom, setMapZoom] = useState(zoom);
    const [stats, setStats] = useState({ actifs: 0, inactifs: 0, total: 0, avecCoordonnees: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Coordonnées des villes tunisiennes
    const cityCoordinates = {
        'Tunis': [36.8065, 10.1815],
        'Ariana': [36.8601, 10.1934],
        'Ben Arous': [36.7531, 10.2189],
        'Manouba': [36.8078, 10.0945],
        'Nabeul': [36.4561, 10.7376],
        'Hammamet': [36.4, 10.6167],
        'Zaghouan': [36.4029, 10.1423],
        'Bizerte': [37.2744, 9.8739],
        'Béja': [36.7256, 9.1817],
        'Jendouba': [36.5012, 8.7802],
        'Le Kef': [36.1741, 8.7049],
        'Siliana': [36.0849, 9.3708],
        'Sousse': [35.8256, 10.641],
        'Monastir': [35.7779, 10.8262],
        'Mahdia': [35.5047, 11.0622],
        'Sfax': [34.7406, 10.7603],
        'Kairouan': [35.6781, 10.0963],
        'Kasserine': [35.1676, 8.8365],
        'Sidi Bouzid': [35.0382, 9.4858],
        'Gabès': [33.8815, 10.0982],
        'Médenine': [33.3549, 10.5055],
        'Djerba': [33.8075, 10.8455],
        'Tataouine': [32.9297, 10.4518],
        'Gafsa': [34.425, 8.784],
        'Tozeur': [33.9197, 8.1335],
        'Kébili': [33.7043, 8.969],
    };

    // Géocodage simple
    const geocodeAddress = (address) => {
        if (!address) return null;
        
        for (const [city, coords] of Object.entries(cityCoordinates)) {
            if (address.toLowerCase().includes(city.toLowerCase())) {
                // Ajout d'un léger offset pour éviter les superpositions
                return [
                    coords[0] + (Math.random() - 0.5) * 0.03,
                    coords[1] + (Math.random() - 0.5) * 0.03
                ];
            }
        }
        return null;
    };

    // Traiter les utilisateurs pour créer les marqueurs
    useEffect(() => {
        const processMarkers = () => {
            const newMarkers = [];
            let actifCount = 0;
            let inactifCount = 0;
            let coordCount = 0;
            
            // Appliquer les filtres
            let filteredUsers = [...users];
            
            if (filter === 'actif') {
                filteredUsers = filteredUsers.filter(user => user.actif === true);
            } else if (filter === 'inactif') {
                filteredUsers = filteredUsers.filter(user => user.actif === false);
            }
            
            if (searchTerm) {
                filteredUsers = filteredUsers.filter(user => 
                    (user.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     user.client_code?.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }
            
            for (const user of filteredUsers) {
                const coords = geocodeAddress(user.adresse);
                if (coords) {
                    coordCount++;
                    if (user.actif) actifCount++;
                    else inactifCount++;
                    
                    newMarkers.push({
                        id: user._id || Math.random(),
                        lat: coords[0],
                        lng: coords[1],
                        client_name: user.client_name || 'Sans nom',
                        client_code: user.client_code,
                        email: user.email,
                        telephone: user.telephone,
                        adresse: user.adresse,
                        status: user.actif ? 'actif' : 'inactif',
                    });
                }
            }
            
            setMarkers(newMarkers);
            setStats({
                actifs: actifCount,
                inactifs: inactifCount,
                total: users.length,
                avecCoordonnees: coordCount
            });
        };
        
        processMarkers();
    }, [users, filter, searchTerm]);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
        setMapCenter([marker.lat, marker.lng]);
        setMapZoom(13);
    };

    const handleResetView = () => {
        setMapCenter([centerLat, centerLng]);
        setMapZoom(zoom);
        setSelectedMarker(null);
    };

    const handleFitBounds = () => {
        if (markers.length > 0) {
            let minLat = markers[0].lat, maxLat = markers[0].lat;
            let minLng = markers[0].lng, maxLng = markers[0].lng;
            
            markers.forEach(m => {
                minLat = Math.min(minLat, m.lat);
                maxLat = Math.max(maxLat, m.lat);
                minLng = Math.min(minLng, m.lng);
                maxLng = Math.max(maxLng, m.lng);
            });
            
            const center = [(minLat + maxLat) / 2, (minLng + maxLng) / 2];
            setMapCenter(center);
            setMapZoom(8);
        }
    };

    return (
        <div className="card shadow-sm border-0" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            {/* Header avec titre */}
            <div className="card-header bg-white border-0 pt-4 pb-0 px-4">
                <div className="d-flex align-items-center gap-2">
                    <FaMapMarkedAlt size={22} style={{ color: '#4361ee' }} />
                    <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Visualisation Cartographique</h5>
                    <span className="text-muted ms-2 small">Localisation des clients sur le territoire tunisien</span>
                </div>
            </div>
            
            <div className="card-body p-0">
                <div className="row g-0">
                    {/* Sidebar gauche */}
                    {isSidebarOpen && (
                        <div className="col-md-4 col-lg-3 border-end" style={{ backgroundColor: '#f8fafc' }}>
                            <div className="p-3">
                                {/* Boutons Réinitialiser et Ajuster */}
                                <div className="d-flex gap-2 mb-4">
                                    <button
                                        className="btn btn-sm btn-outline-secondary flex-grow-1"
                                        onClick={handleResetView}
                                    >
                                        <FaCrosshairs className="me-1" size={12} />
                                        Réinitialiser
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-primary flex-grow-1"
                                        onClick={handleFitBounds}
                                    >
                                        <FaSearch className="me-1" size={12} />
                                        Ajuster
                                    </button>
                                </div>
                                
                                {/* Filtres de statut */}
                                <div className="mb-4">
                                    <div className="d-flex gap-2">
                                        <button
                                            className={`btn btn-sm flex-grow-1 ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setFilter('all')}
                                        >
                                            Tous ({stats.total})
                                        </button>
                                        <button
                                            className={`btn btn-sm flex-grow-1 ${filter === 'actif' ? 'btn-success' : 'btn-outline-success'}`}
                                            onClick={() => setFilter('actif')}
                                        >
                                            Actifs ({stats.actifs})
                                        </button>
                                        <button
                                            className={`btn btn-sm flex-grow-1 ${filter === 'inactif' ? 'btn-danger' : 'btn-outline-danger'}`}
                                            onClick={() => setFilter('inactif')}
                                        >
                                            Inactifs ({stats.inactifs})
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Recherche */}
                                <div className="mb-4">
                                    <div className="input-group input-group-sm">
                                        <span className="input-group-text bg-white border-end-0">
                                            <FaSearch size={12} className="text-muted" />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control form-control-sm border-start-0"
                                            placeholder="Rechercher un client..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                
                                {/* Légende */}
                                <div className="mb-4">
                                    <div className="d-flex align-items-center gap-3 mb-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }}></div>
                                            <span className="small">Client Actif</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                                            <span className="small">Client Inactif</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Statistiques */}
                                <div className="bg-white rounded-3 p-3 border">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small text-muted">Total clients</span>
                                        <span className="fw-bold">{stats.total}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="small text-muted">Avec coordonnées</span>
                                        <span className="fw-bold text-success">{stats.avecCoordonnees}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small text-muted">Sans coordonnées</span>
                                        <span className="fw-bold text-danger">{stats.total - stats.avecCoordonnees}</span>
                                    </div>
                                </div>
                                
                                {/* Message localisation */}
                                <div className="mt-3 text-center">
                                    <small className="text-muted">
                                        📍 {stats.avecCoordonnees} clients localisés sur {stats.total}
                                    </small>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Carte */}
                    <div className={isSidebarOpen ? "col-md-8 col-lg-9" : "col-12"}>
                        <div style={{ height: '550px', position: 'relative' }}>
                            {/* Bouton toggle sidebar */}
                            <button
                                className="btn btn-sm btn-light position-absolute shadow-sm"
                                style={{ top: '10px', left: '10px', zIndex: 1000, borderRadius: '8px' }}
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            >
                                <FaList size={14} />
                            </button>
                            
                            <MapContainer
                                center={mapCenter}
                                zoom={mapZoom}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                                zoomControl={true}
                            >
                                <MapCenter center={mapCenter} zoom={mapZoom} />
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB'
                                />
                                
                                <SimpleMarkers 
                                    markers={markers} 
                                    onMarkerClick={handleMarkerClick}
                                />
                            </MapContainer>
                        </div>
                    </div>
                </div>
                
                {/* Détail du client sélectionné */}
                {selectedMarker && (
                    <div className="p-3 border-top" style={{ backgroundColor: '#f8fafc' }}>
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h6 className="fw-bold mb-2">
                                    {selectedMarker.client_name}
                                    <span className={`badge ms-2 ${selectedMarker.status === 'actif' ? 'bg-success' : 'bg-danger'}`}>
                                        {selectedMarker.status === 'actif' ? 'ACTIF' : 'INACTIF'}
                                    </span>
                                </h6>
                                {selectedMarker.client_code && (
                                    <p className="mb-1 small">
                                        <strong>Code:</strong> {selectedMarker.client_code}
                                    </p>
                                )}
                                {selectedMarker.email && (
                                    <p className="mb-1 small">
                                        <strong>Email:</strong> {selectedMarker.email}
                                    </p>
                                )}
                                {selectedMarker.telephone && (
                                    <p className="mb-1 small">
                                        <strong>Tél:</strong> {selectedMarker.telephone}
                                    </p>
                                )}
                                {selectedMarker.adresse && (
                                    <p className="mb-0 small">
                                        <strong>Adresse:</strong> {selectedMarker.adresse}
                                    </p>
                                )}
                            </div>
                            <button
                                className="btn btn-sm btn-outline-secondary rounded-circle"
                                onClick={() => setSelectedMarker(null)}
                                style={{ width: '32px', height: '32px' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}