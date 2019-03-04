# Events

## Join Room Request

Event Name: `request`

Emit Body:

```json
{
  "user_id": 1, # int
  "recipient_id": 2 # int
}
```

TODO: Check 2 IDs be online

### Request Response

Event Name: `request response`

Event Body:

```json
{
  "success": true, # boolean
  "room_title": "ssss-ssss-ssss-ssss" # string,
}
```

---

## Check Status

Event Name: `status`

Event Body:

```json
{
  "user_id": 1, # int
  "online": true # boolean
}
```

### Status Reponse

Event Name: `status response`

Event Response Body:

```json
{
  "user_id": 1, # int
  "online": true # boolean
}
```

Event Error Body:

```json
{
  "error": {
    "message": "Couldn't set status to offline"
  }
}
```

---

## Send Message

Event Name: `send`

Event Body:

```json
{
  "user_id": 1, # int
  "room_title": "ssss-ssss-ssss-ssss", # string
  "message": "Text Message", # string
}
```

### Send Response

Event Name: `send response`

Event Error Body:

```json
{
  "error": {
    "message": "Couldn't insert the message to database", # string
  }
}
```

---

## Receive Message

Event Name: `receive`

Type: **Listen**

Event Response Body:

```json
{
  "user_id": 1, # int
  "room_title": "ssss-ssss-ssss-ssss", # string
  "message": "Text Message", # string
}
```

Note: `socketServer.sockets.in(data.room_title).emit('receive', data);`
