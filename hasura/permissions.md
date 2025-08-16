
# Hasura Permissions (role: user)

## chats
- **insert**:
  - Check: `{"user_id": {"_eq": "X-Hasura-User-Id"}}` (use column preset below)
  - Column presets:
    - `user_id` → from session variable `X-Hasura-User-Id`
  - Allowed columns: (none required beyond defaults)
- **select**:
  - Row filter: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`
  - Columns: `id`, `user_id`, `created_at`
- **delete**:
  - Row filter: `{"user_id": {"_eq": "X-Hasura-User-Id"}}`

## messages
- Relationship: `messages.chat` from `messages.chat_id -> chats.id` must be tracked.

- **insert**:
  - Row check: `{"chat": {"user_id": {"_eq": "X-Hasura-User-Id"}}}`
  - Columns: `chat_id`, `sender`, `content`
- **select**:
  - Row filter: `{"chat": {"user_id": {"_eq": "X-Hasura-User-Id"}}}`
  - Columns: `id`, `chat_id`, `sender`, `content`, `created_at`

## Action: sendMessage
- Allow role: `user`
- Forward client headers: ON (so `x-hasura-user-id` reaches n8n).
