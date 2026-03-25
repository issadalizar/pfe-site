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
  IconButton,
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

        try {
          const modelResponse = await axios.get(
            `${API_BASE}/models3d/product/${encodeURIComponent(decodedProductId)}`
          );
          setModelData(modelResponse.data);
        } catch {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#0d0d1f' }}>
        <Box textAlign="center">
          <CircularProgress sx={{ color: '#4361ee' }} />
          <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>
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
    <Box sx={{ bgcolor: '#0d0d1f', minHeight: '100vh', fontFamily: "'Syne', sans-serif" }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');`}</style>

      {/* ── Top bar ── */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'rgba(13,13,31,0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
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
            color: 'white',
            bgcolor: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            width: 38, height: 38,
            '&:hover': { bgcolor: 'rgba(67,97,238,0.25)', borderColor: '#4361ee' },
          }}
        >
          <FaArrowLeft size={14} />
        </IconButton>

        <Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase', fontSize: 10 }}>
            Configurateur 3D
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.1, fontFamily: 'Syne, sans-serif' }}>
            {product.title}
          </Typography>
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
          <Chip
            label={product.category}
            size="small"
            sx={{ bgcolor: 'rgba(67,97,238,0.25)', color: '#99aaff', border: '1px solid rgba(67,97,238,0.4)', fontSize: 11 }}
          />
          <Chip
            label={product.mainCategory}
            size="small"
            sx={{ bgcolor: 'rgba(247,37,133,0.2)', color: '#ff88cc', border: '1px solid rgba(247,37,133,0.3)', fontSize: 11 }}
          />
        </Box>

        <IconButton sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}>
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
                bgcolor: '#111125',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                position: 'relative',
                transition: 'height 0.4s ease',
              }}
            >
              <ProductViewer3D product={product} modelData={modelData} />

              {/* Fullscreen toggle */}
              <IconButton
                onClick={() => setFullscreen(v => !v)}
                sx={{
                  position: 'absolute', bottom: 16, right: 16,
                  color: 'rgba(255,255,255,0.5)',
                  bgcolor: 'rgba(13,13,31,0.7)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', zIndex: 20,
                  '&:hover': { color: '#fff', bgcolor: 'rgba(67,97,238,0.5)' },
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
                overflow: 'auto',
                bgcolor: 'rgba(18,18,36,0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                color: 'white',
                p: 0,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 4 },
              }}
            >
              {/* Product hero header */}
              <Box sx={{ p: 3, background: 'linear-gradient(135deg, rgba(67,97,238,0.15) 0%, rgba(247,37,133,0.08) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#fff', fontFamily: 'Syne, sans-serif', lineHeight: 1.2 }}>
                  {product.title}
                </Typography>

                {product.price && (
                  <Typography variant="h4" sx={{ mt: 1.5, fontWeight: 800, color: '#4361ee', fontFamily: 'Syne, sans-serif' }}>
                    {product.price}
                  </Typography>
                )}
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Description */}
                <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 2, fontSize: 10 }}>
                  Description
                </Typography>
                <Typography paragraph sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.7, mt: 1 }}>
                  {product.fullDescription}
                </Typography>

                <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.07)' }} />

                {/* Features */}
                {product.features?.length > 0 && (
                  <>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 2, fontSize: 10 }}>
                      Caractéristiques
                    </Typography>
                    <List dense sx={{ mt: 0.5 }}>
                      {product.features.map((feature, i) => (
                        <ListItem key={i} sx={{ px: 0, py: 0.4 }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#4361ee', mr: 1.5, flexShrink: 0 }} />
                          <ListItemText
                            primary={feature}
                            primaryTypographyProps={{ fontSize: 13, color: 'rgba(255,255,255,0.65)' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.07)' }} />
                  </>
                )}

                {/* Specifications */}
                {product.specifications && (
                  <>
                    <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.3)', letterSpacing: 2, fontSize: 10 }}>
                      Spécifications
                    </Typography>
                    <Box sx={{ mt: 1.5, display: 'grid', gap: 1 }}>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <Box
                          key={key}
                          sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            py: 0.8, px: 1.5,
                            bgcolor: 'rgba(255,255,255,0.03)',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                            {key}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, fontSize: 12 }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Divider sx={{ my: 2.5, borderColor: 'rgba(255,255,255,0.07)' }} />
                  </>
                )}

                {/* CTA */}
                <Box sx={{ display: 'flex', gap: 1.5, mt: 1 }}>
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
                      boxShadow: '0 4px 20px rgba(67,97,238,0.4)',
                      '&:hover': { boxShadow: '0 6px 28px rgba(67,97,238,0.6)' },
                    }}
                  >
                    Ajouter au panier
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)',
                      borderRadius: '10px',
                      px: 2.5,
                      fontFamily: 'Syne, sans-serif',
                      textTransform: 'none',
                      '&:hover': { borderColor: '#4361ee', color: '#fff' },
                    }}
                  >
                    ♡
                  </Button>
                </Box>

                {!modelData?.has3DModel && (
                  <Alert
                    severity="info"
                    sx={{
                      mt: 2.5,
                      bgcolor: 'rgba(33,150,243,0.08)',
                      color: '#7eb8f7',
                      border: '1px solid rgba(33,150,243,0.2)',
                      borderRadius: '10px',
                      fontSize: 12,
                    }}
                  >
                    Représentation générique — aucun modèle 3D spécifique disponible.
                  </Alert>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Product3DPage;