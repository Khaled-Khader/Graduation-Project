# Notifications Feature Implementation Guide

## Overview

Complete implementation of the Notifications feature for PetNexus application including:

- Backend REST API endpoints
- Frontend UI components
- Database schema
- Real-time WebSocket integration

## Backend Implementation

### 1. Database Setup

Run the migration script to create the notifications table:

```sql
-- From: Database/notifications_migration.sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_id BIGINT,
    related_entity_type VARCHAR(50),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_created_at (created_at),
    INDEX idx_notification_is_read (is_read)
);
```

### 2. Backend Files Created

#### Enums

- `NotificationType.java` - Enum for notification types (NEW_MESSAGE, ADOPTION_REQUEST, ADOPTION_STATUS, POST_COMMENT, POST_INTERACTION)

#### Entities

- `Notification.java` - Main notification entity with all fields and relationships

#### Repositories

- `NotificationRepository.java` - Data access layer with custom queries

#### Services

- `NotificationService.java` - Business logic for notifications
  - Create notifications
  - Fetch paginated notifications
  - Mark as read/unread
  - Real-time WebSocket broadcasting
  - Cleanup old notifications

#### Controllers

- `NotificationController.java` - REST API endpoints
  - GET /notifications - Get all notifications (paginated)
  - GET /notifications/unread - Get unread notifications
  - GET /notifications/unread/count - Get unread count
  - GET /notifications/type/{type} - Filter by type
  - PUT /notifications/{id}/read - Mark as read
  - PUT /notifications/read/all - Mark all as read
  - DELETE /notifications/{id} - Delete notification

### 3. REST API Endpoints

```
Base URL: /notifications

GET    /notifications?page=0&size=20&sort=createdAt,desc     # List all
GET    /notifications/unread                                 # Get unread only
GET    /notifications/unread/count                          # Get count
GET    /notifications/type/{type}?page=0&size=20            # Filter by type
PUT    /notifications/{notificationId}/read                 # Mark as read
PUT    /notifications/read/all                              # Mark all as read
DELETE /notifications/{notificationId}                      # Delete
```

### 4. Integration with Existing Services

To create notifications from other services (ChatService, AdoptionService, etc.):

```java
// Example: In ChatService after sending a message
NotificationDTO notification = notificationService.createNotification(
    new CreateNotificationDTO(
        recipientUserId,
        NotificationType.NEW_MESSAGE.toString(),
        "رسالة جديدة من " + senderName,
        messageContent,
        chatId,
        Notification.RelatedEntityType.CHAT.toString()
    )
);
```

## Frontend Implementation

### 1. API Service

File: `src/api/notificationApi.jsx`

```javascript
// Main API functions:
-fetchNotifications(page, size) -
  fetchUnreadNotifications() -
  getUnreadNotificationCount() -
  fetchNotificationsByType(type, page, size) -
  markNotificationAsRead(notificationId) -
  markAllNotificationsAsRead() -
  deleteNotification(notificationId);
```

### 2. Custom Hooks

File: `src/hooks/useNotifications.jsx`

```javascript
// useNotifications() hook provides:
- notifications (array)
- unreadNotifications (array)
- unreadCount (number)
- loading state
- error handling
- handleMarkAsRead()
- handleMarkAllAsRead()
- handleDeleteNotification()
- loadMore() for pagination
```

### 3. Components

#### NotificationBell Component

File: `src/components/NotificationBell.jsx`

- Displays bell icon with unread count badge
- Opens notification panel on click
- Real-time badge updates
- Integrates with WebSocket for new notifications

#### NotificationItem Component

File: `src/components/NotificationItem.jsx`

- Individual notification display
- Shows icon, title, message, time
- Mark as read/delete buttons
- Responsive design

#### NotificationPanel Component

File: `src/components/NotificationPanel.jsx`

- Full-screen overlay panel
- Filter by: All, Unread, Read
- Mark all as read button
- Infinite scroll/load more
- Empty state handling

### 4. CSS Files

- `NotificationBell.css` - Bell icon and badge styles
- `NotificationItem.css` - Notification item styles
- `NotificationPanel.css` - Panel and overlay styles

## Integration Steps

### Step 1: Database

1. Execute SQL migration script to create notifications table
2. Verify table creation in database

### Step 2: Backend

1. Ensure all entity, repository, service, and controller files are in place
2. Build and test: `mvn test`
3. Verify endpoints using Postman or curl

### Step 3: Frontend

1. Import NotificationBell component in MainNavigationComponent or header
2. Pass userId prop to NotificationBell
3. Add to navigation/header JSX:

```jsx
import NotificationBell from "./NotificationBell";

// In your header/navigation component:
<NotificationBell userId={currentUserId} />;
```

### Step 4: WebSocket Integration

1. In your WebSocket service, add subscription:

```javascript
// After WebSocket connection established:
stompClient.subscribe(`/topic/users/${userId}/notifications`, (message) => {
  const notification = JSON.parse(message.body);
  // Handle new notification
  console.log("New notification:", notification);
});
```

### Step 5: Create Notifications from Other Services

In ChatService.sendMessage():

```java
// After message is saved
notificationService.createNotification(
    new CreateNotificationDTO(
        chat.getProvider().getId(),
        NotificationType.NEW_MESSAGE.toString(),
        "رسالة جديدة",
        senderName + ": " + messagePreview,
        chatId,
        Notification.RelatedEntityType.CHAT.toString()
    )
);
```

Similar integration needed in:

- AdoptionRequestService
- PostService
- CommentService
- InteractionService

## Features

### User-Facing Features

✅ Real-time notifications via WebSocket
✅ Mark individual/all notifications as read
✅ Delete notifications
✅ Filter notifications (all/unread/read)
✅ Pagination support
✅ Unread count badge
✅ Notification types with icons
✅ Arabic localization

### Backend Features

✅ JWT authentication on all endpoints
✅ Role-based access control
✅ Database indexing for performance
✅ Automatic timestamp tracking
✅ Cascade delete on user deletion
✅ Old notification cleanup
✅ Real-time broadcasting

## Notification Types

| Type             | Icon | Arabic Label      | Trigger                            |
| ---------------- | ---- | ----------------- | ---------------------------------- |
| NEW_MESSAGE      | 💬   | رسالة جديدة       | New chat message                   |
| ADOPTION_REQUEST | 🐾   | طلب تبني          | New adoption request               |
| ADOPTION_STATUS  | ✅   | حالة التبني       | Adoption request accepted/rejected |
| POST_COMMENT     | 💭   | تعليق على المنشور | New comment on post                |
| POST_INTERACTION | ❤️   | تفاعل على المنشور | Like/reaction on post              |

## Performance Considerations

- Database indexes on: user_id, created_at, is_read
- Pagination (default 20 items per page)
- Lazy loading relationships
- Automatic cleanup of old notifications (30+ days)
- WebSocket for real-time updates

## Security

- JWT authentication required
- Users can only view their own notifications
- Users can only delete their own notifications
- Database constraints ensure data integrity
- SQL injection prevention via JPA

## Testing

Run tests:

```bash
cd backend
./mvnw test
```

All existing tests should pass after implementation.

## Next Steps

1. Create notification templates for email delivery (optional)
2. Implement email notifications
3. Add notification preferences/settings for users
4. Create admin dashboard for notification monitoring
5. Add notification scheduling/delayed notifications
6. Implement notification analytics

## Support

For issues or questions about the implementation:

1. Check test results: `target/surefire-reports/`
2. Review API documentation at `/notifications` endpoint
3. Check browser console for frontend errors
4. Review application logs for backend errors
