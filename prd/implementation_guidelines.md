# General instructions

# Coding
## Progamming language
- Prefer typescript over javascript
- Prefer async / await over callbacks and then / catch syntax
- VSCode is confiured to remove unused imports on save. So never only add an import as only statement that is not being used right now, since this will get removed

## React
When in an react project apply the following rules
- break down into smaller components, to make everthing easier to maintain
- put relevant interfaces (e.g. props) above the actual component

## Project
- always use desugn token if possible instead of hardcoded values for colors, spacing, typography, and other style properties
- reuse components from src/ui for UI elements if possible. If you create new ones, try to make them generic and add them to src/ui
- use a modern, sleak and clean ui style
- also refer to the design guidelines in docs/design_guidelines.md. They have priority

# Architecture

We are applying a MVVM structure, where the Components / Pages act as UI, the useHooks as ViewModel and the Stores / API 
as Model. It is not allowed to call stores or API / Supabase from a UI component directly. Handle everything via useHooks.
See the following for more information

## State Management
- Organize stores by domain/feature to maintain separation of concerns
- Each store should be self-contained with its own types, actions, and state
- Use custom hooks (prefixed with 'use') to expose store functionality
- Keep business logic in the stores, UI logic in components

## API Layer
- Supabase is the primary data store - all database operations go through it
- Define model interfaces in `api/models` to ensure type safety
- Use transformers to convert between API and domain models
- Keep API calls isolated in dedicated API modules
- Use typed clients to ensure type safety in API calls

## Component Architecture
- Follow atomic design principles - break UI into atoms, molecules, and organisms
- Complex components should have their own directory
- Keep presentation and container components separate
- Modal components handle data modification (create/update operations)
- Reuse base components from theme/components for consistency

## Hooks Pattern
- Create custom hooks for reusable logic
- Use composition of hooks for complex functionality
- Name hooks clearly based on their purpose
- Keep hooks focused on a single responsibility

## AI Integration
- Organize AI functionality into distinct use cases
- Use AI hooks for component integration
- Keep AI prompts and logic separate from UI components
- Structure AI responses for consistent handling

## Testing Strategy
- Use factory functions to generate test data
- Write tests for business logic and utilities
- Keep test files close to their implementation
- Use meaningful test descriptions

## Error Handling
- Handle async errors with try/catch
- Transform API errors into user-friendly messages
- Use error boundaries for React component errors
- Log errors appropriately for debugging

## Project Structure
- Group related code by feature/domain
- Keep shared code in appropriate shared directories
- Follow consistent naming conventions
- Use index files for clean exports

## Development Workflow
- Use TypeScript for type safety
- Follow established naming conventions
- Write self-documenting code
- Keep components and functions focused and small
