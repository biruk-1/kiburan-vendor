
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "budget_categories": {
                  Row: {
                    "id": string,"name_am": string | null,"name_en": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name_am"?: string | null,"name_en": string,"slug": string
                  }
                  Update: {
                    "id"?: string,"name_am"?: string | null,"name_en"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"budget_items": {
                  Row: {
                    "booking_id": string | null,"category_id": string | null,"committed_amount": number | null,"created_at": string,"estimated_amount": number,"id": string,"item_kind": string,"label": string,"notes": string | null,"wedding_id": string,"wedding_vendor_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "booking_id"?: string | null,"category_id"?: string | null,"committed_amount"?: number | null,"created_at"?: string,"estimated_amount"?: number,"id"?: string,"item_kind"?: string,"label": string,"notes"?: string | null,"wedding_id": string,"wedding_vendor_id"?: string | null
                  }
                  Update: {
                    "booking_id"?: string | null,"category_id"?: string | null,"committed_amount"?: number | null,"created_at"?: string,"estimated_amount"?: number,"id"?: string,"item_kind"?: string,"label"?: string,"notes"?: string | null,"wedding_id"?: string,"wedding_vendor_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "budget_items_booking_id_fkey"
      columns: ["booking_id"]
isOneToOne: false
      referencedRelation: "vendor_bookings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "budget_items_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "budget_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "budget_items_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "budget_items_wedding_vendor_id_fkey"
      columns: ["wedding_vendor_id"]
isOneToOne: false
      referencedRelation: "wedding_vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"checklist_templates": {
                  Row: {
                    "category_id": string,"description_am": string | null,"description_en": string | null,"id": string,"is_active": boolean,"sort_order": number,"suggested_days_before": number | null,"title_am": string | null,"title_en": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"description_am"?: string | null,"description_en"?: string | null,"id"?: string,"is_active"?: boolean,"sort_order"?: number,"suggested_days_before"?: number | null,"title_am"?: string | null,"title_en": string
                  }
                  Update: {
                    "category_id"?: string,"description_am"?: string | null,"description_en"?: string | null,"id"?: string,"is_active"?: boolean,"sort_order"?: number,"suggested_days_before"?: number | null,"title_am"?: string | null,"title_en"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "checklist_templates_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "task_categories"
      referencedColumns: ["id"]
    }
                  ]
                },"expense_payments": {
                  Row: {
                    "amount": number,"budget_item_id": string,"id": string,"notes": string | null,"paid_at": string,"payment_method": string | null,"receipt_storage_path": string | null,"recorded_by": string | null,"reference": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"budget_item_id": string,"id"?: string,"notes"?: string | null,"paid_at"?: string,"payment_method"?: string | null,"receipt_storage_path"?: string | null,"recorded_by"?: string | null,"reference"?: string | null
                  }
                  Update: {
                    "amount"?: number,"budget_item_id"?: string,"id"?: string,"notes"?: string | null,"paid_at"?: string,"payment_method"?: string | null,"receipt_storage_path"?: string | null,"recorded_by"?: string | null,"reference"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "expense_payments_budget_item_id_fkey"
      columns: ["budget_item_id"]
isOneToOne: false
      referencedRelation: "budget_items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "expense_payments_recorded_by_fkey"
      columns: ["recorded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"guest_group_coordinators": {
                  Row: {
                    "assigned_at": string,"assigned_by": string | null,"can_delete": boolean,"can_send_invitations": boolean,"group_id": string,"user_id": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"can_delete"?: boolean,"can_send_invitations"?: boolean,"group_id": string,"user_id": string,"wedding_id": string
                  }
                  Update: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"can_delete"?: boolean,"can_send_invitations"?: boolean,"group_id"?: string,"user_id"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "guest_group_coordinators_assigned_by_fkey"
      columns: ["assigned_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guest_group_coordinators_group_id_wedding_id_fkey"
      columns: ["group_id","wedding_id"]
isOneToOne: false
      referencedRelation: "guest_groups"
      referencedColumns: ["id","wedding_id"]
    },{
      foreignKeyName: "guest_group_coordinators_wedding_id_user_id_fkey"
      columns: ["wedding_id","user_id"]
isOneToOne: false
      referencedRelation: "wedding_members"
      referencedColumns: ["wedding_id","user_id"]
    }
                  ]
                },"guest_groups": {
                  Row: {
                    "created_by": string | null,"id": string,"name": string,"notes": string | null,"side": string | null,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_by"?: string | null,"id"?: string,"name": string,"notes"?: string | null,"side"?: string | null,"wedding_id": string
                  }
                  Update: {
                    "created_by"?: string | null,"id"?: string,"name"?: string,"notes"?: string | null,"side"?: string | null,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "guest_groups_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guest_groups_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"guest_rsvps": {
                  Row: {
                    "attendance_checked_in_at": string | null,"event_id": string,"guest_id": string,"responded_at": string | null,"response": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attendance_checked_in_at"?: string | null,"event_id": string,"guest_id": string,"responded_at"?: string | null,"response"?: string
                  }
                  Update: {
                    "attendance_checked_in_at"?: string | null,"event_id"?: string,"guest_id"?: string,"responded_at"?: string | null,"response"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "guest_rsvps_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guest_rsvps_guest_id_fkey"
      columns: ["guest_id"]
isOneToOne: false
      referencedRelation: "guests"
      referencedColumns: ["id"]
    }
                  ]
                },"guests": {
                  Row: {
                    "created_at": string,"created_by": string | null,"dietary_notes": string | null,"email": string | null,"full_name": string,"group_id": string | null,"guest_type": string | null,"id": string,"notes": string | null,"phone": string | null,"plus_one_allowed": boolean,"side": string | null,"updated_at": string | null,"updated_by": string | null,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"dietary_notes"?: string | null,"email"?: string | null,"full_name": string,"group_id"?: string | null,"guest_type"?: string | null,"id"?: string,"notes"?: string | null,"phone"?: string | null,"plus_one_allowed"?: boolean,"side"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"wedding_id": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"dietary_notes"?: string | null,"email"?: string | null,"full_name"?: string,"group_id"?: string | null,"guest_type"?: string | null,"id"?: string,"notes"?: string | null,"phone"?: string | null,"plus_one_allowed"?: boolean,"side"?: string | null,"updated_at"?: string | null,"updated_by"?: string | null,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "guests_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guests_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "guest_groups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guests_updated_by_fkey"
      columns: ["updated_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "guests_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"invitation_designs": {
                  Row: {
                    "created_at": string,"design_data": NonNullable<Json>,"id": string,"name": string,"storage_path": string | null,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"design_data"?: NonNullable<Json>,"id"?: string,"name": string,"storage_path"?: string | null,"wedding_id": string
                  }
                  Update: {
                    "created_at"?: string,"design_data"?: NonNullable<Json>,"id"?: string,"name"?: string,"storage_path"?: string | null,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitation_designs_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"invitation_events": {
                  Row: {
                    "event_id": string,"invitation_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "event_id": string,"invitation_id": string
                  }
                  Update: {
                    "event_id"?: string,"invitation_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitation_events_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitation_events_invitation_id_fkey"
      columns: ["invitation_id"]
isOneToOne: false
      referencedRelation: "invitations"
      referencedColumns: ["id"]
    }
                  ]
                },"invitations": {
                  Row: {
                    "created_at": string,"delivered_at": string | null,"delivery_channel": string | null,"design_id": string | null,"group_id": string | null,"guest_id": string | null,"id": string,"opened_at": string | null,"sent_at": string | null,"status": string,"token_hash": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"delivered_at"?: string | null,"delivery_channel"?: string | null,"design_id"?: string | null,"group_id"?: string | null,"guest_id"?: string | null,"id"?: string,"opened_at"?: string | null,"sent_at"?: string | null,"status"?: string,"token_hash": string,"wedding_id": string
                  }
                  Update: {
                    "created_at"?: string,"delivered_at"?: string | null,"delivery_channel"?: string | null,"design_id"?: string | null,"group_id"?: string | null,"guest_id"?: string | null,"id"?: string,"opened_at"?: string | null,"sent_at"?: string | null,"status"?: string,"token_hash"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitations_design_id_fkey"
      columns: ["design_id"]
isOneToOne: false
      referencedRelation: "invitation_designs"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitations_group_id_fkey"
      columns: ["group_id"]
isOneToOne: false
      referencedRelation: "guest_groups"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitations_guest_id_fkey"
      columns: ["guest_id"]
isOneToOne: false
      referencedRelation: "guests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitations_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"display_name": string,"id": string,"phone": string | null,"preferred_language": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string,"id": string,"phone"?: string | null,"preferred_language"?: string,"updated_at"?: string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"display_name"?: string,"id"?: string,"phone"?: string | null,"preferred_language"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"seating_assignments": {
                  Row: {
                    "event_id": string,"guest_id": string,"seat_number": number | null,"table_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "event_id": string,"guest_id": string,"seat_number"?: number | null,"table_id": string
                  }
                  Update: {
                    "event_id"?: string,"guest_id"?: string,"seat_number"?: number | null,"table_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "seating_assignments_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "seating_assignments_guest_id_fkey"
      columns: ["guest_id"]
isOneToOne: false
      referencedRelation: "guests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "seating_assignments_table_id_fkey"
      columns: ["table_id"]
isOneToOne: false
      referencedRelation: "seating_tables"
      referencedColumns: ["id"]
    }
                  ]
                },"seating_tables": {
                  Row: {
                    "capacity": number | null,"event_id": string,"id": string,"name": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "capacity"?: number | null,"event_id": string,"id"?: string,"name": string,"sort_order"?: number
                  }
                  Update: {
                    "capacity"?: number | null,"event_id"?: string,"id"?: string,"name"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "seating_tables_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    }
                  ]
                },"task_assignees": {
                  Row: {
                    "assigned_at": string,"assigned_by": string | null,"task_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"task_id": string,"user_id": string
                  }
                  Update: {
                    "assigned_at"?: string,"assigned_by"?: string | null,"task_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "task_assignees_assigned_by_fkey"
      columns: ["assigned_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "task_assignees_task_id_fkey"
      columns: ["task_id"]
isOneToOne: false
      referencedRelation: "wedding_tasks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "task_assignees_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"task_categories": {
                  Row: {
                    "icon": string | null,"id": string,"is_active": boolean,"name_am": string | null,"name_en": string,"slug": string,"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "icon"?: string | null,"id"?: string,"is_active"?: boolean,"name_am"?: string | null,"name_en": string,"slug": string,"sort_order"?: number
                  }
                  Update: {
                    "icon"?: string | null,"id"?: string,"is_active"?: boolean,"name_am"?: string | null,"name_en"?: string,"slug"?: string,"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"task_comments": {
                  Row: {
                    "author_id": string,"body": string,"created_at": string,"id": string,"task_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id": string,"body": string,"created_at"?: string,"id"?: string,"task_id": string
                  }
                  Update: {
                    "author_id"?: string,"body"?: string,"created_at"?: string,"id"?: string,"task_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "task_comments_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "task_comments_task_id_fkey"
      columns: ["task_id"]
isOneToOne: false
      referencedRelation: "wedding_tasks"
      referencedColumns: ["id"]
    }
                  ]
                },"timeline_items": {
                  Row: {
                    "assigned_to": string | null,"ends_at": string | null,"event_id": string,"id": string,"notes": string | null,"sort_order": number,"starts_at": string | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_to"?: string | null,"ends_at"?: string | null,"event_id": string,"id"?: string,"notes"?: string | null,"sort_order"?: number,"starts_at"?: string | null,"title": string
                  }
                  Update: {
                    "assigned_to"?: string | null,"ends_at"?: string | null,"event_id"?: string,"id"?: string,"notes"?: string | null,"sort_order"?: number,"starts_at"?: string | null,"title"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "timeline_items_assigned_to_fkey"
      columns: ["assigned_to"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "timeline_items_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_availability": {
                  Row: {
                    "ends_at": string,"id": string,"notes": string | null,"service_id": string | null,"starts_at": string,"status": string,"vendor_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ends_at": string,"id"?: string,"notes"?: string | null,"service_id"?: string | null,"starts_at": string,"status": string,"vendor_id": string
                  }
                  Update: {
                    "ends_at"?: string,"id"?: string,"notes"?: string | null,"service_id"?: string | null,"starts_at"?: string,"status"?: string,"vendor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_availability_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "vendor_services"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_availability_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_bookings": {
                  Row: {
                    "booking_date": string | null,"contract_storage_path": string | null,"created_at": string,"currency_code": string,"deposit_amount": number | null,"end_at": string | null,"id": string,"notes": string | null,"quote_id": string | null,"start_at": string | null,"status": string,"total_amount": number | null,"updated_at": string | null,"wedding_vendor_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "booking_date"?: string | null,"contract_storage_path"?: string | null,"created_at"?: string,"currency_code"?: string,"deposit_amount"?: number | null,"end_at"?: string | null,"id"?: string,"notes"?: string | null,"quote_id"?: string | null,"start_at"?: string | null,"status"?: string,"total_amount"?: number | null,"updated_at"?: string | null,"wedding_vendor_id": string
                  }
                  Update: {
                    "booking_date"?: string | null,"contract_storage_path"?: string | null,"created_at"?: string,"currency_code"?: string,"deposit_amount"?: number | null,"end_at"?: string | null,"id"?: string,"notes"?: string | null,"quote_id"?: string | null,"start_at"?: string | null,"status"?: string,"total_amount"?: number | null,"updated_at"?: string | null,"wedding_vendor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_bookings_quote_id_fkey"
      columns: ["quote_id"]
isOneToOne: false
      referencedRelation: "vendor_quotes"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_bookings_wedding_vendor_id_fkey"
      columns: ["wedding_vendor_id"]
isOneToOne: false
      referencedRelation: "wedding_vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_categories": {
                  Row: {
                    "id": string,"name_am": string | null,"name_en": string,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"name_am"?: string | null,"name_en": string,"slug": string
                  }
                  Update: {
                    "id"?: string,"name_am"?: string | null,"name_en"?: string,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"vendor_category_memberships": {
                  Row: {
                    "category_id": string,"vendor_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"vendor_id": string
                  }
                  Update: {
                    "category_id"?: string,"vendor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_category_memberships_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "vendor_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_category_memberships_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_inquiries": {
                  Row: {
                    "created_at": string,"created_by": string,"id": string,"message": string | null,"proposed_budget": number | null,"requested_event_id": string | null,"service_id": string | null,"status": string,"updated_at": string | null,"vendor_id": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by": string,"id"?: string,"message"?: string | null,"proposed_budget"?: number | null,"requested_event_id"?: string | null,"service_id"?: string | null,"status"?: string,"updated_at"?: string | null,"vendor_id": string,"wedding_id": string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string,"id"?: string,"message"?: string | null,"proposed_budget"?: number | null,"requested_event_id"?: string | null,"service_id"?: string | null,"status"?: string,"updated_at"?: string | null,"vendor_id"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_inquiries_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_inquiries_requested_event_id_fkey"
      columns: ["requested_event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_inquiries_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "vendor_services"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_inquiries_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_inquiries_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_media": {
                  Row: {
                    "caption": string | null,"id": string,"media_type": string,"service_id": string | null,"sort_order": number,"storage_path": string,"vendor_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "caption"?: string | null,"id"?: string,"media_type"?: string,"service_id"?: string | null,"sort_order"?: number,"storage_path": string,"vendor_id": string
                  }
                  Update: {
                    "caption"?: string | null,"id"?: string,"media_type"?: string,"service_id"?: string | null,"sort_order"?: number,"storage_path"?: string,"vendor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_media_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "vendor_services"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_media_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_packages": {
                  Row: {
                    "currency_code": string,"description": string | null,"id": string,"inclusions": NonNullable<Json>,"is_active": boolean,"name": string,"price": number | null,"service_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "currency_code"?: string,"description"?: string | null,"id"?: string,"inclusions"?: NonNullable<Json>,"is_active"?: boolean,"name": string,"price"?: number | null,"service_id": string
                  }
                  Update: {
                    "currency_code"?: string,"description"?: string | null,"id"?: string,"inclusions"?: NonNullable<Json>,"is_active"?: boolean,"name"?: string,"price"?: number | null,"service_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_packages_service_id_fkey"
      columns: ["service_id"]
isOneToOne: false
      referencedRelation: "vendor_services"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_quotes": {
                  Row: {
                    "amount": number,"created_at": string,"currency_code": string,"description": string | null,"id": string,"inquiry_id": string,"package_id": string | null,"status": string,"updated_at": string | null,"valid_until": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount": number,"created_at"?: string,"currency_code"?: string,"description"?: string | null,"id"?: string,"inquiry_id": string,"package_id"?: string | null,"status"?: string,"updated_at"?: string | null,"valid_until"?: string | null
                  }
                  Update: {
                    "amount"?: number,"created_at"?: string,"currency_code"?: string,"description"?: string | null,"id"?: string,"inquiry_id"?: string,"package_id"?: string | null,"status"?: string,"updated_at"?: string | null,"valid_until"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_quotes_inquiry_id_fkey"
      columns: ["inquiry_id"]
isOneToOne: false
      referencedRelation: "vendor_inquiries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_quotes_package_id_fkey"
      columns: ["package_id"]
isOneToOne: false
      referencedRelation: "vendor_packages"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_reviews": {
                  Row: {
                    "comment": string | null,"created_at": string,"id": string,"rating": number,"reviewer_id": string,"status": string,"vendor_id": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "comment"?: string | null,"created_at"?: string,"id"?: string,"rating": number,"reviewer_id": string,"status"?: string,"vendor_id": string,"wedding_id": string
                  }
                  Update: {
                    "comment"?: string | null,"created_at"?: string,"id"?: string,"rating"?: number,"reviewer_id"?: string,"status"?: string,"vendor_id"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_reviews_reviewer_id_fkey"
      columns: ["reviewer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_reviews_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_reviews_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_services": {
                  Row: {
                    "base_price": number | null,"category_id": string | null,"created_at": string,"currency_code": string,"description": string | null,"id": string,"is_active": boolean,"price_unit": string,"title": string,"updated_at": string | null,"vendor_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "base_price"?: number | null,"category_id"?: string | null,"created_at"?: string,"currency_code"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"price_unit"?: string,"title": string,"updated_at"?: string | null,"vendor_id": string
                  }
                  Update: {
                    "base_price"?: number | null,"category_id"?: string | null,"created_at"?: string,"currency_code"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"price_unit"?: string,"title"?: string,"updated_at"?: string | null,"vendor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_services_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "vendor_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_services_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"vendor_team_members": {
                  Row: {
                    "role": string,"user_id": string,"vendor_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "role"?: string,"user_id": string,"vendor_id": string
                  }
                  Update: {
                    "role"?: string,"user_id"?: string,"vendor_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendor_team_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "vendor_team_members_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    }
                  ]
                },"vendors": {
                  Row: {
                    "address": string | null,"business_name": string,"city": string | null,"country_code": string,"cover_url": string | null,"created_at": string,"description": string | null,"email": string | null,"id": string,"instagram_url": string | null,"listing_status": string,"logo_url": string | null,"owner_user_id": string,"phone": string | null,"slug": string,"updated_at": string,"verification_status": string,"website_url": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"business_name": string,"city"?: string | null,"country_code"?: string,"cover_url"?: string | null,"created_at"?: string,"description"?: string | null,"email"?: string | null,"id"?: string,"instagram_url"?: string | null,"listing_status"?: string,"logo_url"?: string | null,"owner_user_id": string,"phone"?: string | null,"slug": string,"updated_at"?: string,"verification_status"?: string,"website_url"?: string | null
                  }
                  Update: {
                    "address"?: string | null,"business_name"?: string,"city"?: string | null,"country_code"?: string,"cover_url"?: string | null,"created_at"?: string,"description"?: string | null,"email"?: string | null,"id"?: string,"instagram_url"?: string | null,"listing_status"?: string,"logo_url"?: string | null,"owner_user_id"?: string,"phone"?: string | null,"slug"?: string,"updated_at"?: string,"verification_status"?: string,"website_url"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "vendors_owner_user_id_fkey"
      columns: ["owner_user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_activity_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity_id": string | null,"entity_type": string,"id": string,"required_permission": string | null,"summary": NonNullable<Json>,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"id"?: string,"required_permission"?: string | null,"summary"?: NonNullable<Json>,"wedding_id": string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"id"?: string,"required_permission"?: string | null,"summary"?: NonNullable<Json>,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_activity_log_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_activity_log_required_permission_fkey"
      columns: ["required_permission"]
isOneToOne: false
      referencedRelation: "wedding_permission_catalog"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "wedding_activity_log_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_budgets": {
                  Row: {
                    "currency_code": string,"total_budget": number,"updated_at": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "currency_code"?: string,"total_budget"?: number,"updated_at"?: string,"wedding_id": string
                  }
                  Update: {
                    "currency_code"?: string,"total_budget"?: number,"updated_at"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_budgets_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: true
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_events": {
                  Row: {
                    "address": string | null,"city": string | null,"ends_at": string | null,"event_type": string,"id": string,"name": string,"notes": string | null,"sort_order": number,"starts_at": string | null,"venue_name": string | null,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"city"?: string | null,"ends_at"?: string | null,"event_type"?: string,"id"?: string,"name": string,"notes"?: string | null,"sort_order"?: number,"starts_at"?: string | null,"venue_name"?: string | null,"wedding_id": string
                  }
                  Update: {
                    "address"?: string | null,"city"?: string | null,"ends_at"?: string | null,"event_type"?: string,"id"?: string,"name"?: string,"notes"?: string | null,"sort_order"?: number,"starts_at"?: string | null,"venue_name"?: string | null,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_events_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_files": {
                  Row: {
                    "booking_id": string | null,"created_at": string,"display_name": string,"id": string,"storage_path": string,"task_id": string | null,"uploaded_by": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "booking_id"?: string | null,"created_at"?: string,"display_name": string,"id"?: string,"storage_path": string,"task_id"?: string | null,"uploaded_by": string,"wedding_id": string
                  }
                  Update: {
                    "booking_id"?: string | null,"created_at"?: string,"display_name"?: string,"id"?: string,"storage_path"?: string,"task_id"?: string | null,"uploaded_by"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_files_booking_id_fkey"
      columns: ["booking_id"]
isOneToOne: false
      referencedRelation: "vendor_bookings"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_files_task_id_fkey"
      columns: ["task_id"]
isOneToOne: false
      referencedRelation: "wedding_tasks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_files_uploaded_by_fkey"
      columns: ["uploaded_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_files_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_invites": {
                  Row: {
                    "accepted_at": string | null,"accepted_by": string | null,"created_at": string,"expires_at": string,"group_assignments": NonNullable<Json>,"id": string,"invite_kind": string,"invited_by": string,"invited_email": string | null,"invited_email_normalized": string | null,"invited_phone": string | null,"last_sent_at": string | null,"permissions": (string)[],"revoked_at": string | null,"revoked_by": string | null,"role": string,"token_hash": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string | null,"accepted_by"?: string | null,"created_at"?: string,"expires_at": string,"group_assignments"?: NonNullable<Json>,"id"?: string,"invite_kind"?: string,"invited_by": string,"invited_email"?: string | null,"invited_email_normalized"?: never,"invited_phone"?: string | null,"last_sent_at"?: string | null,"permissions"?: (string)[],"revoked_at"?: string | null,"revoked_by"?: string | null,"role"?: string,"token_hash": string,"wedding_id": string
                  }
                  Update: {
                    "accepted_at"?: string | null,"accepted_by"?: string | null,"created_at"?: string,"expires_at"?: string,"group_assignments"?: NonNullable<Json>,"id"?: string,"invite_kind"?: string,"invited_by"?: string,"invited_email"?: string | null,"invited_email_normalized"?: never,"invited_phone"?: string | null,"last_sent_at"?: string | null,"permissions"?: (string)[],"revoked_at"?: string | null,"revoked_by"?: string | null,"role"?: string,"token_hash"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_invites_accepted_by_fkey"
      columns: ["accepted_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_invites_invited_by_fkey"
      columns: ["invited_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_invites_revoked_by_fkey"
      columns: ["revoked_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_invites_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_member_permissions": {
                  Row: {
                    "granted_at": string,"granted_by": string | null,"permission": string,"user_id": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string,"granted_by"?: string | null,"permission": string,"user_id": string,"wedding_id": string
                  }
                  Update: {
                    "granted_at"?: string,"granted_by"?: string | null,"permission"?: string,"user_id"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_member_permissions_granted_by_fkey"
      columns: ["granted_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_member_permissions_permission_fkey"
      columns: ["permission"]
isOneToOne: false
      referencedRelation: "wedding_permission_catalog"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "wedding_member_permissions_wedding_id_user_id_fkey"
      columns: ["wedding_id","user_id"]
isOneToOne: false
      referencedRelation: "wedding_members"
      referencedColumns: ["wedding_id","user_id"]
    }
                  ]
                },"wedding_members": {
                  Row: {
                    "invited_by": string | null,"joined_at": string,"role": string,"updated_at": string,"user_id": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "invited_by"?: string | null,"joined_at"?: string,"role": string,"updated_at"?: string,"user_id": string,"wedding_id": string
                  }
                  Update: {
                    "invited_by"?: string | null,"joined_at"?: string,"role"?: string,"updated_at"?: string,"user_id"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_members_invited_by_fkey"
      columns: ["invited_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_members_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_members_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_permission_catalog": {
                  Row: {
                    "category": string,"description": string,"is_financial": boolean,"is_grantable": boolean,"key": string,"label": string,"requires": (string)[],"sort_order": number
                  }
                  ComputedFields: never
                  Insert: {
                    "category": string,"description": string,"is_financial"?: boolean,"is_grantable": boolean,"key": string,"label": string,"requires"?: (string)[],"sort_order": number
                  }
                  Update: {
                    "category"?: string,"description"?: string,"is_financial"?: boolean,"is_grantable"?: boolean,"key"?: string,"label"?: string,"requires"?: (string)[],"sort_order"?: number
                  }
                  Relationships: [
                    
                  ]
                },"wedding_role_templates": {
                  Row: {
                    "permission": string,"template": string
                  }
                  ComputedFields: never
                  Insert: {
                    "permission": string,"template": string
                  }
                  Update: {
                    "permission"?: string,"template"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_role_templates_permission_fkey"
      columns: ["permission"]
isOneToOne: false
      referencedRelation: "wedding_permission_catalog"
      referencedColumns: ["key"]
    }
                  ]
                },"wedding_tasks": {
                  Row: {
                    "category_id": string | null,"completed_at": string | null,"created_at": string,"created_by": string | null,"description": string | null,"due_date": string | null,"event_id": string | null,"id": string,"parent_task_id": string | null,"priority": string,"sort_order": number,"status": string,"template_id": string | null,"title": string,"updated_at": string,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id"?: string | null,"completed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"due_date"?: string | null,"event_id"?: string | null,"id"?: string,"parent_task_id"?: string | null,"priority"?: string,"sort_order"?: number,"status"?: string,"template_id"?: string | null,"title": string,"updated_at"?: string,"wedding_id": string
                  }
                  Update: {
                    "category_id"?: string | null,"completed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"due_date"?: string | null,"event_id"?: string | null,"id"?: string,"parent_task_id"?: string | null,"priority"?: string,"sort_order"?: number,"status"?: string,"template_id"?: string | null,"title"?: string,"updated_at"?: string,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_tasks_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "task_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_tasks_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_tasks_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_tasks_parent_task_id_fkey"
      columns: ["parent_task_id"]
isOneToOne: false
      referencedRelation: "wedding_tasks"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_tasks_template_id_fkey"
      columns: ["template_id"]
isOneToOne: false
      referencedRelation: "checklist_templates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_tasks_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"wedding_vendors": {
                  Row: {
                    "category_id": string | null,"created_at": string,"event_id": string | null,"external_business_name": string | null,"external_phone": string | null,"id": string,"notes": string | null,"status": string,"vendor_id": string | null,"wedding_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id"?: string | null,"created_at"?: string,"event_id"?: string | null,"external_business_name"?: string | null,"external_phone"?: string | null,"id"?: string,"notes"?: string | null,"status"?: string,"vendor_id"?: string | null,"wedding_id": string
                  }
                  Update: {
                    "category_id"?: string | null,"created_at"?: string,"event_id"?: string | null,"external_business_name"?: string | null,"external_phone"?: string | null,"id"?: string,"notes"?: string | null,"status"?: string,"vendor_id"?: string | null,"wedding_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wedding_vendors_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "vendor_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_vendors_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "wedding_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_vendors_vendor_id_fkey"
      columns: ["vendor_id"]
isOneToOne: false
      referencedRelation: "vendors"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wedding_vendors_wedding_id_fkey"
      columns: ["wedding_id"]
isOneToOne: false
      referencedRelation: "weddings"
      referencedColumns: ["id"]
    }
                  ]
                },"weddings": {
                  Row: {
                    "celebration_kind": string,"city": string | null,"country_code": string,"cover_image_url": string | null,"created_at": string,"created_by": string,"currency_code": string,"estimated_guest_count": number | null,"id": string,"partner_one_name": string | null,"partner_two_name": string | null,"status": string,"style": string | null,"timezone": string,"title": string,"updated_at": string,"wedding_date": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "celebration_kind"?: string,"city"?: string | null,"country_code"?: string,"cover_image_url"?: string | null,"created_at"?: string,"created_by": string,"currency_code"?: string,"estimated_guest_count"?: number | null,"id"?: string,"partner_one_name"?: string | null,"partner_two_name"?: string | null,"status"?: string,"style"?: string | null,"timezone"?: string,"title": string,"updated_at"?: string,"wedding_date"?: string | null
                  }
                  Update: {
                    "celebration_kind"?: string,"city"?: string | null,"country_code"?: string,"cover_image_url"?: string | null,"created_at"?: string,"created_by"?: string,"currency_code"?: string,"estimated_guest_count"?: number | null,"id"?: string,"partner_one_name"?: string | null,"partner_two_name"?: string | null,"status"?: string,"style"?: string | null,"timezone"?: string,"title"?: string,"updated_at"?: string,"wedding_date"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "weddings_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "accept_my_team_invite":
{ Args: { "p_invite_id": string }; Returns: {
              "invited_by": string | null,
"joined_at": string,
"role": string,
"updated_at": string,
"user_id": string,
"wedding_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "wedding_members"
        isOneToOne: true
        isSetofReturn: false
      } },
"accept_team_invite":
{ Args: { "p_raw_token": string }; Returns: {
              "invited_by": string | null,
"joined_at": string,
"role": string,
"updated_at": string,
"user_id": string,
"wedding_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "wedding_members"
        isOneToOne: true
        isSetofReturn: false
      } },
"accept_vendor_quote":
{ Args: { "p_quote_id": string }; Returns: Json
                           },
"accept_wedding_invite":
{ Args: { "p_raw_token": string }; Returns: {
              "invited_by": string | null,
"joined_at": string,
"role": string,
"updated_at": string,
"user_id": string,
"wedding_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "wedding_members"
        isOneToOne: true
        isSetofReturn: false
      } },
"assign_group_coordinator":
{ Args: { "p_can_delete"?: boolean,"p_can_send_invitations"?: boolean,"p_group_id": string,"p_user_id": string,"p_wedding_id": string }; Returns: {
              "assigned_at": string,
"assigned_by": string | null,
"can_delete": boolean,
"can_send_invitations": boolean,
"group_id": string,
"user_id": string,
"wedding_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "guest_group_coordinators"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_guest_invitation":
{ Args: { "p_delivery_channel"?: string,"p_design_id"?: string,"p_event_ids"?: (string)[],"p_group_id"?: string,"p_guest_id"?: string,"p_wedding_id": string }; Returns: {
              "invitation_id": string,"raw_token": string
            }[]
                           },
"create_team_invite":
{ Args: { "p_expires_in"?: string,"p_group_assignments"?: Json,"p_invite_kind"?: string,"p_invited_email": string,"p_permissions"?: (string)[],"p_role_template"?: string,"p_wedding_id": string }; Returns: {
              "expires_at": string,"invite_id": string,"raw_token": string
            }[]
                           },
"create_vendor":
{ Args: { "p_business_name": string,"p_category_ids": (string)[],"p_city"?: string,"p_description"?: string,"p_email"?: string,"p_phone"?: string }; Returns: {
              "address": string | null,
"business_name": string,
"city": string | null,
"country_code": string,
"cover_url": string | null,
"created_at": string,
"description": string | null,
"email": string | null,
"id": string,
"instagram_url": string | null,
"listing_status": string,
"logo_url": string | null,
"owner_user_id": string,
"phone": string | null,
"slug": string,
"updated_at": string,
"verification_status": string,
"website_url": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "vendors"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_wedding":
{ Args: { "p_budget_allocations"?: Json,"p_celebration_kind"?: string,"p_city"?: string,"p_country_code"?: string,"p_currency_code"?: string,"p_estimated_guest_count"?: number,"p_partner_one_name"?: string,"p_partner_two_name"?: string,"p_style"?: string,"p_timezone"?: string,"p_title": string,"p_total_budget"?: number,"p_wedding_date"?: string }; Returns: {
              "celebration_kind": string,
"city": string | null,
"country_code": string,
"cover_image_url": string | null,
"created_at": string,
"created_by": string,
"currency_code": string,
"estimated_guest_count": number | null,
"id": string,
"partner_one_name": string | null,
"partner_two_name": string | null,
"status": string,
"style": string | null,
"timezone": string,
"title": string,
"updated_at": string,
"wedding_date": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "weddings"
        isOneToOne: true
        isSetofReturn: false
      } },
"create_wedding_invite":
{ Args: { "p_expires_in"?: string,"p_invited_email"?: string,"p_invited_phone"?: string,"p_role"?: string,"p_wedding_id": string }; Returns: {
              "expires_at": string,"invite_id": string,"raw_token": string
            }[]
                           },
"delete_guest":
{ Args: { "p_guest_id": string,"p_wedding_id": string }; Returns: undefined
                           },
"delete_guest_group":
{ Args: { "p_group_id": string,"p_wedding_id": string }; Returns: undefined
                           },
"ensure_family_guest_groups":
{ Args: { "p_wedding_id": string }; Returns: Json
                           },
"get_budget_summary":
{ Args: { "p_wedding_id": string }; Returns: Json
                           },
"get_guest_invitation_by_token":
{ Args: { "p_raw_token": string }; Returns: Json
                           },
"get_guest_stats":
{ Args: { "p_event_id"?: string,"p_wedding_id": string }; Returns: Json
                           },
"get_my_wedding_access":
{ Args: { "p_wedding_id": string }; Returns: Json
                           },
"get_team_invite_preview":
{ Args: { "p_raw_token": string }; Returns: Json
                           },
"get_wedding_guest":
{ Args: { "p_guest_id": string,"p_wedding_id": string }; Returns: Json
                           },
"guest_name_email_taken":
{ Args: { "p_email": string,"p_exclude_guest_id"?: string,"p_full_name": string,"p_wedding_id": string }; Returns: boolean
                           },
"leave_wedding":
{ Args: { "p_wedding_id": string }; Returns: undefined
                           },
"list_my_pending_team_invites":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"list_team_invites":
{ Args: { "p_wedding_id": string }; Returns: Json
                           },
"list_team_members":
{ Args: { "p_wedding_id": string }; Returns: Json
                           },
"list_wedding_guests":
{ Args: { "p_group_id"?: string,"p_limit"?: number,"p_offset"?: number,"p_query"?: string,"p_wedding_id": string }; Returns: Json
                           },
"mark_guest_invitation_sent":
{ Args: { "p_invitation_id": string }; Returns: Json
                           },
"remove_member":
{ Args: { "p_user_id": string,"p_wedding_id": string }; Returns: undefined
                           },
"resend_team_invite":
{ Args: { "p_expires_in"?: string,"p_invite_id": string }; Returns: {
              "expires_at": string,"invite_id": string,"raw_token": string
            }[]
                           },
"revoke_team_invite":
{ Args: { "p_invite_id": string }; Returns: undefined
                           },
"set_member_permissions":
{ Args: { "p_permissions": (string)[],"p_user_id": string,"p_wedding_id": string }; Returns: Json
                           },
"set_member_role_template":
{ Args: { "p_reset_permissions"?: boolean,"p_template": string,"p_user_id": string,"p_wedding_id": string }; Returns: {
              "invited_by": string | null,
"joined_at": string,
"role": string,
"updated_at": string,
"user_id": string,
"wedding_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "wedding_members"
        isOneToOne: true
        isSetofReturn: false
      } },
"set_task_assignees":
{ Args: { "p_task_id": string,"p_user_ids"?: (string)[] }; Returns: Json
                           },
"set_wedding_member_role":
{ Args: { "p_role": string,"p_user_id": string,"p_wedding_id": string }; Returns: {
              "invited_by": string | null,
"joined_at": string,
"role": string,
"updated_at": string,
"user_id": string,
"wedding_id": string
            }
                          SetofOptions: {
        from: "*"
        to: "wedding_members"
        isOneToOne: true
        isSetofReturn: false
      } },
"submit_guest_invitation_rsvp":
{ Args: { "p_event_id": string,"p_guest_id": string,"p_raw_token": string,"p_response": string }; Returns: {
              "attendance_checked_in_at": string | null,
"event_id": string,
"guest_id": string,
"responded_at": string | null,
"response": string
            }
                          SetofOptions: {
        from: "*"
        to: "guest_rsvps"
        isOneToOne: true
        isSetofReturn: false
      } },
"submit_vendor_for_verification":
{ Args: { "p_vendor_id": string }; Returns: {
              "address": string | null,
"business_name": string,
"city": string | null,
"country_code": string,
"cover_url": string | null,
"created_at": string,
"description": string | null,
"email": string | null,
"id": string,
"instagram_url": string | null,
"listing_status": string,
"logo_url": string | null,
"owner_user_id": string,
"phone": string | null,
"slug": string,
"updated_at": string,
"verification_status": string,
"website_url": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "vendors"
        isOneToOne: true
        isSetofReturn: false
      } },
"unassign_group_coordinator":
{ Args: { "p_group_id": string,"p_user_id": string,"p_wedding_id": string }; Returns: undefined
                           },
"update_wedding_settings":
{ Args: { "p_city"?: string,"p_cover_image_url"?: string,"p_currency_code"?: string,"p_estimated_guest_count"?: number,"p_partner_one_name"?: string,"p_partner_two_name"?: string,"p_status"?: string,"p_style"?: string,"p_title"?: string,"p_wedding_date"?: string,"p_wedding_id": string }; Returns: {
              "celebration_kind": string,
"city": string | null,
"country_code": string,
"cover_image_url": string | null,
"created_at": string,
"created_by": string,
"currency_code": string,
"estimated_guest_count": number | null,
"id": string,
"partner_one_name": string | null,
"partner_two_name": string | null,
"status": string,
"style": string | null,
"timezone": string,
"title": string,
"updated_at": string,
"wedding_date": string | null
            }
                          SetofOptions: {
        from: "*"
        to: "weddings"
        isOneToOne: true
        isSetofReturn: false
      } },
"validate_team_invite_email":
{ Args: { "p_email": string,"p_raw_token": string }; Returns: Json
                           },
"vendor_dashboard_summary":
{ Args: { "p_vendor_id": string }; Returns: Json
                           },
"vendor_earnings_summary":
{ Args: { "p_vendor_id": string }; Returns: Json
                           },
"vendor_get_booking":
{ Args: { "p_booking_id": string }; Returns: Json
                           },
"vendor_get_inquiry":
{ Args: { "p_inquiry_id": string }; Returns: Json
                           },
"vendor_list_bookings":
{ Args: { "p_cursor_created_at"?: string,"p_cursor_id"?: string,"p_limit"?: number,"p_status"?: string,"p_vendor_id": string }; Returns: Json
                           },
"vendor_list_inquiries":
{ Args: { "p_cursor_created_at"?: string,"p_cursor_id"?: string,"p_limit"?: number,"p_status"?: string,"p_vendor_id": string }; Returns: Json
                           },
"vendor_list_reviews":
{ Args: { "p_cursor_created_at"?: string,"p_cursor_id"?: string,"p_limit"?: number,"p_status"?: string,"p_vendor_id": string }; Returns: Json
                           },
"vendor_respond_booking":
{ Args: { "p_action": string,"p_booking_id": string,"p_note"?: string }; Returns: Json
                           },
"vendor_send_quote":
{ Args: { "p_amount": number,"p_currency_code"?: string,"p_description"?: string,"p_inquiry_id": string,"p_package_id"?: string,"p_valid_until"?: string }; Returns: Json
                           },
"vendor_update_inquiry_status":
{ Args: { "p_inquiry_id": string,"p_status": string }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
