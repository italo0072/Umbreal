export type Profile = { id: string; display_name: string; created_at: string }
export type Guide = { id: number; title: string; detail: string }
type ReadTable<Row> = { Row: Row; Insert: never; Update: never; Relationships: [] }
export type Database = {
  public: {
    Tables: {
      umbral_profiles: ReadTable<Profile>
      umbral_guides: ReadTable<Guide>
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
