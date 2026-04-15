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
import { Bar, Pie } from 'react-chartjs-2';
import { FaMapMarkerAlt, FaUsers, FaUserCheck, FaUserTimes, FaCity, FaChartLine, FaCalendarAlt, FaList } from 'react-icons/fa';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Enregistrer les composants Chart.js et le plugin
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

export default function ClientsByRegionMap({ users = [] }) {
    const [regionData, setRegionData] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [viewType, setViewType] = useState('bar');
    const [topActiveCities, setTopActiveCities] = useState([]);
    const [topInactiveCities, setTopInactiveCities] = useState([]);
    const [newClientsByMonthAndRegion, setNewClientsByMonthAndRegion] = useState({});
    const [availableMonths, setAvailableMonths] = useState([]);
    const [selectedMonthForChart, setSelectedMonthForChart] = useState(null);
    const [showAllMonths, setShowAllMonths] = useState(false);

    // Liste exhaustive des villes tunisiennes par gouvernorat
    const tunisianCities = [
        'Tunis', 'Bab Souika', 'Bab El Bhar', 'Bab Jedid', 'Bab El Khadra', 'Bab El Assel', 'Halfaouine', 'Médina', 'El Omrane', 'El Omrane Supérieur', 'El Kabaria', 'Sidi El Béchir', 'Djebel Jelloud', 'El Ouardia', 'El Hraïria', 'Sidi Hassine', 'La Charguia', 'La Cité El Khadra', 'Montfleury', 'El Menzah', 'Cité Ennasr', 'El Manar', 'El Mourouj',
        'Ariana', 'La Soukra', 'Raoued', 'Sidi Thabet', 'Kalaat El Andalous', 'Mnihla', 'Ettadhamen', 'Douar Hicher', 'Oued Ellil', 'Borj Louzir', 'Ennasr', 'Riadh El Andalous',
        'Ben Arous', 'Mohamedia', 'Mornag', 'Rades', 'Hammam Lif', 'Bou Mhel El Bassatine', 'Ezzahra', 'Hammam Chott', 'Fouchana', 'Mégrine', 'Mhamdia', 'Nouvelle Médina', 'Bir El Bey', 'El Mghira', 'Chouket Ezzahra',
        'Manouba', 'Douar Hicher', 'Oued Ellil', 'Mornaguia', 'Borj El Amri', 'Djedeida', 'El Battan', 'Tebourba',
        'Nabeul', 'Hammamet', 'Dar Chaabane', 'El Feija', 'Béni Khalled', 'Béni Khiar', 'Korba', 'Menzel Temime', 'Takelsa', 'Bou Argoub', 'Grombalia', 'Soliman', 'Menzel Bouzelfa', 'Mrissa', 'Tazarka', 'El Mida', 'Kelibia', 'Haouaria',
        'Zaghouan', 'Bir Mcherga', 'El Fahs', 'Nadhour', 'Saouaf', 'Sbikha', 'Zriba',
        'Bizerte', 'Menzel Bourguiba', 'Menzel Jemil', 'Ras Jebel', 'Metline', 'El Alia', 'Ghar El Melh', 'Tinja', 'Sejnane', 'Joumine', 'Mateur', 'Ouechtata', 'Zouara',
        'Béja', 'Amdoun', 'Goubellat', 'Medjez El Bab', 'Nefza', 'Teboursouk', 'Testour', 'Zahret Medjez', 'Thibar',
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

    // Grouper les villes par région
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

    // Fonction pour extraire la ville à partir de l'adresse
    const extractCity = (adresse) => {
        if (!adresse) return null;
        const adresseLower = adresse.toLowerCase();
        for (const city of tunisianCities) {
            if (adresseLower.includes(city.toLowerCase())) {
                return city;
            }
        }
        return null;
    };

    // Fonction pour extraire la région à partir de l'adresse
    const extractRegion = (adresse) => {
        if (!adresse) return 'Non spécifié';
        const adresseLower = adresse.toLowerCase();
        for (const [region, cities] of Object.entries(regionGroups)) {
            for (const city of cities) {
                if (adresseLower.includes(city.toLowerCase())) {
                    return region;
                }
            }
        }
        return 'Autre';
    };

    // Traiter les données par région et par ville + nouveaux clients par mois/région
    useEffect(() => {
        const regionMap = new Map();
        const cityActiveMap = new Map();
        const cityInactiveMap = new Map();
        const newClientsByMonth = new Map();
        const monthsSet = new Set();

        users.forEach((user) => {
            const region = extractRegion(user.adresse);
            const isActive = user.actif === true;
            const city = extractCity(user.adresse);
            
            let createdAt = null;
            
            if (user.createdAt) {
                if (typeof user.createdAt === 'object' && user.createdAt.$date) {
                    createdAt = new Date(user.createdAt.$date);
                }
                else if (typeof user.createdAt === 'string') {
                    createdAt = new Date(user.createdAt);
                }
                else if (user.createdAt instanceof Date) {
                    createdAt = user.createdAt;
                }
            }
            
            if ((!createdAt || isNaN(createdAt.getTime())) && user._id) {
                const idString = user._id.toString();
                if (idString.length >= 24) {
                    const timestamp = parseInt(idString.substring(0, 8), 16);
                    if (!isNaN(timestamp) && timestamp > 0) {
                        createdAt = new Date(timestamp * 1000);
                    }
                }
            }
            
            let monthKey = null;
            if (createdAt && !isNaN(createdAt.getTime())) {
                const year = createdAt.getFullYear();
                const month = createdAt.getMonth() + 1;
                monthKey = `${year}-${month.toString().padStart(2, '0')}`;
                monthsSet.add(monthKey);
                
                const regionMonthKey = `${region}|${monthKey}`;
                const currentCount = newClientsByMonth.get(regionMonthKey) || 0;
                newClientsByMonth.set(regionMonthKey, currentCount + 1);
            }
            
            if (!regionMap.has(region)) {
                regionMap.set(region, {
                    region: region,
                    actifs: 0,
                    inactifs: 0,
                    total: 0
                });
            }
            
            const regionStats = regionMap.get(region);
            if (isActive) {
                regionStats.actifs++;
            } else {
                regionStats.inactifs++;
            }
            regionStats.total++;
            
            if (city && isActive) {
                cityActiveMap.set(city, (cityActiveMap.get(city) || 0) + 1);
            }
            
            if (city && !isActive) {
                cityInactiveMap.set(city, (cityInactiveMap.get(city) || 0) + 1);
            }
        });
        
        const sortedData = Array.from(regionMap.values())
            .sort((a, b) => b.total - a.total);
        
        setRegionData(sortedData);
        
        const topActive = Array.from(cityActiveMap.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        setTopActiveCities(topActive);
        
        const topInactive = Array.from(cityInactiveMap.entries())
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        setTopInactiveCities(topInactive);
        
        const monthsSorted = Array.from(monthsSet).sort();
        setAvailableMonths(monthsSorted);
        
        const regionMonthData = {};
        sortedData.forEach(regionInfo => {
            const regionName = regionInfo.region;
            regionMonthData[regionName] = {};
            monthsSorted.forEach(month => {
                const key = `${regionName}|${month}`;
                regionMonthData[regionName][month] = newClientsByMonth.get(key) || 0;
            });
        });
        
        setNewClientsByMonthAndRegion(regionMonthData);
        
        if (monthsSorted.length > 0 && !selectedMonthForChart && !showAllMonths) {
            setSelectedMonthForChart(monthsSorted[monthsSorted.length - 1]);
        }
    }, [users]);

    // Données pour le graphique des nouveaux clients par région pour un mois spécifique
    const getNewClientsChartData = () => {
        if (!selectedMonthForChart || !newClientsByMonthAndRegion) {
            return { labels: [], datasets: [] };
        }
        
        const regions = regionData.map(r => r.region);
        const newClientsCounts = regions.map(region => 
            newClientsByMonthAndRegion[region]?.[selectedMonthForChart] || 0
        );
        
        const filteredRegions = [];
        const filteredCounts = [];
        for (let i = 0; i < regions.length; i++) {
            if (newClientsCounts[i] > 0) {
                filteredRegions.push(regions[i]);
                filteredCounts.push(newClientsCounts[i]);
            }
        }
        
        return {
            labels: filteredRegions,
            datasets: [
                {
                    label: `Nouveaux clients - ${formatMonthName(selectedMonthForChart)}`,
                    data: filteredCounts,
                    backgroundColor: 'rgba(99, 102, 241, 0.7)',
                    borderColor: '#4f46e5',
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            ]
        };
    };

    // Données pour le graphique de tous les mois
    const getAllMonthsChartData = () => {
        if (availableMonths.length === 0) {
            return { labels: [], datasets: [] };
        }
        
        const totalByMonth = availableMonths.map(month => {
            let total = 0;
            regionData.forEach(region => {
                total += newClientsByMonthAndRegion[region]?.[month] || 0;
            });
            return total;
        });
        
        return {
            labels: availableMonths.map(month => formatMonthName(month)),
            datasets: [
                {
                    label: 'Nouveaux clients',
                    data: totalByMonth,
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    borderColor: '#4f46e5',
                    borderWidth: 2,
                    borderRadius: 8,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            ]
        };
    };

    // Options POUR LE GRAPHIQUE DES NOUVEAUX CLIENTS UNIQUEMENT (avec datalabels)
    const newClientsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y} client${context.parsed.y > 1 ? 's' : ''}`;
                    }
                }
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                offset: 6,
                color: '#1e293b',
                backgroundColor: '#f8fafc',
                borderRadius: 6,
                padding: {
                    left: 8,
                    right: 8,
                    top: 4,
                    bottom: 4
                },
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: function(value) {
                    if (value === 0) return '';
                    return value;
                },
                borderWidth: 1,
                borderColor: '#cbd5e1',
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                shadowBlur: 2,
                shadowColor: 'rgba(0,0,0,0.1)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Nombre de nouveaux clients",
                    font: { size: 11 }
                },
                ticks: {
                    stepSize: 1,
                    font: { size: 10 }
                },
                grid: {
                    color: '#e2e8f0'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Régions',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    display: false
                }
            }
        }
    };

    // Options pour le graphique "Tous les mois" (AVEC datalabels aussi car c'est aussi un graphique de nouveaux clients)
    const allMonthsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.parsed.y} client${context.parsed.y > 1 ? 's' : ''}`;
                    }
                }
            },
            datalabels: {
                anchor: 'end',
                align: 'top',
                offset: 6,
                color: '#1e293b',
                backgroundColor: '#f8fafc',
                borderRadius: 6,
                padding: {
                    left: 8,
                    right: 8,
                    top: 4,
                    bottom: 4
                },
                font: {
                    weight: 'bold',
                    size: 12
                },
                formatter: function(value) {
                    if (value === 0) return '';
                    return value;
                },
                borderWidth: 1,
                borderColor: '#cbd5e1',
                shadowOffsetX: 1,
                shadowOffsetY: 1,
                shadowBlur: 2,
                shadowColor: 'rgba(0,0,0,0.1)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Nombre de nouveaux clients",
                    font: { size: 11 }
                },
                ticks: {
                    stepSize: 1,
                    font: { size: 10 }
                },
                grid: {
                    color: '#e2e8f0'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Mois',
                    font: { size: 11 }
                },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 45
                },
                grid: {
                    display: false
                }
            }
        }
    };

    const formatMonthName = (monthKey) => {
        if (!monthKey) return '';
        const [year, month] = monthKey.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1, 1);
        return date.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    };

    const totalActifs = regionData.reduce((sum, r) => sum + r.actifs, 0);
    const totalInactifs = regionData.reduce((sum, r) => sum + r.inactifs, 0);
    const totalUsers = totalActifs + totalInactifs;
    const tauxActifs = totalUsers > 0 ? (totalActifs / totalUsers * 100).toFixed(1) : 0;

    // Options pour le graphique Actifs vs Inactifs (SANS datalabels)
    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11 }
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        label += context.parsed.y;
                        return label;
                    }
                }
            }
            // PAS de datalabels ici
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Nombre d'utilisateurs",
                    font: { size: 11 }
                },
                ticks: { stepSize: 1, font: { size: 10 } },
                grid: { color: '#e2e8f0' }
            },
            x: {
                title: {
                    display: true,
                    text: 'Régions',
                    font: { size: 11 }
                },
                ticks: { font: { size: 10 }, maxRotation: 45, minRotation: 45 },
                grid: { display: false }
            }
        }
    };

    const barChartData = {
        labels: regionData.map(r => r.region),
        datasets: [
            {
                label: 'Comptes Actifs',
                data: regionData.map(r => r.actifs),
                backgroundColor: 'rgba(34, 197, 94, 0.7)',
                borderColor: '#16a34a',
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7
            },
            {
                label: 'Comptes Inactifs',
                data: regionData.map(r => r.inactifs),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#dc2626',
                borderWidth: 2,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.7
            }
        ]
    };

    const createPieOptions = () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 11, weight: '500' },
                    boxWidth: 12,
                    boxHeight: 12,
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${label}: ${value} client${value > 1 ? 's' : ''} (${percentage}%)`;
                    }
                },
                backgroundColor: '#1e293b',
                titleColor: '#f1f5f9',
                bodyColor: '#cbd5e1',
                padding: 10,
                cornerRadius: 8
            }
        },
        layout: {
            padding: {
                top: 20,
                bottom: 20,
                left: 10,
                right: 10
            }
        },
        elements: {
            arc: {
                shadowOffsetX: 3,
                shadowOffsetY: 5,
                shadowBlur: 8,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
        },
        cutout: '0%',
        rotation: -0.5 * Math.PI,
        circumference: 360
    });

    const greenColors = ['#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#22c55e', '#4ade80', '#86efac', '#bbf7d0', '#22c55e', '#4ade80'];
    const redColors = ['#ef4444', '#f87171', '#fca5a5', '#fee2e2', '#ef4444', '#f87171', '#fca5a5', '#fee2e2', '#ef4444', '#f87171'];

    const activeCitiesPieData = {
        labels: topActiveCities.map(item => item.city),
        datasets: [{
            data: topActiveCities.map(item => item.count),
            backgroundColor: greenColors.slice(0, topActiveCities.length),
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 15
        }]
    };

    const inactiveCitiesPieData = {
        labels: topInactiveCities.map(item => item.city),
        datasets: [{
            data: topInactiveCities.map(item => item.count),
            backgroundColor: redColors.slice(0, topInactiveCities.length),
            borderColor: '#ffffff',
            borderWidth: 3,
            hoverOffset: 15
        }]
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3 pb-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="btn-group" role="group">
                        <button className={`btn btn-sm ${viewType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewType('bar')}>
                            <i className="bi bi-bar-chart me-1"></i> Actifs vs Inactifs
                        </button>
                        <button className={`btn btn-sm ${viewType === 'stats' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewType('stats')}>
                            <i className="bi bi-table me-1"></i> Tableau
                        </button>
                        <button className={`btn btn-sm ${viewType === 'newClients' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewType('newClients')}>
                            <FaChartLine className="me-1" /> Nouveaux clients
                        </button>
                    </div>
                </div>
                <p className="text-muted mt-2" style={{ fontSize: '0.8rem' }}>
                    Analyse de la répartition géographique des clients actifs et inactifs par région (24 gouvernorats)
                </p>
            </div>
            
            <div className="card-body">
                {/* Cartes KPI */}
                <div className="row g-3 mb-4">
                    <div className="col-md-3">
                        <div className="card bg-success bg-opacity-10 border-0">
                            <div className="card-body text-center">
                                <FaUsers size={24} className="text-primary mb-2" />
                                <h6 className="text-muted mb-1">Total Clients</h6>
                                <h3 className="fw-bold mb-0">{totalUsers}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success bg-opacity-10 border-0">
                            <div className="card-body text-center">
                                <FaUserCheck size={24} className="text-success mb-2" />
                                <h6 className="text-muted mb-1">Comptes Actifs</h6>
                                <h3 className="fw-bold text-success mb-0">{totalActifs}</h3>
                                <small className="text-muted">{tauxActifs}% du total</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-danger bg-opacity-10 border-0">
                            <div className="card-body text-center">
                                <FaUserTimes size={24} className="text-danger mb-2" />
                                <h6 className="text-muted mb-1">Comptes Inactifs</h6>
                                <h3 className="fw-bold text-danger mb-0">{totalInactifs}</h3>
                                <small className="text-muted">{(100 - tauxActifs).toFixed(1)}% du total</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info bg-opacity-10 border-0">
                            <div className="card-body text-center">
                                <FaMapMarkerAlt size={24} className="text-info mb-2" />
                                <h6 className="text-muted mb-1">Régions couvertes</h6>
                                <h3 className="fw-bold mb-0">{regionData.length}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vue Graphique à Barres Actifs vs Inactifs - SANS datalabels */}
                {viewType === 'bar' && (
                    <>
                        <div style={{ height: '450px' }}>
                            {regionData.length > 0 ? (
                                <Bar data={barChartData} options={barChartOptions} />
                            ) : (
                                <div className="text-center py-5"><p className="text-muted">Aucune donnée de région disponible</p></div>
                            )}
                        </div>
                        {selectedRegion !== null && regionData[selectedRegion] && (
                            <div className="mt-4 p-3 bg-light rounded-3">
                                <h6 className="fw-bold mb-3">Détails pour la région: {regionData[selectedRegion].region}</h6>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="h4 fw-bold text-success">{regionData[selectedRegion].actifs}</div>
                                            <small className="text-muted">Comptes Actifs</small>
                                            <div className="progress mt-2" style={{ height: '8px' }}>
                                                <div className="progress-bar bg-success" style={{ width: `${(regionData[selectedRegion].actifs / regionData[selectedRegion].total * 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="h4 fw-bold text-danger">{regionData[selectedRegion].inactifs}</div>
                                            <small className="text-muted">Comptes Inactifs</small>
                                            <div className="progress mt-2" style={{ height: '8px' }}>
                                                <div className="progress-bar bg-danger" style={{ width: `${(regionData[selectedRegion].inactifs / regionData[selectedRegion].total * 100)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="h4 fw-bold text-primary">{regionData[selectedRegion].total}</div>
                                            <small className="text-muted">Total Clients</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Vue Tableau des régions */}
                {viewType === 'stats' && (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="table-light">
                                <tr><th>Région</th><th className="text-center">Actifs</th><th className="text-center">Inactifs</th><th className="text-center">Total</th><th className="text-center">Taux d'activité</th></tr>
                            </thead>
                            <tbody>
                                {regionData.map((region, idx) => {
                                    const taux = region.total > 0 ? (region.actifs / region.total * 100).toFixed(1) : 0;
                                    return (
                                        <tr key={idx}>
                                            <td className="fw-semibold">{region.region}</td>
                                            <td className="text-center text-success">{region.actifs}</td>
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
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Vue Nouveaux Clients - AVEC datalabels et SANS le bloc "Total" */}
                {viewType === 'newClients' && (
                    <div>
                        {availableMonths.length > 0 && (
                            <div className="mb-4">
                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                                    <label className="form-label fw-semibold mb-0">
                                        <FaCalendarAlt className="me-2" /> Sélectionner un mois :
                                    </label>
                                    <button 
                                        className={`btn btn-sm ${showAllMonths ? 'btn-primary' : 'btn-outline-primary'}`} 
                                        onClick={() => { setShowAllMonths(true); setSelectedMonthForChart(null); }}
                                    >
                                        <FaList className="me-1" /> Tous les mois
                                    </button>
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    {availableMonths.map(month => (
                                        <button 
                                            key={month} 
                                            className={`btn btn-sm ${!showAllMonths && selectedMonthForChart === month ? 'btn-primary' : 'btn-outline-secondary'}`} 
                                            onClick={() => { setShowAllMonths(false); setSelectedMonthForChart(month); }}
                                        >
                                            {formatMonthName(month)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {showAllMonths ? (
                            <>
                                <div style={{ height: '500px' }}>
                                    {getAllMonthsChartData().labels.length > 0 ? (
                                        <Bar data={getAllMonthsChartData()} options={allMonthsChartOptions} />
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Aucune donnée disponible</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 text-center">
                                    <small className="text-muted">Évolution mensuelle du nombre de nouveaux clients (toutes régions confondues)</small>
                                </div>
                                {getAllMonthsChartData().labels.length > 0 && (
                                    <div className="mt-4">
                                        <h6 className="fw-semibold mb-3">Récapitulatif mensuel</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm table-bordered">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Mois</th>
                                                        <th className="text-center">Nouveaux clients</th>
                                                        <th className="text-center">% du total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getAllMonthsChartData().labels.map((label, index) => {
                                                        const count = getAllMonthsChartData().datasets[0].data[index];
                                                        const total = getAllMonthsChartData().datasets[0].data.reduce((a, b) => a + b, 0);
                                                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                                                        return (
                                                            <tr key={index}>
                                                                <td>{label}</td>
                                                                <td className="text-center fw-semibold">{count}</td>
                                                                <td className="text-center">
                                                                    <div className="d-flex align-items-center justify-content-center gap-2">
                                                                        <div className="progress flex-grow-1" style={{ height: '5px', maxWidth: '80px' }}>
                                                                            <div className="progress-bar" style={{ width: `${percentage}%`, backgroundColor: '#4f46e5' }}></div>
                                                                        </div>
                                                                        <span className="small">{percentage}%</span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* Le bloc "Total des nouveaux clients" a été SUPPRIMÉ - plus de carte avec le total */}
                                <div style={{ height: '500px' }}>
                                    {getNewClientsChartData().labels.length > 0 ? (
                                        <Bar data={getNewClientsChartData()} options={newClientsChartOptions} />
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">
                                                Aucun nouveau client pour {selectedMonthForChart ? formatMonthName(selectedMonthForChart) : 'cette période'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-3 text-center">
                                    <small className="text-muted">
                                        Nombre de nouveaux clients inscrits par région pour le mois sélectionné
                                        {selectedMonthForChart && ` (${formatMonthName(selectedMonthForChart)})`}
                                    </small>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* SECTION DES PIE CHARTS */}
                <div className="mt-5 pt-3">
                    <hr className="mb-4" />
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <FaCity size={22} style={{ color: '#4361ee' }} />
                        <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>Analyse par Ville</h5>
                        <span className="badge rounded-pill bg-secondary">Top 10</span>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-6">
                            <div className="card h-100 border-0 shadow-lg" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                                <div className="card-header bg-white border-0 pt-3 pb-0" style={{ background: 'transparent' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle p-2" style={{ backgroundColor: '#22c55e20', boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)' }}>
                                            <FaUserCheck size={18} className="text-success" />
                                        </div>
                                        <h6 className="fw-bold mb-0" style={{ background: 'linear-gradient(135deg, #22c55e, #15803d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            Top Villes - Clients Actifs
                                        </h6>
                                    </div>
                                    <p className="text-muted small mt-1 mb-0">Répartition des comptes actifs par ville (Top 10)</p>
                                </div>
                                <div className="card-body">
                                    {topActiveCities.length > 0 ? (
                                        <div style={{ height: '400px' }}><Pie data={activeCitiesPieData} options={createPieOptions()} /></div>
                                    ) : (
                                        <div className="text-center py-5"><p className="text-muted">Aucune donnée de ville active disponible</p></div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="card h-100 border-0 shadow-lg" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)' }}>
                                <div className="card-header bg-white border-0 pt-3 pb-0" style={{ background: 'transparent' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle p-2" style={{ backgroundColor: '#ef444420', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)' }}>
                                            <FaUserTimes size={18} className="text-danger" />
                                        </div>
                                        <h6 className="fw-bold mb-0" style={{ background: 'linear-gradient(135deg, #ef4444, #991b1b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                            Top Villes - Clients Inactifs
                                        </h6>
                                    </div>
                                    <p className="text-muted small mt-1 mb-0">Répartition des comptes inactifs par ville (Top 10)</p>
                                </div>
                                <div className="card-body">
                                    {topInactiveCities.length > 0 ? (
                                        <div style={{ height: '400px' }}><Pie data={inactiveCitiesPieData} options={createPieOptions()} /></div>
                                    ) : (
                                        <div className="text-center py-5"><p className="text-muted">Aucune donnée de ville inactive disponible</p></div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}