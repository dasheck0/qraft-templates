# Tasks: Box Syncing Improvement with Manifest Support

## Relevant Files

- `src/core/manifestManager.ts` - New class to handle local manifest storage, retrieval, and comparison operations (CREATED)
- `src/core/manifestManager.test.ts` - Unit tests for ManifestManager class (CREATED)
- `src/core/contentComparison.ts` - Extend existing class to include manifest comparison alongside file content comparison (UPDATED)
- `src/core/contentComparison.test.ts` - Update existing tests and add new tests for manifest comparison features (UPDATED)
- `src/core/conflictResolution.ts` - Extend existing class to handle manifest conflicts with new conflict types (UPDATED)
- `src/core/conflictResolution.test.ts` - Update existing tests and add new tests for manifest conflict resolution
- `src/core/changeAnalysis.ts` - Extend existing class to include manifest-level changes in risk assessment
- `src/core/changeAnalysis.test.ts` - Update existing tests and add new tests for manifest change analysis
- `src/core/boxManager.ts` - Update existing methods to integrate manifest storage during box operations (UPDATED)
- `src/core/boxManager.test.ts` - Update existing tests and add new tests for manifest integration (CREATED)
- `src/core/repositoryManager.ts` - Update existing methods to store local manifest copies when creating boxes (UPDATED)
- `src/core/repositoryManager.test.ts` - Update existing tests and add new tests for local manifest storage (UPDATED)
- `src/types/index.ts` - Extend existing interfaces to include manifest comparison and conflict types
- `src/utils/manifestUtils.ts` - Utility functions for manifest operations (comparison, validation, storage paths) (CREATED)
- `src/utils/manifestUtils.test.ts` - Unit tests for manifest utility functions (CREATED)

### Notes

- Unit tests should typically be placed alongside the code files they are testing
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration
- Focus on extending existing classes rather than creating completely new systems to maintain consistency
- Ensure backward compatibility by gracefully handling missing local manifests

## Tasks

- [ ] 1.0 Create Local Manifest Management System
  - [x] 1.1 Create ManifestManager class with methods for storing, retrieving, and comparing local manifests
  - [x] 1.2 Implement local manifest storage in `.qraft/manifest.json` within target directories
  - [x] 1.3 Add manifest metadata tracking (timestamps, checksums) for sync state management
  - [x] 1.4 Create utility functions for manifest path resolution and directory management
  - [x] 1.5 Add error handling for corrupted or missing local manifest files
  - [x] 1.6 Write comprehensive unit tests for ManifestManager class and utility functions

- [x] 2.0 Extend Content Comparison for Manifest Support
  - [x] 2.1 Add ManifestComparison interface to define manifest comparison structure
  - [x] 2.2 Extend DirectoryComparison interface to include manifest comparison results
  - [x] 2.3 Update ContentComparison.compareDirectories() to include manifest comparison logic
  - [x] 2.4 Implement manifest field comparison (version, description, tags, exclude patterns, etc.)
  - [x] 2.5 Add manifest comparison to existing conflict detection workflow
  - [x] 2.6 Update existing tests and add new tests for manifest comparison features

- [x] 3.0 Integrate Manifest Conflicts into Resolution System
  - [x] 3.1 Add 'manifest_mismatch' conflict type to ConflictInfo interface
  - [x] 3.2 Extend ConflictResolution class to handle manifest conflicts with appropriate severity levels
  - [x] 3.3 Implement manifest conflict resolution strategies (keep_existing, use_new, backup_and_replace)
  - [x] 3.4 Add manifest conflicts to change analysis risk assessment calculations
  - [x] 3.5 Update conflict resolution UI/prompts to display manifest changes clearly
  - [x] 3.6 Write tests for manifest conflict resolution scenarios and edge cases

- [x] 4.0 Update Box Operations for Manifest Synchronization
  - [x] 4.1 Update BoxManager.copyBox() to automatically download and store remote manifests locally
  - [x] 4.2 Update BoxManager.downloadAndCopyFiles() to include manifest storage in target directory
  - [x] 4.3 Update RepositoryManager.createBox() to store local manifest copy during box creation
  - [x] 4.4 Add manifest synchronization to existing caching mechanisms in CacheManager
  - [x] 4.5 Implement box state detection logic (new vs updated) using manifest comparison
  - [x] 4.6 Add `.qraft/` to default exclude patterns to prevent recursive boxing
  - [x] 4.7 Update existing box operation tests and add new tests for manifest synchronization

- [x] 5.0 Enhance Change Analysis with Manifest Considerations
  - [x] 5.1 Extend ChangeAnalysis class to include manifest-level changes in overall risk assessment
  - [x] 5.2 Add manifest change detection to FileChangeAnalysis for version, metadata changes
  - [x] 5.3 Implement manifest change impact calculation (critical for version changes, medium for metadata)
  - [x] 5.4 Update change analysis recommendations to include manifest-specific guidance
  - [x] 5.5 Add manifest change statistics to ChangeAnalysisResult summary
  - [x] 5.6 Write tests for manifest change analysis scenarios and risk level calculations
