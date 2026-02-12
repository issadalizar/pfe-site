// productData.js - Données détaillées des produits CNC
// CORRIGÉ avec les chemins d'images correspondant à la structure réelle des dossiers

export const cncProductDetails = {
  // CNC Turning Machines - CORRIGÉ: "Turing" au lieu de "Turning"
  'De2-Ultra Mini CNC Turning Center': {
    title: 'De2-Ultra Mini CNC Turning Center',
    category: 'CNC Turing Machine', // CORRIGÉ
    mainCategory: 'CNC for Education',
    price: 8990,
    features: [
      'Trois modes sont disponibles : De2, De2-Pro, De2-Ultra',
      'Banc incliné avec changeur d\'outils automatique à 4 positions',
      'Mandrin à 3 mors et pinces de serrage inclus de série',
      'Accessoires bien organisés'
    ],
    fullDescription: 'Le De2-Ultra est un centre de tournage CNC miniaturisé parfait pour l\'enseignement. Sa conception compacte n\'enlève rien à ses performances professionnelles. Idéal pour initier les étudiants aux techniques de tournage CNC.',
    specifications: {
      'Modes disponibles': 'De2, De2-Pro, De2-Ultra',
      'Changeur d\'outils': 'Automatique à 4 positions',
      'Banc': 'Incliné',
      'Mandrin': '3 mors avec pinces de serrage',
      'Application': 'Enseignement et formation CNC'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turing Machine/De2-Ultra Mini CNC Turning Center.png', // CORRIGÉ
      '/images/products/CNC EDUCATION/CNC Turing Machine/De2-Ultra Mini CNC Turning Center-2.png', // CORRIGÉ
      '/images/products/CNC EDUCATION/CNC Turing Machine/De2-Ultra Mini CNC Turning Center-3.jpg' // CORRIGÉ
    ],
    technicalSpecs: {
      'Course axe X': '120 mm',
      'Course axe Z': '200 mm',
      'Vitesse de broche': '0-3000 tr/min',
      'Puissance moteur': '1.5 kW',
      'Précision': '±0.005 mm'
    }
  },
  
  'PC1 Baby CNC Lathe-Mach': {
    title: 'PC1 Baby CNC Lathe-Mach',
    category: 'CNC Turing Machine', // CORRIGÉ
    mainCategory: 'CNC for Education',
    price: 5490,
    features: [
      'Faible coût',
      'Volant manuel préinstallé',
      'Tour micro-CNC piloté par PC',
      'Arrêt automatique de l\'alimentation à l\'ouverture de la porte',
      'Idéal pour l\'enseignement et la formation',
      'Combine les modes CNC et manuel',
      '2 en 1 (CNC et manuel)'
    ],
    fullDescription: 'Le PC1 Baby CNC Lathe-Mach est une solution économique et pédagogique par excellence. Ce tour micro-CNC piloté par PC offre la flexibilité de fonctionner à la fois en mode CNC et en mode manuel, ce qui en fait un outil polyvalent pour l\'apprentissage progressif de l\'usinage CNC.',
    specifications: {
      'Type': 'Tour micro-CNC piloté par PC',
      'Modes': 'CNC et Manuel (2 en 1)',
      'Sécurité': 'Arrêt auto à l\'ouverture de porte',
      'Volant': 'Manuel préinstallé',
      'Application': 'Enseignement et formation'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turing Machine/PC1 Baby CNC Lathe-Mach.png', // CORRIGÉ
      '/images/products/CNC EDUCATION/CNC Turing Machine/PC1 Baby CNC Lathe-Mach-2.png' // CORRIGÉ
    ]
  },
  
  'De4-Eco (KC4S) Bench CNC Lathe': {
    title: 'De4-Eco (KC4S) Bench CNC Lathe',
    category: 'CNC Turing Machine', // CORRIGÉ
    mainCategory: 'CNC for Education',
    price: 7490,
    features: [
      'Système CNC basé sur PC, haute fiabilité, utilisation simple',
      'Connexion au PC via câble réseau',
      'Moteur pas à pas 2 axes de haute qualité, moteur brushless à couple élevé',
      'Broche métrique MT3',
      'Porte-outils automatique à 4 positions',
      'Glissières de guidage haute résistance'
    ],
    fullDescription: 'Le De4-Eco (KC4S) est un tour CNC d\'établi robuste et fiable, conçu pour un usage intensif en environnement éducatif. Sa connexion réseau simplifiée et son interface intuitive permettent une prise en main rapide par les étudiants.',
    specifications: {
      'Système CNC': 'Basé sur PC, connexion réseau',
      'Broche': 'Métrique MT3',
      'Porte-outils': 'Automatique 4 positions',
      'Moteurs': 'Pas à pas 2 axes, brushless couple élevé',
      'Glissières': 'Haute résistance'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turing Machine/De4-Eco (KC4S) Bench CNC Lathe.png' // CORRIGÉ
    ]
  },
  
  'De6 (iKC6S) CNC Turning Machine': {
    title: 'De6 (iKC6S) CNC Turning Machine',
    category: 'CNC Turing Machine', // CORRIGÉ
    mainCategory: 'CNC for Education',
    price: 12990,
    features: [
      'Changeur d\'outils automatique à 8 positions',
      'Banc incliné avec couvercle de protection',
      'Rails linéaires de très haute précision',
      'Certification de sécurité CE'
    ],
    fullDescription: 'La De6 (iKC6S) est une machine de tournage CNC professionnelle avec changeur d\'outils 8 positions. Sa construction robuste avec rails linéaires haute précision et banc incliné garantit une excellente stabilité et précision d\'usinage. Certifiée CE pour une sécurité optimale.',
    specifications: {
      'Changeur d\'outils': 'Automatique 8 positions',
      'Banc': 'Incliné avec protection',
      'Rails': 'Linéaires très haute précision',
      'Certification': 'CE',
      'Application': 'Usinage professionnel et formation avancée'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turing Machine/De6 (iKC6S) CNC Turning Machine.png' // CORRIGÉ
    ]
  },
  
  'De4-Pro (iKC4) Bench CNC Lathe': {
    title: 'De4-Pro (iKC4) Bench CNC Lathe',
    category: 'CNC Turing Machine', // CORRIGÉ
    mainCategory: 'CNC for Education',
    price: 10990,
    features: [
      'Changeur d\'outils à 8 stations',
      'Glissière inclinée',
      'Rails linéaires de très haute précision',
      'Certificat CE'
    ],
    fullDescription: 'Le De4-Pro (iKC4) est la version professionnelle du tour d\'établi CNC, équipé d\'un changeur d\'outils 8 stations et de rails linéaires haute précision. Sa glissière inclinée facilite l\'évacuation des copeaux et améliore l\'accessibilité.',
    specifications: {
      'Changeur d\'outils': '8 stations',
      'Glissière': 'Inclinée',
      'Rails': 'Linéaires très haute précision',
      'Certification': 'CE'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turing Machine/De4-Pro (iKC4) Bench CNC Lathe.png' // CORRIGÉ
    ]
  },
  
  'De6-Eco (KC6S) Bench CNC Lathe': {
    title: 'De6-Eco (KC6S) Bench CNC Lathe',
    category: 'CNC Turing Machine', // CORRIGÉ
    mainCategory: 'CNC for Education',
    price: 8990,
    features: [
      'Diamètre maximal d\'usinage au-dessus du banc : 260 mm',
      'Distance maximale entre pointes : 550 mm',
      'Système CNC basé sur PC, haute fiabilité, utilisation simple',
      'Connexion au PC via câble réseau',
      'Tourelle porte-outils automatique à 4 positions',
      'Glissières haute résistance',
      'Certification de sécurité CE'
    ],
    fullDescription: 'Le De6-Eco (KC6S) est un tour CNC d\'établi offrant une capacité d\'usinage supérieure avec un diamètre max de 260 mm et une distance entre pointes de 550 mm. Parfait pour les projets pédagogiques de plus grande envergure.',
    specifications: {
      'Diamètre max d\'usinage': '260 mm',
      'Distance entre pointes': '550 mm',
      'Système CNC': 'Basé sur PC, connexion réseau',
      'Tourelle porte-outils': 'Automatique 4 positions',
      'Glissières': 'Haute résistance',
      'Certification': 'CE'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turing Machine/De6-Eco (KC6S) Bench CNC Lathe.jpeg' // CORRIGÉ
    ]
  },
  
  'De8 (iKC8) CNC Turning Machine': {
    title: 'De8 (iKC8) CNC Turning Machine',
    category: 'CNC Turing Machine', // CORRIGÉ
    mainCategory: 'CNC for Education',
    price: 18990,
    features: [
      'Bâti monobloc en fonte',
      'Structure de broche A2-5 et moteur de broche de 4 kW',
      'Les axes X/Z sont équipés de guides linéaires et de vis à billes de haute précision',
      'Magasin d\'outils électrique à 8 positions',
      'Banc incliné à 35°',
      'Plusieurs systèmes CNC tels que Siemens, FANUC, GSK et HNC peuvent être installés en option'
    ],
    fullDescription: 'La De8 (iKC8) est une machine de tournage CNC haut de gamme avec bâti monobloc en fonte pour une rigidité maximale. Son moteur de broche 4 kW et son magasin d\'outils électrique 8 positions en font un outil professionnel pour les formations avancées. Compatible avec les principaux systèmes CNC (Siemens, FANUC, etc.).',
    specifications: {
      'Bâti': 'Monobloc en fonte',
      'Broche': 'Structure A2-5, moteur 4 kW',
      'Axes X/Z': 'Guides linéaires + vis à billes haute précision',
      'Magasin d\'outils': 'Électrique 8 positions',
      'Banc': 'Incliné 35°',
      'Systèmes CNC optionnels': 'Siemens, FANUC, GSK, HNC'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turing Machine/De8 (iKC8) CNC Turning Machine.png' // CORRIGÉ
    ]
  },

  // CNC Milling Machines - Chemins déjà corrects
  'Fa2-Ultra Mini CNC Milling Center': {
    title: 'Fa2-Ultra Mini CNC Milling Center',
    category: 'CNC Milling Machine',
    mainCategory: 'CNC for Education',
    price: 8490,
    features: [
      'Trois modes sont disponibles : Fa2, Fa2-Pro, Fa2-Ultra',
      'Usinage à grande vitesse de 5000 tr/min pour une surface lisse',
      'Changeur d\'outils automatique à 2 stations pour un changement d\'outil rapide',
      'Structure interne du centre d\'usinage',
      'Accessoires bien organisés'
    ],
    fullDescription: 'Le Fa2-Ultra est un centre de fraisage CNC miniaturisé avec usinage à grande vitesse (5000 tr/min). Sa structure de centre d\'usinage et son changeur d\'outils automatique en font un outil idéal pour l\'apprentissage professionnel de la fabrication numérique.',
    specifications: {
      'Modes disponibles': 'Fa2, Fa2-Pro, Fa2-Ultra',
      'Vitesse de broche': '5000 tr/min',
      'Changeur d\'outils': 'Automatique 2 stations',
      'Structure': 'Centre d\'usinage',
      'Finition': 'Surface lisse'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Milling Machine/Fa2-Ultra Mini CNC Milling Center.png'
    ]
  },
  
  'PX1 Baby CNC Milling Machine': {
    title: 'PX1 Baby CNC Milling Machine',
    category: 'CNC Milling Machine',
    mainCategory: 'CNC for Education',
    price: 5990,
    features: [
      'Machine CNC 2 en 1 (mode automatique et manuel)',
      'Boîtier transparent',
      'Vitesse de rotation élevée de 20 000 tr/min',
      'Fraiseuse micro-CNC pilotée par PC',
      'Arrêt automatique de l\'alimentation à l\'ouverture de la porte',
      'Idéale pour l\'enseignement et la formation'
    ],
    fullDescription: 'La PX1 Baby CNC Milling Machine est une fraiseuse micro-CNC polyvalente avec boîtier transparent pour une visualisation pédagogique optimale. Sa vitesse de rotation de 20 000 tr/min permet l\'usinage de précision de petites pièces. Le mode 2-en-1 (CNC/manuel) facilite l\'apprentissage progressif.',
    specifications: {
      'Type': 'Fraiseuse micro-CNC pilotée par PC',
      'Modes': 'Automatique et Manuel (2 en 1)',
      'Vitesse': '20 000 tr/min',
      'Boîtier': 'Transparent pour visualisation',
      'Sécurité': 'Arrêt auto à l\'ouverture de porte',
      'Application': 'Enseignement et formation'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Milling Machine/PX1 Baby CNC Milling Machine.png'
    ]
  },
  
  'Fa4-Eco (KX1S) CNC Milling Machine': {
    title: 'Fa4-Eco (KX1S) CNC Milling Machine',
    category: 'CNC Milling Machine',
    mainCategory: 'CNC for Education',
    price: 6990,
    features: [
      'Système CNC basé sur PC, haute fiabilité, utilisation simple',
      'Connexion au PC via câble réseau',
      'Interface rapide 4 axes préinstallée',
      'Interface rapide pour volant de commande préinstallée',
      'Le meilleur choix pour les bricoleurs et les amateurs',
      'Certification de sécurité CE'
    ],
    fullDescription: 'La Fa4-Eco (KX1S) est une fraiseuse CNC d\'établi accessible et fiable, parfaite pour les amateurs et l\'initiation. Son interface 4 axes préinstallée et sa connexion réseau en font un outil moderne et facile à utiliser.',
    specifications: {
      'Système CNC': 'Basé sur PC, connexion réseau',
      'Interface': '4 axes préinstallée',
      'Volant': 'Interface rapide préinstallée',
      'Application': 'Bricoleurs, amateurs, initiation',
      'Certification': 'CE'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Milling Machine/Fa4-Eco (KX1S) CNC Milling Machine.png'
    ]
  },
  
  'Fa4 (iKX1) CNC Milling Center': {
    title: 'Fa4 (iKX1) CNC Milling Center',
    category: 'CNC Milling Machine',
    mainCategory: 'CNC for Education',
    price: 9990,
    features: [
      'Changeur d\'outils automatique à 4 positions',
      'Boîtier transparent',
      'Système CNC basé sur PC, haute fiabilité',
      'Interface rapide 4 axes préinstallée',
      'Interface rapide pour volant de commande manuel préinstallée',
      'Idéal pour la petite production et la formation'
    ],
    fullDescription: 'Le Fa4 (iKX1) est un centre de fraisage CNC compact avec changeur d\'outils 4 positions et boîtier transparent. Idéal pour la petite production et la formation professionnelle, il combine performance et visibilité pédagogique.',
    specifications: {
      'Changeur d\'outils': 'Automatique 4 positions',
      'Boîtier': 'Transparent',
      'Système CNC': 'Basé sur PC',
      'Interface': '4 axes préinstallée',
      'Volant': 'Interface manuelle préinstallée',
      'Application': 'Petite production, formation'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Milling Machine/Fa4 (iKX1) CNC Milling Center.png'
    ]
  },
  
  'Fa6-Eco (KX3S) CNC Milling Machine': {
    title: 'Fa6-Eco (KX3S) CNC Milling Machine',
    category: 'CNC Milling Machine',
    mainCategory: 'CNC for Education',
    price: 11990,
    features: [
      'Capacité de perçage : 25 mm',
      'Dimensions de la table de travail : 550 x 160 mm',
      'Système CNC basé sur PC, haute fiabilité',
      'Système de lubrification automatique, prolongeant la durée de vie des rails',
      'Moteur pas à pas 3 axes de haute qualité, moteur sans balais à couple élevé'
    ],
    fullDescription: 'La Fa6-Eco (KX3S) est une fraiseuse CNC robuste avec une capacité de perçage de 25 mm et une table de travail généreuse (550x160 mm). Son système de lubrification automatique garantit une longue durée de vie et une fiabilité exceptionnelle.',
    specifications: {
      'Capacité de perçage': '25 mm',
      'Table de travail': '550 x 160 mm',
      'Système CNC': 'Basé sur PC',
      'Lubrification': 'Automatique',
      'Moteurs': 'Pas à pas 3 axes, brushless couple élevé'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Milling Machine/Fa6-Eco (KX3S) CNC Milling Machine.png'
    ]
  },
  
  'Fa6 (iKX3) CNC Milling Center': {
    title: 'Fa6 (iKX3) CNC Milling Center',
    category: 'CNC Milling Machine',
    mainCategory: 'CNC for Education',
    price: 14990,
    features: [
      'Changeur d\'outils automatique à 2 positions',
      'Boîtier transparent',
      'Système CNC basé sur PC, haute fiabilité',
      'Interface rapide 4 axes préinstallée',
      'Interface rapide pour volant de commande préinstallée',
      'Idéal pour la petite production et la formation'
    ],
    fullDescription: 'Le Fa6 (iKX3) est un centre de fraisage CNC avec changeur d\'outils 2 positions et boîtier transparent. Sa conception robuste et ses interfaces multiples en font un outil polyvalent pour la formation et la petite production.',
    specifications: {
      'Changeur d\'outils': 'Automatique 2 positions',
      'Boîtier': 'Transparent',
      'Système CNC': 'Basé sur PC',
      'Interface': '4 axes préinstallée',
      'Volant': 'Interface rapide préinstallée',
      'Application': 'Petite production, formation'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Milling Machine/Fa6 (iKX3) CNC Milling Center.jpeg'
    ]
  },
  
  'Fa8 (iKX5) CNC Milling Center': {
    title: 'Fa8 (iKX5) CNC Milling Center',
    category: 'CNC Milling Machine',
    mainCategory: 'CNC for Education',
    price: 22990,
    features: [
      'Structure à banc vertical',
      'Moteur de broche servo d\'une puissance de 2,2 kW',
      'Vis à billes de précision C3 avec précharge à double écrou',
      'Équipé d\'un magasin d\'outils à 12 positions, le changement d\'outil est précis et fiable',
      'Plusieurs systèmes CNC tels que Siemens, FANUC, Guangshu et Huazhong peuvent être installés en option'
    ],
    fullDescription: 'Le Fa8 (iKX5) est un centre de fraisage CNC professionnel à banc vertical. Équipé d\'un moteur servo 2,2 kW et d\'un magasin d\'outils 12 positions, il offre des performances industrielles pour les formations avancées. Compatible avec Siemens, FANUC et autres systèmes CNC.',
    specifications: {
      'Structure': 'Banc vertical',
      'Moteur broche': 'Servo 2,2 kW',
      'Vis à billes': 'Précision C3, précharge double écrou',
      'Magasin d\'outils': '12 positions',
      'Systèmes CNC optionnels': 'Siemens, FANUC, Guangshu, Huazhong'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Milling Machine/Fa8 (iKX5) CNC Milling Center.png'
    ]
  },

  // CNC Turn-Mill Center
  'X60Y CNC Turn-Mill Center': {
    title: 'X60Y CNC Turn-Mill Center',
    category: 'CNC Turn-Mill Center',
    mainCategory: 'CNC for Education',
    price: 27990,
    features: [
      'Les pièces moulées de la machine-outil sont fabriquées en HT300. La conception intègre une technologie d\'analyse par éléments finis avancée',
      'La machine-outil est équipée d\'une broche auxiliaire, permettant l\'accouplement des deux broches',
      'Des guides linéaires à rouleaux sont utilisés dans les directions X, Z1 et Z2',
      'Les deux broches sont des broches motorisées de précision',
      'La machine-outil est équipée d\'une tourelle porte-outils motorisée à 12 positions avec axe Y',
      'Les vis à billes des 3 axes sont des vis à billes de précision importées',
      'La machine-outil est conçue avec deux options d\'évacuation des copeaux : latérale et arrière'
    ],
    fullDescription: 'Le X60Y est un centre de tournage-fraisage combiné haut de gamme, capable d\'usiner des pièces complexes en une seule opération. Sa broche auxiliaire et sa tourelle motorisée 12 positions avec axe Y permettent le fraisage, le perçage et le taraudage en complément du tournage. Conception par éléments finis et composants de précision importés.',
    specifications: {
      'Structure': 'Moulage HT300, analyse éléments finis',
      'Broches': 'Principale + auxiliaire, motorisées précision',
      'Guides': 'Linéaires à rouleaux X, Z1, Z2',
      'Tourelle': 'Motorisée 12 positions avec axe Y',
      'Vis à billes': 'Importées précision 3 axes',
      'Évacuation copeaux': 'Latérale ou arrière'
    },
    images: [
      '/images/products/CNC EDUCATION/CNC Turn-Mill Center/X60Y CNC Turn-Mill Center.png'
    ]
  },

  // 5-axis Machining Centers
  'ECO1 5-axis Milling Machine': {
    title: 'ECO1 5-axis Milling Machine',
    category: '5-axis Machining Center',
    mainCategory: 'CNC for Education',
    price: 15990,
    features: [
      'Prise en charge de l\'interpolation à 5 axes',
      'Prise en charge des fonctions RTCP et 3+2',
      'Prise en charge de la fonction d\'encodeur à valeur absolue',
      'Prise en charge du retour d\'information de l\'encodeur et de la règle de mesure',
      'Compensation des erreurs de pas',
      'Ajout de la fonction d\'avance à double vitesse',
      'Prise en charge de la prévisualisation du traitement graphique 3D au format STL',
      'Compatibilité directe avec les programmes d\'usinage des systèmes SIEMENS, HEIDENHAIN, FANUC, SYNTEC, GSK et HNC'
    ],
    fullDescription: 'L\'ECO1 est une fraiseuse 5 axes d\'entrée de gamme offrant des fonctionnalités avancées comme le RTCP et l\'usinage 3+2. Idéale pour découvrir les techniques d\'usinage multi-axes, elle est compatible avec tous les principaux langages CNC. La prévisualisation 3D STL facilite la programmation et l\'apprentissage.',
    specifications: {
      'Axes': '5 axes interpolation, RTCP, 3+2',
      'Encodeur': 'Valeur absolue, retour information',
      'Compensation': 'Erreurs de pas',
      'Avance': 'Double vitesse',
      'Prévisualisation': '3D STL',
      'Compatibilité': 'SIEMENS, HEIDENHAIN, FANUC, SYNTEC, GSK, HNC'
    },
    images: [
      '/images/products/CNC EDUCATION/5-axis Machining Center/ECO1 5-axis Milling Machine.png'
    ]
  },
  
  'ECO1-Pro 5-axis Milling Machine': {
    title: 'ECO1-Pro 5-axis Milling Machine',
    category: '5-axis Machining Center',
    mainCategory: 'CNC for Education',
    price: 19990,
    features: [
      'Banc rigide intégré en fonte avec structure AC',
      'Broche électrique à grande vitesse',
      'Vis à billes et rails de guidage de haute qualité',
      'Système 5 axes SIEG développé en interne, offrant un excellent rapport qualité-prix',
      'Fonctions multiples : compensation RTCP/longueur d\'outil/décalage du système de coordonnées/usinage de surfaces inclinées'
    ],
    fullDescription: 'L\'ECO1-Pro est une fraiseuse 5 axes avec structure AC en fonte, conçue pour un excellent rapport qualité-prix. Le système 5 axes SIEG développé en interne offre toutes les fonctionnalités professionnelles (RTCP, compensation longueur d\'outil, usinage de surfaces inclinées) à un coût maîtrisé.',
    specifications: {
      'Structure': 'Banc fonte intégré AC',
      'Broche': 'Électrique grande vitesse',
      'Guidage': 'Vis à billes + rails haute qualité',
      'Système': '5 axes SIEG propriétaire',
      'Fonctions': 'RTCP, compensation longueur, décalage coordonnées, usinage surfaces inclinées'
    },
    images: [
      '/images/products/CNC EDUCATION/5-axis Machining Center/ECO1-Pro 5-axis Milling Machine.png'
    ]
  },
  
  'ECO2 5-axis Milling Machine': {
    title: 'ECO2 5-axis Milling Machine',
    category: '5-axis Machining Center',
    mainCategory: 'CNC for Education',
    price: 24990,
    features: [
      'Banc monobloc moulé avec structure BC',
      'Broche électrique à changement d\'outil automatique BT30',
      'Vis à billes et rails de guidage de haute qualité (marque taïwanaise)',
      'Magasin d\'outils circulaire BT30 à 6 stations',
      'Système 5 axes SIEG économique, offrant un excellent rapport qualité-prix',
      'Nombreuses fonctions clés : compensation de longueur d\'outil, correction de trajectoire, décalage du système de coordonnées et usinage de surfaces inclinées'
    ],
    fullDescription: 'L\'ECO2 est une fraiseuse 5 axes avec changeur d\'outils automatique BT30 et magasin circulaire 6 positions. Sa structure BC en fonte monobloc et ses composants de guidage taïwanais assurent robustesse et précision. Parfait pour les formations exigeantes et la petite production.',
    specifications: {
      'Structure': 'Banc monobloc moulé BC',
      'Broche': 'Électrique BT30, changement auto',
      'Guidage': 'Vis à billes + rails taïwanais',
      'Magasin': 'Circulaire BT30, 6 stations',
      'Système': '5 axes SIEG économique',
      'Fonctions': 'Compensation longueur, correction trajectoire, décalage coordonnées, usinage surfaces inclinées'
    },
    images: [
      '/images/products/CNC EDUCATION/5-axis Machining Center/ECO2 5-axis Milling Machine.png'
    ]
  },
  
  'W150 5-axis Machining Center': {
    title: 'W150 5-axis Machining Center',
    category: '5-axis Machining Center',
    mainCategory: 'CNC for Education',
    price: 32990,
    features: [
      'Modèle : Machine CNC 5 axes W150',
      'Structure : Portique mobile, type berceau AC, cinq axes',
      'Secteur d\'application : Usinage des métaux',
      'Méthode d\'usinage : Gravure et fraisage',
      'Matériaux usinés : Cuivre, aluminium, métaux tendres, plastique, bois, métaux non trempés, acier à moules, acier inoxydable'
    ],
    fullDescription: 'Le W150 est un centre d\'usinage 5 axes à portique mobile, conçu pour l\'usinage polyvalent des métaux. Sa structure berceau AC permet une grande flexibilité. Capable d\'usiner une large gamme de matériaux, du plastique à l\'acier inoxydable.',
    specifications: {
      'Modèle': 'W150',
      'Structure': 'Portique mobile, berceau AC 5 axes',
      'Application': 'Usinage métaux',
      'Méthodes': 'Gravure, fraisage',
      'Matériaux': 'Cuivre, aluminium, métaux tendres, plastique, bois, métaux non trempés, acier à moules, acier inoxydable'
    },
    images: [
      '/images/products/CNC EDUCATION/5-axis Machining Center/W150 5-axis Machining Center.png'
    ]
  },
  
  'W250 5-axis Machining Center': {
    title: 'W250 5-axis Machining Center',
    category: '5-axis Machining Center',
    mainCategory: 'CNC for Education',
    price: 39990,
    features: [
      'Modèle : Machine CNC 5 axes W250',
      'Structure : Portique mobile, type berceau AC, cinq axes',
      'Secteur d\'application : Usinage des métaux',
      'Méthode d\'usinage : Gravure et fraisage',
      'Matériaux usinés : Cuivre, aluminium, métaux tendres, plastique, bois, métaux non trempés, acier à moules, acier inoxydable'
    ],
    fullDescription: 'Le W250 est un centre d\'usinage 5 axes de taille moyenne à portique mobile. Idéal pour les projets pédagogiques nécessitant une capacité d\'usinage plus importante. Polyvalent et robuste, il traite tous types de matériaux.',
    specifications: {
      'Modèle': 'W250',
      'Structure': 'Portique mobile, berceau AC 5 axes',
      'Application': 'Usinage métaux',
      'Méthodes': 'Gravure, fraisage',
      'Matériaux': 'Cuivre, aluminium, métaux tendres, plastique, bois, métaux non trempés, acier à moules, acier inoxydable'
    },
    images: [
      '/images/products/CNC EDUCATION/5-axis Machining Center/W250 5-axis Machining Center.png'
    ]
  },
  
  'W350 5-axis Machining Center': {
    title: 'W350 5-axis Machining Center',
    category: '5-axis Machining Center',
    mainCategory: 'CNC for Education',
    price: 49990,
    features: [
      'Modèle : Machine CNC 5 axes W350',
      'Structure : Portique mobile, type berceau AC, cinq axes',
      'Secteur d\'application : Usinage des métaux',
      'Méthode d\'usinage : Gravure et fraisage',
      'Matériaux usinés : Cuivre, aluminium, métaux tendres, plastique, bois, métaux non trempés, acier à moules, acier inoxydable'
    ],
    fullDescription: 'Le W350 est le plus grand centre d\'usinage 5 axes à portique mobile de la série. Offrant une capacité maximale, il est adapté aux projets complexes et aux pièces de grandes dimensions. Même polyvalence et robustesse que les modèles W150 et W250.',
    specifications: {
      'Modèle': 'W350',
      'Structure': 'Portique mobile, berceau AC 5 axes',
      'Application': 'Usinage métaux',
      'Méthodes': 'Gravure, fraisage',
      'Matériaux': 'Cuivre, aluminium, métaux tendres, plastique, bois, métaux non trempés, acier à moules, acier inoxydable'
    },
    images: [
      '/images/products/CNC EDUCATION/5-axis Machining Center/W350 5-axis Machining Center.png'
    ]
  }
};

// Fonction utilitaire pour récupérer les détails d'un produit par son nom
// VERSION AMÉLIORÉE avec gestion des erreurs de nommage
export const getProductDetails = (productName) => {
  // Nettoyer le nom pour la recherche
  const cleanName = productName?.trim();
  
  // Recherche exacte d'abord
  if (cncProductDetails[cleanName]) {
    return cncProductDetails[cleanName];
  }
  
  // CORRECTION: Remplacer '65' par '6S' pour l'erreur fréquente
  const correctedName65 = cleanName?.replace('iKC65', 'iKC6S');
  if (correctedName65 && cncProductDetails[correctedName65]) {
    return cncProductDetails[correctedName65];
  }
  
  // CORRECTION: Remplacer 'Turning' par 'Turing' pour correspondre au dossier
  const correctedNameTurning = cleanName?.replace('CNC Turning Machine', 'CNC Turing Machine');
  if (correctedNameTurning && cncProductDetails[correctedNameTurning]) {
    return cncProductDetails[correctedNameTurning];
  }
  
  // Recherche approximative
  for (const [key, details] of Object.entries(cncProductDetails)) {
    if (cleanName?.includes(key) || key.includes(cleanName || '')) {
      return details;
    }
  }
  
  return null;
};