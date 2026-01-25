import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Activity } from '@/constants/types';

interface ActivityItemProps {
  activity: Activity;
  onApprovePlan?: (planId: string) => void;
}

/**
 * シマー効果付きスケルトン
 */
function Skeleton({ width, height, style }: { width: number | string; height: number; style?: object }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: isDark ? '#334155' : '#e2e8f0',
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * アクティビティスケルトン（チャット風）
 */
export function ActivityItemSkeleton({ isAgent = true }: { isAgent?: boolean }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[
      skeletonStyles.container,
      isAgent ? skeletonStyles.agentContainer : skeletonStyles.userContainer,
    ]}>
      <View style={[
        skeletonStyles.bubble,
        isDark && skeletonStyles.bubbleDark,
        isAgent ? skeletonStyles.agentBubble : skeletonStyles.userBubble,
        isDark && (isAgent ? skeletonStyles.agentBubbleDark : skeletonStyles.userBubbleDark),
      ]}>
        <View style={skeletonStyles.header}>
          <Skeleton width={24} height={24} style={{ borderRadius: 12 }} />
          <Skeleton width={80} height={14} />
        </View>
        <View style={{ marginTop: 12, gap: 8 }}>
          <Skeleton width="100%" height={14} />
          <Skeleton width="85%" height={14} />
          <Skeleton width="70%" height={14} />
        </View>
      </View>
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  agentContainer: {
    alignItems: 'flex-start',
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
  },
  bubbleDark: {},
  agentBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
  },
  agentBubbleDark: {
    backgroundColor: '#1e293b',
  },
  userBubble: {
    backgroundColor: '#dbeafe',
    borderBottomRightRadius: 4,
  },
  userBubbleDark: {
    backgroundColor: '#1e3a8a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

interface ActivityItemProps {
  activity: Activity;
  onApprovePlan?: (planId: string) => void;
}

// Custom diff highlighter component
function DiffHighlighter({ code }: { code: string }) {
  const lines = code.split('\n');

  return (
    <View>
      {lines.map((line, idx) => {
        let color = '#94a3b8'; // default gray
        let backgroundColor = 'transparent';

        if (line.startsWith('+') && !line.startsWith('+++')) {
          color = '#4ade80'; // green for additions
          backgroundColor = 'rgba(74, 222, 128, 0.1)';
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          color = '#f87171'; // red for deletions
          backgroundColor = 'rgba(248, 113, 113, 0.1)';
        } else if (line.startsWith('@@')) {
          color = '#60a5fa'; // blue for chunk headers
        } else if (line.startsWith('diff') || line.startsWith('index') || line.startsWith('---') || line.startsWith('+++')) {
          color = '#a78bfa'; // purple for file headers
        }

        return (
          <Text
            key={idx}
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              color,
              backgroundColor,
              paddingHorizontal: 4,
            }}
          >
            {line}
          </Text>
        );
      })}
    </View>
  );
}

/**
 * 全アクティビティタイプ対応のコンポーネント
 * - Markdown表示対応
 * - コード詳細表示（折りたたみ式）
 */
export const ActivityItem = React.memo(function ActivityItem({ activity, onApprovePlan }: ActivityItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expanded, setExpanded] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  // 時刻フォーマット
  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  // Markdownスタイル
  const markdownStyles = {
    body: {
      color: isDark ? '#e2e8f0' : '#1e293b',
      fontSize: 14,
      lineHeight: 20,
    },
    heading1: {
      color: isDark ? '#f8fafc' : '#0f172a',
      fontSize: 18,
      fontWeight: '700' as const,
      marginVertical: 8,
    },
    heading2: {
      color: isDark ? '#f8fafc' : '#0f172a',
      fontSize: 16,
      fontWeight: '600' as const,
      marginVertical: 6,
    },
    strong: {
      fontWeight: '600' as const,
    },
    code_inline: {
      backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
      color: isDark ? '#22d3ee' : '#0891b2',
      paddingHorizontal: 4,
      borderRadius: 4,
      fontFamily: 'monospace',
    },
    fence: {
      backgroundColor: isDark ? '#0f172a' : '#f8fafc',
      padding: 12,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 12,
    },
    bullet_list: {
      marginVertical: 4,
    },
    list_item: {
      marginVertical: 2,
    },
    link: {
      color: '#2563eb',
    },
  };

  // === エージェントメッセージ (Markdown対応) ===
  if (activity.agentMessaged?.agentMessage) {
    return (
      <View style={styles.container}>
        <View style={[styles.bubble, styles.bubbleAgent, isDark && styles.bubbleAgentDark]}>
          <View style={styles.header}>
            <View style={styles.senderRow}>
              <IconSymbol name="message.fill" size={14} color="#2563eb" />
              <Text style={styles.sender}>Jules</Text>
            </View>
            <Text style={styles.time}>{formatTime(activity.createTime)}</Text>
          </View>
          <Markdown style={markdownStyles}>
            {activity.agentMessaged.agentMessage}
          </Markdown>
        </View>
      </View>
    );
  }

  // === ユーザーメッセージ ===
  if (activity.userMessaged?.userMessage) {
    return (
      <View style={[styles.container, styles.containerUser]}>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <View style={styles.header}>
            <Text style={styles.senderUser}>You</Text>
            <Text style={styles.timeUser}>{formatTime(activity.createTime)}</Text>
          </View>
          <Text style={styles.messageUser} selectable>
            {activity.userMessaged.userMessage}
          </Text>
        </View>
      </View>
    );
  }

  // === プラン生成 ===
  if (activity.planGenerated?.plan) {
    const plan = activity.planGenerated.plan;
    return (
      <View style={styles.container}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <IconSymbol name="doc.text" size={16} color="#10b981" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Plan Generated</Text>
          </View>
          {plan.steps?.map((step, index) => (
            <View key={step.id || index} style={styles.planStep}>
              <Text style={[styles.stepNumber, isDark && styles.stepNumberDark]}>
                {index + 1}.
              </Text>
              <Text style={[styles.stepTitle, isDark && styles.stepTitleDark]}>
                {step.title}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  // === プラン承認リクエスト ===
  if (activity.planApprovalRequested) {
    const planId = activity.planApprovalRequested.planId;
    return (
      <View style={styles.container}>
        <View style={[styles.card, styles.approvalCard, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <IconSymbol name="hand.raised" size={16} color="#f59e0b" />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Approval Required</Text>
          </View>
          <Text style={[styles.description, isDark && styles.descriptionDark]}>
            Jules is waiting for your approval to proceed with the plan.
          </Text>
          {onApprovePlan && (
            <TouchableOpacity
              style={styles.approveButton}
              onPress={() => onApprovePlan(planId)}
              activeOpacity={0.8}
            >
              <IconSymbol name="checkmark.circle.fill" size={18} color="#ffffff" />
              <Text style={styles.approveButtonText}>Approve Plan</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // === プラン承認 ===
  if (activity.planApproved) {
    return (
      <View style={[styles.container, styles.containerUser]}>
        <View style={[styles.bubble, styles.bubbleUser]}>
          <View style={styles.header}>
            <Text style={styles.senderUser}>You</Text>
            <Text style={styles.timeUser}>{formatTime(activity.createTime)}</Text>
          </View>
          <View style={styles.approvalRow}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#ffffff" />
            <Text style={styles.messageUser}>Plan approved</Text>
          </View>
        </View>
      </View>
    );
  }

  // === 進捗更新 (progressUpdated) ===
  if (activity.progressUpdated) {
    const { title, description } = activity.progressUpdated;
    const artifacts = activity.artifacts || [];
    
    const bashArtifacts = artifacts.filter(a => a.bashOutput);
    const mediaArtifacts = artifacts.filter(a => a.media);
    // CLI実行時(bashOutputあり)は、過去の変更履歴(changeSet)を表示しないようにする
    const changeSetArtifacts = bashArtifacts.length > 0
      ? []
      : artifacts.filter(a => a.changeSet?.gitPatch);
    
    const hasAnyContent = title || description || bashArtifacts.length > 0 || 
                         changeSetArtifacts.length > 0 || mediaArtifacts.length > 0;
    
    return (
      <View style={styles.container}>
        <View style={[styles.card, isDark && styles.cardDark]}>
          {/* タイトル */}
          {title && (
            <View style={styles.cardHeader}>
              <IconSymbol name="terminal" size={16} color="#f59e0b" />
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                {title}
              </Text>
            </View>
          )}
          
          {/* description */}
          {description && (
            <Text style={[styles.description, isDark && styles.descriptionDark]}>
              {description}
            </Text>
          )}
          
          {/* Media artifacts (images) */}
          {mediaArtifacts.length > 0 && (
            <View style={styles.mediaContainer}>
              {mediaArtifacts.map((artifact, index) => {
                if (!artifact.media) return null;
                const { mimeType, data } = artifact.media;
                // Check if it's an image
                if (mimeType.startsWith('image/')) {
                  // Validate base64 data format (basic check)
                  const isValidBase64 = data && typeof data === 'string' && data.length > 0;
                  if (!isValidBase64) {
                    return (
                      <View key={index} style={[styles.mediaPlaceholder, isDark && styles.mediaPlaceholderDark]}>
                        <IconSymbol name="exclamationmark.triangle" size={24} color="#ef4444" />
                        <Text style={[styles.mediaPlaceholderText, isDark && styles.mediaPlaceholderTextDark]}>
                          Invalid image data
                        </Text>
                      </View>
                    );
                  }
                  return (
                    <View key={index} style={styles.mediaImageWrapper}>
                      <Image
                        source={{ uri: `data:${mimeType};base64,${data}` }}
                        style={styles.mediaImage}
                        resizeMode="contain"
                      />
                    </View>
                  );
                }
                // For non-image media, show a placeholder
                return (
                  <View key={index} style={[styles.mediaPlaceholder, isDark && styles.mediaPlaceholderDark]}>
                    <IconSymbol name="doc" size={24} color={isDark ? '#94a3b8' : '#64748b'} />
                    <Text style={[styles.mediaPlaceholderText, isDark && styles.mediaPlaceholderTextDark]}>
                      {mimeType}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
          
          {/* bashOutput */}
          {bashArtifacts.map((artifact, index) => (
            <View key={index} style={styles.bashContainer}>
              <TouchableOpacity 
                style={styles.bashHeader}
                onPress={() => setExpanded(!expanded)}
              >
                <Text style={styles.bashCommand}>
                  $ {artifact.bashOutput?.command}
                </Text>
                <IconSymbol 
                  name={expanded ? 'chevron.down' : 'chevron.right'} 
                  size={14} 
                  color="#64748b" 
                />
              </TouchableOpacity>
              
              {expanded && artifact.bashOutput?.output && (
                <ScrollView 
                  style={styles.bashOutput}
                  horizontal
                  nestedScrollEnabled
                >
                  <Text style={styles.bashOutputText}>
                    {artifact.bashOutput.output}
                  </Text>
                </ScrollView>
              )}
            </View>
          ))}
          
          {/* changeSet (コード変更) */}
          {changeSetArtifacts.length > 0 && (
            <TouchableOpacity 
              style={styles.codeButton}
              onPress={() => setShowCode(!showCode)}
            >
              <IconSymbol name="chevron.left.forwardslash.chevron.right" size={14} color="#2563eb" />
              <Text style={styles.codeButtonText}>
                {showCode ? 'Hide Code Changes' : `View Code Changes (${changeSetArtifacts.length})`}
              </Text>
            </TouchableOpacity>
          )}
          
          {showCode && changeSetArtifacts.map((artifact, index) => (
            <View key={index} style={styles.codeContainer}>
              <ScrollView 
                style={styles.codeScrollVertical}
                nestedScrollEnabled
                showsVerticalScrollIndicator
              >
                <ScrollView 
                  horizontal
                  nestedScrollEnabled
                  showsHorizontalScrollIndicator
                >
                  <DiffHighlighter
                    code={(artifact.changeSet?.gitPatch?.unidiffPatch?.slice(0, 3000) || '') +
                      ((artifact.changeSet?.gitPatch?.unidiffPatch?.length || 0) > 3000 ? '\n... (truncated)' : '')}
                  />
                </ScrollView>
              </ScrollView>
            </View>
          ))}
          
          {/* 何もない場合 */}
          {!hasAnyContent && (
            <View style={styles.cardHeader}>
              <IconSymbol name="arrow.clockwise" size={16} color="#64748b" />
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Working...</Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  return null;
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 12,
  },
  containerUser: {
    alignItems: 'flex-end',
  },
  
  // チャットバブル
  bubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
  },
  bubbleUser: {
    backgroundColor: '#2563eb',
    borderBottomRightRadius: 4,
  },
  bubbleAgent: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  bubbleAgentDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  
  // ヘッダー
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sender: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  senderUser: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },
  time: {
    fontSize: 10,
    color: '#94a3b8',
  },
  timeUser: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  
  // メッセージ
  messageUser: {
    fontSize: 14,
    lineHeight: 20,
    color: '#ffffff',
  },
  
  // カード
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  cardTitleDark: {
    color: '#e2e8f0',
  },
  
  // プランステップ
  planStep: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
    width: 20,
  },
  stepNumberDark: {
    color: '#34d399',
  },
  stepTitle: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
  },
  stepTitleDark: {
    color: '#94a3b8',
  },
  
  // 承認
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  // 進捗説明
  description: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 8,
  },
  descriptionDark: {
    color: '#94a3b8',
  },
  
  // Bash出力
  bashContainer: {
    marginTop: 8,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1e293b',
  },
  bashCommand: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#22d3ee',
    flex: 1,
  },
  bashOutput: {
    maxHeight: 150,
    padding: 10,
  },
  bashOutputText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#94a3b8',
  },
  
  // コード変更ボタン
  codeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
  },
  codeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2563eb',
  },
  
  // コード表示
  codeContainer: {
    marginTop: 8,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    maxHeight: 250,
    overflow: 'hidden',
  },
  codeScrollVertical: {
    maxHeight: 250,
    padding: 10,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: '#94a3b8',
  },
  
  // 承認カード
  approvalCard: {
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#10b981',
    borderRadius: 10,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  
  // Media artifacts
  mediaContainer: {
    marginTop: 8,
    gap: 8,
  },
  mediaImageWrapper: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    maxHeight: 300,
  },
  mediaImage: {
    width: '100%',
    height: 300,
  },
  mediaPlaceholder: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  mediaPlaceholderDark: {
    backgroundColor: '#0f172a',
  },
  mediaPlaceholderText: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  mediaPlaceholderTextDark: {
    color: '#94a3b8',
  },
});
