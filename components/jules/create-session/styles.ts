import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#020617',
  },
  content: {
    padding: 16,
  },
  errorBanner: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorBannerDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 13,
    flex: 1,
  },
  errorClose: {
    color: '#dc2626',
    fontSize: 18,
    fontWeight: '700',
    paddingLeft: 12,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  labelDark: {
    color: '#cbd5e1',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCounter: {
    fontSize: 12,
    color: '#94a3b8',
  },
  charCounterDark: {
    color: '#64748b',
  },
  selectButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  selectButtonText: {
    fontSize: 15,
    color: '#0f172a',
    flex: 1,
  },
  selectButtonTextDark: {
    color: '#f8fafc',
  },
  placeholderText: {
    color: '#94a3b8',
  },
  sourceList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    maxHeight: 300,
  },
  repoSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  repoSearchContainerDark: {
    borderBottomColor: '#334155',
    backgroundColor: '#0f172a',
  },
  repoSearchInput: {
    flex: 1,
    fontSize: 13,
    color: '#334155',
    paddingVertical: 0,
  },
  repoSearchInputDark: {
    color: '#cbd5e1',
  },
  sourceListDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sourceItemDark: {
    borderBottomColor: '#334155',
  },
  sourceItemSelected: {
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  sourceItemText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },
  sourceItemTextDark: {
    color: '#e2e8f0',
  },
  sourceItemTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  hintDark: {
    color: '#64748b',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#0f172a',
    height: 120,
  },
  textAreaDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    color: '#f8fafc',
  },
  createButton: {
    borderRadius: 14,
    marginTop: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#e2e8f0',
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  createButtonDisabled: {
    shadowOpacity: 0,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  createButtonTextDisabled: {
    color: '#94a3b8',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingMoreTextDark: {
    color: '#94a3b8',
  },
  endOfList: {
    alignItems: 'center',
    padding: 8,
  },
  endOfListText: {
    fontSize: 11,
    color: '#94a3b8',
  },
  endOfListTextDark: {
    color: '#64748b',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionHeaderDark: {
    backgroundColor: '#0f172a',
    borderBottomColor: '#334155',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeaderTextDark: {
    color: '#94a3b8',
  },
  modeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  modeButtonDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
  },
  modeButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.05)',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  modeTitleDark: {
    color: '#cbd5e1',
  },
  modeTitleSelected: {
    color: '#2563eb',
  },
  modeDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  modeDescDark: {
    color: '#94a3b8',
  },
  modeDescSelected: {
    color: '#3b82f6',
  },
});
