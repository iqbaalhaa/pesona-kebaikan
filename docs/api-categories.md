# API Documentation: Campaign Categories

## Base URL
`/api/campaigns/categories`

## Endpoints

### 1. Get Categories
Retrieves a list of campaign categories.

**Method:** `GET`

**Query Parameters:**
- `active` (optional): Set to `true` to filter only active categories.

**Response:**
Returns an array of category objects.

```json
[
  {
    "id": "cuid...",
    "name": "Bencana Alam",
    "slug": "bencana-alam",
    "icon": "bencana",
    "isActive": true,
    "desc": "Description...",
    "options": [...],
    "examples": [...]
  }
]
```

### 2. Create Category
Creates a new campaign category.

**Method:** `POST`

**Body:**
```json
{
  "name": "New Category",
  "slug": "new-category", // optional, auto-generated if missing
  "icon": "icon-key", // optional
  "isActive": true // optional, default true
}
```

### 3. Update Category
Updates an existing campaign category.

**Method:** `PUT`

**Body:**
```json
{
  "id": "cuid...",
  "name": "Updated Name",
  "slug": "updated-slug",
  "icon": "icon-key",
  "isActive": false,
  "options": [...],
  "examples": [...]
}
```

### 4. Delete Category
Deletes a campaign category.

**Method:** `DELETE`

**Query Parameters:**
- `id`: The ID of the category to delete.

## Notes
- The "Medical" category (`slug: 'medis'`) is handled specially in the frontend to ensure it always appears and redirects to the correct creation flow (`type=sakit`).
- Categories marked as inactive (`isActive: false`) will be excluded from the public user form when `active=true` is passed.
