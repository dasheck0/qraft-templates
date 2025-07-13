# PRD: Box Syncing Improvement with Manifest Support

## Introduction/Overview

Currently, the qraft CLI lacks proper synchronization between local and remote box versions, making it difficult for users to track changes and determine whether a box is new or has been updated. The system downloads boxes without storing manifest metadata locally, and when creating boxes, it doesn't maintain local manifest copies for future comparison.

This feature will enhance the box syncing mechanism by implementing local manifest storage, automatic manifest downloading, and integrated manifest comparison alongside the existing content comparison system to provide better change detection and conflict resolution.

## Goals

1. **Improve Change Detection**: Enable accurate identification of new vs. updated boxes by comparing both manifest metadata and file content
2. **Enhance User Experience**: Provide clear visibility into what has changed between local and remote box versions
3. **Maintain Data Integrity**: Ensure local and remote box states remain synchronized with proper conflict resolution
4. **Preserve Backward Compatibility**: Work seamlessly with newly created boxes while gracefully handling existing boxes without local manifests

## User Stories

1. **As a developer creating a box locally**, I want the manifest to be stored locally so I can track changes when I later sync with the remote version
2. **As a developer downloading a box**, I want the manifest to be automatically downloaded and stored locally so I can detect future updates
3. **As a developer updating an existing box**, I want to see what has changed in both the manifest and files so I can make informed decisions about conflicts
4. **As a developer working with multiple box versions**, I want the system to automatically detect whether I'm working with a new box or an updated version of an existing one

## Functional Requirements

### Core Manifest Management
1. **Local Manifest Storage**: When creating a box, the system must store the manifest.json file in a `.qraft` metadata directory within the source directory
2. **Manifest Download**: When downloading/copying a box, the system must automatically download and store the manifest.json locally in the target directory's `.qraft` subdirectory
3. **Manifest Comparison**: The system must extend the existing ContentComparison class to include manifest comparison alongside file content comparison
4. **Box State Detection**: The system must determine if a box is "new" or "updated" by comparing local manifest (if exists) with remote manifest

### Integration with Existing Systems
5. **Content Comparison Enhancement**: The system must add manifest comparison to the existing DirectoryComparison interface and ContentComparison class
6. **Conflict Resolution Integration**: The system must integrate manifest conflicts into the existing ConflictResolution system with appropriate conflict types and severity levels
7. **Change Analysis Extension**: The system must extend the ChangeAnalysis class to include manifest-level changes in risk assessment

### Synchronization Behavior
8. **Automatic Sync on Download**: Every box download/copy operation must include manifest synchronization
9. **Sync on Box Creation**: When creating a box locally, the system must store the manifest locally for future comparison
10. **Manifest Update Detection**: The system must detect changes in manifest fields (version, description, tags, exclude patterns, etc.) and treat them as conflicts requiring resolution

### Backward Compatibility
11. **Graceful Degradation**: The system must work with existing boxes that don't have local manifests by treating them as "unknown state" and offering to initialize manifest tracking
12. **New Box Workflow**: For newly created boxes going forward, full manifest tracking must be enabled by default

## Non-Goals (Out of Scope)

1. **Migration of Existing Boxes**: No automatic migration or initialization of manifest tracking for existing boxes without local manifests
2. **Advanced Merge Strategies**: No complex manifest merging beyond the existing conflict resolution patterns
3. **Version Control Integration**: No integration with git or other VCS systems for manifest tracking
4. **Multi-User Collaboration**: No real-time collaboration features or locking mechanisms
5. **Manifest Schema Validation**: No validation of manifest schema changes or breaking changes detection

## Technical Considerations

### Manifest Storage Structure
- Local manifests stored in `{target-directory}/.qraft/manifest.json`
- Metadata directory should be hidden and include additional sync metadata (timestamps, checksums)
- Consider adding `.qraft/` to default exclude patterns to prevent recursive boxing

### Integration Points
- Extend `ContentComparison.compareDirectories()` to include manifest comparison
- Add new conflict type `'manifest_mismatch'` to existing ConflictInfo interface
- Enhance `BoxManager.copyBox()` and `BoxManager.downloadAndCopyFiles()` to handle manifest storage
- Update `RepositoryManager.createBox()` to store local manifest copy

### Existing System Leverage
- Utilize existing conflict resolution strategies and severity levels
- Reuse existing diff generation and change analysis patterns
- Maintain compatibility with current caching mechanisms in CacheManager

## Success Metrics

1. **Accuracy**: 100% accurate detection of new vs. updated boxes when local manifest exists
2. **User Experience**: Reduced user confusion about box state with clear change indicators
3. **Reliability**: Zero data loss during sync operations with proper conflict resolution
4. **Performance**: No significant performance degradation in box operations (< 10% overhead)
5. **Adoption**: All new box creation workflows include manifest tracking by default

## Open Questions

1. **Manifest Conflict Priority**: Should manifest conflicts be treated as higher priority than file conflicts in the resolution workflow?
2. **Sync Frequency**: Should there be an option for background manifest checking to detect remote updates?
3. **Cleanup Strategy**: How should orphaned `.qraft` directories be handled when boxes are deleted?
4. **Cross-Platform Compatibility**: Any special considerations for `.qraft` directory handling on different operating systems?
5. **Error Recovery**: How should the system handle corrupted or missing local manifest files?
