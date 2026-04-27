// /src/components/BI/ClientsByRegionMap.jsx
import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { FaMapMarkerAlt, FaUsers, FaUserCheck, FaUserTimes, FaCity, FaChartLine, FaCalendarAlt, FaList, FaChartPie } from 'react-icons/fa';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import NewClientsChart from './NewClientsChart';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    LineElement,
    PointElement,
    ChartDataLabels
);

export default function ClientsByRegionMap({ 
    users = [], 
    hideNewClientsTab = false,
    forceViewType = null,
    hideOtherTabs = false
}) {
    const [regionData, setRegionData] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [selectedRegionDetails, setSelectedRegionDetails] = useState(null);
    const [viewType, setViewType] = useState(forceViewType || 'both');
    const [topActiveCities, setTopActiveCities] = useState([]);
    const [topInactiveCities, setTopInactiveCities] = useState([]);
    const [newClientsByMonthAndRegion, setNewClientsByMonthAndRegion] = useState({});
    const [availableMonths, setAvailableMonths] = useState([]);
    const [showDonutModal, setShowDonutModal] = useState(false);

    // Couleurs féminines pour le donut chart (uniquement pour le modal)
    const feminineColors = {
        actif: '#F4A261',      // Corail doux
        inactif: '#E9C46A',    // Jaune doré
        actifHover: '#E76F51', // Corail plus soutenu
        inactifHover: '#F4A261',
        background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF0F5 100%)'
    };

    // Garder les couleurs originales pour les graphiques par ville (vert/rouge)
    const greenColors = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#22c55e', '#4ade80'];
    const redColors = ['#ef4444', '#f87171', '#fca5a5', '#fee2e2', '#ef4444', '#f87171', '#fca5a5', '#fee2e2', '#ef4444', '#f87171'];

    const tunisianCities = [
        'Tunis', 'Bab Souika', 'Bab El Bhar', 'Bab Jedid', 'Bab El Khadra', 'Bab El Assel', 'Halfaouine', 'Médina', 'El Omrane', 'El Omrane Supérieur', 'El Kabaria', 'Sidi El Béchir', 'Djebel Jelloud', 'El Ouardia', 'El Hraïria', 'Sidi Hassine', 'La Charguia', 'La Cité El Khadra', 'Montfleury', 'El Menzah', 'Cité Ennasr', 'El Manar', 'El Mourouj',
        'Ariana', 'La Soukra', 'Raoued', 'Sidi Thabet', 'Kalaat El Andalous', 'Mnihla', 'Ettadhamen', 'Douar Hicher', 'Oued Ellil', 'Borj Louzir', 'Ennasr', 'Riadh El Andalous',
        'Ben Arous', 'Mohamedia', 'Mornag', 'Rades', 'Hammam Lif', 'Bou Mhel El Bassatine', 'Ezzahra', 'Hammam Chott', 'Fouchana', 'Mégrine', 'Mhamdia', 'Nouvelle Médina', 'Bir El Bey', 'El Mghira', 'Chouket Ezzahra',
        'Manouba', 'Douar Hicher', 'Oued Ellil', 'Mornaguia', 'Borj El Amri', 'Djedeida', 'El Battan', 'Tebourba',
        'Nabeul', 'Hammamet', 'Dar Chaabane', 'El Feija', 'Béni Khalled', 'Béni Khiar', 'Korba', 'Menzel Temime', 'Takelsa', 'Bou Argoub', 'Grombalia', 'Soliman', 'Menzel Bouzelfa', 'Mrissa', 'Tazarka', 'El Mida', 'Kelibia', 'Haouaria',
        'Zaghouan', 'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Sbikha', 'Zriba',
        'Bizerte', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Metline', 'El Alia', 'Ghar El Melh', 'Tinja', 'Sejnane', 'Joumine', 'Mateur', 'Ouechtata', 'Zouara',
        'Béja', 'Amdoun', 'Goubellat', 'Medjez El Bassatine', 'Nefza', 'Teboursouk', 'Testour', 'Zahret Medjez', 'Thibar',
        'Jendouba', 'Aïn Draham', 'Beni Mtir', 'Bou Salem', 'Fernana', 'Ghardimaou', 'Oued Meliz', 'Tabarka', 'Balta Bou Aouene',
        'Le Kef', 'Dahmani', 'Jérissa', 'Kalaa Khasba', 'Kalaat Senan', 'Nebeur', 'Sakiet Sidi Youssef', 'Sers', 'Tajerouine', 'Touiref',
        'Siliana', 'Bargou', 'Bou Arada', 'El Aroussa', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia', 'Sidi Bou Rouis',
        'Sousse', 'Akouda', 'Bouficha', 'Enfidha', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', 'Kondar', 'M\'saken', 'Sidi Bou Ali', 'Sidi El Hani', 'Zaouiet Sousse', 'Ezzouhour', 'Sahloul',
        'Monastir', 'Amiret El Fhoul', 'Amiret Touazra', 'Bekalta', 'Bembla', 'Beni Hassen', 'Jemmal', 'Ksar Hellal', 'Ksibet El Mediouni', 'Moknine', 'Ouerdanin', 'Sahline', 'Sayada', 'Téboulba', 'Zéramdine', 'Bouhjar', 'Menzel Ennour', 'Menzel Farsi', 'Menzel Hayet', 'Menzel Kamel',
        'Mahdia', 'Bou Merdes', 'Chebba', 'Chorbane', 'El Bradâa', 'El Jem', 'Essouassi', 'Hebira', 'Ksour Essef', 'Melloulèche', 'Ouled Chamekh', 'Sidi Alouane', 'Zeramdine', 'Rejiche',
        'Sfax', 'Agareb', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Graïba', 'Jebiniana', 'Kerkennah', 'Mahrès', 'Menzel Chaker', 'Sakiet Eddaïer', 'Sakiet Ezzit', 'Thyna', 'Chihia', 'Gremda', 'Sidi Abid',
        'Kairouan', 'Alaâ', 'Bou Hajla', 'Chebika', 'Echrarda', 'Haffouz', 'Hajeb El Ayoun', 'Menzel Mehiri', 'Nasrallah', 'Oueslatia', 'Sbikha',
        'Kasserine', 'Fériana', 'Foussana', 'Haïdra', 'Jedelienne', 'Magel Bel Abbès', 'Sbeitla', 'Sbiba', 'Thala', 'Zhour',
        'Sidi Bouzid', 'Ben Aoun', 'Bir El Hafey', 'Cebbala Ouled Asker', 'Jilma', 'Meknassy', 'Menzel Bouzaiane', 'Mezzouna', 'Ouled Haffouz', 'Regueb', 'Sidi Ali Ben Aoun', 'Souk Jedid',
        'Gabès', 'Chenini Nahal', 'El Hamma', 'Ghannouch', 'Mareth', 'Matmata', 'Menzel El Habib', 'Metouia', 'Nouvelle Matmata', 'Oudhref', 'Zarat',
        'Médenine', 'Ajim', 'Ben Gardane', 'Beni Khedache', 'Djerba', 'Houmt Souk', 'Midoun', 'Zarzis', 'Sidi Makhlouf', 'Boughrara',
        'Tataouine', 'Bir Lahmar', 'Dehiba', 'Ghomrassen', 'Remada', 'Smar',
        'Gafsa', 'Belkhir', 'El Guettar', 'El Ksar', 'Mdhilla', 'Métlaoui', 'Moularès', 'Redeyef', 'Sened', 'Sidi Aïch', 'Thélepte', 'Zannouch',
        'Tozeur', 'Degache', 'El Hamma du Jerid', 'Hazoua', 'Nefta', 'Tameghza',
        'Kébili', 'Douz', 'El Faouar', 'Rjim Maatoug', 'Souk Lahad', 'Bechri', 'Jemna', 'Kebili Sud', 'Nouail'
    ];

    const regionGroups = {
        'Tunis': ['Tunis', 'Bab Souika', 'Bab El Bhar', 'Bab Jedid', 'Bab El Khadra', 'Bab El Assel', 'Halfaouine', 'Médina', 'El Omrane', 'El Omrane Supérieur', 'El Kabaria', 'Sidi El Béchir', 'Djebel Jelloud', 'El Ouardia', 'El Hraïria', 'Sidi Hassine', 'La Charguia', 'La Cité El Khadra', 'Montfleury', 'El Menzah', 'Cité Ennasr', 'El Manar', 'El Mourouj'],
        'Ariana': ['Ariana', 'La Soukra', 'Raoued', 'Sidi Thabet', 'Kalaat El Andalous', 'Mnihla', 'Ettadhamen', 'Douar Hicher', 'Oued Ellil', 'Borj Louzir', 'Ennasr', 'Riadh El Andalous'],
        'Ben Arous': ['Ben Arous', 'Mohamedia', 'Mornag', 'Rades', 'Hammam Lif', 'Bou Mhel El Bassatine', 'Ezzahra', 'Hammam Chott', 'Fouchana', 'Mégrine', 'Mhamdia', 'Nouvelle Médina', 'Bir El Bey', 'El Mghira', 'Chouket Ezzahra'],
        'Manouba': ['Manouba', 'Douar Hicher', 'Oued Ellil', 'Mornaguia', 'Borj El Amri', 'Djedeida', 'El Battan', 'Tebourba'],
        'Nabeul': ['Nabeul', 'Hammamet', 'Dar Chaabane', 'El Feija', 'Béni Khalled', 'Béni Khiar', 'Korba', 'Menzel Temime', 'Takelsa', 'Bou Argoub', 'Grombalia', 'Soliman', 'Menzel Bouzelfa', 'Mrissa', 'Tazarka', 'El Mida', 'Kelibia', 'Haouaria'],
        'Zaghouan': ['Zaghouan', 'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Sbikha', 'Zriba'],
        'Bizerte': ['Bizerte', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Metline', 'El Alia', 'Ghar El Melh', 'Tinja', 'Sejnane', 'Joumine', 'Mateur', 'Ouechtata', 'Zouara'],
        'Béja': ['Béja', 'Amdoun', 'Goubellat', 'Medjez El Bab', 'Nefza', 'Teboursouk', 'Testour', 'Zahret Medjez', 'Thibar'],
        'Jendouba': ['Jendouba', 'Aïn Draham', 'Beni Mtir', 'Bou Salem', 'Fernana', 'Ghardimaou', 'Oued Meliz', 'Tabarka', 'Balta Bou Aouene'],
        'Le Kef': ['Le Kef', 'Dahmani', 'Jérissa', 'Kalaa Khasba', 'Kalaat Senan', 'Nebeur', 'Sakiet Sidi Youssef', 'Sers', 'Tajerouine', 'Touiref'],
        'Siliana': ['Siliana', 'Bargou', 'Bou Arada', 'El Aroussa', 'Gaâfour', 'Kesra', 'Makthar', 'Rouhia', 'Sidi Bou Rouis'],
        'Sousse': ['Sousse', 'Akouda', 'Bouficha', 'Enfidha', 'Hammam Sousse', 'Hergla', 'Kalâa Kebira', 'Kalâa Seghira', 'Kondar', 'M\'saken', 'Sidi Bou Ali', 'Sidi El Hani', 'Zaouiet Sousse', 'Ezzouhour', 'Sahloul'],
        'Monastir': ['Monastir', 'Amiret El Fhoul', 'Amiret Touazra', 'Bekalta', 'Bembla', 'Beni Hassen', 'Jemmal', 'Ksar Hellal', 'Ksibet El Mediouni', 'Moknine', 'Ouerdanin', 'Sahline', 'Sayada', 'Téboulba', 'Zéramdine', 'Bouhjar', 'Menzel Ennour', 'Menzel Farsi', 'Menzel Hayet', 'Menzel Kamel'],
        'Mahdia': ['Mahdia', 'Bou Merdes', 'Chebba', 'Chorbane', 'El Bradâa', 'El Jem', 'Essouassi', 'Hebira', 'Ksour Essef', 'Melloulèche', 'Ouled Chamekh', 'Sidi Alouane', 'Zeramdine', 'Rejiche'],
        'Sfax': ['Sfax', 'Agareb', 'Bir Ali Ben Khalifa', 'El Amra', 'El Hencha', 'Graïba', 'Jebiniana', 'Kerkennah', 'Mahrès', 'Menzel Chaker', 'Sakiet Eddaïer', 'Sakiet Ezzit', 'Thyna', 'Chihia', 'Gremda', 'Sidi Abid'],
        'Kairouan': ['Kairouan', 'Alaâ', 'Bou Hajla', 'Chebika', 'Echrarda', 'Haffouz', 'Hajeb El Ayoun', 'Menzel Mehiri', 'Nasrallah', 'Oueslatia', 'Sbikha'],
        'Kasserine': ['Kasserine', 'Fériana', 'Foussana', 'Haïdra', 'Jedelienne', 'Magel Bel Abbès', 'Sbeitla', 'Sbiba', 'Thala', 'Zhour'],
        'Sidi Bouzid': ['Sidi Bouzid', 'Ben Aoun', 'Bir El Hafey', 'Cebbala Ouled Asker', 'Jilma', 'Meknassy', 'Menzel Bouzaiane', 'Mezzouna', 'Ouled Haffouz', 'Regueb', 'Sidi Ali Ben Aoun', 'Souk Jedid'],
        'Gabès': ['Gabès', 'Chenini Nahal', 'El Hamma', 'Ghannouch', 'Mareth', 'Matmata', 'Menzel El Habib', 'Metouia', 'Nouvelle Matmata', 'Oudhref', 'Zarat'],
        'Médenine': ['Médenine', 'Ajim', 'Ben Gardane', 'Beni Khedache', 'Djerba', 'Houmt Souk', 'Midoun', 'Zarzis', 'Sidi Makhlouf', 'Boughrara'],
        'Tataouine': ['Tataouine', 'Bir Lahmar', 'Dehiba', 'Ghomrassen', 'Remada', 'Smar'],
        'Gafsa': ['Gafsa', 'Belkhir', 'El Guettar', 'El Ksar', 'Mdhilla', 'Métlaoui', 'Moularès', 'Redeyef', 'Sened', 'Sidi Aïch', 'Thélepte', 'Zannouch'],
        'Tozeur': ['Tozeur', 'Degache', 'El Hamma du Jerid', 'Hazoua', 'Nefta', 'Tameghza'],
        'Kébili': ['Kébili', 'Douz', 'El Faouar', 'Rjim Maatoug', 'Souk Lahad', 'Bechri', 'Jemna', 'Kebili Sud', 'Nouail']
    };

    const extractCity = (adresse) => {
        if (!adresse) return null;
        const adresseLower = adresse.toLowerCase();
        for (const city of tunisianCities) {
            if (adresseLower.includes(city.toLowerCase())) return city;
        }
        return null;
    };

    const extractRegion = (adresse) => {
        if (!adresse) return 'Non spécifié';
        const adresseLower = adresse.toLowerCase();
        for (const [region, cities] of Object.entries(regionGroups)) {
            for (const city of cities) {
                if (adresseLower.includes(city.toLowerCase())) return region;
            }
        }
        return 'Autre';
    };

    useEffect(() => {
        const regionMap = new Map();
        const cityActiveMap = new Map();
        const cityInactiveMap = new Map();
        const newClientsByMonth = new Map();
        const monthsSet = new Set();
        const regionClientsMap = new Map();

        users.forEach((user) => {
            const region = extractRegion(user.adresse);
            const isActive = user.actif === true;
            const city = extractCity(user.adresse);
            
            if (!regionClientsMap.has(region)) {
                regionClientsMap.set(region, { actif: [], inactif: [] });
            }
            const clientInfo = {
                id: user._id,
                name: user.client_name || 'Sans nom',
                email: user.email,
                telephone: user.telephone,
                adresse: user.adresse,
                code: user.client_code
            };
            if (isActive) {
                regionClientsMap.get(region).actif.push(clientInfo);
            } else {
                regionClientsMap.get(region).inactif.push(clientInfo);
            }
            
            let createdAt = null;
            if (user.createdAt) {
                if (typeof user.createdAt === 'object' && user.createdAt.$date) createdAt = new Date(user.createdAt.$date);
                else if (typeof user.createdAt === 'string') createdAt = new Date(user.createdAt);
                else if (user.createdAt instanceof Date) createdAt = user.createdAt;
            }
            if ((!createdAt || isNaN(createdAt.getTime())) && user._id) {
                const idString = user._id.toString();
                if (idString.length >= 24) {
                    const timestamp = parseInt(idString.substring(0, 8), 16);
                    if (!isNaN(timestamp) && timestamp > 0) createdAt = new Date(timestamp * 1000);
                }
            }
            let monthKey = null;
            if (createdAt && !isNaN(createdAt.getTime())) {
                const year = createdAt.getFullYear();
                const month = createdAt.getMonth() + 1;
                monthKey = `${year}-${month.toString().padStart(2, '0')}`;
                monthsSet.add(monthKey);
                const regionMonthKey = `${region}|${monthKey}`;
                newClientsByMonth.set(regionMonthKey, (newClientsByMonth.get(regionMonthKey) || 0) + 1);
            }
            if (!regionMap.has(region)) regionMap.set(region, { region, actifs: 0, inactifs: 0, total: 0 });
            const regionStats = regionMap.get(region);
            if (isActive) regionStats.actifs++; else regionStats.inactifs++;
            regionStats.total++;
            if (city && isActive) cityActiveMap.set(city, (cityActiveMap.get(city) || 0) + 1);
            if (city && !isActive) cityInactiveMap.set(city, (cityInactiveMap.get(city) || 0) + 1);
        });

        const sortedData = Array.from(regionMap.values()).sort((a, b) => b.total - a.total);
        
        const sortedDataWithClients = sortedData.map(region => ({
            ...region,
            clients: regionClientsMap.get(region.region) || { actif: [], inactif: [] }
        }));
        
        setRegionData(sortedDataWithClients);
        setTopActiveCities(Array.from(cityActiveMap.entries()).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 10));
        setTopInactiveCities(Array.from(cityInactiveMap.entries()).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 10));
        const monthsSorted = Array.from(monthsSet).sort();
        setAvailableMonths(monthsSorted);
        const regionMonthData = {};
        sortedData.forEach(regionInfo => {
            regionMonthData[regionInfo.region] = {};
            monthsSorted.forEach(month => {
                regionMonthData[regionInfo.region][month] = newClientsByMonth.get(`${regionInfo.region}|${month}`) || 0;
            });
        });
        setNewClientsByMonthAndRegion(regionMonthData);
    }, [users]);

    const handleRegionClick = (region, idx) => {
        const total = region.actifs + region.inactifs;
        const actifPercent = total > 0 ? ((region.actifs / total) * 100).toFixed(1) : 0;
        const inactifPercent = total > 0 ? ((region.inactifs / total) * 100).toFixed(1) : 0;
        
        setSelectedRegionDetails({
            region: region.region,
            actifs: region.actifs,
            inactifs: region.inactifs,
            total: total,
            actifPercent: actifPercent,
            inactifPercent: inactifPercent,
            clients: region.clients
        });
        setSelectedRegion(idx);
        setShowDonutModal(true);
    };

    const handleCloseModal = () => {
        setShowDonutModal(false);
        setSelectedRegion(null);
    };

    const donutChartData = selectedRegionDetails ? {
        labels: ['Clients Actifs', 'Clients Inactifs'],
        datasets: [{
            data: [selectedRegionDetails.actifs, selectedRegionDetails.inactifs],
            backgroundColor: [feminineColors.actif, feminineColors.inactif],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 3,
            hoverBackgroundColor: [feminineColors.actifHover, feminineColors.inactifHover],
            hoverOffset: 15,
            borderRadius: 12,
            spacing: 5
        }]
    } : { labels: [], datasets: [] };

    const donutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 14, family: "'Poppins', 'Segoe UI', sans-serif", weight: '500' },
                    boxWidth: 16,
                    boxHeight: 16,
                    padding: 16,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    color: '#4a5568'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = selectedRegionDetails?.total || 1;
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} client${value > 1 ? 's' : ''} (${percentage}%)`;
                    }
                },
                backgroundColor: '#2d3748',
                titleColor: '#f7fafc',
                bodyColor: '#e2e8f0',
                padding: 12,
                cornerRadius: 8,
                bodyFont: { size: 13 }
            },
            datalabels: {
                display: true,
                color: '#ffffff',
                font: { weight: 'bold', size: 16 },
                formatter: (value, context) => {
                    const total = selectedRegionDetails?.total || 1;
                    const percentage = ((value / total) * 100).toFixed(1);
                    return `${percentage}%`;
                },
                backgroundColor: 'rgba(0,0,0,0.6)',
                borderRadius: 20,
                padding: { left: 8, right: 8, top: 4, bottom: 4 },
                labels: { title: null }
            }
        },
        layout: {
            padding: { top: 20, bottom: 20, left: 20, right: 20 }
        },
        elements: {
            arc: {
                shadowOffsetX: 4,
                shadowOffsetY: 6,
                shadowBlur: 12,
                shadowColor: 'rgba(0, 0, 0, 0.15)'
            }
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: 'easeOutBounce'
        }
    };

    const handleViewTypeChange = (newType) => {
        if (!forceViewType) {
            setViewType(newType);
        }
    };

    const renderViewButtons = () => {
        if (hideOtherTabs) return null;
        
        return (
            <div className="btn-group" role="group">
                
                {!hideNewClientsTab && (
                    <button 
                        className={`btn btn-sm ${viewType === 'newClients' ? 'btn-primary' : 'btn-outline-primary'}`} 
                        onClick={() => handleViewTypeChange('newClients')}
                    >
                        <FaChartLine className="me-1" /> Nouveaux clients
                    </button>
                )}
            </div>
        );
    };

    const totalActifs = regionData.reduce((sum, r) => sum + r.actifs, 0);
    const totalInactifs = regionData.reduce((sum, r) => sum + r.inactifs, 0);
    const totalUsers = totalActifs + totalInactifs;
    const tauxActifs = totalUsers > 0 ? (totalActifs / totalUsers * 100).toFixed(1) : 0;

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { usePointStyle: true, boxWidth: 8, font: { size: 11 } } },
            tooltip: { callbacks: { label: function(context) { let label = context.dataset.label || ''; if (label) label += ': '; label += context.parsed.y; return label; } } },
            datalabels: { display: false }
        },
        scales: {
            y: { beginAtZero: true, title: { display: true, text: "Nombre d'utilisateurs", font: { size: 11 } }, ticks: { stepSize: 1, font: { size: 10 } }, grid: { color: '#e2e8f0' } },
            x: { title: { display: true, text: 'Régions', font: { size: 11 } }, ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 }, grid: { display: false } }
        }
    };

    const barChartData = {
        labels: regionData.map(r => r.region),
        datasets: [
            { label: 'Comptes Actifs', data: regionData.map(r => r.actifs), backgroundColor: 'rgba(34, 197, 94, 0.7)', borderColor: '#16a34a', borderWidth: 2, borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.7 },
            { label: 'Comptes Inactifs', data: regionData.map(r => r.inactifs), backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: '#dc2626', borderWidth: 2, borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.7 }
        ]
    };

    const createPieOptions = () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 11, weight: '500' }, boxWidth: 12, boxHeight: 12, padding: 12, usePointStyle: true, pointStyle: 'circle' } },
            tooltip: { callbacks: { label: function(context) { const label = context.label || ''; const value = context.parsed || 0; const total = context.dataset.data.reduce((a, b) => a + b, 0); const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0; return `${label}: ${value} client${value > 1 ? 's' : ''} (${percentage}%)`; } }, backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#cbd5e1', padding: 10, cornerRadius: 8 },
            datalabels: { display: false }
        },
        layout: { padding: { top: 20, bottom: 20, left: 10, right: 10 } },
        elements: { arc: { shadowOffsetX: 3, shadowOffsetY: 5, shadowBlur: 8, shadowColor: 'rgba(0, 0, 0, 0.3)' } },
        cutout: '0%', rotation: -0.5 * Math.PI, circumference: 360
    });

    // Utiliser les couleurs originales (vert/rouge) pour les graphiques par ville
    const activeCitiesPieData = { labels: topActiveCities.map(i => i.city), datasets: [{ data: topActiveCities.map(i => i.count), backgroundColor: greenColors.slice(0, topActiveCities.length), borderColor: '#ffffff', borderWidth: 3, hoverOffset: 15 }] };
    const inactiveCitiesPieData = { labels: topInactiveCities.map(i => i.city), datasets: [{ data: topInactiveCities.map(i => i.count), backgroundColor: redColors.slice(0, topInactiveCities.length), borderColor: '#ffffff', borderWidth: 3, hoverOffset: 15 }] };

    if (forceViewType === 'newClients') {
        return (
            <NewClientsChart 
                regionData={regionData}
                newClientsByMonthAndRegion={newClientsByMonthAndRegion}
                availableMonths={availableMonths}
            />
        );
    }

    return (
        <>
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white border-0 pt-3 pb-0">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                        {renderViewButtons()}
                    </div>
                </div>

                <div className="card-body">
                    <div className="row g-3 mb-4">
                        <div className="col-md-3"><div className="card bg-success bg-opacity-10 border-0"><div className="card-body text-center"><FaUsers size={24} className="text-primary mb-2" /><h6 className="text-muted mb-1">Total Clients</h6><h3 className="fw-bold mb-0">{totalUsers}</h3></div></div></div>
                        <div className="col-md-3"><div className="card bg-success bg-opacity-10 border-0"><div className="card-body text-center"><FaUserCheck size={24} className="text-success mb-2" /><h6 className="text-muted mb-1">Comptes Actifs</h6><h3 className="fw-bold text-success mb-0">{totalActifs}</h3><small className="text-muted">{tauxActifs}% du total</small></div></div></div>
                        <div className="col-md-3"><div className="card bg-danger bg-opacity-10 border-0"><div className="card-body text-center"><FaUserTimes size={24} className="text-danger mb-2" /><h6 className="text-muted mb-1">Comptes Inactifs</h6><h3 className="fw-bold text-danger mb-0">{totalInactifs}</h3><small className="text-muted">{(100 - tauxActifs).toFixed(1)}% du total</small></div></div></div>
                        <div className="col-md-3"><div className="card bg-info bg-opacity-10 border-0"><div className="card-body text-center"><FaMapMarkerAlt size={24} className="text-info mb-2" /><h6 className="text-muted mb-1">Régions couvertes</h6><h3 className="fw-bold mb-0">{regionData.length}</h3></div></div></div>
                    </div>

                    {(viewType === 'both' || viewType === 'bar') && (
                        <div className="row g-4">
                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm">

                                    <div className="card-body">
                                        <div style={{ height: '450px' }}>
                                            {regionData.length > 0 ? (
                                                <Bar data={barChartData} options={barChartOptions} />
                                            ) : (
                                                <div className="text-center py-5">
                                                    <p className="text-muted">Aucune donnée de région disponible</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                            <table className="table table-hover table-sm">
                                                <thead className="table-light sticky-top">
                                                    <tr>
                                                        <th>Région</th>
                                                        <th className="text-center">Actifs</th>
                                                        <th className="text-center">Inactifs</th>
                                                        <th className="text-center">Total</th>
                                                        <th className="text-center">Taux d'activité</th>
                                                        <th className="text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {regionData.map((region, idx) => {
                                                        const taux = region.total > 0 ? (region.actifs / region.total * 100).toFixed(1) : 0;
                                                        return (
                                                            <tr 
                                                                key={idx} 
                                                                style={{ cursor: 'pointer' }}
                                                                onClick={() => handleRegionClick(region, idx)}
                                                                className={selectedRegion === idx ? 'table-active' : ''}
                                                            >
                                                                <td className="fw-semibold">{region.region}</td>
                                                                <td className="text-center fw-semibold text-success">{region.actifs}</td>
                                                                <td className="text-center text-danger">{region.inactifs}</td>
                                                                <td className="text-center fw-bold">{region.total}</td>
                                                                <td className="text-center">
                                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                                        <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '100px' }}>
                                                                            <div className="progress-bar bg-success" style={{ width: `${taux}%` }}></div>
                                                                        </div>
                                                                        <span className="small fw-semibold">{taux}%</span>
                                                                    </div>
                                                                </td>
                                                                <td className="text-center">
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-secondary rounded-circle"
                                                                        style={{ width: '28px', height: '28px', padding: '0', fontSize: '12px' }}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRegionClick(region, idx);
                                                                        }}
                                                                    >
                                                                        <FaChartPie />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {viewType === 'newClients' && !hideNewClientsTab && (
                        <NewClientsChart 
                            regionData={regionData}
                            newClientsByMonthAndRegion={newClientsByMonthAndRegion}
                            availableMonths={availableMonths}
                        />
                    )}

                    <div className="mt-5 pt-3">
                        <hr className="mb-4" />
                        <div className="d-flex align-items-center gap-2 mb-4"><FaCity size={22} style={{ color: '#4361ee' }} /><h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Analyse par Ville</h5><span className="badge rounded-pill bg-secondary"></span></div>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-lg" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                                    <div className="card-header bg-white border-0 pt-3 pb-0" style={{ background: 'transparent' }}>
                                        <div className="d-flex align-items-center gap-2"><div className="rounded-circle p-2" style={{ backgroundColor: '#22c55e20', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)' }}><FaUserCheck size={18} className="text-success" /></div><h6 className="fw-bold mb-0" style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Top Villes - Clients Actifs</h6></div>
                                        <p className="text-muted small mt-1 mb-0">Répartition des comptes actifs par ville (Top 10)</p>
                                    </div>
                                    <div className="card-body">{topActiveCities.length > 0 ? <div style={{ height: '400px' }}><Pie data={activeCitiesPieData} options={createPieOptions()} /></div> : <div className="text-center py-5"><p className="text-muted">Aucune donnée de ville active disponible</p></div>}</div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card h-100 border-0 shadow-lg" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)' }}>
                                    <div className="card-header bg-white border-0 pt-3 pb-0" style={{ background: 'transparent' }}>
                                        <div className="d-flex align-items-center gap-2"><div className="rounded-circle p-2" style={{ backgroundColor: '#ef444420', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)' }}><FaUserTimes size={18} className="text-danger" /></div><h6 className="fw-bold mb-0" style={{ background: 'linear-gradient(135deg, #ef4444, #991b1b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Top Villes - Clients Inactifs</h6></div>
                                        <p className="text-muted small mt-1 mb-0">Répartition des comptes inactifs par ville (Top 10)</p>
                                    </div>
                                    <div className="card-body">{topInactiveCities.length > 0 ? <div style={{ height: '400px' }}><Pie data={inactiveCitiesPieData} options={createPieOptions()} /></div> : <div className="text-center py-5"><p className="text-muted">Aucune donnée de ville inactive disponible</p></div>}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Donut Chart - Style féminin */}
            {showDonutModal && selectedRegionDetails && (
                <div 
                    className="modal show d-block" 
                    tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    onClick={handleCloseModal}
                >
                    <div 
                        className="modal-dialog modal-lg modal-dialog-centered" 
                        style={{ maxWidth: '650px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-content rounded-4 border-0" style={{ background: 'linear-gradient(135deg, #FFF8F5 0%, #FFFFFF 100%)', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
                            <div className="modal-header border-0 pt-4 px-4">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle p-2" style={{ background: 'linear-gradient(135deg, #F4A261, #E9C46A)', boxShadow: '0 4px 12px rgba(244, 162, 97, 0.4)' }}>
                                        <FaMapMarkerAlt size={20} color="#fff" />
                                    </div>
                                    <div>
                                        <h5 className="fw-bold mb-0" style={{ color: '#2d3748' }}>
                                            {selectedRegionDetails.region}
                                        </h5>
                                        <p className="text-muted small mb-0">Répartition des clients par statut</p>
                                    </div>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-close rounded-circle shadow-sm" 
                                    onClick={handleCloseModal}
                                    style={{ backgroundColor: '#f0f0f0', padding: '10px' }}
                                ></button>
                            </div>
                            
                            <div className="modal-body p-4">
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div style={{ height: '280px', position: 'relative' }}>
                                            <Doughnut data={donutChartData} options={donutOptions} />
                                            <div 
                                                style={{
                                                    position: 'absolute',
                                                    top: '50%',
                                                    left: '50%',
                                                    transform: 'translate(-50%, -50%)',
                                                    textAlign: 'center',
                                                    background: 'rgba(255,255,255,0.9)',
                                                    borderRadius: '50%',
                                                    width: '100px',
                                                    height: '100px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                                    backdropFilter: 'blur(4px)'
                                                }}
                                            >
                                                <span className="fw-bold" style={{ fontSize: '24px', color: '#F4A261' }}>
                                                    {selectedRegionDetails.total}
                                                </span>
                                                <span className="small text-muted">Total</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="p-3 rounded-3" style={{ background: 'rgba(244, 162, 97, 0.08)', borderRadius: '16px' }}>
                                            <div className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: feminineColors.actif }}></div>
                                                        <span className="fw-semibold">Clients Actifs</span>
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold" style={{ color: '#F4A261', fontSize: '20px' }}>{selectedRegionDetails.actifs}</span>
                                                        <span className="text-muted ms-1">clients</span>
                                                    </div>
                                                </div>
                                                <div className="progress" style={{ height: '8px', borderRadius: '10px', backgroundColor: 'rgba(244, 162, 97, 0.2)' }}>
                                                    <div 
                                                        className="progress-bar rounded-pill" 
                                                        style={{ width: `${selectedRegionDetails.actifPercent}%`, backgroundColor: feminineColors.actif }}
                                                    ></div>
                                                </div>
                                                <div className="text-end mt-1">
                                                    <small className="fw-semibold" style={{ color: '#F4A261' }}>{selectedRegionDetails.actifPercent}%</small>
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: feminineColors.inactif }}></div>
                                                        <span className="fw-semibold">Clients Inactifs</span>
                                                    </div>
                                                    <div>
                                                        <span className="fw-bold" style={{ color: '#E9C46A', fontSize: '20px' }}>{selectedRegionDetails.inactifs}</span>
                                                        <span className="text-muted ms-1">clients</span>
                                                    </div>
                                                </div>
                                                <div className="progress" style={{ height: '8px', borderRadius: '10px', backgroundColor: 'rgba(233, 196, 106, 0.2)' }}>
                                                    <div 
                                                        className="progress-bar rounded-pill" 
                                                        style={{ width: `${selectedRegionDetails.inactifPercent}%`, backgroundColor: feminineColors.inactif }}
                                                    ></div>
                                                </div>
                                                <div className="text-end mt-1">
                                                    <small className="fw-semibold" style={{ color: '#E9C46A' }}>{selectedRegionDetails.inactifPercent}%</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {(selectedRegionDetails.clients?.actif?.length > 0 || selectedRegionDetails.clients?.inactif?.length > 0) && (
                                    <div className="mt-4">
                                        <hr className="my-3" />
                                        <div className="d-flex gap-3 flex-wrap">
                                            {selectedRegionDetails.clients.actif?.slice(0, 3).map((client, idx) => (
                                                <div key={idx} className="rounded-2 p-2 flex-grow-1" style={{ backgroundColor: 'rgba(244, 162, 97, 0.08)' }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F4A261' }}></div>
                                                        <small className="fw-semibold">{client.name}</small>
                                                    </div>
                                                    {client.email && <small className="text-muted d-block ms-3">{client.email}</small>}
                                                </div>
                                            ))}
                                            {selectedRegionDetails.clients.inactif?.slice(0, 2).map((client, idx) => (
                                                <div key={idx} className="rounded-2 p-2 flex-grow-1" style={{ backgroundColor: 'rgba(233, 196, 106, 0.08)' }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#E9C46A' }}></div>
                                                        <small className="fw-semibold">{client.name}</small>
                                                    </div>
                                                    {client.email && <small className="text-muted d-block ms-3">{client.email}</small>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <div className="modal-footer border-0 justify-content-center pb-4">
                                <button 
                                    className="btn px-4 rounded-pill" 
                                    onClick={handleCloseModal}
                                    style={{ background: 'linear-gradient(135deg, #F4A261, #E9C46A)', color: 'white', border: 'none', boxShadow: '0 2px 8px rgba(244, 162, 97, 0.4)' }}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}