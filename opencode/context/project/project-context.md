# Improvements for more consistency

- If a npm script fails, because it is not found, read in the package.json to find out if there is script with a similar name, that you were probably looking for
- Follow instructions explicitly. Never bypass instructions (i.e. relaxing linting rules, commenting out tests) to accomplish a task. If you are not sure how to fix the error, ask for help.
- Do not use online comments for explaining stuff. It makes the code base less searchable and maintainable.
- Prefer supabase enums over database functions / triggers, when you want to enforce certain values on string columns
- Check the supabase types file in order to educated yourself about the current state of the database schema. It is located at packages/shared-domain/src/integrations/supabase/types.ts
- If you want to regenerate the supabase types, simply run `npm run typegen` from the project root
- Never run migrations yourself. Always ask the developer to run them for you. Under no circumstances run `supabase db reset` or `supabase db push` yourself. Assume that we are running on production. Be cautios accordingly.
- Never ever use supabase directly in the UI components. The architectural pattern is very strict: UI Component -> use Hook -> Store -> API Layer -> Supabase -> Database. You must never violiate this pattern.
- When you try to execute npm scripts or other location aware commands and run into "No such file or directory", execute pwd so locate your current directory

# End of work tasks

- Before you finish your task and handover to me, run and fix them all if they fail:
  - typecheck on all packages and apps 
  - run all tests 
  - run linting
  - npm run check-translations 
  - npm run check-translations -- --only-static

# Modes 

## Research Task

This means that I need to know things about either the codebase, how to implement a given feature or any other information
that requires you to think and come up with a plan. Under no circumstances implement anything or make changes to the 
code base unless you are explicitly asked to do so. Consider involving context7 mcp server for fetching latest documentation
or invoke a websearch in order to look up information. It might be a good idea to run the time mcp server to fetch the 
current datetime before you start your task.

## Commit Task

When I tell you commit task, commit all the changes that are currently done to the codebase in small meaningul commits.
Make sure to adhere to the commit guidelines, which are usually found in the commitlint config. There are also pre-commit 
hooks, that check for the style. So you can't do anything wrong.

# Architecture

## Models

We have three types of models in the codebase that represent a given supabase table:

### Data Models 

They basically represent the Row of the suapabse table. It is usually named after the table name with a `Model` suffix. 
For example `AgentModel`. They sometimes contain other models that are eagerly loaded in the api. In this case it 
should referennce the model type and not reintroduce the model. Check if the other model already exists. If not, create 
it. They are located in `packages/shared-domain/src/models`

### Insert Models 

They represent the `Insert` type of the supabase table. They are usually named after the table name with an 
`InsertModel` suffix. They have the required fields of the table and optional fields. For example `AgentInsertModel`. 
They are located in `packages/shared-domain/src/models`

### Update Models 

They represent the `Update` type of the supabase table. They are usually named after the table name with an `UpdateModel` 
suffix. They have all fields as optional. For example `AgentUpdateModel`. They are located in 
`packages/shared-domain/src/models`

## Transformers 

They are responsible for transforming the supabase types to the domain models. They are located in 
`packages/shared-domain/src/transformers`. We useually have three functions inside a transformer 

### toModel 

This function transforms a supabase row to a domain model. It is usually named `supabaseToModel`. For example 
`supabaseToAgent`. It takes a supabase row as an argument and returns a domain model. In case we eagerly load data 
we create a new row type that is based on the actual row but contains the eagerly loaded data. For example 

```ts
type AgentRowWithConfig = AgentRow & {
  agent_configurations: AgentConfigurationRow[];
};

const agentTransformer = {
  supabaseToAgent(row: AgentRowWithConfig): AgentModel {
    // ...
  }
};
```

### toInsert 

This function transforms a domain model to a supabase insert. It is usually named `modelToSupabaseInsert`. For example 
`agentInsertToSupabase`. It takes a domain model as an argument and returns a supabase insert. 

### toUpdate

This function transforms a domain model to a supabase update. It is usually named `modelToSupabaseUpdate`. For example 
`agentUpdateToSupabase`. It takes a domain model as an argument and returns a supabase update. 

## API 

The api is located in `packages/shared-domain/src/api`. It is responsible for calling the supabase client and 
transforming the response to the domain model. It should not contain any business logic. It should also not contain 
any data validation. The api is usually named after the table name. For example `agentApi`. It contains functions that 
perform crud operations on the table. For example `getAgentById`. It returns a `SupabaseResponse` that contains the 
data and error. The data is the domain model. The error is the supabase error. It takes only domain models or primitive
types as arguments. 

## Store and useHooks

### Store 

The store is responsible for loading and caching the data. It is located in `packages/shared-domain/src/stores`. It is 
usually named after the table name. For example `AgentStore`. It contains the data and functions to fetch the data. 
It should not contain any business logic. It should also not contain any data validation. It should only call the api. 
The store is a class and has a constructor that calls `makeAutoObservable(this)` in order to make the store observable. 
It also calls `makePersistable` with the parameters `name`, `properties` and `storage` in order to make the store 
persistable. The `name` is the name of the store. The `properties` are the properties that should be persisted. 
The `storage` is the storage backend that should be used. It is usually `getStorageForContext()`. 

It has functions for interacting with the api or setting and getting data. For example `getAgentById`. It takes only 
domain models or primitive types as arguments. It must not take supabase types as arguments. It utilizes `runInAction`
in order to update the store and it may use `toast` in order to show feedback to the user. 

Store are the only components that are allowed to call the api. 

The Store must be added to the `RootStore` in `packages/shared-domain/src/stores/RootStore.ts`. It must also be 
hydrated in the `RootStore.hydrate` function.

### useHooks 

The useHooks are responsible for calling the store and returning the data. They are located in 
`packages/shared-domain/src/hooks`. They are usually named after the table name. For example `useAgent`. They contain 
functions that perform crud operations on the table. For example `getAgentById`. They return a `StoreResponse` that 
contains the data and error. The data is the domain model. The error is the supabase error. They take only domain models 
or primitive types as arguments. 

useHooks never call the api directly but only through the store. It serves as the business logic layer between the 
ui and the store. It may contain business and validation logic. The useHooks utilize the `tanstack query client` and
sets appropriate query keys and stale times. Do not create a new query client instance but use the default one that is 
provided by the `packages/shared-domain/src/queryClient.ts`. The query keys are defined in the store and imported 
from there.

## UI Components

The UI components are located in `apps/saas/src/components`. They are usually named after the feature they represent. 
For example `AgentProfile`. They are responsible for rendering the UI and calling the useHooks. They should not 
contain any business logic. They must not call the api directly. They should not contain any data validation. Components
should be small. If they are too big, we should break them down into smaller meaningful components. Make sure that we
set the dependencies in `useEffects` correctly so that we do not create infinite loops. Utilize `useCallback` and 
`useMemo` whereever possible and feasable. We have atomic UI components in `packages/shared-ui` that should be used to 
build the UI. They are usually named after the HTML element they represent. For example `Button`. They are located in 
`packages/shared-ui/src/components`. Avoid using plain html elements and instead use the atomic UI components. If you 
need further styling, then go for tailwind classes instead of inline styles.

Components are meant to be reusable. So choose props wisely in order to be able to reuse the component. Do not pass 
hardcoded values to the component. Instead, pass them as props. This makes the component more flexible and reusable. 
Also use inversion of control in order to propagate events from the component to the parent. For example, if you 
want to handle a button click in the parent, then pass a callback function to the component as a prop. so that the parent
can handle the event. Do not handle the event in the component itself. 

Always check for existing components that you can reuse instead of creating a new one. Only create a new component if 
there is no existing one that you can reuse. 

In the UI always work with localized strings. The `shared-i18n` package provides a `useTranslation` hook that can be used 
to localize strings. It is located in `packages/shared-i18n/src/hooks/useTranslation.ts`. It returns a `t` function that 
can be used to localize strings. For example `t('common.cancel')`. The `t` function takes a key as an argument and returns 
the localized string. The key is the path to the string in the translation file. For example `common.cancel` refers to 
the `cancel` string in the `common.json` file. There are npm scripts for your in order to check whether or not you have
unstranslated content or missing translations. They are as follows:

- `npm run check-translations` - This will check for missing translations and untranslated content. 
- `npm run check-translations -- --only-static` - This will only check for untranslated content. 

# Recipes

## How to add a new oauth integration

### Create the OAuth App 

Create the OAuth App in the respective provider's developer console. For example in the GitHub developer console. This 
will provide you with the `client_id` and `client_secret` that you need to add to the supabase edge function. Follow
the documentation of the provider to create the OAuth App. 

### Environment Variables

Add the `client_id` and `client_secret` to the supabase edge function secrets. The name of the secrets should be 
`{PROVIDER}_OAUTH_CLIENT_ID` and `{PROVIDER}_OAUTH_CLIENT_SECRET`. For example `GITHUB_OAUTH_CLIENT_ID` and 
`GITHUB_OAUTH_CLIENT_SECRET`. 

You can run the following command to add the secrets to the supabase edge function: 

```bash
supabase secrets set {PROVIDER}_OAUTH_CLIENT_ID={CLIENT_ID} {PROVIDER}_OAUTH_CLIENT_SECRET={CLIENT_SECRET}
```

### Edge Function 

Create a new edge function in the `apps/saas/supabase/functions` folder. The name of the file should be 
`{provider}-oauth.ts`. For example `github-oauth.ts`. This function will be called by the api in order to initiate the 
oauth flow. It will also be called by the api in order to complete the oauth flow. It will also be called by the api in 
order to refresh the tokens. Follow the documentation of the provider to implement the edge function. You can use the 
other oauth edge functions as a reference. 

Make sure to add the newly created Environment Variables to the `apps/saas/supabase/functions/_shared/env.ts` file. And 
only ever load environment variables in the edge function via `_shared/env.ts`. Do not use `Deno.env.get` directly in the 
edge function other than in the `_shared/env.ts` file.

Wrap the function in `withCors` in order to enable cors. This method is located in `apps/saas/supabase/functions/_shared/cors.ts`.

### Callback Page 

Create a new callback page in the `apps/saas/src/pages` folder. The name of the file should be 
`{Provider}OAuthCallback.tsx`. For example `GitHubOAuthCallback.tsx`. This page will be called by the provider after the 
user has authenticated. It will call the api in order to complete the oauth flow. You can use the other callback pages 
as a reference. The url of the page should be `/integrations/{provider}/callback`. For example `/integrations/github/callback`. 

