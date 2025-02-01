export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: string;
  }
  
  export interface ChatState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
  }