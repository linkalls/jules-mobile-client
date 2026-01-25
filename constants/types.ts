/**
 * ==========================================
 * Jules API型定義 (厳密な型付け！)
 * ==========================================
 */

// APIのエラーレスポンス
export interface ApiError {
  error: {
    code: number;
    message: string;
    status: string;
  };
}

// ソース (GitHubリポジトリなど)
export interface Source {
  name: string; // "sources/github/..."
  displayName?: string;
  id?: string;
  githubRepo?: {
    owner: string;
    repo: string;
    isPrivate?: boolean;
    defaultBranch?: {
      displayName: string;
    };
  };
}

/**
 * PR object
 */
export interface PullRequest {
  url?: string;
  title?: string;
  description?: string;
}

/**
 * Session Output object
 */
export interface SessionOutput {
  pullRequest?: PullRequest;
  [key: string]: unknown;
}

/**
 * Session (unit of work in Jules)
 */
export interface Session {
  name: string; // "sessions/..."
  title?: string;
  state: 'STATE_UNSPECIFIED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createTime: string;
  updateTime: string;
  outputs?: SessionOutput[];
  submittedPr?: string;
}

// プランステップ
export interface PlanStep {
  id?: string;
  title: string;
  description?: string;
  state?: string;
  index?: number;
}

// Bashアウトプット
export interface BashOutput {
  command: string;
  output?: string;
  exitCode?: number;
}

// アーティファクト
export interface Artifact {
  bashOutput?: BashOutput;
  changeSet?: {
    source: string;
    gitPatch?: {
      unidiffPatch: string;
      baseCommitId?: string;
    };
  };
  media?: {
    mimeType: string;
    data: string; // base64 encoded
  };
}

// アクティビティ (セッション内のイベント) - 実際のAPI構造
export interface Activity {
  name: string;
  id: string;
  createTime: string;
  
  // originator: "agent" | "user"
  originator: 'agent' | 'user';
  
  // エージェントからのメッセージ
  agentMessaged?: {
    agentMessage: string;
  };
  
  // ユーザーからのメッセージ
  userMessaged?: {
    userMessage: string;
  };
  
  // 進捗更新
  progressUpdated?: {
    title?: string;
    description?: string;
  };
  
  // プラン生成
  planGenerated?: {
    plan: {
      id: string;
      steps?: PlanStep[];
    };
  };
  
  // プラン承認
  planApproved?: {
    planId: string;
  };
  
  // プラン承認リクエスト
  planApprovalRequested?: {
    planId: string;
  };
  
  // アーティファクト（bashOutput等）
  artifacts?: Artifact[];
  
  // タイトル（オプション）
  title?: string;
}

// APIレスポンスのラッパー
export interface ListSourcesResponse {
  sources?: Source[];
  nextPageToken?: string;
}

export interface ListSessionsResponse {
  sessions?: Session[];
  nextPageToken?: string;
}

export interface ListActivitiesResponse {
  activities?: Activity[];
  nextPageToken?: string;
}

// Photo/Image attachment (for future API support)
export interface PhotoAttachment {
  uri: string;
  mimeType: string;
  fileName?: string | null;
  base64?: string | null;
}

// アプリのビュー状態
export type ViewState = 'SESSIONS' | 'SETTINGS' | 'CREATE_SESSION' | 'SESSION_DETAIL';
