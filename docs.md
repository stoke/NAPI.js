

<!-- Start lib/main.js -->

## _get(url, dom, callback)

Return complete request in the callback passed as parameter

### Params: 

* **String** *url* 

* **Boolean|Optional** *dom* 

* **Function** *callback* 

url, [dom], cbl

## _asyncAssertEq(value)

Throw if assertion isn't respected

### Params: 

* **Mixed** *value* 

## getProjectIdFromName(name, cbl)

Return id from the project name

### Params: 

* **String** *name* 

* **Function** *cbl* 

user], name, cbl

## getUserIdFromUserName

Return id from the username

### Params: 

* **String** *username* 

* **Function** *cbl* 

## getNameFromProjectId(id, cbl)

Return name from the project id

### Params: 

* **Number** *id* 

* **Function** *cbl* 

user], id, cbl

## getUsernameFromUserId

Return name from user id

### Params: 

* **Number** *id* 

* **Function** *cbl* 

## addOption(name, input)

Add option in the &quot;profile&quot; section

### Params: 

* **String** *name* 

* **DOM|Optional** *input* 

## addButton(name, callback)

Add button to the api form

### Params: 

* **String** *name* 

* **Function** *callback* on click

## _fireMiddlewares(event, data)

It filters `data` passing it to listeners

### Params: 

* **String** *event* 

* **Mixed** *data* 

HOOKS

Comment hook

Event: `comment`

Prefbar (preferences) hooks

Events: `pref_account pref_profile pref_guests pref_projects pref_language pref_delete`

---

<!-- End lib/main.js -->

