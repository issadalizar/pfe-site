import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert,
  CircularProgress,
  Button,
  IconButton
} from '@mui/material';
import { FaArrowLeft } from 'react-icons/fa'; // Remplacer ArrowBackIcon par FaArrowLeft
import ProductViewer3D from '../components/ProductViewer3D';

const Product3DPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Décoder le nom du produit
        const decodedProductId = decodeURIComponent(productId);
        console.log("🔍 Recherche du produit:", decodedProductId);
        
        // En dev: passer par le proxy Vite (/api -> backend) pour éviter les erreurs réseau / page blanche
        const isDev = import.meta.env.DEV;
        const API_BASE = isDev ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

        // Récupérer les infos du produit depuis l'API
        const productResponse = await axios.get(`${API_BASE}/product-data/details/${encodeURIComponent(decodedProductId)}`);
        console.log("✅ Produit trouvé:", productResponse.data);
        // L'API renvoie { success, data } → on garde la structure mais on extrait data
        setProduct(productResponse.data?.data ?? productResponse.data);

        // Récupérer le modèle 3D
        try {
          const modelResponse = await axios.get(`${API_BASE}/models3d/product/${encodeURIComponent(decodedProductId)}`);
          console.log("✅ Modèle 3D:", modelResponse.data);
          setModelData(modelResponse.data);
        } catch (modelErr) {
          console.log("ℹ️ Pas de modèle 3D pour ce produit");
          setModelData({ has3DModel: false });
        }
        
        setError(null);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError('Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    if (!productId || String(productId).trim() === '') {
      setError('Produit non trouvé');
      setLoading(false);
      return;
    }

    if (productId) {
      fetchData();
    }
  }, [productId]);

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Box textAlign="center">
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Chargement de la visualisation 3D...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert 
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleGoBack}>
              Retour
            </Button>
          }
        >
          {error || 'Produit non trouvé'}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: '#0a0a1a', minHeight: '100vh' }}>
      {/* Header */}
      <Paper 
        sx={{ 
          borderRadius: 0, 
          bgcolor: 'rgba(10,10,26,0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 2
        }}
        elevation={0}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleGoBack}
              sx={{ 
                color: 'white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
              }}
            >
              <FaArrowLeft /> {/* Remplacé ArrowBackIcon par FaArrowLeft */}
            </IconButton>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Visualisation 3D
            </Typography>
            <Chip 
              label={product.title}
              sx={{ 
                ml: 'auto',
                bgcolor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            />
          </Box>
        </Container>
      </Paper>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Visualisation 3D */}
          <Grid item xs={12} md={8}>
            <Paper 
              sx={{ 
                height: '600px', 
                overflow: 'hidden',
                bgcolor: '#111122',
                borderRadius: 2,
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <ProductViewer3D product={product} modelData={modelData} />
            </Paper>
          </Grid>

          {/* Informations produit */}
          <Grid item xs={12} md={4}>
            <Paper 
              sx={{ 
                p: 3, 
                height: '600px', 
                overflow: 'auto',
                bgcolor: 'rgba(20,20,40,0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white'
              }}
            >
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#fff' }}>
                {product.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <Chip 
                  label={product.category} 
                  size="small"
                  sx={{ bgcolor: '#4361ee', color: 'white' }}
                />
                <Chip 
                  label={product.mainCategory} 
                  size="small"
                  sx={{ bgcolor: '#f72585', color: 'white' }}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Description
              </Typography>
              <Typography paragraph sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {product.fullDescription}
              </Typography>

              <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />

              <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                Caractéristiques
              </Typography>
              <List dense>
                {product.features?.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemText 
                      primary={feature} 
                      sx={{ color: 'rgba(255,255,255,0.7)' }}
                    />
                  </ListItem>
                ))}
              </List>

              {product.specifications && (
                <>
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                  <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>
                    Spécifications
                  </Typography>
                  <Box sx={{ display: 'grid', gap: 1 }}>
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {key}:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 'medium' }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}

              {!modelData?.has3DModel && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mt: 3,
                    bgcolor: 'rgba(33, 150, 243, 0.1)',
                    color: '#90caf9',
                    border: '1px solid rgba(33, 150, 243, 0.3)'
                  }}
                >
                  ℹ️ Pas de modèle 3D disponible pour ce produit. Affichage d'une représentation générique.
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Product3DPage;