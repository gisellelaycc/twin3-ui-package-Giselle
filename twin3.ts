// Core Types for Twin3

export type Role = 'user' | 'assistant';
export type MessageType = 'text' | 'card' | 'widget';

export interface Action {
  label: string;
  actionId: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface TaskOpportunityPayload {
  brand: { name: string; logoUrl: string };
  title: string;
  description: string;
  imageUrl?: string;
  reward: { tokens: string; gift?: string };
  status: 'open' | 'closed';
  spotsLeft?: number;
  deadline?: string;
  acceptedCount?: number;
  totalSpots?: number;
}

export type CardAction = Action;

export type CardData =
  | { type: 'intro'; title: string; description: string; actions?: CardAction[] }
  | { type: 'generic'; title: string; description: string; actions?: CardAction[] }
  | { type: 'task_opportunity'; taskPayload: TaskOpportunityPayload; actions?: CardAction[] }
  | { type: 'task_detail'; title: string; description: string; imageUrl?: string; actions?: CardAction[] }
  | { type: 'confirmation'; title: string; description: string; actions?: CardAction[] }
  | { type: 'feature_grid'; features: Array<{ icon?: string; title: string; description: string; link?: string }> };

export interface Message {
  id: string;
  role: Role;
  type: MessageType;
  content: string;
  cardData?: CardData;
  widget?: string;
  timestamp: number;
}

export interface Suggestion {
  label: string;
  payload: string;
}

export interface InteractionNode {
  id: string;
  triggers: string[];
  response: {
    text: string;
    delay?: number;
    card?: CardData;
    widget?: string;
  };
  suggestedActions?: Suggestion[];
}

export type InteractionInventory = InteractionNode[];
