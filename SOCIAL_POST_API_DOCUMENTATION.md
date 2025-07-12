# SocialPost API Documentation

## Overview
The SocialPost API provides functionality for creating, managing, and interacting with social posts within events. It includes features for posts, comments, likes, and shares.

**Base URL:** `http://localhost:3001/api/social`

**Authentication:** All endpoints require JWT authentication via Bearer token in the Authorization header.

---

## Table of Contents
1. [Authentication](#authentication)
2. [Create Social Post](#create-social-post)
3. [Get Social Posts by Event](#get-social-posts-by-event)
4. [Like/Unlike Social Post](#likeunlike-social-post)
5. [Share Social Post](#share-social-post)
6. [Create Comment](#create-comment)
7. [Reply to Comment](#reply-to-comment)
8. [Like/Unlike Comment](#likeunlike-comment)
9. [Delete Social Post](#delete-social-post)
10. [Error Responses](#error-responses)

---

## Authentication

All endpoints require a valid JWT token in the Authorization header.

```http
Authorization: Bearer <your-jwt-token>
```

---

## Create Social Post

Creates a new social post with optional images.

**Endpoint:** `POST /api/social/`

**Content-Type:** `multipart/form-data`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | No | Post description text |
| attendeeId | number | Yes | ID of the attendee creating the post |
| images | file[] | Yes | Array of image files (max 10) |

### Sample Request
```bash
curl -X POST http://localhost:3001/api/social/ \
  -H "Authorization: Bearer <your-jwt-token>" \
  -F "description=This is my first social post!" \
  -F "attendeeId=1" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### Sample Response
```json
{
  "id": 1,
  "description": "This is my first social post!",
  "images": [
    "https://supabase-storage.com/social-posts/image1.jpg",
    "https://supabase-storage.com/social-posts/image2.jpg"
  ],
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "attendeeId": 1,
  "shares": 0
}
```

---

## Get Social Posts by Event

Retrieves social posts for a specific event with pagination and like information.

**Endpoint:** `GET /api/social/event/:eventId`

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| attendeeId | number | Yes | - | ID of the current attendee |
| page | number | No | 1 | Page number for pagination |
| pageSize | number | No | 10 | Number of posts per page |

### Sample Request
```bash
curl -X GET "http://localhost:3001/api/social/event/1?attendeeId=1&page=1&pageSize=10" \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Sample Response
```json
{
  "posts": [
    {
      "id": 1,
      "description": "This is my first social post!",
      "images": [
        "https://supabase-storage.com/social-posts/image1.jpg"
      ],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "attendeeId": 1,
      "shares": 5,
      "likeCount": 3,
      "likedByCurrentUser": true,
      "attendee": {
        "id": 1,
        "user": {
          "firstName": "John",
          "profilePicture": "https://example.com/profile.jpg"
        }
      },
      "comments": [
        {
          "id": 1,
          "postId": 1,
          "attendeeId": 2,
          "content": "Great post!",
          "parentId": null,
          "createdAt": "2024-01-15T10:35:00.000Z",
          "updatedAt": "2024-01-15T10:35:00.000Z",
          "likeCount": 1,
          "likedByCurrentUser": false,
          "attendee": {
            "id": 2,
            "user": {
              "firstName": "Jane",
              "profilePicture": "https://example.com/jane.jpg"
            }
          }
        }
      ]
    }
  ],
  "page": 1,
  "pageSize": 10,
  "total": 1
}
```

---

## Like/Unlike Social Post

Toggles the like status of a social post for the current attendee.

**Endpoint:** `POST /api/social/:id/like`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID of the social post |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attendeeId | number | Yes | ID of the attendee liking/unliking |

### Sample Request
```bash
curl -X POST http://localhost:3001/api/social/1/like \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "attendeeId": 1
  }'
```

### Sample Response (Like)
```json
{
  "liked": true
}
```

### Sample Response (Unlike)
```json
{
  "liked": false
}
```

---

## Share Social Post

Increments the share count of a social post.

**Endpoint:** `POST /api/social/:id/share`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID of the social post |

### Sample Request
```bash
curl -X POST http://localhost:3001/api/social/1/share \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Sample Response
```json
{
  "shares": 6
}
```

---

## Create Comment

Creates a new comment on a social post.

**Endpoint:** `POST /api/social/comment`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| postId | number | Yes | ID of the social post |
| content | string | Yes | Comment text content |
| attendeeId | number | Yes | ID of the attendee commenting |

### Sample Request
```bash
curl -X POST http://localhost:3001/api/social/comment \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": 1,
    "content": "This is an amazing post!",
    "attendeeId": 2
  }'
```

### Sample Response
```json
{
  "id": 2,
  "postId": 1,
  "attendeeId": 2,
  "content": "This is an amazing post!",
  "parentId": null,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "attendee": {
    "id": 2,
    "user": {
      "firstName": "Jane",
      "profilePicture": "https://example.com/jane.jpg"
    }
  }
}
```

---

## Reply to Comment

Creates a reply to a top-level comment.

**Endpoint:** `POST /api/social/comment/:commentId/reply`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| commentId | number | Yes | ID of the comment to reply to |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Reply text content |
| attendeeId | number | Yes | ID of the attendee replying |

### Sample Request
```bash
curl -X POST http://localhost:3001/api/social/comment/1/reply \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I agree with you!",
    "attendeeId": 3
  }'
```

### Sample Response
```json
{
  "id": 3,
  "postId": 1,
  "attendeeId": 3,
  "content": "I agree with you!",
  "parentId": 1,
  "createdAt": "2024-01-15T11:05:00.000Z",
  "updatedAt": "2024-01-15T11:05:00.000Z"
}
```

---

## Like/Unlike Comment

Toggles the like status of a comment for the current attendee.

**Endpoint:** `POST /api/social/comment/:commentId/like`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| commentId | number | Yes | ID of the comment |

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| attendeeId | number | Yes | ID of the attendee liking/unliking |

### Sample Request
```bash
curl -X POST http://localhost:3001/api/social/comment/1/like \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "attendeeId": 1
  }'
```

### Sample Response (Like)
```json
{
  "liked": true
}
```

### Sample Response (Unlike)
```json
{
  "liked": false
}
```

---

## Delete Social Post

Deletes a social post and all associated comments and likes.

**Endpoint:** `DELETE /api/social/:id`

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | number | Yes | ID of the social post to delete |

### Sample Request
```bash
curl -X DELETE http://localhost:3001/api/social/1 \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Sample Response
```json
{
  "message": "Post deleted successfully."
}
```

---

## Error Responses

### Authentication Error (403)
```json
{
  "message": "Access denied, no token provided"
}
```

### Validation Error (400)
```json
{
  "message": "attendeeId is required in the request body."
}
```

### Not Found Error (400)
```json
{
  "message": "Social post not found."
}
```

### Server Error (500)
```json
{
  "message": "Image upload failed."
}
```

---

## Data Models

### SocialPost
```typescript
interface SocialPost {
  id: number;
  description?: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  attendeeId: number;
  shares: number;
  likeCount?: number;
  likedByCurrentUser?: boolean;
  attendee?: {
    id: number;
    user: {
      firstName: string;
      profilePicture?: string;
    };
  };
  comments?: SocialComment[];
}
```

### SocialComment
```typescript
interface SocialComment {
  id: number;
  postId: number;
  attendeeId: number;
  content: string;
  parentId?: number;
  createdAt: Date;
  updatedAt: Date;
  likeCount?: number;
  likedByCurrentUser?: boolean;
  attendee?: {
    id: number;
    user: {
      firstName: string;
      profilePicture?: string;
    };
  };
}
```

---

## Testing

### Basic Test
```bash
node test-social-basic.js
```

### Full Test (with authentication)
```bash
# Update credentials in test-social-api-with-auth.js
node test-social-api-with-auth.js
```

---

## Notes

1. **Image Upload**: Images are uploaded to Supabase storage in the 'social-posts' folder
2. **Like Toggle**: The same endpoint is used for both liking and unliking
3. **Comment Replies**: Only top-level comments can have replies (no nested replies)
4. **Pagination**: Posts are returned in descending order by creation date
5. **Cascade Delete**: Deleting a post also deletes all associated comments and likes
6. **Unique Constraints**: Each attendee can only like a post/comment once

---

## Rate Limiting

All endpoints are subject to rate limiting as configured in your application middleware.

---

## Support

For issues or questions regarding the SocialPost API, please refer to your application logs or contact your development team. 