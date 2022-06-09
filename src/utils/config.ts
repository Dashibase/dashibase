/*
This file contains documentation on the configuration for your Dashibase dashboard.
You should update ~/src/dashibaseConfig.ts to specify your config.
*/

/*
A Page corresponds to a page in the dashboard

Each Page is mapped to a Supabase table, which needs to fulfill 2 conditions
1. The table must contain a column that is a foreign key to the `id` column in the auth.users table, which defaults to
   'user' if unspecified - see `Page.user_col` below
2. The table must have an ID column, which defaults to 'id' if unspecified - see `Page.id_col` below

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
  id_col: string; // Name of column that refers to the row or item ID - defaults to 'id'
  user_col: string; // Name of column that refers to the user ID and is a foreign key to auth.users - defaults to 'user'
  enforce_user_col: boolean;
  attributes: Array<Attribute> // Which columns/attributes to show to the user
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
  linkedPage?: LinkedPage; // If attribute type is Page, this contains information for fetching and displaying the linked data
}

/*
If AttributeType is Page, then the object below is used to help fetch and display the linked data from a separate Supabase table
*/
export interface LinkedPage {
  name: string;
  id_col: string;
  value_col: string;
}

export enum AttributeType {
  Text = "TEXT",
  LongText = "LONGTEXT",
  Date = "DATE",
  Bool = "BOOL",
  Enum = "ENUM",
  PageX = "PAGE",
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
