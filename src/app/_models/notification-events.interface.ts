export interface QueueActivityEventBody {
  results: MediaActivity[];
}

export interface MediaActivity {
  mediaType: 'voice' | 'message' | 'email' | 'chat' | 'callback';
  data: MetricCounter[];
}

export interface MetricCounter {
  metric: string;
  count: number;
  qualifier?: string;
  calculatedMetricValue?: number;
}

export interface ConversationsQueueActivity {
  data: MetricCounter[];
  entities: any[];
  group: {
    queueId: string;
  }
}
