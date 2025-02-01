import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating
} from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import EditIcon from '@mui/icons-material/Edit';
import { aiLearningService } from '../../services/aiLearning';

interface MessageItemProps {
  message: Message;
  onFeedbackSubmit: (feedback: any) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onFeedbackSubmit }) => {
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [correction, setCorrection] = useState('');
  const [helpfulness, setHelpfulness] = useState<number | null>(null);

  const handleFeedbackSubmit = async () => {
    const feedbackData = {
      isHelpful: helpfulness ? helpfulness > 3 : false,
      correction,
      category: message.category || 'general',
      context: message.context || {}
    };

    await aiLearningService.feedbackSubmission(message.id, feedbackData);
    onFeedbackSubmit(feedbackData);
    setFeedbackDialog(false);
  };

  return (
    <Box>
      {/* Existing message content */}
      {message.sender === 'ai' && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Was this helpful?">
            <Rating
              value={helpfulness}
              onChange={(_, value) => setHelpfulness(value)}
              max={5}
            />
          </Tooltip>
          <Tooltip title="Suggest a correction">
            <IconButton size="small" onClick={() => setFeedbackDialog(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)}>
        <DialogTitle>Provide Feedback</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Suggest a correction or improvement"
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={handleFeedbackSubmit} variant="contained">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};