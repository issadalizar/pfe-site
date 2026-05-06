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
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { FaArrowLeft, FaShare, FaExpand } from 'react-icons/fa';
import ProductViewer3D from '../components/ProductViewer3D';

const Product3DPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const decodedProductId = decodeURIComponent(productId);

        const isDev = import.meta.env.DEV;
        const API_BASE = isDev
          ? '/api'
          : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

        const productResponse = await axios.get(
          `${API_BASE}/product-data/details/${encodeURIComponent(decodedProductId)}`
        );
        setProduct(productResponse.data?.data ?? productResponse.data);

        // Optionnel: tenter de récupérer les infos du modèle 3D spécifique
        try {
          const modelResponse = await axios.get(
            `${API_BASE}/models3d/product/${encodeURIComponent(decodedProductId)}`
          );
          setModelData(modelResponse.data);
        } catch {
          // Pas d'erreur, on utilise simplement le fallback
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

    fetchData();
  }, [productId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#f0f0f5' }}>
        <Box textAlign="center">
          <CircularProgress sx={{ color: '#4361ee' }} />
          <Typography sx={{ mt: 2, color: 'rgba(0,0,0,0.5)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
            Chargement…
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate(-1)}>
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
    <Box sx={{ bgcolor: '#f0f0f5', minHeight: '100vh', fontFamily: "'Syne', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');`}</style>

      {/* ── Top bar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
          py: 1.5,
          px: { xs: 2, md: 4 },
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            color: '#333',
            bgcolor: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '10px',
            width: 38, height: 38,
            '&:hover': { bgcolor: 'rgba(67,97,238,0.1)', borderColor: '#4361ee' },
          }}
        >
          <FaArrowLeft size={14} />
        </IconButton>

        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.4)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 10 }}>
            Configurateur 3D
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#111', fontWeight: 700, lineHeight: 1.1, fontFamily: 'Syne, sans-serif' }}>
            {product.title}
          </Typography>
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          {product.category && (
            <Chip
              label={product.category}
              size="small"
              sx={{ bgcolor: 'rgba(67,97,238,0.12)', color: '#4361ee', border: '1px solid rgba(67,97,238,0.2)', fontSize: 11 }}
            />
          )}
          {product.mainCategory && (
            <Chip
              label={product.mainCategory}
              size="small"
              sx={{ bgcolor: 'rgba(247,37,133,0.1)', color: '#c2185b', border: '1px solid rgba(247,37,133,0.2)', fontSize: 11 }}
            />
          )}
        </Box>

        <IconButton sx={{ color: 'rgba(0,0,0,0.4)', '&:hover': { color: '#333' } }}>
          <FaShare size={14} />
        </IconButton>
      </Box>

      {/* ── Content ── */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid container spacing={3}>

          {/* ── 3D Viewer ── */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                height: fullscreen ? '85vh' : { xs: 380, sm: 500, md: 620 },
                overflow: 'hidden',
                bgcolor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid rgba(0,0,0,0.08)',
                position: 'relative',
                transition: 'height 0.4s ease',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              }}
            >
              <ProductViewer3D 
                product={product} 
                modelData={modelData} 
                useGenericFallback={true} 
              />

              {/* Fullscreen toggle */}
              <IconButton
                onClick={() => setFullscreen(v => !v)}
                sx={{
                  position: 'absolute', 
                  bottom: 16, 
                  right: 16,
                  color: 'rgba(0,0,0,0.5)',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '8px', 
                  zIndex: 20,
                  '&:hover': { 
                    color: '#fff', 
                    bgcolor: '#4361ee' 
                  },
                }}
              >
                <FaExpand size={12} />
              </IconButton>
            </Paper>
          </Grid>

          {/* ── Product Info Panel ── */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                height: { xs: 'auto', lg: fullscreen ? '85vh' : 620 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                bgcolor: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '16px',
                color: '#1a1a2e',
                p: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 800, 
                  color: '#1a1a2e', 
                  fontFamily: 'Syne, sans-serif', 
                  lineHeight: 1.2,
                  mb: 2
                }}
              >
                {product.title}
              </Typography>

              {product.price && (
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 800, 
                    color: '#4361ee', 
                    fontFamily: 'Syne, sans-serif',
                    mb: 3
                  }}
                >
                  {product.price}
                </Typography>
              )}

              <Box sx={{ display: 'flex', gap: 1.5, width: '100%', maxWidth: 300, mx: 'auto' }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(135deg, #4361ee, #7209b7)',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '10px',
                    py: 1.4,
                    fontFamily: 'Syne, sans-serif',
                    textTransform: 'none',
                    fontSize: 14,
                    boxShadow: '0 4px 20px rgba(67,97,238,0.3)',
                    '&:hover': { boxShadow: '0 6px 28px rgba(67,97,238,0.5)' },
                  }}
                >
                  Ajouter au panier
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(0,0,0,0.2)',
                    color: 'rgba(0,0,0,0.6)',
                    borderRadius: '10px',
                    px: 2.5,
                    fontFamily: 'Syne, sans-serif',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#4361ee', color: '#4361ee' },
                  }}
                >
                  ♡
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Product3DPage;