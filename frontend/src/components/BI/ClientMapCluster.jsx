// /src/components/BI/ClientMapCluster.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FaMapMarkedAlt,FaUsers, FaUserCheck, FaUserTimes, FaSearch, FaCrosshairs } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';


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

// Composant simplifié sans MarkerCluster (car nous avons des problèmes avec)
function SimpleMarkers({ markers, onMarkerClick, filter }) {
    const filteredMarkers = filter === 'all' 
        ? markers 
        : markers.filter(m => filter === 'actif' ? m.status === 'actif' : m.status === 'inactif');
    
    return (
        <>
            {filteredMarkers.map((marker) => (
                <Marker
                    key={marker.id}
                    position={[marker.lat, marker.lng]}
                    eventHandlers={{
                        click: () => onMarkerClick(marker)
                    }}
                >
                    <Popup>
                        <div style={{ minWidth: '200px' }}>
                            <strong>{marker.client_name}</strong><br/>
                            <span style={{ color: marker.color === '#22c55e' ? '#16a34a' : '#dc2626' }}>
                                {marker.status === 'actif' ? '✅ Actif' : '❌ Inactif'}
                            </span><br/>
                            {marker.email && <><i className="bi bi-envelope"></i> {marker.email}<br/></>}
                            {marker.telephone && <><i className="bi bi-telephone"></i> {marker.telephone}<br/></>}
                            {marker.adresse && <><i className="bi bi-geo-alt"></i> {marker.adresse}</>}
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

export default function ClientMapCluster({ users = [], centerLat = 36.8065, centerLng = 10.1815, zoom = 7 }) {
    const [markers, setMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [mapCenter, setMapCenter] = useState([centerLat, centerLng]);
    const [mapZoom, setMapZoom] = useState(zoom);
    const [stats, setStats] = useState({ actifs: 0, inactifs: 0, total: 0, avecCoordonnees: 0 });

    // Fonction pour géocoder une adresse (simulée)
    const geocodeAddress = async (address) => {
        if (!address) return null;
        
        const regionCoords = {
            'Tunis': [36.8065, 10.1815],
            'Ariana': [36.8601, 10.1934],
            'Ben Arous': [36.7531, 10.2189],
            'Manouba': [36.8078, 10.0945],
            'Nabeul': [36.4561, 10.7376],
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
            'Tataouine': [32.9297, 10.4518],
            'Gafsa': [34.425, 8.784],
            'Tozeur': [33.9197, 8.1335],
            'Kébili': [33.7043, 8.969],
        };
        
        for (const [region, coords] of Object.entries(regionCoords)) {
            if (address.toLowerCase().includes(region.toLowerCase())) {
                return [
                    coords[0] + (Math.random() - 0.5) * 0.05,
                    coords[1] + (Math.random() - 0.5) * 0.05
                ];
            }
        }
        
        return null;
    };

    // Traiter les utilisateurs pour créer les marqueurs
    useEffect(() => {
        const processMarkers = async () => {
            const newMarkers = [];
            let actifCount = 0;
            let inactifCount = 0;
            let coordCount = 0;
            
            const filteredUsers = users.filter(user => {
                if (filter === 'actif') return user.actif === true;
                if (filter === 'inactif') return user.actif === false;
                return true;
            }).filter(user => {
                if (!searchTerm) return true;
                return (user.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       user.client_code?.toLowerCase().includes(searchTerm.toLowerCase()));
            });
            
            for (const user of filteredUsers) {
                const coords = await geocodeAddress(user.adresse);
                if (coords) {
                    coordCount++;
                    if (user.actif) actifCount++;
                    else inactifCount++;
                    
                    newMarkers.push({
                        id: user._id,
                        lat: coords[0],
                        lng: coords[1],
                        client_name: user.client_name || 'Sans nom',
                        client_code: user.client_code,
                        email: user.email,
                        telephone: user.telephone,
                        adresse: user.adresse,
                        status: user.actif ? 'actif' : 'inactif',
                        color: user.actif ? '#22c55e' : '#ef4444'
                    });
                }
            }
            
            setMarkers(newMarkers);
            setStats({
                actifs: actifCount,
                inactifs: inactifCount,
                total: newMarkers.length,
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
            // Calculer les bounds de tous les marqueurs
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
            setMapZoom(Math.min(zoom + 1, 10));
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3 pb-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleResetView}
                            title="Réinitialiser la vue"
                        >
                            <FaCrosshairs /> Réinitialiser
                        </button>
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={handleFitBounds}
                            title="Ajuster aux marqueurs"
                        >
                            <FaSearch /> Ajuster
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="card-body">
                {/* Filtres et statistiques */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="d-flex gap-2">
                            <button
                                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'} flex-grow-1`}
                                onClick={() => setFilter('all')}
                            >
                                <FaUsers className="me-1" />
                                Tous ({stats.total})
                            </button>
                            <button
                                className={`btn ${filter === 'actif' ? 'btn-success' : 'btn-outline-success'} flex-grow-1`}
                                onClick={() => setFilter('actif')}
                            >
                                <FaUserCheck className="me-1" />
                                Actifs ({stats.actifs})
                            </button>
                            <button
                                className={`btn ${filter === 'inactif' ? 'btn-danger' : 'btn-outline-danger'} flex-grow-1`}
                                onClick={() => setFilter('inactif')}
                            >
                                <FaUserTimes className="me-1" />
                                Inactifs ({stats.inactifs})
                            </button>
                        </div>
                    </div>
                    
                    <div className="col-md-4">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher un client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="col-md-4">
                        <div className="bg-light rounded p-2 text-center">
                            <small className="text-muted">
                                📍 {stats.avecCoordonnees} clients localisés sur {stats.total}
                            </small>
                        </div>
                    </div>
                </div>
                
                {/* Légende */}
                <div className="d-flex justify-content-center gap-4 mb-3">
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid white', boxShadow: '0 0 0 1px #22c55e' }}></div>
                        <span className="small">Client Actif</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid white', boxShadow: '0 0 0 1px #ef4444' }}></div>
                        <span className="small">Client Inactif</span>
                    </div>
                </div>
                
                {/* Carte */}
                <div style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <MapContainer
                        center={mapCenter}
                        zoom={mapZoom}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <MapCenter center={mapCenter} zoom={mapZoom} />
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB'
                        />
                        
                        <SimpleMarkers 
                            markers={markers} 
                            onMarkerClick={handleMarkerClick}
                            filter={filter}
                        />
                    </MapContainer>
                </div>
                
                {/* Détail du client sélectionné */}
                {selectedMarker && (
                    <div className="mt-4 p-3 bg-light rounded-3">
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
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => setSelectedMarker(null)}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                )}
                
                {/* Message si aucun résultat */}
                {markers.length === 0 && (
                    <div className="text-center py-4">
                        <p className="text-muted mb-0">
                            Aucun client localisé pour les critères sélectionnés
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}