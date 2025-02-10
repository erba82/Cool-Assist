import React, { useState } from 'react';
import { Box, Grid, TextField, Button, Typography } from '@mui/material';
import { evaluate } from 'mathjs';

interface CalculatorProps {
  onCalculate: (result: number) => void;
}

const EngineeringCalculator: React.FC<CalculatorProps> = ({ onCalculate }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    try {
      const calculatedResult = evaluate(expression);
      setResult(calculatedResult);
      onCalculate(calculatedResult);
    } catch (error) {
      console.error('Calculation error:', error);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        value={expression}
        onChange={(e) => setExpression(e.target.value)}
        label="Engineering Expression"
        variant="outlined"
      />
      <Button onClick={handleCalculate} variant="contained" sx={{ mt: 2 }}>
        Calculate
      </Button>
      {result !== null && (
        <Typography variant="h6" sx={{ mt: 2 }}>
          Result: {result}
        </Typography>
      )}
    </Box>
  );
};

export default EngineeringCalculator;