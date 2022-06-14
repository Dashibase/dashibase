/*
This file contains documentation on the configuration for your Dashibase dashboard.
You should update ~/src/dashibaseConfig.ts to specify your config.
*/

/*
A Page corresponds to a page in the dashboard

Each Page is mapped to a Supabase table, which needs to fulfill 2 conditions
1. The table must contain a column that is a foreign key to the `id` column in the auth.users table, which defaults to
   'user' if unspecified - see `Page.user_col` below
2. [Deprecating Page.id_col] The table must have an ID column, which defaults to 'id' if unspecified - see `Page.id_col` below

We currently support 3 display modes
- 'single' shows a single page, meant of tables where each user can have a maximum of 1 row
- 'list' shows the user's data in a tabular format
- 'card' is similar to 'list' but represents each row as a card instead
*/
export interface Page {
  name: string; // Name of the page that will be seen by the user (required)
  page_id: string; // View ID, used for the URL (required)
  table_id: string; // Name of the Supabase table (required)
  mode: string; // One of ['single', 'list', 'card'] (required)
  readonly: boolean; // Whether this page is read-only
  user_col: string; // Name of column that refers to the user ID and is a foreign key to auth.users - defaults to 'user'
  enforce_user_col: boolean; // Whether this page enforces having a user_col foreign key in the corresponding Supabase table
  attributes: Array<Attribute>; // Which columns/attributes to show to the user
  triggers: Array<Trigger>;
}

/*
An Attribute corresponds to a column/attribute in a Supabase table
*/
export interface Attribute {
  id: string; // Column ID (required)
  label: string; // Label that will be seen by the user (required)
  required: boolean;  // Whether the attribute is required
  readonly: boolean; // Whether the attribute is read-only
  hidden: boolean; // Whether the attribute is hidden when displayed in table or cards
  type: AttributeType; // Type of attribute that determines UI of input (required)
  enumOptions?: string[]; // If attribute type is enum, this lists the options
}

export enum AttributeType {
  Text = "TEXT",
  LongText = "LONGTEXT",
  Date = "DATE",
  Bool = "BOOL",
  Enum = "ENUM",
  Join = "JOIN",
}

/*
A Trigger is a function that is triggered by a button click and accepts selected items as parameters
*/
export interface Trigger {
  label: string; // Trigger label shown on the button
  // Code that triggers when button is clicked, accepts the following arguments:
  // items - array of selected items or array of single item
  // user - user object obtained from supabase.auth.user()
  code: string;
  call?: Function; // Do not set - automatically initialized based on Trigger.code 
}

/*
Config - Dashibase Config
*/

export interface Config {
  name: string; // Name of your app or dashboard (required) - shown in title of the webpage via `components/branding/AppLogo.vue`
  supabase_url: string; // Supabase credentials (required) - see https://app.supabase.io/project/YOUR_PROJECT_ID/settings/api
  supabase_anon_key: string; // Supabase credentials (required) - see https://app.supabase.io/project/YOUR_PROJECT_ID/settings/api
  pages: Array<Page>; // Array of Views
}
