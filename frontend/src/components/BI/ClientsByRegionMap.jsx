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
    ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {  FaMapMarkerAlt,FaUsers, FaUserCheck, FaUserTimes, FaCity } from 'react-icons/fa';

// Enregistrer le plugin pour afficher les pourcentages sur le graphique
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function ClientsByRegionMap({ users = [] }) {
    const [regionData, setRegionData] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [viewType, setViewType] = useState('bar'); // 'bar' ou 'stats'
    const [topActiveCities, setTopActiveCities] = useState([]);
    const [topInactiveCities, setTopInactiveCities] = useState([]);

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

    // Fonction pour générer des dégradés de couleurs
    const generateGradient = (ctx, centerX, centerY, radius, startColor, endColor) => {
        const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        return gradient;
    };

    // Dégradés de vert pour les actifs
    const greenGradients = [
        ['#22c55e', '#15803d'], // vert clair -> vert foncé
        ['#4ade80', '#166534'],
        ['#86efac', '#14532d'],
        ['#bbf7d0', '#166534'],
        ['#22c55e', '#14532d'],
        ['#4ade80', '#15803d'],
        ['#86efac', '#166534'],
        ['#bbf7d0', '#14532d'],
        ['#22c55e', '#15803d'],
        ['#4ade80', '#166534']
    ];

    // Dégradés de rouge pour les inactifs
    const redGradients = [
        ['#ef4444', '#991b1b'], // rouge clair -> rouge foncé
        ['#f87171', '#7f1d1d'],
        ['#fca5a5', '#991b1b'],
        ['#fee2e2', '#7f1d1d'],
        ['#ef4444', '#991b1b'],
        ['#f87171', '#7f1d1d'],
        ['#fca5a5', '#991b1b'],
        ['#fee2e2', '#7f1d1d'],
        ['#ef4444', '#991b1b'],
        ['#f87171', '#7f1d1d']
    ];

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

    // Traiter les données par région et par ville
    useEffect(() => {
        const regionMap = new Map();
        const cityActiveMap = new Map();
        const cityInactiveMap = new Map();
        
        users.forEach(user => {
            const region = extractRegion(user.adresse);
            const isActive = user.actif === true;
            const city = extractCity(user.adresse);
            
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
    }, [users]);

    // Calculer les statistiques globales
    const totalActifs = regionData.reduce((sum, r) => sum + r.actifs, 0);
    const totalInactifs = regionData.reduce((sum, r) => sum + r.inactifs, 0);
    const totalUsers = totalActifs + totalInactifs;
    const tauxActifs = totalUsers > 0 ? (totalActifs / totalUsers * 100).toFixed(1) : 0;

    // Données pour le graphique à barres
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

    // Configuration du Pie Chart avec pourcentages affichés sur les sections et effet 3D
    const createPieOptions = (data, isActive = true) => ({
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
            },
            datalabels: {
                display: true,
                color: '#ffffff',
                font: {
                    weight: 'bold',
                    size: 13
                },
                formatter: (value, context) => {
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                    return `${percentage}%`;
                },
                textShadowBlur: 4,
                textShadowColor: 'rgba(0, 0, 0, 0.5)'
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
        // Effet 3D : ombre portée
        elements: {
            arc: {
                shadowOffsetX: 3,
                shadowOffsetY: 5,
                shadowBlur: 8,
                shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
        },
        cutout: '0%', // Pie chart complet (pas de trou au centre)
        rotation: -0.5 * Math.PI, // Rotation pour un meilleur effet visuel
        circumference: 360
    });

    // Données pour le Pie Chart des villes actives avec dégradés de vert
    const activeCitiesPieData = {
        labels: topActiveCities.map(item => item.city),
        datasets: [
            {
                data: topActiveCities.map(item => item.count),
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return greenGradients[context.dataIndex % greenGradients.length][0];
                    
                    const centerX = (chartArea.left + chartArea.right) / 2;
                    const centerY = (chartArea.top + chartArea.bottom) / 2;
                    const radius = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;
                    
                    const [startColor, endColor] = greenGradients[context.dataIndex % greenGradients.length];
                    return generateGradient(ctx, centerX, centerY, radius, startColor, endColor);
                },
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 15,
                offset: 5 // Effet 3D : les sections sont légèrement séparées au hover
            }
        ]
    };

    // Données pour le Pie Chart des villes inactives avec dégradés de rouge
    const inactiveCitiesPieData = {
        labels: topInactiveCities.map(item => item.city),
        datasets: [
            {
                data: topInactiveCities.map(item => item.count),
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return redGradients[context.dataIndex % redGradients.length][0];
                    
                    const centerX = (chartArea.left + chartArea.right) / 2;
                    const centerY = (chartArea.top + chartArea.bottom) / 2;
                    const radius = Math.min(chartArea.right - chartArea.left, chartArea.bottom - chartArea.top) / 2;
                    
                    const [startColor, endColor] = redGradients[context.dataIndex % redGradients.length];
                    return generateGradient(ctx, centerX, centerY, radius, startColor, endColor);
                },
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverOffset: 15,
                offset: 5
            }
        ]
    };

    const options = {
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
                        if (label) {
                            label += ': ';
                        }
                        label += context.parsed.y;
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Nombre d'utilisateurs",
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
        },
        onClick: (event, activeElements) => {
            if (activeElements.length > 0) {
                const index = activeElements[0].dataIndex;
                setSelectedRegion(selectedRegion === index ? null : index);
            }
        }
    };

    return (
        <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0 pt-3 pb-0">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                   
                    
                    <div className="btn-group" role="group">
                        <button
                            className={`btn btn-sm ${viewType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewType('bar')}
                        >
                            <i className="bi bi-bar-chart me-1"></i>
                            Graphique
                        </button>
                        <button
                            className={`btn btn-sm ${viewType === 'stats' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setViewType('stats')}
                        >
                            <i className="bi bi-table me-1"></i>
                            Tableau
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

                {/* Vue Graphique à Barres */}
                {viewType === 'bar' && (
                    <>
                        <div style={{ height: '450px' }}>
                            {regionData.length > 0 ? (
                                <Bar data={barChartData} options={options} />
                            ) : (
                                <div className="text-center py-5">
                                    <p className="text-muted">Aucune donnée de région disponible</p>
                                </div>
                            )}
                        </div>

                        {selectedRegion !== null && regionData[selectedRegion] && (
                            <div className="mt-4 p-3 bg-light rounded-3">
                                <h6 className="fw-bold mb-3">
                                    Détails pour la région: {regionData[selectedRegion].region}
                                </h6>
                                <div className="row">
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="h4 fw-bold text-success">
                                                {regionData[selectedRegion].actifs}
                                            </div>
                                            <small className="text-muted">Comptes Actifs</small>
                                            <div className="progress mt-2" style={{ height: '8px' }}>
                                                <div 
                                                    className="progress-bar bg-success" 
                                                    style={{ width: `${(regionData[selectedRegion].actifs / regionData[selectedRegion].total * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="h4 fw-bold text-danger">
                                                {regionData[selectedRegion].inactifs}
                                            </div>
                                            <small className="text-muted">Comptes Inactifs</small>
                                            <div className="progress mt-2" style={{ height: '8px' }}>
                                                <div 
                                                    className="progress-bar bg-danger" 
                                                    style={{ width: `${(regionData[selectedRegion].inactifs / regionData[selectedRegion].total * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="text-center">
                                            <div className="h4 fw-bold text-primary">
                                                {regionData[selectedRegion].total}
                                            </div>
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
                                <tr>
                                    <th>Région</th>
                                    <th className="text-center">Actifs</th>
                                    <th className="text-center">Inactifs</th>
                                    <th className="text-center">Total</th>
                                    <th className="text-center">Taux d'activité</th>
                                </tr>
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
                                                        <div 
                                                            className="progress-bar bg-success" 
                                                            style={{ width: `${taux}%` }}
                                                        ></div>
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

                {/* SECTION DES PIE CHARTS - Style 3D avec dégradés */}
                <div className="mt-5 pt-3">
                    <hr className="mb-4" />
                    <div className="d-flex align-items-center gap-2 mb-4">
                        <FaCity size={22} style={{ color: '#4361ee' }} />
                        <h5 className="fw-bold mb-0" style={{ color: '#0f172a' }}>
                            Analyse par Ville
                        </h5>
                        <span className="badge rounded-pill bg-secondary">Top 10</span>
                    </div>
                    
                    <div className="row g-4">
                        {/* Pie Chart 1: Villes avec clients actifs - Dégradés de vert */}
                        <div className="col-md-6">
                            <div className="card h-100 border-0 shadow-lg" style={{ 
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
                            }}>
                                <div className="card-header bg-white border-0 pt-3 pb-0" style={{ background: 'transparent' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle p-2" style={{ 
                                            backgroundColor: '#22c55e20',
                                            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
                                        }}>
                                            <FaUserCheck size={18} className="text-success" />
                                        </div>
                                        <h6 className="fw-bold mb-0" style={{ 
                                            background: 'linear-gradient(135deg, #22c55e, #15803d)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            Top Villes - Clients Actifs
                                        </h6>
                                    </div>
                                    <p className="text-muted small mt-1 mb-0">
                                        Répartition des comptes actifs par ville (Top 10)
                                    </p>
                                </div>
                                <div className="card-body">
                                    {topActiveCities.length > 0 ? (
                                        <div style={{ height: '400px' }}>
                                            <Pie 
                                                data={activeCitiesPieData} 
                                                options={createPieOptions(activeCitiesPieData, true)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Aucune donnée de ville active disponible</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Pie Chart 2: Villes avec clients inactifs - Dégradés de rouge */}
                        <div className="col-md-6">
                            <div className="card h-100 border-0 shadow-lg" style={{ 
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)'
                            }}>
                                <div className="card-header bg-white border-0 pt-3 pb-0" style={{ background: 'transparent' }}>
                                    <div className="d-flex align-items-center gap-2">
                                        <div className="rounded-circle p-2" style={{ 
                                            backgroundColor: '#ef444420',
                                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)'
                                        }}>
                                            <FaUserTimes size={18} className="text-danger" />
                                        </div>
                                        <h6 className="fw-bold mb-0" style={{ 
                                            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent'
                                        }}>
                                            Top Villes - Clients Inactifs
                                        </h6>
                                    </div>
                                    <p className="text-muted small mt-1 mb-0">
                                        Répartition des comptes inactifs par ville (Top 10)
                                    </p>
                                </div>
                                <div className="card-body">
                                    {topInactiveCities.length > 0 ? (
                                        <div style={{ height: '400px' }}>
                                            <Pie 
                                                data={inactiveCitiesPieData} 
                                                options={createPieOptions(inactiveCitiesPieData, false)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <p className="text-muted">Aucune donnée de ville inactive disponible</p>
                                        </div>
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