## Palette's Journal

## $(date +%Y-%m-%d) - Adding accessibility labels to icon-only buttons
**Learning:** Found that relying heavily on translation keys (`t('...')`) for accessibility labels requires strict verification that those keys exist in the project's i18n dictionaries and that the translation hook (`useI18n`) is actually imported and instantiated in the target component. Assuming standard keys (like 'close', 'send') exist without checking can lead to ReferenceErrors and app crashes.
**Action:** Always verify the existence of translation keys in `constants/i18n.ts` (or equivalent) and ensure `const { t } = useI18n();` is present in the component before applying localized accessibility labels. Use explicit string fallbacks if a translation is missing and cannot be easily added.
