# Events (emits)

## `request`

Event Body:

```json
{
  "user_id": 1,
  "recipient_id": 2
}
```

Response Listener: `logs response`  
Response Body:

```json
{
  "type": "request",
  "success": true,
  "room_title": "xxxx-xxxx-xxxx-xxxx"
}
```

---

## `send`

Event Body:

```json
{
  "user_id": 1,
  "room_title": "xxxx-xxxx-xxxx-xxxx",
  "message": "Lorem Ipsum is my message",
  "type_id": 2
}
```

**NOTE: Please check the message types with the backend developer**

Response Listener: `receive`  
Response Body:

```json
{
  "user_id": 1,
  "room_title": "xxxx-xxxx-xxxx-xxxx",
  "message": "I got Lorem Ipsum",
  "type_id": 2
}
```

---

## `status`

Event Body:

```json
{
  "user_id": 1,
  "online": true
}
```

Response Listener: `logs response`  
Response Body:

```json
{
  "type": "status",
  "user_id": 1,
  "online": true,
  "last_seen": "YYYY-MM-DD HH:mm"
}
```

---

## `call`

Event Body:

```json
{
  "from_user": 1,
  "to_user": 2,
  "type": "Video"
}
```

Response Listener: `call response`  
Response Body:

```json
{
  "room_id": "xxxx-xxxx-xxxx-xxxx",
  "from_id": 1,
  "to_id": 2,
  "from_status": "Calling",
  "to_status": "Ringing",
  "call_type": "Video",
  "type": "request"
}
```

---

## `user list`

Event Body:

```json
{
  "user_id": 1
}
```

Response Listener: `call response`  
Response Body:

```json
{
  "type": "list",
  "rooms": [
    {
      "id": 10,
      "title": "2833e549-67db-4fd1-9136-c36cdfbab5db",
      "user_id": 2,
      "recipient_id": 3,
      "last_message": "This is a message",
      "last_message_date": "1398-1-29 15:03",
      "recipient_status": "online",
      "recipient_lastseen": "1398-1-29 15:03",
      "recipient_avatar": "#",
      "recipient_name": "Sajjad Rajabi"
    }
  ]
}
```

---

## `call answer`

Event Body:

```json
{
  "from_user": 1,
  "to_user": 2,
  "room_title": "xxxx-xxxx-xxxx-xxxx",
  "answered": true
}
```

Response Listener: `call response`  
Response Body:

```json
{
  "status": true,
  "type": "answer",
  "room_title": "xxxx-xxxx-xxxx-xxxx"
}
```

---

## `refresh`

Event Body:

```json
{
  "room_title": "xxxx-xxxx-xxxx-xxxx"
}
```

Response Listener: `user response`  
Response Body:

```json
{
  "type": "status",
  "refresh": true
}
```
