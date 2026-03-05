import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Activity, Session } from '@/constants/types';

/**
 * Export session to Markdown format
 */
export async function exportSessionAsMarkdown(
  session: Session,
  activities: Activity[]
): Promise<string> {
  const markdown: string[] = [];
  
  // Header
  markdown.push(`# ${session.title || 'Untitled Session'}\n`);
  markdown.push(`**Session ID:** ${session.name}\n`);
  markdown.push(`**State:** ${session.state}\n`);
  markdown.push(`**Created:** ${new Date(session.createTime).toLocaleString()}\n`);
  markdown.push(`**Updated:** ${new Date(session.updateTime).toLocaleString()}\n`);
  
  const pullRequestUrl = session.outputs?.find((output) => output.pullRequest?.url)?.pullRequest?.url;
  if (pullRequestUrl) {
    markdown.push(`**Pull Request:** ${pullRequestUrl}\n`);
  }
  
  markdown.push(`\n---\n\n`);
  
  // Activities
  markdown.push(`## Activities\n\n`);
  
  for (const activity of activities) {
    const time = new Date(activity.createTime).toLocaleString();
    
    if (activity.agentMessaged) {
      markdown.push(`### 🤖 Jules (${time})\n\n`);
      markdown.push(`${activity.agentMessaged.agentMessage}\n\n`);
    }
    
    if (activity.userMessaged) {
      markdown.push(`### 👤 You (${time})\n\n`);
      markdown.push(`${activity.userMessaged.userMessage}\n\n`);
    }
    
    if (activity.planGenerated) {
      const plan = activity.planGenerated.plan;
      markdown.push(`### 📋 Plan Generated (${time})\n\n`);
      if (plan.steps) {
        plan.steps.forEach((step, index) => {
          markdown.push(`${index + 1}. **${step.title}**\n`);
          if (step.description) {
            markdown.push(`   ${step.description}\n`);
          }
        });
      }
      markdown.push('\n');
    }
    
    if (activity.planApprovalRequested) {
      markdown.push(`### ⚠️ Plan Approval Requested (${time})\n\n`);
      markdown.push(`Plan ID: ${activity.planApprovalRequested.planId}\n\n`);
    }
    
    if (activity.planApproved) {
      markdown.push(`### ✅ Plan Approved (${time})\n\n`);
    }
    
    if (activity.progressUpdated) {
      markdown.push(`### 📊 Progress Update (${time})\n\n`);
      if (activity.progressUpdated.title) {
        markdown.push(`**${activity.progressUpdated.title}**\n\n`);
      }
      if (activity.progressUpdated.description) {
        markdown.push(`${activity.progressUpdated.description}\n\n`);
      }
    }
    
    if (activity.sessionCompleted) {
      markdown.push(`### ✅ Session Completed (${time})\n\n`);
    }
    
    if (activity.sessionFailed) {
      markdown.push(`### ❌ Session Failed (${time})\n\n`);
      if (activity.sessionFailed.reason) {
        markdown.push(`Reason: ${activity.sessionFailed.reason}\n\n`);
      }
    }
    
    if (activity.artifacts) {
      let block = '';
      for (const artifact of activity.artifacts) {
        if (artifact.bashOutput) {
          block += `#### 💻 Bash Command\n\n\`\`\`bash\n${artifact.bashOutput.command}\n\`\`\`\n\n`;
          if (artifact.bashOutput.output) {
            block += `**Output:**\n\n\`\`\`\n${artifact.bashOutput.output}\n\`\`\`\n\n`;
          }
          if (artifact.bashOutput.exitCode !== undefined) {
            block += `Exit code: ${artifact.bashOutput.exitCode}\n\n`;
          }
        }
        
        if (artifact.changeSet?.gitPatch) {
          block += `#### 📝 Code Changes\n\n\`\`\`diff\n${artifact.changeSet.gitPatch.unidiffPatch}\n\`\`\`\n\n`;
        }
      }
      if (block) {
        markdown.push(block);
      }
    }
  }
  
  markdown.push(`\n---\n\n`);
  markdown.push(`*Exported from Jules Mobile Client*\n`);
  
  return markdown.join('');
}

/**
 * Export session to JSON format
 */
export async function exportSessionAsJSON(
  session: Session,
  activities: Activity[]
): Promise<string> {
  const data = {
    session,
    activities,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  
  return JSON.stringify(data, null, 2);
}

/**
 * Share exported session
 */
export async function shareSession(
  session: Session,
  activities: Activity[],
  format: 'markdown' | 'json' = 'markdown'
): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  
  if (!isAvailable) {
    throw new Error('Sharing is not available on this platform');
  }
  
  const content = format === 'markdown' 
    ? await exportSessionAsMarkdown(session, activities)
    : await exportSessionAsJSON(session, activities);
  
  const extension = format === 'markdown' ? 'md' : 'json';
  const fileName = `session-${session.name.split('/').pop()}.${extension}`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  // Write file
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  
  // Share
  await Sharing.shareAsync(fileUri, {
    mimeType: format === 'markdown' ? 'text/markdown' : 'application/json',
    dialogTitle: 'Share Session Export',
    UTI: format === 'markdown' ? 'public.markdown' : 'public.json',
  });
}

/**
 * Save exported session to device
 */
export async function saveSessionExport(
  session: Session,
  activities: Activity[],
  format: 'markdown' | 'json' = 'markdown'
): Promise<string> {
  const content = format === 'markdown' 
    ? await exportSessionAsMarkdown(session, activities)
    : await exportSessionAsJSON(session, activities);
  
  const extension = format === 'markdown' ? 'md' : 'json';
  const fileName = `session-${session.name.split('/').pop()}-${Date.now()}.${extension}`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;
  
  // Write file
  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  
  return fileUri;
}
