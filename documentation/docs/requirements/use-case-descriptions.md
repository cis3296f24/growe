---
sidebar_position: 5
---

# Use-case descriptions / Sequence Diagram

## Use Case: Signing Up from login page
```mermaid
sequenceDiagram
  participant User
  participant Auth
  participant Server
  participant Database

  User ->> Auth : Enter Email
  Auth ->> Server : Store Email
  Server --> Database : Check Email Exists
  Database -->> Server : Validate Email
  Server -->> Auth : Validate Step
  User ->> Auth : Enter Username and Display Name
  Auth ->> Server : Store Username
  Server --> Database : Check Username Exists
  Database -->> Server : Validate Username
  Server -->> Auth : Validate Step
  User ->> Auth : Enter Password
  User ->> Auth : Request Sign Up
  Auth ->> Server : Handle Sign Up
  Server --> Database : Add User
  Database -->> Server : Return User
  Server -->> Auth : Return User
  Auth -->> User : Serve Home Screen
```

## Use Case: Logging in
```mermaid
sequenceDiagram
  participant User
  participant Auth
  participant Server
  participant Database

  User ->> Auth : Enter Email
  Auth ->> Server : Store Email
  
  
  Server -->> Auth : Validate Step
  User ->> Auth : Enter Password
  Auth ->> Server : Store Password
  Server--> Database: Check if Password is correct
  Server --> Database : Check Email Exists
  
  alt Password is correct and email Exists
  Database -->> Server : Validate Email
  Database-->> Server : Validate Password
 Server -->> Auth : Handle Sign in
Auth -->> User : Server Home Screen
else Password Incorrect or email DNE
Database -->> Server : Email or Password dne
Server -->> Auth : Handle Incorrect sign in
Auth -->> User : Incorrect Password or email message

end
```
## Use Case: Creating Group after successfully login or sign up
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend

    User->>Frontend: Submit group creation request
    Frontend->>Backend: Retrieve user document (getDoc)
    Backend->>Backend: Generate join code
    Backend->>Backend: Create group document (addDoc)
    Backend->>Backend: Update user document with new group (updateDoc)
    Backend-->>Frontend: Return new group document
    Frontend-->>User: Confirm group creation
```

## Use Case: Join Group after successfully login / signup
```mermaid

sequenceDiagram
    participant User
    participant Frontend
    participant Backend

    User->>Frontend: Submit join code
    Frontend->>Backend: Query groups collection with join code (where)
    Backend-->>Frontend: Return matching group or false
    alt Group Found
        Frontend->>Backend: Retrieve user document (getDoc)
        Backend-->>Backend: Return user data
        Backend->>Backend: Update user document with new group (updateDoc)
        Backend->>Backend: Update group document with new user (updateDoc)
        Backend-->>Frontend: Return updated group data
        Frontend-->>User: Group joined successfully
    else No Group Found
        Frontend-->>User: Display error message: Invalid join code
    end
```

