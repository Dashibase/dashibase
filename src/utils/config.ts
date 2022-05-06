/*
This file contains documentation on the configuration for your Dashibase dashboard.
You should update ~/src/dashibaseConfig.ts to specify your config.
*/

/*
A Page corresponds to a page in the dashboard

Each Page is mapped to a Supabase table, which needs to fulfill 2 conditions
1. The table must contain a column named `user` that is a foreign key to the `id` column in the auth.users table
2. The table must have a primary key named `id`

We currently support 3 display modes
- 'single' shows a single page, meant of tables where each user can have a maximum of 1 row - see example in https://dashibase.com/demo/profile
- 'list' shows the user's data in a tabular format - see example in https://dashibase.com/demo/todo
- 'card' is similar to 'list' but represents each row as a card instead - see example in https://dashibase.com/demo/notes
*/
export interface Page {
  name: string; // Name of the page that will be seen by the user
  view_id: string; // View ID, used for the URL
  table_id: string; // Name of the Supabase table
  mode: string; // One of ['single', 'list', 'card']
  readonly: boolean; // Whether this page is read-only
  attributes: Array<Attribute> // Which columns/attributes to show to the user
}

/*
An Attribute corresponds to a column/attribute in a Supabase table
*/
export interface Attribute {
  id: string; // Column ID
  label: string; // Label that will be seen by the user
  required: boolean;  // Whether the attribute is required
  readonly: boolean; // Whether the attribute is read-only
  type: AttributeType; // Type of attribute that determines UI of input
  enumOptions?: string[]; // If attribute type is enum, this lists the options
}

export enum AttributeType {
  Text = "TEXT",
  LongText = "LONGTEXT",
  Date = "DATE",
  Bool = "BOOL",
  Enum = "ENUM",
}

/*
Config - Dashibase Config
*/

export interface Config {
  name: string; // Name of your app or dashboard - shown in title of the webpage and in `components/branding/AppLogo.vue`
  supabase_url: string; // Supabase credentials - see https://app.supabase.io/project/YOUR_PROJECT_ID/settings/api
  supabase_anon_key: string; // Supabase credentials - see https://app.supabase.io/project/YOUR_PROJECT_ID/settings/api
  views: Array<Page>; // Array of Views
}
