import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  TextField,
  Autocomplete
} from '@mui/material';
import { aiApi } from '../../services/api';

const KnowledgeBase: React.FC = () => {
  const [knowledge, setKnowledge] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKnowledge();
  }, [selectedCategory, searchQuery]);

  const fetchKnowledge = async () => {
    const response = await aiApi.getKnowledgeBase({
      category: selectedCategory,
      query: searchQuery
    });
    setKnowledge(response.data);
    setCategories(response.categories);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Knowledge Base
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={categories}
              value={selectedCategory}
              onChange={(_, newValue) => setSelectedCategory(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Filter by Category" />
              )}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search Knowledge Base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2}>
        {knowledge.map((item) => (
          <Grid item xs={12} key={item.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {item.tags.map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KnowledgeBase;